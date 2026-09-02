import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Ce qui compte comme extension en fin de nom : 1 à 8 caractères
 * alphanumériques. Exclut les points internes d'un libellé (« (ep. BAZZE) »).
 */
const EXTENSION_PATTERN = /\.[A-Za-z0-9]{1,8}$/;
import {
  enrichFilesWithStatus,
  enrichTreeWithStatus,
} from "@backend/modules/storage/services/enrichStatus.service";

import { router, protectedProcedure } from "@backend/trpc";

import {
  storageProviderSchema,
  storageMoveIntentSchema,
  createR2UploadAuthorizationSchema,
} from "@contracts/storage";

import {
  createUploadSignaturesSchema,
  registerUploadedAssetsSchema,
} from "@contracts/cloudinary/upload.schema";

import { getAdapter } from "@backend/modules/storage/providerRegistry";
import { VirtualStorage } from "@backend/modules/storage/virtualStorage";
import { isProtectedEntityFolderPath } from "@backend/modules/storage/protectedEntityFolder";
import { toPhysicalMoveIntents } from "@backend/modules/storage/toPhysicalMoveIntents.service";
import {
  planMoveOperations,
  executeMoveOperations,
} from "@backend/modules/storage/resolveMoveIntent.service";
import { assertOperationsDontUnpublishReferencedAssets } from "@backend/modules/media/services/assertOperationsDontUnpublishReferencedAssets.service";
import { countPersoImages } from "@backend/modules/media/services/countPersoImages.service";
import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";
import { listCommonRepositoryFolders } from "@backend/modules/media/services/listCommonRepositoryFolders.service";
import { resolvePendingUploadFolder } from '@backend/modules/cloudinary/services/resolvePendingUploadFolder.service';
import { assertCanReadPath } from "@backend/modules/memberGroups/assertCanReadPath.service";
import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";
import {
  mergeGroupSpaceFolders,
  mergeGroupSpaceFoldersIntoTree,
} from "@backend/modules/storage/mergeGroupSpaceFolders.service";
import {
  applyGroupSpaceNamesToFolders,
  applyGroupSpaceNamesToTree,
} from "@backend/modules/storage/applyGroupSpaceNames.service";
import { assertUploadDestinationAllowed } from '@backend/modules/storage/assertUploadDestinationAllowed.service';
import { buildUploadFileName } from '@backend/modules/storage/services/buildUploadFileName.service';

/**
 * storageRouter — Phase 2 update
 *
 * Le seul changement par rapport à la version précédente est le schema
 * d'input de `registerR2Upload`, qui doit maintenant transporter la
 * destination métier (categoryId, disciplineId) et l'originalFileName
 * pour créer la row MediaAsset côté adapter R2.
 *
 * Le schema legacy `registerR2UploadedAssetSchema` n'avait que
 * `{ path, expectedBytes, expectedMimeType }` — insuffisant pour le
 * tracking DB. On le redéfinit en inline dans ce router pour ne pas
 * forcer une modif côté contracts (le contract est à jour côté Cloudinary
 * via `registerUploadedAssetsSchema.destination`, on reproduit la même
 * forme ici).
 *
 * ⚠️ NOTE : si un autre endroit du code utilise `registerR2UploadedAssetSchema`
 * importé depuis `@contracts/storage`, il faudra aussi l'aligner. À ce jour,
 * seul ce router le consomme.
 */

/* -------------------------------------------------------------------------- */
/*  Schema R2 Phase 2 — inline                                                */
/* -------------------------------------------------------------------------- */

/**
 * Destination metier — discriminée pour gérer les deux cas :
 *   - existing-discipline : on a categoryId + disciplineId direct
 *   - new-discipline : on a categoryId + proposedDisciplineName (admin validera plus tard)
 *
 * Forme identique à ce que `DragNDropForm` construit déjà côté frontend
 * pour Cloudinary — on réutilise.
 */
const r2UploadDestinationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('existing-discipline'),
    categoryId: z.number().int().positive(),
    disciplineId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('new-discipline'),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().min(1).max(120),
  }),
  // Espace club partagé, sans discipline ni catégorie.
  z.object({
    kind: z.literal('common_repository'),
    folder: z.string().trim().min(1).max(120).optional(),
  }),
  // Contenus d'un événement (parité avec `general`).
  z.object({
    kind: z.literal('event'),
    eventId: z.number().int().positive(),
    disciplineIds: z.array(z.number().int().positive()).default([]),
  }),
  // Espace d'un groupe collaboratif (dépôt gardé côté procédure).
  z.object({
    kind: z.literal('group'),
    groupId: z.string(),
  }),
]);

const registerR2UploadInputSchema = z.object({
  path: z.string().min(1),
  expectedBytes: z.number().int().positive(),
  expectedMimeType: z.string().min(1),
  // Phase 2 — nouveaux champs requis pour créer la row MediaAsset
  destination: r2UploadDestinationSchema,
  originalFileName: z.string().min(1).max(255),
});

/* -------------------------------------------------------------------------- */
/*  Router                                                                    */
/* -------------------------------------------------------------------------- */

export const storageRouter = router({
  /**
   * Noms d'affichage EXACTS des espaces (groupe / perso), indexés par cuid.
   * Permet au finder d'afficher « Administrateurs » au lieu de
   * « administrateurs-<cuid> ». Noms de groupes : toujours ; noms
   * d'utilisateurs (espaces perso) : réservés aux admins (confidentialité).
   */
  spaceDisplayNames: protectedProcedure.query(async ({ ctx }) => {
    const map: Record<string, string> = {};

    const groups = await ctx.prisma.memberGroup.findMany({
      select: { id: true, name: true },
    });
    for (const g of groups) map[g.id] = g.name;

    if (await isAdminByGroup(ctx.prisma, ctx.user.id)) {
      const users = await ctx.prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      });
      for (const u of users) {
        const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
        map[u.id] = full || u.pseudo || u.email;
      }
    }

    return map;
  }),

  /* ====================================================================== */
  /*  Lecture (inchangé)                                                    */
  /* ====================================================================== */

  /**
   * Compteurs « à traiter » de la bibliothèque, pour la cloche du header :
   * assets en attente de classement (MediaAsset.status "pending") et
   * entrées de corbeille (TrashEntry IN_BIN). protectedProcedure simple,
   * comme le reste du router — la cloche est de plus gatée côté client
   * sur la présence d'au moins une permission.
   */
  getAttentionCounts: protectedProcedure.query(async ({ ctx }) => {
    const [pending, bin, commonRepositoryPending, persoCounts] = await Promise.all([
      ctx.prisma.mediaAsset.count({ where: { status: "pending" } }),
      ctx.prisma.trashEntry.count({ where: { status: "IN_BIN" } }),
      ctx.prisma.mediaAsset.count({
        where: {
          status: "pending",
          appRoot: ctx.appRoot,
          fullPath: { contains: "/common_repository/" },
        },
      }),
      countPersoImages({
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.user.id,
      }),
    ]);
    return {
      pending,
      bin,
      commonRepositoryPending,
      persoPending: persoCounts.pending,
    };
  }),

  /**
   * Ventilation des contenus « en attente » par dossier parent.
   *
   * Renvoie le `kind` du dossier plutôt qu'un libellé : la formulation
   * (« le stockage général », « votre stockage personnel »…) appartient à
   * l'UI, pas au backend. Les dossiers sont triés par volume décroissant.
   */
  getPendingBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.mediaAsset.findMany({
      where: { appRoot: ctx.appRoot, status: "pending" },
      select: { fullPath: true },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const segments = row.fullPath.split("/");
      segments.pop(); // le nom du fichier
      const folder = segments.join("/");
      if (!folder) continue;
      counts.set(folder, (counts.get(folder) ?? 0) + 1);
    }

    const commonRepositoryRoot = `${ctx.appRoot}/common_repository`;
    const persosRoot = `${ctx.appRoot}/persos`;

    const entries = Array.from(counts.entries()).map(([path, count]) => {
      let kind: "common_repository" | "perso" | "folder" = "folder";
      if (path === commonRepositoryRoot || path.startsWith(`${commonRepositoryRoot}/`)) {
        kind = "common_repository";
      } else if (path.startsWith(`${persosRoot}/`)) {
        // Personnel de l'utilisateur courant uniquement : le dossier porte
        // son id. Ceux des autres restent des dossiers ordinaires.
        kind = path.includes(ctx.user.id) ? "perso" : "folder";
      }
      // Nom lisible : pour le dossier personnel d'un AUTRE utilisateur, le
      // dernier segment vaut « photos » et n'apprend rien — on prend le
      // segment qui identifie la personne.
      let name = path.split("/").pop() ?? path;
      if (kind === "folder" && path.startsWith(`${persosRoot}/`)) {
        name = path.slice(persosRoot.length + 1).split("/")[0] ?? name;
      }

      return { path, count, kind, name };
    });

    entries.sort((a, b) => b.count - a.count);

    return { total: rows.length, entries };
  }),

  /**
   * Statut du quota d'images de l'espace perso de l'admin courant (lecture
   * seule). Le dossier perso est dérivé de `ctx.user.id`, jamais d'un input.
   */
  getPersoPhotoQuota: protectedProcedure.query(async ({ ctx }) => {
    const counts = await countPersoImages({
      prisma: ctx.prisma,
      appRoot: ctx.appRoot,
      userId: ctx.user.id,
    });
    const remaining = Math.max(0, PERSO_PHOTO_QUOTA - counts.total);
    return {
      quota: PERSO_PHOTO_QUOTA,
      pending: counts.pending,
      published: counts.published,
      total: counts.total,
      remaining,
    };
  }),

  /**
   * Sous-dossiers existants sous `general/` (pending + published), pour peupler
   * le select « dossier existant » de l'uploader général.
   */
  listCommonRepositoryFolders: protectedProcedure.query(async ({ ctx }) => {
    return listCommonRepositoryFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });
  }),

  /**
   * Hiérarchie des espaces collaboratifs : chemin d'espace RÉEL + parent,
   * pour l'imbrication visuelle du finder admin (les chemins physiques
   * restent inchangés). Réservé aux admins.
   */
  groupSpaceHierarchy: protectedProcedure.query(async ({ ctx }) => {
    if (!(await isAdminByGroup(ctx.prisma, ctx.user.id))) return [];

    const groups = await ctx.prisma.memberGroup.findMany({
      where: { isCollaborative: true },
      select: { id: true, name: true, parentGroupId: true },
    });
    return Promise.all(
      groups.map(async (g) => ({
        groupId: g.id,
        name: g.name,
        parentGroupId: g.parentGroupId,
        path: await resolveGroupBaseFolder({
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          groupId: g.id,
        }),
      })),
    );
  }),

  /**
   * Espaces des groupes collaboratifs accessibles à l'utilisateur courant
   * (racines du finder côté membre) : chemin + droit par groupe.
   *
   * Passerelle admin : un administrateur est d'emblée ÉDITEUR de TOUS les
   * espaces collaboratifs (au-dessus du système de groupes), sans
   * appartenance manuelle.
   */
  myCollaborativeSpaces: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = await isAdminByGroup(ctx.prisma, ctx.user.id);

    const entries: {
      groupId: string;
      name: string;
      access: "VIEWER" | "EDITOR";
      parentGroupId: string | null;
    }[] = isAdmin
      ? (
          await ctx.prisma.memberGroup.findMany({
            where: { isCollaborative: true },
            select: { id: true, name: true, parentGroupId: true },
          })
        ).map((g) => ({ groupId: g.id, name: g.name, access: "EDITOR" as const, parentGroupId: g.parentGroupId }))
      : await collaborativeEntriesForMember(ctx.prisma, ctx.user.id);

    return Promise.all(
      entries.map(async (e) => ({
        ...e,
        path: await resolveGroupBaseFolder({
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          groupId: e.groupId,
        }),
      })),
    );
  }),

  /**
   * ═══ Le flag `logical` — chantier « arbre sans strate de statut » ═══════
   *
   * Levé, il enveloppe l'adapter dans `StatusFoldingReadView` : le nœud
   * logique `AKFC/cours/x` fusionne alors les physiques
   * `AKFC/pending/cours/x` et `AKFC/published/cours/x`, et le statut cesse
   * d'être un lieu pour redevenir ce qu'il aurait toujours dû être — une
   * métadonnée (`MediaAsset.status`, déjà exposée en `MediaMeta.status`).
   *
   * Baissé (le défaut), rien ne change : l'appelant voit l'arbre physique,
   * exactement comme avant ce chantier.
   *
   * ─── Pourquoi un flag plutôt qu'une bascule sèche ─────────────────────
   *
   * Le pliage change ce que voit l'admin dans sa bibliothèque. Un flag
   * découple la mise en place (backend, inerte, vérifiable) du basculement
   * (front, visible) — et surtout, il rend le retour arrière instantané :
   * un booléen, pas un revert en catastrophe un soir de démo.
   *
   * ⚠️ Un appelant qui lève `logical` sur une lecture DOIT le lever aussi
   * sur `move` : les chemins qu'il reçoit sont logiques, et le pipeline de
   * move ne sait travailler qu'en physique (cf. `toPhysicalMoveIntents`).
   * Les mélanger, c'est envoyer des chemins logiques à `resolveTargetPath`,
   * qui lève. En pratique il n'y a qu'un seul appelant
   * (`finderStorageAdapter`), donc un seul endroit à tenir cohérent.
   *
   * ─── Durée de vie ─────────────────────────────────────────────────────
   *
   * Transitoire. À l'étape 5 du chantier, tous les binaires vivent à plat,
   * le pliage devient l'identité, et le flag disparaît avec les trois
   * modules qu'il commande.
   */
  list: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        cursor: z.string().optional(),
        limit: z.number().int().positive().optional(),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      // Pliage retiré (étape 6) : les binaires sont à plat, plus de strate à
      // fusionner. On lit directement le backend. Le flag `logical` est
      // désormais sans effet sur la lecture.
      const reader = backend;
      const result = await reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
      // Le statut vit en DB depuis l'aplatissement : on le rapatrie ici.
      await enrichFilesWithStatus(ctx.prisma, ctx.appRoot, result.files);
      // Espaces de groupe visibles même vides : Cloudinary/R2 n'ont pas de
      // vrais dossiers, un espace sans asset s'évaporerait du listing.
      if (input.path === `${ctx.appRoot}/groups`) {
        const merged = await mergeGroupSpaceFolders({
          result,
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          userId: ctx.user.id,
        });
        return {
          ...merged,
          folders: await applyGroupSpaceNamesToFolders(
            merged.folders,
            ctx.prisma,
          ),
        };
      }
      return result;
    }),

  getTree: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        depth: z.number().int().positive().optional(),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      // Pliage retiré (étape 6) : les binaires sont à plat, plus de strate à
      // fusionner. On lit directement le backend. Le flag `logical` est
      // désormais sans effet sur la lecture.
      const reader = backend;
      const result = await reader.getTree({
        path: input.path,
        depth: input.depth,
      });
      await enrichTreeWithStatus(ctx.prisma, ctx.appRoot, result.root);
      // Espaces de groupe ET perso visibles même vides, dans l'arbre du finder.
      result.root = await mergeGroupSpaceFoldersIntoTree({
        root: result.root,
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.user.id,
      });
      // Nom EXACT des dossiers d'espace de groupe (accents) — c'est getTree
      // que lit l'adapter du finder (et le picker).
      return {
        ...result,
        root: await applyGroupSpaceNamesToTree(result.root, ctx.prisma),
      };
    }),

  // Libellés d'affichage des dossiers (découplés du chemin physique).
  folderLabels: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.folderLabel.findMany({
      select: { path: true, displayName: true },
    }),
  ),

  setFolderLabel: protectedProcedure
    .input(
      z.object({
        path: z.string().min(1),
        displayName: z.string().trim().max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const name = input.displayName.trim();
      // Libellé vide = on retire l'override (retour au repli du listing).
      if (name === "") {
        await ctx.prisma.folderLabel.deleteMany({ where: { path: input.path } });
        return { path: input.path, displayName: null as string | null };
      }
      const row = await ctx.prisma.folderLabel.upsert({
        where: { path: input.path },
        create: { path: input.path, displayName: name },
        update: { displayName: name },
      });
      return { path: row.path, displayName: row.displayName as string | null };
    }),

  getNode: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      // Pliage retiré (étape 6) : les binaires sont à plat, plus de strate à
      // fusionner. On lit directement le backend. Le flag `logical` est
      // désormais sans effet sur la lecture.
      const reader = backend;
      if (!reader.getNode) {
        throw new Error(
          `Provider "${input.provider ?? "virtual"}" does not support getNode().`
        );
      }
      return reader.getNode(input.path);
    }),

  getMetadata: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      // Pliage retiré (étape 6) : les binaires sont à plat, plus de strate à
      // fusionner. On lit directement le backend. Le flag `logical` est
      // désormais sans effet sur la lecture.
      const reader = backend;
      if (!reader.getMetadata) {
        throw new Error(
          `Provider "${input.provider ?? "virtual"}" does not support getMetadata().`
        );
      }
      return reader.getMetadata(input.path);
    }),

  /**
   * Renomme un fichier ou un dossier — c'est-à-dire un `move` vers le même
   * parent sous un nouveau nom.
   *
   * `newBaseName` est le nom SANS extension : le client n'édite que la base
   * (l'extension affichée est reconstruite par `displayName` et n'appartient
   * pas toujours au path réel, cf. les public_id Cloudinary). L'extension de
   * la source est réappliquée telle quelle, ce qui préserve la convention du
   * provider.
   */
  rename: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        type: z.enum(["file", "folder"]).default("file"),
        newBaseName: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cleanName = input.newBaseName.trim();
      if (!cleanName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nom ne peut pas être vide.",
        });
      }
      if (cleanName.includes("/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nom ne peut pas contenir « / ».",
        });
      }

      const segments = input.path.split("/");
      const currentName = segments.pop() ?? "";
      const parent = segments.join("/");
      if (!parent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible de renommer un élément racine.",
        });
      }

      // Dossier-entité : nom PHYSIQUE immuable. Sa garde de suppression
      // repose sur son chemin ; le renommer (déplacement du binaire)
      // casserait cette protection. Refusé (un libellé d'affichage passera
      // par un mécanisme séparé).
      if (input.type === "folder" && isProtectedEntityFolderPath(input.path)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Ce dossier système ne peut pas être renommé.",
        });
      }

      // ─── FICHIER : on n'édite QUE le nom d'affichage ───────────────────
      //
      // Depuis la slugification (increment 1), la clé de stockage est un slug
      // stable et opaque. Renommer un fichier ne déplace donc plus rien chez
      // le provider et ne devine plus d'extension (fin du bug historique) :
      // c'est un simple UPDATE de `displayName`. Match logique tolérant à
      // l'extension, comme `media.updateDescription` (fullPath DB = path UI +
      // "." + format côté Cloudinary). Deux fichiers peuvent partager un nom
      // d'affichage : pas de contrôle de collision ici, la clé reste unique.
      if (input.type === "file") {
        const result = await ctx.prisma.mediaAsset.updateMany({
          where: {
            appRoot: ctx.appRoot,
            OR: [
              { fullPath: input.path },
              { fullPath: { startsWith: `${input.path}.` } },
            ],
          },
          data: { displayName: cleanName },
        });
        if (result.count === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Aucun média trouvé pour ce fichier.",
          });
        }
        return { success: true, path: input.path };
      }

      // Extension de la SOURCE, réappliquée telle quelle.
      //
      // ⚠️ Un point dans un nom n'est PAS forcément un séparateur
      // d'extension : « CNI recto PORQUET (ep. BAZZE) Yvonne » en contient
      // un. Couper au dernier point produirait une pseudo-extension
      // « . BAZZE) Yvonne » et mutilerait le fichier au renommage. On
      // n'accepte donc qu'un suffixe AYANT LA FORME d'une extension.
      // Un DOSSIER n'a pas d'extension : « photos.2024 » renommé en
      // « archives » doit donner « archives », pas « archives.2024 ».
      const extensionMatch =
        input.type === "folder" ? null : EXTENSION_PATTERN.exec(currentName);
      const extension = extensionMatch ? extensionMatch[0] : "";
      const targetPath = `${parent}/${cleanName}${extension}`;

      // Renommage en son propre nom : rien à faire, mais pas une erreur.
      if (targetPath === input.path) {
        return { success: true, path: input.path };
      }

      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      // On n'écrase jamais un élément existant.
      if (adapter.getNode) {
        const collision = await adapter.getNode(targetPath);
        if (collision) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un élément porte déjà ce nom dans ce dossier.",
          });
        }
      }

      // `move` est optionnel sur l'interface d'adapter : on garde avant
      // d'appeler, comme pour `getNode` plus haut.
      if (!adapter.move) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Ce provider ne supporte pas le déplacement.",
        });
      }

      await adapter.move({
        source: { type: input.type, path: input.path },
        target: { path: targetPath },
      });

      return { success: true, path: targetPath };
    }),

  move: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        intent: storageMoveIntentSchema,
        /**
         * L'intention est exprimée en chemins LOGIQUES (cf. `list`).
         *
         * Un appelant qui lit en `logical` DOIT lever ce flag ici aussi :
         * les chemins qu'il détient viennent de la vue pliée.
         */
        logical: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Dossier-entité : chemin immuable, pas de déplacement du binaire.
      // Même raison qu'au rename ; couvre aussi les sélections multiples.
      {
        const movedPaths =
          input.intent.source.type === "folder"
            ? [input.intent.source.path]
            : input.intent.source.type === "selection"
              ? input.intent.source.roots
              : [];
        if (movedPaths.some((pth) => isProtectedEntityFolderPath(pth))) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Ce dossier système ne peut pas être déplacé.",
          });
        }
      }

      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      // ⚠️ L'adapter reste PHYSIQUE, toujours. On n'enveloppe JAMAIS le
      // pipeline de move dans `StatusFoldingReadView` : `planMoveOperations`
      // lit la source via cet adapter puis calcule la cible avec
      // `resolveTargetPath`, qui exige un segment de statut en position 1 et
      // lève sinon. Lui donner des chemins logiques casserait la
      // publication. La traduction se fait en amont, sur l'INTENTION.
      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      // Une intention logique peut recouvrir plusieurs emplacements réels
      // (un dossier logique vit dans 1..N strates). `toPhysicalMoveIntents`
      // les résout contre la DB et n'émet que des intentions RÉELLES — pas
      // de spéculation, donc pas de tolérance à installer ici.
      const intents = input.logical
        ? await toPhysicalMoveIntents({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot,
            intent: input.intent,
          })
        : [input.intent];

      // On planifie TOUT avant de garder, et on garde sur l'UNION.
      //
      // C'est le point non négociable de cet enchaînement :
      // `assertOperationsDontUnpublishReferencedAssets` doit voir l'ensemble
      // des opérations. La faire tourner par intention la laisserait
      // raisonner sur un sous-ensemble — et une garde qui juge sur une
      // partie du geste ne garde rien.
      const plans = await Promise.all(
        intents.map((intent) =>
          planMoveOperations({ adapter, appRoot: ctx.appRoot, intent }),
        ),
      );
      // ─── Une opération sur place n'est pas une opération ───────────
      //
      // Rien en aval ne filtre `{ source: X, target: X }` : `adapter.move`
      // partirait renommer un objet sur lui-même, le provider refuserait, et
      // l'exception ferait échouer TOUT le geste — y compris sa partie utile.
      //
      // Le cas devient courant avec le pliage : publier un dossier logique
      // émet une intention par strate occupée, et celle qui vit DÉJÀ dans la
      // strate cible se résout en X → X. Elle n'a simplement rien à faire.
      //
      // Le filtre est posé AVANT les gardes, pour qu'elles ne raisonnent que
      // sur des opérations réelles — une opération sur place ne dépublie
      // rien, elle n'a donc pas à peser dans leur verdict. Et il est posé
      // avant `return { operations }` : l'appelant reçoit ce qui a bougé, pas
      // ce qu'on a envisagé.
      const effectiveOperations = plans
        .flat()
        .filter((operation) => operation.source.path !== operation.target.path);

      await assertOperationsDontUnpublishReferencedAssets(
        ctx.prisma,
        effectiveOperations,
        ctx.appRoot,
      );

      // Exécution séquentielle, comme avant : Cloudinary n'aime pas les
      // opérations concurrentes sur des préfixes voisins.
      await executeMoveOperations(adapter, effectiveOperations);

      return { operations: effectiveOperations };
    }),

  /* ====================================================================== */
  /*  Upload Cloudinary (inchangé)                                          */
  /* ====================================================================== */

  createUploadAuthorization: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...createUploadSignaturesSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertUploadDestinationAllowed({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        destination: input.destination,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      switch (input.provider) {
        case "cloudinary": {
          const adapter = getAdapter("cloudinary", deps);
          return adapter.createUploadAuthorization({
            userId: ctx.user.id,
            destination: input.destination,
            assets: input.assets,
            allowOverwrite: input.allowOverwrite,
          });
        }
        case "r2": {
          throw new Error(
            "R2 uploads not supported via this procedure. " +
              "Use storage.createR2Upload / storage.registerR2Upload instead."
          );
        }
      }
    }),

  registerUploadedAsset: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...registerUploadedAssetsSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertUploadDestinationAllowed({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        destination: input.destination,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      switch (input.provider) {
        case "cloudinary": {
          const adapter = getAdapter("cloudinary", deps);
          return adapter.registerUploadedAsset({
            destination: input.destination,
            assets: input.assets,
            eventDate: input.eventDate,
            userId: ctx.user.id,
          });
        }
        case "r2": {
          throw new Error(
            "R2 register-uploaded-asset not supported via this procedure. " +
              "Use storage.createR2Upload / storage.registerR2Upload instead."
          );
        }
      }
    }),

  /* ====================================================================== */
  /*  Upload R2 — Phase 2 (enrichi avec destination + originalFileName)     */
  /* ====================================================================== */

  createR2Upload: protectedProcedure
    .input(createR2UploadAuthorizationSchema)
    .mutation(async ({ ctx, input }) => {
      await assertUploadDestinationAllowed({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        destination: input.destination,
      });
      // Le chemin se calcule ICI, une seule fois, avec la même règle que
      // Cloudinary. `buildR2Path` (client) n'existe plus.
      const folder = await resolvePendingUploadFolder({
        prisma: ctx.prisma,
        destination: input.destination,
        appRoot: ctx.appRoot,
        userId: ctx.user.id,
      });
      const fileName = buildUploadFileName(input.originalFileName);
      const path = `${folder}/${fileName}`;

      const adapter = getAdapter("r2", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      const auth = await adapter.createUploadAuthorization({
        path,
        mimeType: input.mimeType,
        maxBytes: input.maxBytes,
      });

      // Le client a besoin du chemin résolu : il le renverra tel quel à
      // `registerR2Upload`. Le chemin ne retraverse jamais une règle de calcul.
      return { ...auth, path };
    }),

  /**
   * Phase 2 — l'input transporte maintenant `destination` + `originalFileName`
   * pour permettre à l'adapter R2 de créer la row MediaAsset après HeadObject.
   */
  registerR2Upload: protectedProcedure
    .input(registerR2UploadInputSchema)
    .mutation(async ({ ctx, input }) => {
      await assertUploadDestinationAllowed({
        prisma: ctx.prisma,
        userId: ctx.user.id,
        destination: input.destination,
      });
      const adapter = getAdapter("r2", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      return adapter.registerUploadedAsset({
        path: input.path,
        userId: ctx.user.id,
        expectedBytes: input.expectedBytes,
        expectedMimeType: input.expectedMimeType,
        destination: input.destination,
        originalFileName: input.originalFileName,
      });
    }),
});
