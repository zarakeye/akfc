import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Ce qui compte comme extension en fin de nom : 1 à 8 caractères
 * alphanumériques. Exclut les points internes d'un libellé (« (ep. BAZZE) »).
 */
const EXTENSION_PATTERN = /\.[A-Za-z0-9]{1,8}$/;

/**
 * La corbeille est une FEUILLE dans l'arbre du finder : on n'expose jamais son
 * sous-arbre physique `.trash/<uuid>/…`. On elague recursivement les enfants du
 * noeud dont le chemin est exactement `binPath`. (La vue plate lit trash.listBin,
 * le drill-down passe par `list` — aucun ne depend de getTree.)
 */
/**
 * La corbeille (`<racine>/bin/…`) n'appartient qu'au routeur `trash` : ni renommage ni déplacement
 * n'y entre ou n'en sort par `storage`. Restaurer et vider ont leurs propres gardes (TrashEntry).
 */
function assertOutsideBin(appRoot: string, paths: readonly string[]): void {
  const bin = `${appRoot}/bin`;
  if (paths.some((p) => p === bin || p.startsWith(`${bin}/`))) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "La corbeille se gère depuis sa propre vue (restaurer, supprimer).",
    });
  }
}

function stripBinSubtree(node: StorageFolderNode, binPath: string): void {
  for (const child of node.children ?? []) {
    if (child.type !== "folder") continue;
    if (child.path === binPath) {
      child.children = [];
      child.hasChildren = false;
    } else {
      stripBinSubtree(child, binPath);
    }
  }
}
import {
  enrichFilesWithStatus,
  enrichTreeWithStatus,
} from "@backend/modules/storage/services/enrichStatus.service";

import { router, protectedProcedure } from "@backend/trpc";
import { isAdmin } from "@backend/trpc/middleware";

import {
  storageProviderSchema,
  storageMoveIntentSchema,
  createR2UploadAuthorizationSchema,
  type StorageFolderNode,
} from "@contracts/storage";

import { uploadDestinationSchema, type UploadDestination } from "@contracts/storage/upload-destination.schema";
import { uploadTypeError } from "@contracts/storage/allowedUploadTypes";

import { getAdapter } from "@backend/modules/storage/providerRegistry";
import { VirtualStorage } from "@backend/modules/storage/virtualStorage";
import { isProtectedEntityFolderPath } from "@backend/modules/storage/protectedEntityFolder";
import { isRootFolder } from "@backend/modules/storage/services/ensureRootFolders.service";
import {
  planMoveOperations,
  executeMoveOperations,
} from "@backend/modules/storage/resolveMoveIntent.service";
import { countPersoImages } from "@backend/modules/media/services/countPersoImages.service";
import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";
import { listCommonRepositoryFolders } from "@backend/modules/media/services/listCommonRepositoryFolders.service";
import { listMyCommonRepositoryContainers } from "@backend/modules/media/services/listMyCommonRepositoryContainers.service";
import { commonRepositoryContainerPath } from "@backend/modules/media/services/commonRepositoryContainerPath.service";
import { resolvePendingUploadFolder } from '@backend/modules/storage/services/resolvePendingUploadFolder.service';
import { assertCanReadPath } from "@backend/modules/memberGroups/assertCanReadPath.service";
import { assertCanWritePaths } from "@backend/modules/memberGroups/assertCanWritePaths.service";
import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";
import { scopePersoSpaceInTree } from "@backend/modules/storage/scopePersoSpace.service";
import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";
import {
  mergeGroupSpaceFolders,
  mergeGroupSpaceFoldersIntoTree,
} from "@backend/modules/storage/mergeGroupSpaceFolders.service";
import {
  ensureContentRootsInTree,
  missingContentRootFolders,
  requiredRootPaths,
} from "@backend/modules/storage/ensureContentRoots.service";
import {
  applyGroupSpaceNamesToFolders,
  applyGroupSpaceNamesToTree,
} from "@backend/modules/storage/applyGroupSpaceNames.service";
import { assertUploadDestinationAllowed } from '@backend/modules/storage/assertUploadDestinationAllowed.service';
import { buildUploadFileName } from '@backend/modules/storage/services/buildUploadFileName.service';

/**
 * storageRouter — finder (lecture, renommage, déplacement) et envois vers R2.
 */

/* -------------------------------------------------------------------------- */
/*  Schema R2 Phase 2 — inline                                                */
/* -------------------------------------------------------------------------- */

/**
 * Destination metier — discriminée pour gérer les deux cas :
 *   - existing-discipline : on a categoryId + disciplineId direct
 *   - new-discipline : on a categoryId + proposedDisciplineName (admin validera plus tard)
 *
 * Forme identique à ce que `DragNDropForm` construit côté frontend.
 */

/**
 * Remplacer un fichier déjà connu, c'est publier un contenu SANS repasser par la validation : la
 * ligne garde son statut. Un dépôt ouvert à tout membre (discipline, stage, événement, dépôt commun)
 * ne doit donc pas permettre de remplacer un fichier publié, ou déposé par quelqu'un d'autre.
 * Autorisé : un administrateur ; un éditeur dans l'espace de son groupe (il peut déjà y mettre à la
 * corbeille ; son droit d'écriture est vérifié par assertUploadDestinationAllowed) ; l'auteur d'un
 * fichier encore en attente. Vérifié à la signature ET à l'enregistrement : l'enregistrement met à
 * jour la ligne existante, auteur compris.
 */
function mayReplace(
  existing: { status: string; uploaderUserId: string },
  user: { id: string; isAdmin: boolean },
  destination: UploadDestination,
): boolean {
  return (
    user.isAdmin ||
    destination.kind === "group" ||
    (existing.status === "pending" && existing.uploaderUserId === user.id)
  );
}

const registerR2UploadInputSchema = z.object({
  path: z.string().min(1),
  expectedBytes: z.number().int().positive(),
  expectedMimeType: z.string().min(1),
  // Phase 2 — nouveaux champs requis pour créer la row MediaAsset
  destination: uploadDestinationSchema,
  originalFileName: z.string().min(1).max(255),
});

/* -------------------------------------------------------------------------- */
/*  Router                                                                    */
/* -------------------------------------------------------------------------- */

export const storageRouter = router({
  /* ====================================================================== */
  /*  Lecture (inchangé)                                                    */
  /* ====================================================================== */

  /**
   * Compteurs « à traiter » de la bibliothèque, pour la cloche du header :
   * assets en attente de classement (MediaAsset.status "pending") et
   * entrées de corbeille (TrashEntry IN_BIN). Réservée aux administrateurs : ce sont des
   * compteurs de toute la bibliothèque, et la cloche qui les affiche n'existe que pour eux.
   */
  getAttentionCounts: protectedProcedure.use(isAdmin).query(async ({ ctx }) => {
    const [pending, bin, commonRepositoryPending, persoCounts] = await Promise.all([
      ctx.prisma.mediaAsset.count({ where: { status: "pending" } }),
      ctx.prisma.trashEntry.count({ where: { status: "IN_BIN" } }),
      ctx.prisma.mediaAsset.count({
        where: {
          status: "pending",
          appRoot: ctx.appRoot,
          fullPath: { contains: "/common-repository/" },
        },
      }),
      countPersoImages({
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.sessionClient.user.id,
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
   * Réservée aux administrateurs : elle nomme les dossiers de toute la bibliothèque,
   * espaces personnels compris.
   */
  getPendingBreakdown: protectedProcedure.use(isAdmin).query(async ({ ctx }) => {
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

    const commonRepositoryRoot = `${ctx.appRoot}/common-repository`;
    const persosRoot = `${ctx.appRoot}/personal-space`;

    const entries = Array.from(counts.entries()).map(([path, count]) => {
      let kind: "common_repository" | "perso" | "folder" = "folder";
      if (path === commonRepositoryRoot || path.startsWith(`${commonRepositoryRoot}/`)) {
        kind = "common_repository";
      } else if (path.startsWith(`${persosRoot}/`)) {
        // Personnel de l'utilisateur courant uniquement : le dossier porte
        // son id. Ceux des autres restent des dossiers ordinaires.
        kind = path.includes(ctx.sessionClient.user.id) ? "perso" : "folder";
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
   * seule). Le dossier perso est dérivé de `ctx.sessionClient.user.id`, jamais d'un input.
   */
  getPersoPhotoQuota: protectedProcedure.query(async ({ ctx }) => {
    const counts = await countPersoImages({
      prisma: ctx.prisma,
      appRoot: ctx.appRoot,
      userId: ctx.sessionClient.user.id,
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

  // Sujets des dépôts de l'utilisateur courant (page membre) — scopé user.
  listMyCommonRepositoryContainers: protectedProcedure.query(async ({ ctx }) => {
    return listMyCommonRepositoryContainers({
      prisma: ctx.prisma,
      appRoot: ctx.appRoot,
      userId: ctx.sessionClient.user.id,
    });
  }),

  // Pose le libellé humain d'un conteneur de dépôt (appelé par le front après
  // un dépôt réussi). Le path est dérivé de ctx.sessionClient.user.id → un membre ne peut
  // labelliser QUE ses propres conteneurs.
  setCommonRepositoryLabel: protectedProcedure
    .input(z.object({ subject: z.string().trim().min(1).max(120), label: z.string().trim().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const path = await commonRepositoryContainerPath({
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.sessionClient.user.id,
        subject: input.subject,
      });
      await ctx.prisma.folderLabel.upsert({
        where: { path },
        update: { displayName: input.label },
        create: { path, displayName: input.label },
      });
      return { ok: true };
    }),

  /**
   * Hiérarchie des espaces collaboratifs : chemin d'espace RÉEL + parent,
   * pour l'imbrication visuelle du finder admin (les chemins physiques
   * restent inchangés). Réservé aux admins.
   */
  groupSpaceHierarchy: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.sessionClient.user.isAdmin) return [];

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
    const isAdmin = ctx.sessionClient.user.isAdmin;

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
      : await collaborativeEntriesForMember(ctx.prisma, ctx.sessionClient.user.id);

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

  list: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        cursor: z.string().optional(),
        limit: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      const reader = backend;
      const result = await reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
      // Le statut vit en DB depuis l'aplatissement : on le rapatrie ici.
      await enrichFilesWithStatus(ctx.prisma, ctx.appRoot, result.files);
      // Espaces de groupe visibles même vides : R2 n'a pas de
      // vrais dossiers, un espace sans asset s'évaporerait du listing.
      if (input.path === `${ctx.appRoot}/collaborative-group-spaces`) {
        const merged = await mergeGroupSpaceFolders({
          result,
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          userId: ctx.sessionClient.user.id,
        });
        return {
          ...merged,
          folders: await applyGroupSpaceNamesToFolders(
            merged.folders,
            ctx.prisma,
          ),
        };
      }
      // Racine du finder : racines principales visibles même vides (grille).
      if (input.path === ctx.appRoot) {
        const missing = await missingContentRootFolders(
          result.folders.map((f) => f.path),
          ctx.prisma,
          ctx.appRoot,
        );
        return {
          ...result,
          folders: await applyGroupSpaceNamesToFolders(
            [...result.folders, ...missing],
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
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      const reader = backend;
      // Perso : quand la grille demande le conteneur personal-space
      // (adapter.list = getTree depth1), on lit en réalité le sous-espace de
      // l'utilisateur courant → il ne voit QUE son contenu (privé + illusion).
      const persoContainer = `${ctx.appRoot}/personal-space`;
      let readPath = input.path;
      if (input.path === persoContainer) {
        try {
          readPath = await resolvePersoBaseFolder({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot,
            userId: ctx.sessionClient.user.id,
          });
        } catch {
          readPath = input.path;
        }
      }
      const result = await reader.getTree({
        path: readPath,
        depth: input.depth,
      });
      // Corbeille = feuille : jamais de `.trash` dans l'arbre du finder.
      stripBinSubtree(result.root, `${ctx.appRoot}/bin`);
      await enrichTreeWithStatus(ctx.prisma, ctx.appRoot, result.root);
      // Espaces de groupe ET perso visibles même vides, dans l'arbre du finder.
      result.root = await mergeGroupSpaceFoldersIntoTree({
        root: result.root,
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.sessionClient.user.id,
      });
      // Racines principales visibles même vides (courses/seminars/events/
      // personal-space/collaborative-group-spaces/common-repository).
      // Uniquement à la RACINE : la grille fait adapter.list = getTree
      // depth1 sur CHAQUE dossier ; sans cette garde on injecterait les
      // racines de contenu dans tous les dossiers.
      if (input.path === ctx.appRoot) {
        result.root = await ensureContentRootsInTree(
          result.root,
          ctx.prisma,
          ctx.appRoot,
        );
      }
      // Perso : dans l'arbre racine, aplatir personal-space sur le contenu du
      // sous-espace de l'utilisateur courant (masque les autres admins).
      if (input.path === ctx.appRoot) {
        result.root = scopePersoSpaceInTree(
          result.root,
          ctx.appRoot,
          ctx.sessionClient.user.id,
        );
      }
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

  // Racines de contenu (label-only) : le front y route « Renommer » vers
  // l'édition du FolderLabel plutôt que le rename physique.
  contentRootPaths: protectedProcedure.query(({ ctx }) =>
    requiredRootPaths(ctx.prisma, ctx.appRoot),
  ),

  setFolderLabel: protectedProcedure
    .input(
      z.object({
        path: z.string().min(1),
        displayName: z.string().trim().max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Un libellé change ce que TOUT LE MONDE voit : même droit qu'un renommage.
      await assertCanWritePaths({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, paths: [input.path] });
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
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
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
      })
    )
    .query(async ({ ctx, input }) => {
      await assertCanReadPath({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        path: input.path,
      });
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
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
   * (l'extension affichée est reconstruite par `displayName`). L'extension de
   * la source est réappliquée telle quelle.
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
      // Écriture : un administrateur partout, un éditeur dans l'espace de son groupe.
      await assertCanWritePaths({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, paths: [input.path] });
      assertOutsideBin(ctx.appRoot, [input.path]);
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
      // « . » et « .. » feraient un chemin que toutes les gardes refusent (`includes("..")`) : le
      // dossier renommé deviendrait illisible pour tout le monde.
      if (cleanName === "." || cleanName.includes("..")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nom ne peut pas contenir « .. ».",
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

      // Racine de contenu (catégorie / stages / events / espaces / dépôt) :
      // nom PHYSIQUE immuable aussi. Son « Renommer » édite le FolderLabel
      // côté client ; un rename physique casserait le lien catégorie↔dossier
      // et les gardes. Refusé ici (défense en profondeur).
      if (input.type === "folder") {
        const roots = await requiredRootPaths(ctx.prisma, ctx.appRoot);
        if (roots.includes(input.path)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "Cette racine ne se renomme pas physiquement (libellé éditable).",
          });
        }
      }

      // ─── FICHIER : on n'édite QUE le nom d'affichage ───────────────────
      //
      // Depuis la slugification (increment 1), la clé de stockage est un slug
      // stable et opaque. Renommer un fichier ne déplace donc plus rien chez
      // le provider et ne devine plus d'extension (fin du bug historique) :
      // c'est un simple UPDATE de `displayName`, par le chemin exact. Deux fichiers peuvent
      // partager un nom d'affichage : pas de contrôle de collision ici, la clé reste unique.
      if (input.type === "file") {
        const result = await ctx.prisma.mediaAsset.updateMany({
          where: { appRoot: ctx.appRoot, fullPath: input.path },
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

      // On n'écrase jamais un élément existant : un objet (ou un dossier non vide) chez le stockage,
      // une ligne MediaAsset, un dossier enregistré (même contrôle que storage.move).
      const [collision, asset, folder] = await Promise.all([
        adapter.getNode ? adapter.getNode(targetPath) : Promise.resolve(null),
        ctx.prisma.mediaAsset.findUnique({ where: { fullPath: targetPath }, select: { id: true } }),
        ctx.prisma.folder.findFirst({ where: { appRoot: ctx.appRoot, fullPath: targetPath }, select: { id: true } }),
      ]);
      if (collision || asset || folder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un élément porte déjà ce nom dans ce dossier.",
        });
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Écriture : la SOURCE et la CIBLE. Un éditeur ne sort rien de l'espace de son groupe, et
      // n'y fait rien entrer qui vienne d'ailleurs.
      {
        const source = input.intent.source;
        const sourcePaths = source.type === "selection" ? source.roots : [source.path];
        const targetPaths = [input.intent.target.path];
        await assertCanWritePaths({
          prisma: ctx.prisma,
          userId: ctx.sessionClient.user.id,
          paths: [...sourcePaths, ...targetPaths],
        });
        assertOutsideBin(ctx.appRoot, [...sourcePaths, ...targetPaths]);
      }

      // Dossier-entité : chemin immuable, pas de déplacement du binaire.
      // Même raison qu'au rename ; couvre aussi les sélections multiples.
      {
        const movedPaths =
          input.intent.source.type === "folder"
            ? [input.intent.source.path]
            : input.intent.source.type === "selection"
              ? input.intent.source.roots
              : [];
        // Les racines de contenu (cours, stages, événements, espaces…) et la corbeille non plus :
        // leur chemin est connu du code (destinations d'envoi, gardes, libellés).
        const roots = await requiredRootPaths(ctx.prisma, ctx.appRoot);
        if (
          movedPaths.some(
            (pth) =>
              isProtectedEntityFolderPath(pth) ||
              roots.includes(pth) ||
              isRootFolder(ctx.appRoot, pth),
          )
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Ce dossier système ne peut pas être déplacé.",
          });
        }
      }

      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      const planned = await planMoveOperations({ adapter, appRoot: ctx.appRoot, intent: input.intent });
      // Une opération sur place (déposer un élément dans son propre dossier) n'a rien à faire :
      // l'adapter renommerait un objet sur lui-même, le stockage refuserait, et tout le geste échouerait.
      const effectiveOperations = planned.filter(
        (operation) => operation.source.path !== operation.target.path,
      );

      // Rien ne s'écrase en silence : une copie S3 remplace l'objet qui porte déjà la clé cible, et
      // la ligne MediaAsset déplacée heurterait la contrainte d'unicité APRÈS la copie — le fichier
      // d'arrivée serait perdu. On vérifie donc chaque cible avant la moindre écriture : un objet
      // (ou un dossier non vide) chez le stockage, une ligne MediaAsset, un dossier enregistré.
      const targets = new Set<string>();
      for (const operation of effectiveOperations) {
        const target = operation.target.path;
        // Deux éléments de la même sélection qui arriveraient au même nom.
        if (targets.has(target)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Deux éléments de la sélection s'appellent « ${target.slice(target.lastIndexOf("/") + 1)} ».`,
          });
        }
        targets.add(target);
        const [node, asset, folder] = await Promise.all([
          adapter.getNode ? adapter.getNode(target) : Promise.resolve(null),
          ctx.prisma.mediaAsset.findUnique({ where: { fullPath: target }, select: { id: true } }),
          ctx.prisma.folder.findFirst({ where: { appRoot: ctx.appRoot, fullPath: target }, select: { id: true } }),
        ]);
        if (node || asset || folder) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `« ${target.slice(target.lastIndexOf("/") + 1)} » existe déjà dans le dossier de destination.`,
          });
        }
      }

      // Exécution séquentielle : des opérations concurrentes sur des
      // préfixes voisins pourraient se marcher dessus.
      await executeMoveOperations(adapter, effectiveOperations);

      return { operations: effectiveOperations };
    }),

  /* ====================================================================== */
  /*  Upload R2 — Phase 2 (enrichi avec destination + originalFileName)     */
  /* ====================================================================== */

  /**
   * Noms de fichiers qui existent DÉJÀ dans la destination (pour demander avant d'écraser).
   */
  checkR2Conflicts: protectedProcedure
    .input(z.object({ destination: uploadDestinationSchema, fileNames: z.array(z.string().min(1).max(255)).max(100) }))
    .query(async ({ ctx, input }) => {
      await assertUploadDestinationAllowed({ prisma: ctx.prisma, userId: ctx.sessionClient.user.id, isAdmin: ctx.sessionClient.user.isAdmin, destination: input.destination });
      const folder = await resolvePendingUploadFolder({
        prisma: ctx.prisma,
        destination: input.destination,
        appRoot: ctx.appRoot,
        userId: ctx.sessionClient.user.id,
      });
      // Deux fichiers du même lot peuvent donner la même clé (« Photo 1.JPG » et « photo-1.jpg ») :
      // envoyés en parallèle, le second écraserait le premier sans que personne ne l'ait demandé.
      // On les signale par leur position dans le lot (deux noms identiques ne se distinguent pas).
      const byPath = new Map<string, string>();
      const duplicateIndexes: number[] = [];
      input.fileNames.forEach((name, index) => {
        const path = `${folder}/${buildUploadFileName(name)}`;
        if (byPath.has(path)) duplicateIndexes.push(index);
        else byPath.set(path, name);
      });
      const found = await ctx.prisma.mediaAsset.findMany({ where: { fullPath: { in: [...byPath.keys()] } }, select: { fullPath: true } });
      return {
        existing: found.map((f) => byPath.get(f.fullPath)).filter((name): name is string => Boolean(name)),
        duplicateIndexes,
      };
    }),

  createR2Upload: protectedProcedure
    .input(createR2UploadAuthorizationSchema)
    .mutation(async ({ ctx, input }) => {
      await assertUploadDestinationAllowed({
        prisma: ctx.prisma,
        userId: ctx.sessionClient.user.id,
        isAdmin: ctx.sessionClient.user.isAdmin,
        destination: input.destination,
      });
      // Le chemin se calcule ICI, une seule fois (jamais côté client).
      const folder = await resolvePendingUploadFolder({
        prisma: ctx.prisma,
        destination: input.destination,
        appRoot: ctx.appRoot,
        userId: ctx.sessionClient.user.id,
      });
      const fileName = buildUploadFileName(input.originalFileName);
      const path = `${folder}/${fileName}`;

      // Formats autorisés seulement (extension ET type déclaré) : jamais de HTML, SVG ou
      // script, qu'un navigateur pourrait exécuter s'il était affiché. Le type est signé dans
      // l'URL d'envoi, puis revérifié par registerR2Upload sur l'objet réellement stocké.
      const typeError = uploadTypeError(input.originalFileName, input.mimeType);
      if (typeError) {
        throw new TRPCError({ code: "BAD_REQUEST", message: typeError });
      }

      if (input.destination.kind === "perso" && !input.mimeType.startsWith("image/")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Le dossier perso n'accepte que des images." });
      }
      // Pas d'écrasement silencieux : confirmation explicite requise.
      const existing = await ctx.prisma.mediaAsset.findUnique({
        where: { fullPath: path },
        select: { id: true, status: true, uploaderUserId: true },
      });
      if (existing && !input.allowOverwrite) {
        throw new TRPCError({ code: "CONFLICT", message: `Un fichier « ${fileName} » existe déjà à cet endroit.` });
      }
      // Confirmer ne suffit pas : remplacer, c'est publier sans validation (mayReplace).
      if (existing && !mayReplace(existing, ctx.sessionClient.user, input.destination)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `« ${fileName} » existe déjà et ne peut être remplacé que par un administrateur. Renommez votre fichier.`,
        });
      }
      if (input.destination.kind === "perso" && !existing) {
        const { total } = await countPersoImages({ prisma: ctx.prisma, appRoot: ctx.appRoot, userId: ctx.sessionClient.user.id });
        if (total + 1 > PERSO_PHOTO_QUOTA) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Quota d'images perso atteint (max ${PERSO_PHOTO_QUOTA}).` });
        }
      }

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
        userId: ctx.sessionClient.user.id,
        isAdmin: ctx.sessionClient.user.isAdmin,
        destination: input.destination,
      });
      // Le chemin enregistré doit être celui que createR2Upload a autorisé pour cette destination.
      const expectedFolder = await resolvePendingUploadFolder({
        prisma: ctx.prisma,
        destination: input.destination,
        appRoot: ctx.appRoot,
        userId: ctx.sessionClient.user.id,
      });
      const rest = input.path.slice(expectedFolder.length + 1);
      if (!input.path.startsWith(`${expectedFolder}/`) || rest === "" || rest.includes("/") || rest.includes("..")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Chemin d'envoi hors de la destination autorisée." });
      }
      // L'enregistrement met à jour une ligne existante (auteur compris) : même règle qu'à la
      // signature, sans quoi un membre pourrait « adopter » le fichier en attente d'un autre, puis le
      // remplacer en tant qu'auteur.
      const existing = await ctx.prisma.mediaAsset.findUnique({
        where: { fullPath: input.path },
        select: { status: true, uploaderUserId: true },
      });
      if (existing && !mayReplace(existing, ctx.sessionClient.user, input.destination)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Ce fichier existe déjà et ne peut être remplacé que par un administrateur.",
        });
      }
      const adapter = getAdapter("r2", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      return adapter.registerUploadedAsset({
        path: input.path,
        userId: ctx.sessionClient.user.id,
        expectedBytes: input.expectedBytes,
        expectedMimeType: input.expectedMimeType,
        destination: input.destination,
        originalFileName: input.originalFileName,
      });
    }),
});
