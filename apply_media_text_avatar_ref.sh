#!/bin/bash
# Bloc media-text : le media peut etre un MEDIA de bibliotheque OU une
# REFERENCE AVATAR d un admin (logique : { kind:"avatar", userId }, resolue au
# rendu via User.avatar -> la page suit l avatar COURANT). Editeur : picker
# bibliotheque OU selecteur listant tous les admins. Compat ancien format
# { mediaId } via preprocess (kind:"library"). (v2 : router 'user' au
# singulier, kind litteral via 'as const', defaultData sans media:[]).
# À lancer depuis la RACINE : bash apply_media_text_avatar_ref.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

mkdir -p apps/web/src/features/page-builder/blocks/media-text packages/backend/src/modules/media/services

echo "-> packages/contracts/src/page/blocks.v1.ts"
cat > 'packages/contracts/src/page/blocks.v1.ts' << 'FILE_EOF'
import { z } from "zod";

import { proseMirrorContentSchema } from "@contracts/shared/prosemirror";

/**
 * Contrat versionné de contenu de page — v1.
 *
 * Une page est composée d'une liste ordonnée de blocs discriminés par
 * un champ `type`. Quatre types de blocs sont définis en v1 :
 *
 *   - `tiptap`           : texte riche (ProseMirror JSON)
 *   - `image-gallery`    : galerie d'images
 *   - `audio-collection` : collection de pistes audio
 *   - `document-list`    : liste de documents téléchargeables
 *
 * Voir README.md pour la philosophie (référence stable par mediaId,
 * versioning, frontière contrat / builder / renderer).
 */

/* -------------------------------------------------------------------------- */
/*  Contenu ProseMirror                                                       */
/* -------------------------------------------------------------------------- */

// Le schéma vit désormais dans shared/prosemirror.ts : il ne concerne plus
// seulement le PageBuilder (Comment.content le réutilise côté backend).
// La doc complète (opacité, raisons, consommateurs) est là-bas.

/* -------------------------------------------------------------------------- */
/*  Base commune                                                              */
/* -------------------------------------------------------------------------- */

const blockBaseSchema = z.object({
  /**
   * Identifiant stable du bloc à l'intérieur de la page.
   *
   * Généré côté builder (cuid recommandé pour cohérence avec le reste du
   * projet), il sert de clé React, de cible de focus/scroll au mount,
   * et de point d'ancrage pour le drag-and-drop.
   *
   * N'est PAS l'identifiant d'un asset — c'est l'identifiant du bloc
   * lui-même au sein de la page.
   */
  id: z.string().min(1),
});

/* -------------------------------------------------------------------------- */
/*  Bloc tiptap                                                               */
/* -------------------------------------------------------------------------- */

const tiptapBlockSchema = blockBaseSchema.extend({
  type: z.literal("tiptap"),
  content: proseMirrorContentSchema,
});

export type TipTapBlockV1 = z.infer<typeof tiptapBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Bloc image-gallery                                                        */
/* -------------------------------------------------------------------------- */

const imageGalleryLayoutSchema = z.enum(["grid", "carousel", "masonry"]);

export type ImageGalleryLayout = z.infer<typeof imageGalleryLayoutSchema>;

const imageGalleryBlockSchema = blockBaseSchema.extend({
  type: z.literal("image-gallery"),
  /**
   * Liste des images de la galerie.
   *
   * Volontairement non `.min(1)` : un bloc fraîchement ajouté par le
   * builder peut être vide le temps que l'utilisateur sélectionne ses
   * premières images via le MediaPicker. La cohérence "non vide à la
   * publication" est une décision UX, pas une décision de schema —
   * elle pourra être imposée en amont du save par le builder ou par
   * une validation côté admin si nécessaire.
   */
  items: z.array(
    z.object({
      mediaId: z.string().min(1),
      caption: z.string().optional(),
    }),
  ),
  layout: imageGalleryLayoutSchema.default("grid"),
});

export type ImageGalleryBlockV1 = z.infer<typeof imageGalleryBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Bloc audio-collection                                                     */
/* -------------------------------------------------------------------------- */

const audioCollectionBlockSchema = blockBaseSchema.extend({
  type: z.literal("audio-collection"),
  items: z.array(
    z.object({
      mediaId: z.string().min(1),
      /** Titre affiché à la place du nom de fichier brut. */
      title: z.string().optional(),
    }),
  ),
});

export type AudioCollectionBlockV1 = z.infer<typeof audioCollectionBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Bloc document-list                                                        */
/* -------------------------------------------------------------------------- */

const documentListBlockSchema = blockBaseSchema.extend({
  type: z.literal("document-list"),
  items: z.array(
    z.object({
      mediaId: z.string().min(1),
      /** Libellé du lien (à défaut, on retombe sur le nom de fichier). */
      label: z.string().optional(),
    }),
  ),
});

export type DocumentListBlockV1 = z.infer<typeof documentListBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Bloc media-text                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Bloc composite « médias + texte » côte à côte, pensé pour une mise en page
 * éditoriale. Les DEUX parties sont optionnelles :
 *
 *   - `content` + `media` non vides → rendu en deux colonnes ; le RENDERER
 *     alterne automatiquement le côté des médias d'un bloc media-text au
 *     suivant (1er : médias à gauche ; 2e : à droite ; etc.). L'ordre n'est
 *     donc PAS stocké ici — c'est une décision de rendu fondée sur la
 *     position, pas une donnée du bloc.
 *   - une seule des deux parties → rendu centré, pleine largeur.
 *
 * `media` accepte plusieurs items (images et/ou une vidéo) ; le renderer
 * décide de leur agencement (grille pour plusieurs images, lecteur pour une
 * vidéo). `content` est le même ProseMirror JSON que le bloc tiptap.
 */
/** Média issu de la bibliothèque (MediaAsset). */
const libraryMediaItemSchema = z.object({
  kind: z.literal("library").default("library"),
  mediaId: z.string().min(1),
  caption: z.string().optional(),
});

/**
 * Référence LOGIQUE à l'avatar d'un utilisateur (pas au binaire). Résolue
 * dynamiquement au rendu : la page affiche toujours l'avatar COURANT du user
 * — pas de copie, pas de synchro, pas de dérive. Si le user change d'avatar,
 * la page suit automatiquement.
 */
const avatarMediaItemSchema = z.object({
  kind: z.literal("avatar"),
  userId: z.string().min(1),
  caption: z.string().optional(),
});

/**
 * Média d'un bloc media-text : soit un média de bibliothèque, soit une
 * référence avatar. Discriminé par `kind`. L'ancien format (objet
 * `{ mediaId }` sans `kind`) est traité comme `library` par le preprocess.
 */
const mediaTextItemSchema = z.discriminatedUnion("kind", [
  libraryMediaItemSchema,
  avatarMediaItemSchema,
]);

const mediaTextBlockSchema = blockBaseSchema.extend({
  type: z.literal("media-text"),
  /** Texte riche optionnel (ProseMirror). Absent/vide → côté texte masqué. */
  content: proseMirrorContentSchema.optional(),
  /**
   * UN SEUL média optionnel : média de bibliothèque OU référence avatar.
   * Absent → côté médias masqué.
   *
   * Compat : preprocess tolérant — (1) un ancien TABLEAU est réduit à son
   * premier élément ; (2) un objet SANS `kind` (ancien format média
   * bibliothèque) reçoit `kind: "library"`.
   */
  media: z.preprocess((val) => {
    let v = val;
    if (Array.isArray(v)) v = v.length > 0 ? v[0] : undefined;
    if (
      v &&
      typeof v === "object" &&
      !("kind" in (v as Record<string, unknown>))
    ) {
      // Ancien format { mediaId, caption } → média bibliothèque.
      return { kind: "library", ...(v as Record<string, unknown>) };
    }
    return v;
  }, mediaTextItemSchema.optional()),
});

export type MediaTextBlockV1 = z.infer<typeof mediaTextBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Union discriminée                                                         */
/* -------------------------------------------------------------------------- */

export const pageBlockSchemaV1 = z.discriminatedUnion("type", [
  tiptapBlockSchema,
  imageGalleryBlockSchema,
  audioCollectionBlockSchema,
  documentListBlockSchema,
  mediaTextBlockSchema,
]);

export type PageBlockV1 = z.infer<typeof pageBlockSchemaV1>;

/**
 * Union des `type` littéraux acceptés en v1.
 *
 * Pratique pour typer les clés d'un registry — voir
 * `features/page-builder/blockRegistry.ts` (sous-chantier 5).
 */
export type PageBlockKindV1 = PageBlockV1["type"];

/* -------------------------------------------------------------------------- */
/*  Enveloppe versionnée                                                      */
/* -------------------------------------------------------------------------- */

export const pageContentSchemaV1 = z.object({
  version: z.literal(1),
  blocks: z.array(pageBlockSchemaV1),
});

export type PageContentV1 = z.infer<typeof pageContentSchemaV1>;

/* -------------------------------------------------------------------------- */
/*  Helper de fabrique                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Fabrique un contenu de page vide, prêt à recevoir des blocs via le
 * builder. À utiliser comme valeur initiale d'un nouveau Course / Stage /
 * Post tant que l'admin n'a rien composé.
 */
export function emptyPageContentV1(): PageContentV1 {
  return { version: 1, blocks: [] };
}
FILE_EOF

echo "-> packages/contracts/src/page/extractMediaIds.ts"
cat > 'packages/contracts/src/page/extractMediaIds.ts' << 'FILE_EOF'
import type { PageBlockV1, PageContentV1 } from "@contracts/page/blocks.v1";

/**
 * Extraction des références `mediaId` d'un bloc ou d'un contenu de page.
 *
 * Ces fonctions sont pures, indépendantes de toute couche de stockage,
 * et utilisées à deux endroits :
 *
 *   - Backend, au save d'une page (cf. routers course / stage / post) :
 *     calcul du diff entre références anciennes et nouvelles pour
 *     synchroniser la table `PageMediaReference`.
 *
 *   - Frontend, dans le builder : afficher à l'utilisateur quels
 *     mediaIds seront libérés si un bloc est supprimé (affordance UX).
 */

/* -------------------------------------------------------------------------- */
/*  API publique                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Collecte les `mediaId` directement référencés par un bloc.
 *
 * Le `switch` est exhaustif sur `block.type` — ajouter un nouveau type au
 * `pageBlockSchemaV1` produit une erreur de compilation ici tant que le
 * `case` correspondant n'a pas été ajouté. C'est le principal garde-fou
 * contre les références fantômes au moment où le contrat évolue.
 */
export function extractMediaIdsFromBlock(
  block: PageBlockV1,
): readonly string[] {
  switch (block.type) {
    case "image-gallery":
      return block.items.map((item) => item.mediaId);
    case "audio-collection":
      return block.items.map((item) => item.mediaId);
    case "document-list":
      return block.items.map((item) => item.mediaId);
    case "tiptap":
      return walkProseMirrorForMediaIds(block.content);
    case "media-text":
      // Seul un média de bibliothèque a un mediaId à résoudre ; une référence
      // avatar est résolue dynamiquement ailleurs (via User.avatar).
      return [
        ...(block.media && block.media.kind === "library"
          ? [block.media.mediaId]
          : []),
        ...walkProseMirrorForMediaIds(block.content),
      ];
    default:
      return assertNever(block);
  }
}

/**
 * Collecte tous les `mediaId` référencés par un contenu de page complet.
 *
 * Dédupliqué : un même asset peut apparaître dans plusieurs blocs (par
 * exemple la même photo dans deux galeries différentes), mais la table
 * `PageMediaReference` est uniquée par `(mediaAsset, page)`, donc on
 * dédup avant l'écriture pour éviter des erreurs d'unicité au save.
 */
export function extractMediaIdsFromContent(
  content: PageContentV1,
): readonly string[] {
  const ids = content.blocks.flatMap(extractMediaIdsFromBlock);
  return Array.from(new Set(ids));
}

/* -------------------------------------------------------------------------- */
/*  Walker ProseMirror                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Traverse un arbre ProseMirror à la recherche des nodes `library-image`
 * et collecte leurs `mediaId`.
 *
 * Le node `library-image` est introduit par l'extension TipTap du builder
 * (sous-chantier 3 du plan). On le reconnaît par :
 *
 *   - `node.type === 'library-image'`
 *   - `node.attrs.mediaId` (string non-vide)
 *
 * Cette traversée est volontairement défensive : le contenu ProseMirror
 * est typé `Record<string, unknown>` dans le schema, donc on ne fait
 * aucune hypothèse forte sur la structure. Un payload corrompu ou
 * inattendu rend une liste vide plutôt que de jeter — le save d'une
 * page ne doit pas exploser à cause d'un artefact d'édition.
 */
function walkProseMirrorForMediaIds(content: unknown): readonly string[] {
  const ids: string[] = [];

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;

    const candidate = node as {
      type?: unknown;
      attrs?: { mediaId?: unknown };
      content?: unknown;
    };

    if (
      candidate.type === "library-image" &&
      typeof candidate.attrs?.mediaId === "string" &&
      candidate.attrs.mediaId.length > 0
    ) {
      ids.push(candidate.attrs.mediaId);
    }

    if (Array.isArray(candidate.content)) {
      for (const child of candidate.content) walk(child);
    }
  }

  walk(content);
  return ids;
}

/* -------------------------------------------------------------------------- */
/*  Garde d'exhaustivité                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Vérifie à la compilation que tous les cas d'une union discriminée
 * sont couverts. Utilisée comme `default` dans le switch ci-dessus —
 * si une branche manque, TypeScript échoue parce que `value` n'est
 * pas `never`.
 */
function assertNever(value: never): never {
  throw new Error(
    `Cas de bloc non couvert dans extractMediaIdsFromBlock : ${JSON.stringify(value)}`,
  );
}
FILE_EOF

echo "-> packages/backend/src/modules/media/services/resolveAvatarsByUserIds.service.ts"
cat > 'packages/backend/src/modules/media/services/resolveAvatarsByUserIds.service.ts' << 'FILE_EOF'
import type { PrismaClient } from "@prisma/client";

import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import type { ResolvedMedia } from "@contracts/page";

/**
 * Résout les avatars d'une liste d'utilisateurs en `ResolvedMedia`, pour les
 * blocs media-text qui référencent « l'avatar de tel user » (référence
 * LOGIQUE, résolue dynamiquement → la page suit toujours l'avatar courant).
 *
 * `User.avatar` stocke un publicId Cloudinary (délivrance signée via le
 * proxy). On construit l'URL de la même façon que pour un MediaAsset image.
 * Un user sans avatar → absent de la map (le rendu affichera un placeholder).
 */
export async function resolveAvatarsByUserIds(
  prisma: PrismaClient,
  userIds: string[],
): Promise<Record<string, ResolvedMedia | null>> {
  const out: Record<string, ResolvedMedia | null> = {};
  for (const id of userIds) out[id] = null;

  if (userIds.length === 0) return out;

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, avatar: true, firstName: true, lastName: true },
  });

  for (const user of users) {
    if (!user.avatar) continue; // pas d'avatar → reste null (placeholder)
    const url = buildMediaProxyUrl(
      { publicId: user.avatar, fullPath: "" },
      "public",
    );
    out[user.id] = {
      url,
      kind: "image",
      posterUrl: null,
      mimeType: "image/*",
      fileName:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "avatar",
      width: null,
      height: null,
      duration: null,
    };
  }

  return out;
}
FILE_EOF

echo "-> packages/backend/src/modules/users/router.ts"
cat > 'packages/backend/src/modules/users/router.ts' << 'FILE_EOF'
import { router, protectedProcedure } from "@backend/trpc/core";
import { requirePermission, isAdmin } from "@backend/trpc/middleware";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

import type { UserProfile } from "@contracts/users/user-profile.types";
import { updateMeFormSchema } from "@contracts/forms/updateMeForm.schema";
import { updateUserRoleByIdSchema } from "@contracts/forms/updateUserRoleById.schema";

export const userRouter = router({
  getAll: protectedProcedure
    .use(requirePermission("manage_users"))
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findMany({
        orderBy: { id: "asc" },
        relationLoadStrategy: "join",
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        relationLoadStrategy: "join",
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  getByEmail: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        relationLoadStrategy: "join",
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  create: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z
          .string()
          .min(12, "Le mot de passe doit avoir au moins 12 caractères"),
        roleId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hash = await bcrypt.hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hash,
          roleId: input.roleId,
        },
      });

      return {
        success: true,
        user,
      };
    }),

  updateProfile: protectedProcedure
    .input(updateMeFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;

      return ctx.prisma.user.update({
        where: { id: userId },
        data: {
          ...input,
          isFirstLogin: false,
        },
      });
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.delete({
        where: { id: input.id },
      });
    }),

  getCurrentUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        avatar: true,
        aboutMe: true,
        phone: true,
        birthDate: true,
        isFirstLogin: true,
        role: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const userProfile = {
      ...user,
      birthDate: user.birthDate
        ? user.birthDate.toISOString().split("T")[0]
        : null,
    };

    return userProfile satisfies UserProfile;
  }),

  updateUserRoleById: protectedProcedure
    .use(requirePermission("manage_users"))
    .input(updateUserRoleByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.sessionClient.user.id;

      if (actorId === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change your own role.",
        });
      }

      const role = await ctx.prisma.role.findUnique({
        where: { id: input.roleId },
        select: { id: true },
      });

      if (!role) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Role not found",
        });
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { roleId: input.roleId },
        relationLoadStrategy: "join",
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      return user;
    }),

  getProfileById: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          pseudo: true,
          avatar: true,
          aboutMe: true,
          phone: true,
          birthDate: true,
          isFirstLogin: true,
          role: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userProfile = {
        ...user,
        birthDate: user.birthDate
          ? user.birthDate.toISOString().split("T")[0]
          : null,
      };

      return userProfile satisfies UserProfile;
    }),

  /**
   * Liste tous les users qui sont **factuellement** instructeurs — c'est-à-dire
   * qui ont au moins une relation d'animation dans le club : ils animent
   * une discipline, un cours, ou un stage (en tant qu'animateur principal
   * ou secondaire).
   *
   * Le club n'a pas de rôle "instructor" nominal en schéma ; cette
   * définition factuelle permet de peupler les sélecteurs des forms admin
   * (Course, Stage, etc.) sans dépendre d'un signal qui n'existe pas.
   *
   * Si un jour tu veux désigner un nouvel instructeur qui n'anime encore
   * rien, il faudra introduire un autre signal (rôle dédié ou flag
   * `isInstructor` sur User) — auquel cas cette query devra évoluer.
   *
   * Sélection minimale (id + nom) suffisante pour l'affichage en dropdown.
   * Tri par lastName puis firstName pour l'UX du select.
   */
  getInstructors: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        OR: [
          { disciplinesAsInstructor: { some: {} } },
          { coursesAsInstructor: { some: {} } },
          { stagesAsPrimaryAnimator: { some: {} } },
          { stagesAsAnimator: { some: {} } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        email: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),

  /**
   * Liste tous les administrateurs (rôle ADMIN) avec leur avatar courant,
   * pour peupler le sélecteur d'avatar du bloc media-text (« utiliser
   * l'avatar de X »). Inclut les admins SANS avatar (avatar `null`) — l'UI
   * affichera un placeholder. `avatar` est un publicId Cloudinary brut ;
   * l'URL d'affichage est construite côté client comme pour l'avatar du
   * header.
   */
  listAvatarCandidates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { role: { name: "ADMIN" } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        avatar: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),
});
FILE_EOF

echo "-> apps/web/src/features/page-builder/BlockDefinition.types.ts"
cat > 'apps/web/src/features/page-builder/BlockDefinition.types.ts' << 'FILE_EOF'
import type { ComponentType, ReactNode } from "react";
import type { PageBlockV1, ResolvedMedia } from "@contracts/page";

/**
 * Définition complète d'un type de bloc dans le builder de page.
 *
 * Trois rôles cohabitent dans cette interface unique :
 *
 *   1. **Métadonnées d'affichage** — `kind`, `label`, `icon` :
 *      consommés par le menu "+" du PageBuilder pour proposer
 *      l'ajout du bloc.
 *
 *   2. **Fabrique** — `defaultData(id)` : rend un bloc vide prêt à
 *      être ajouté au composite. L'`id` est fourni par le PageBuilder
 *      (cuid) au moment de la création — externalisé pour que le
 *      builder puisse cibler immédiatement le nouveau bloc (focus,
 *      scroll-into-view, drag handle).
 *
 *   3. **Composants** — `Editor` (client) pour l'édition, `View`
 *      (typiquement RSC) pour le rendu en lecture. La chrome
 *      transverse (drag handle, label de type, bouton supprimer)
 *      est dans le PageBuilder, pas dans chaque Editor.
 *
 * Le générique `TBlock` est instancié par chaque entrée du registry
 * pour une variante précise du discriminated union `PageBlockV1` —
 * c'est ce qui garantit le typage strict des props passées à Editor
 * et View, et qui rend `getBlockDefinition('tiptap').Editor` typé
 * pour les TipTapBlockV1 spécifiquement (pas l'union dégénérée).
 */
export interface BlockDefinition<TBlock extends PageBlockV1> {
  /**
   * Discriminant du bloc. Doit matcher exactement `TBlock['type']`,
   * c'est le typage qui force la cohérence.
   */
  kind: TBlock["type"];

  /** Libellé affiché dans le menu "+" du PageBuilder. */
  label: string;

  /**
   * Icône affichée dans le menu "+" et dans la chrome du bloc.
   *
   * `ReactNode` plutôt que `ComponentType` : on attend une instance
   * (`<Icon />`) plutôt qu'une référence (`Icon`), pour permettre des
   * compositions plus fines si besoin (icône avec badge, etc.).
   *
   * Doit être server-safe (pas de hooks) — peut être consommée par
   * le RSC du PageRenderer indirectement via le registry.
   */
  icon: ReactNode;

  /**
   * Fabrique un bloc vide. L'`id` est fourni par le PageBuilder, pas
   * par le bloc lui-même — typiquement `cuid()` côté frontend.
   */
  defaultData: (id: string) => TBlock;

  /**
   * Composant client d'édition. Reçoit le bloc courant et un callback
   * de mise à jour, ne gère QUE le contenu spécifique au bloc.
   *
   * Implémenté progressivement par type de bloc dans les sous-livraisons
   * suivantes du sous-chantier 5.
   */
  Editor: ComponentType<BlockEditorProps<TBlock>>;

  /**
   * Composant de rendu en lecture seule. Typiquement un Server Component
   * (file marqué `view.server.tsx`), qui résout les références médias
   * en URL via la couche storage avant émission HTML.
   *
   * Implémenté au sous-chantier 6 (le renderer public).
   */
  View: ComponentType<BlockViewProps<TBlock>>;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props des composants                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Props du composant `Editor` d'un bloc.
 *
 * Signature volontairement minimale : pas d'`onRemove`, pas d'`onMoveUp` —
 * ce sont des affaires de chrome, gérées par le PageBuilder en wrapper
 * autour de l'Editor. L'Editor ne sait que se rendre et notifier le
 * changement de son propre contenu.
 */
export interface BlockEditorProps<TBlock extends PageBlockV1> {
  block: TBlock;
  onChange: (next: TBlock) => void;
  /**
   * Côté d'affichage des médias dans la preview du builder, calculé par le
   * PageBuilder selon la position du bloc parmi les blocs `media-text`
   * (même alternance que le rendu public). Optionnel — seul le bloc
   * media-text l'exploite pour sa preview.
   */
  mediaSide?: "left" | "right";
}

/**
 * Props du composant `View` d'un bloc.
 *
 * Le bloc lui-même + un **lookup synchrone** des mediaIds vers leurs
 * informations résolues. Le `PageRenderer` (RSC) extrait tous les
 * mediaIds de la page en amont, fait une résolution batch en une
 * requête, et passe `resolveMedia` à chaque View — qui peut alors
 * accéder aux URLs / mimeType / dimensions sans aucun appel asynchrone.
 *
 * `resolveMedia(mediaId)` rend `null` si l'asset n'existe pas ou n'est
 * pas en `published` (cf. la sémantique du service `resolveMediaByIds`).
 * À la View de présenter un placeholder dans ce cas, sans casser.
 */
export interface BlockViewProps<TBlock extends PageBlockV1> {
  block: TBlock;
  resolveMedia: (mediaId: string) => ResolvedMedia | null;
  /**
   * Résout l'avatar COURANT d'un utilisateur (pour les blocs media-text qui
   * référencent « l'avatar de tel user »). Optionnel — seul le bloc
   * media-text l'exploite. `null` si le user n'a pas d'avatar.
   */
  resolveAvatar?: (userId: string) => ResolvedMedia | null;
  /**
   * Côté d'affichage des médias, calculé par le PageRenderer selon la
   * POSITION du bloc parmi les blocs `media-text` (alternance automatique :
   * 1er → "left", 2e → "right", etc.). Optionnel — seul le bloc media-text
   * l'exploite ; les autres blocs l'ignorent. Absent = pas d'alternance
   * pertinente pour ce bloc.
   */
  mediaSide?: "left" | "right";
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/PageRenderer.tsx"
cat > 'apps/web/src/features/page-builder/PageRenderer.tsx' << 'FILE_EOF'
import type { ComponentType } from "react";

import { prisma } from "@backend/prisma";
import { resolveMediaByIds } from "@backend/modules/media/services/resolveMediaByIds.service";
import { resolveAvatarsByUserIds } from "@backend/modules/media/services/resolveAvatarsByUserIds.service";

import {
  extractMediaIdsFromContent,
  type PageBlockV1,
  type PageContentV1,
  type ResolvedMedia,
} from "@contracts/page";

import { getBlockDefinition } from "./blockRegistry";
import type { BlockViewProps } from "./BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface PageRendererProps {
  /**
   * Contenu validé de la page. L'host est responsable de la validation
   * Zod en amont (le helper `parsePageContentV1` qui tombe sur
   * `emptyPageContentV1()` en cas de payload douteux arrivera au
   * sous-chantier 6c). Ici on suppose que le composite est sain.
   */
  content: PageContentV1;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Renderer public du composite de page. **Server Component asynchrone.**
 *
 * ─── Orchestration en deux temps ───────────────────────────────────────
 *
 *   1. **Extraction** : `extractMediaIdsFromContent(content)` rassemble
 *      tous les mediaIds référencés dans toute la page — y compris les
 *      `library-image` inlines dans les blocs tiptap (walker
 *      ProseMirror). Dédupliqué.
 *
 *   2. **Résolution batch** : `resolveMediaByIds(prisma, ids)` fait UNE
 *      requête SQL qui ramène toutes les métadonnées en filtrant
 *      `status === 'published'`. Le résultat est un Record indexé par
 *      mediaId, avec `null` pour les ids absents ou non-published.
 *
 * Ensuite, on construit une fonction de lookup synchrone `resolveMedia`
 * qui ferme sur ce Record, et on rend chaque bloc via son `View` en lui
 * passant le bloc + cette fonction. Chaque View peut ainsi lookuper ses
 * propres mediaIds sans aucun appel async — elle reste un composant
 * synchrone classique.
 *
 * ─── Le cast de variance (mêmes raisons qu'en édition) ─────────────────
 *
 * `getBlockDefinition(block.type).View` est, à travers l'itération sur
 * `PageBlockV1`, une union de `ComponentType<BlockViewProps<variante>>`.
 * On la cast en `ComponentType<BlockViewProps<PageBlockV1>>` — sûr par
 * construction (le discriminant garantit la correspondance), localisé
 * et documenté, comme côté `BlockShell` pour l'édition.
 *
 * ─── Limitation actuelle ───────────────────────────────────────────────
 *
 * Les URLs résolues pointent vers `/api/media/r2/...` pour les assets
 * R2 (audio, documents) — route actuellement gardée par auth admin.
 * Pour le visiteur anonyme d'une page publique, le rendu fonctionnera
 * pour les images Cloudinary (route publique) mais pas pour les R2.
 * Ce sera résolu au sous-chantier 6c avec une route publique séparée.
 */
export async function PageRenderer({ content }: PageRendererProps) {
  // 1. Extraction de tous les mediaIds référencés sur la page.
  const mediaIds = extractMediaIdsFromContent(content);

  // 2. Résolution batch (1 requête SQL, filtre `published`).
  //    Audience `public` : les URLs R2 pointent vers la route publique
  //    `/api/media/public/r2/...` qui valide qu'un PageMediaReference
  //    existe avant de signer (cf. sous-chantier 6c).
  const resolvedMap = await resolveMediaByIds(prisma, mediaIds, "public");

  // Lookup synchrone fermé sur la map — passé à chaque View.
  const resolveMedia = (mediaId: string): ResolvedMedia | null =>
    resolvedMap[mediaId] ?? null;

  // Résolution des avatars référencés par les blocs media-text (référence
  // logique { kind: "avatar", userId } → avatar courant du user).
  const avatarUserIds = content.blocks.flatMap((b) =>
    b.type === "media-text" && b.media?.kind === "avatar"
      ? [b.media.userId]
      : [],
  );
  const avatarMap = await resolveAvatarsByUserIds(prisma, avatarUserIds);
  const resolveAvatar = (userId: string): ResolvedMedia | null =>
    avatarMap[userId] ?? null;

  if (content.blocks.length === 0) {
    return null;
  }

  // Alternance media-text SANS mutation pendant le rendu (React Compiler) :
  // le côté dérive du rang du bloc dans la liste des seuls blocs media-text.
  const mediaTextIds = content.blocks
    .filter((b) => b.type === "media-text")
    .map((b) => b.id);
  const sideFor = (blockId: string): "left" | "right" | undefined => {
    const rank = mediaTextIds.indexOf(blockId);
    if (rank === -1) return undefined;
    return rank % 2 === 0 ? "left" : "right";
  };

  return (
    <div className="page-renderer flex flex-col gap-10">
      {content.blocks.map((block) => {
        const def = getBlockDefinition(block.type);
        const View = def.View as unknown as ComponentType<
          BlockViewProps<PageBlockV1>
        >;
        return (
          <View
            key={block.id}
            block={block}
            resolveMedia={resolveMedia}
            resolveAvatar={resolveAvatar}
            mediaSide={sideFor(block.id)}
          />
        );
      })}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/view.server.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/view.server.tsx' << 'FILE_EOF'
import { Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { HorizontalRule } from "@/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension";

import type { MediaTextBlockV1, ResolvedMedia } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Nœud image server-only (identique à la View tiptap)                     */
/* ─────────────────────────────────────────────────────────────────────── */

interface ServerLibraryImageOptions {
  resolveMedia: (mediaId: string) => ResolvedMedia | null;
}

const ServerLibraryImageNode = Node.create<ServerLibraryImageOptions>({
  name: "library-image",
  group: "block",
  atom: true,
  addOptions() {
    return { resolveMedia: () => null };
  },
  addAttributes() {
    return { mediaId: { default: null }, caption: { default: null } };
  },
  renderHTML({ node }) {
    const mediaId = node.attrs.mediaId as string | null;
    const caption = node.attrs.caption as string | null;
    if (!mediaId) return ["span", { class: "hidden", "aria-hidden": "true" }];
    const media = this.options.resolveMedia(mediaId);
    if (!media) return ["span", { class: "hidden", "aria-hidden": "true" }];
    const imgAttrs: Record<string, unknown> = {
      src: media.url,
      alt: caption ?? "",
      loading: "lazy",
      decoding: "async",
    };
    if (media.width !== null) imgAttrs.width = media.width;
    if (media.height !== null) imgAttrs.height = media.height;
    if (caption) {
      return [
        "figure",
        { class: "tiptap-library-image" },
        ["img", imgAttrs],
        ["figcaption", {}, caption],
      ];
    }
    return ["figure", { class: "tiptap-library-image" }, ["img", imgAttrs]];
  },
});

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc `media-text`.
 *
 * Mise en page éditoriale : médias d'un côté, texte de l'autre, avec
 * ALTERNANCE automatique du côté des médias d'un bloc media-text au suivant
 * (`mediaSide`, calculé par le PageRenderer selon la position). Si une seule
 * des deux parties est présente, le bloc s'affiche centré, pleine largeur.
 *
 * Server Component pur (sync, pas de hook). Les vidéos sont rendues avec un
 * `<video controls>` + poster ; les images en grille.
 */
export function MediaTextView({
  block,
  resolveMedia,
  resolveAvatar,
  mediaSide = "left",
}: BlockViewProps<MediaTextBlockV1>) {
  // Média unique résolu (ou null). Selon le kind : média de bibliothèque
  // (resolveMedia) ou référence avatar résolue dynamiquement (resolveAvatar).
  const resolvedMedia = !block.media
    ? null
    : block.media.kind === "avatar"
      ? (resolveAvatar?.(block.media.userId) ?? null)
      : resolveMedia(block.media.mediaId);
  const mediaCaption = block.media?.caption;

  // Texte : présent uniquement si content non vide.
  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;

  const hasMedia = resolvedMedia !== null;

  // Bloc vide (ni texte ni média résolu) → rien.
  if (!hasText && !hasMedia) return null;

  const textHtml = hasText
    ? generateHTML(block.content as JSONContent, [
        StarterKit.configure({ horizontalRule: false }),
        HorizontalRule,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Typography,
        Subscript,
        Superscript,
        ServerLibraryImageNode.configure({ resolveMedia }),
      ])
    : null;

  const MediaColumn =
    hasMedia && resolvedMedia ? (
      <MediaFigure media={resolvedMedia} caption={mediaCaption} />
    ) : null;

  const TextColumn = textHtml ? (
    <div
      className="tiptap-rendered prose max-w-none"
      dangerouslySetInnerHTML={{ __html: textHtml }}
    />
  ) : null;

  // Une seule partie → centré, pleine largeur (impression de respiration).
  if (!hasText || !hasMedia) {
    return (
      <div className="mx-auto max-w-3xl">
        {hasMedia ? MediaColumn : TextColumn}
      </div>
    );
  }

  // Deux parties → deux colonnes, côté médias selon l'alternance.
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{MediaColumn}</div>
          <div className="md:order-1">{TextColumn}</div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  MediaFigure — image ou vidéo selon le kind résolu                       */
/* ─────────────────────────────────────────────────────────────────────── */

function MediaFigure({
  media,
  caption,
}: {
  media: ResolvedMedia;
  caption?: string;
}) {
  return (
    <figure className="m-0">
      {media.kind === "video" ? (
        <video
          src={media.url}
          poster={media.posterUrl ?? undefined}
          controls
          className="block w-full rounded-md"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={caption ?? ""}
          width={media.width ?? undefined}
          height={media.height ?? undefined}
          loading="lazy"
          decoding="async"
          className="block w-full rounded-md object-cover"
        />
      )}
      {caption && (
        <figcaption className="mt-1 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx' << 'FILE_EOF'
"use client";

import { useCallback } from "react";
import type { MediaTextBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { MediaListEditor } from "../../components/MediaListEditor";
import { BuilderTipTapEditor } from "../tiptap/builder-tiptap-editor";
import { MediaTextPreview } from "./MediaTextPreview";
import { AvatarPicker } from "./AvatarPicker";

/**
 * Editor du bloc `media-text`.
 *
 * Deux sections empilées dans l'éditeur (la mise en page côte à côte /
 * alternée est une affaire de rendu public, pas d'édition) :
 *
 *   1. Le picker de médias (MediaListEditor partagé) — plusieurs images
 *      et/ou une vidéo, avec légende optionnelle par média.
 *   2. L'éditeur de texte riche (BuilderTipTapEditor, même instance que le
 *      bloc tiptap).
 *
 * Les deux parties sont optionnelles : l'admin peut ne renseigner que l'une
 * ou l'autre — le rendu public centrera alors le contenu présent.
 */
export function MediaTextEditor({
  block,
  onChange,
  mediaSide,
}: BlockEditorProps<MediaTextBlockV1>) {
  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      onChange({ ...block, content });
    },
    [block, onChange],
  );

  return (
    <div className="space-y-4">
      {/* Média — UN SEUL, au choix : (1) un média de la bibliothèque, ou
          (2) l'avatar d'un admin (référence logique, suit l'avatar courant).
          Les deux sont exclusifs : choisir un avatar retire le média
          bibliothèque et inversement. */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">
          Média (une image/vidéo de la bibliothèque, ou un avatar d'admin)
        </span>

        {/* Option 1 : bibliothèque (masquée si un avatar est référencé) */}
        {(!block.media || block.media.kind === "library") && (
          <MediaListEditor
            items={
              block.media && block.media.kind === "library" ? [block.media] : []
            }
            onChange={(list) =>
              onChange({
                ...block,
                media:
                  list.length > 0
                    ? { ...list[list.length - 1], kind: "library" as const }
                    : undefined,
              })
            }
            itemFactory={(mediaId) => ({ kind: "library" as const, mediaId })}
            getItemText={(item) => item.caption}
            setItemText={(item, value) => ({
              ...item,
              caption: value ?? undefined,
            })}
            textPlaceholder="Légende (optionnelle)"
            addLabel={block.media ? "Remplacer le média" : "Ajouter un média"}
            emptyStateLabel="Aucun média de bibliothèque sélectionné."
            renderPreview={({ resolved, status }) => {
              if (status === "loading") {
                return <div className="h-full w-full animate-pulse bg-muted" />;
              }
              if (status === "missing" || !resolved) {
                return (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                    indispo
                  </div>
                );
              }
              if (resolved.kind === "video") {
                return (
                  <div className="flex h-full w-full items-center justify-center bg-black text-[10px] text-white">
                    vidéo
                  </div>
                );
              }
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolved.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              );
            }}
          />
        )}

        {/* Option 2 : avatar d'admin */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            …ou l'avatar d'un administrateur
          </span>
          <AvatarPicker
            selectedUserId={
              block.media && block.media.kind === "avatar"
                ? block.media.userId
                : null
            }
            onSelect={(userId) =>
              onChange({
                ...block,
                media: userId
                  ? {
                      kind: "avatar",
                      userId,
                      caption:
                        block.media && "caption" in block.media
                          ? block.media.caption
                          : undefined,
                    }
                  : undefined,
              })
            }
          />
        </div>
      </div>

      {/* Texte */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Texte (optionnel)
        </span>
        <BuilderTipTapEditor
          content={block.content ?? {}}
          onChange={handleContentChange}
        />
      </div>

      {/* Aperçu du rendu public (mise en page réelle, alternance incluse) */}
      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <MediaTextPreview block={block} mediaSide={mediaSide} />
        </div>
      </div>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useState, type JSX } from "react";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

import { trpcClient } from "@trpc/trpcClient";
import type { MediaTextBlockV1 } from "@contracts/page";
import { publicIdToUrl } from "@features/social/userDisplay";

/**
 * Preview CLIENT du bloc media-text, affichée sous l'éditeur dans le builder.
 *
 * Reproduit fidèlement le rendu public (MediaTextView, qui est un Server
 * Component non montable ici) : résolution des médias via trpcClient,
 * alternance gauche/droite selon `mediaSide` (fourni par le PageBuilder), et
 * mêmes règles de disposition (1 média = pleine largeur ; plusieurs = grille ;
 * une seule partie = centré, gouttière nette entre colonnes).
 *
 * Le rendu du texte réutilise generateHTML avec les mêmes extensions que la
 * vue publique (sans le nœud library-image, dont la résolution serveur n'est
 * pas disponible ici — les images insérées dans le texte n'apparaissent donc
 * pas dans la preview, ce qui est acceptable pour un aperçu).
 */

interface ResolvedPreviewMedia {
  url: string;
  kind: string;
  posterUrl: string | null;
  caption?: string;
}

export function MediaTextPreview({
  block,
  mediaSide = "left",
}: {
  block: MediaTextBlockV1;
  mediaSide?: "left" | "right";
}): JSX.Element | null {
  const [media, setMedia] = useState<ResolvedPreviewMedia | null>(null);

  const m = block.media ?? null;
  // Clé de dépendance stable selon le kind.
  const mediaKey =
    m == null ? null : m.kind === "avatar" ? `avatar:${m.userId}` : m.mediaId;

  useEffect(() => {
    let cancelled = false;
    if (!m) {
      setMedia(null);
      return;
    }

    if (m.kind === "avatar") {
      // Référence avatar : on récupère l'avatar courant du user (via la liste
      // des candidats) et on construit l'URL comme le portrait du header.
      void trpcClient.user.listAvatarCandidates.query().then((admins) => {
        if (cancelled) return;
        const user = admins.find((a) => a.id === m.userId);
        if (user?.avatar) {
          setMedia({
            url: publicIdToUrl(user.avatar),
            kind: "image",
            posterUrl: null,
            caption: m.caption,
          });
        } else {
          setMedia(null);
        }
      });
    } else {
      // Média de bibliothèque.
      void trpcClient.media.resolveByIds
        .query({ mediaIds: [m.mediaId] })
        .then((resolved) => {
          if (cancelled) return;
          const r = resolved[m.mediaId];
          if (r) {
            setMedia({
              url: r.url,
              kind: r.kind,
              posterUrl: r.posterUrl,
              caption: m.caption,
            });
          } else {
            setMedia(null);
          }
        });
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaKey]);

  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;
  const hasMedia = media !== null;

  if (!hasText && !hasMedia) {
    return (
      <p className="text-xs italic text-muted-foreground">
        Aperçu : bloc vide (ajoute du texte et/ou des médias).
      </p>
    );
  }

  const textHtml = hasText
    ? generateHTML(block.content as JSONContent, [
        StarterKit.configure({ horizontalRule: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Typography,
        Subscript,
        Superscript,
      ])
    : null;

  const MediaColumn =
    hasMedia && media ? <PreviewFigure media={media} /> : null;

  const TextColumn = textHtml ? (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: textHtml }}
    />
  ) : null;

  // Une seule partie → centré, pleine largeur.
  if (!hasText || !hasMedia) {
    return (
      <div className="mx-auto max-w-2xl">
        {hasMedia ? MediaColumn : TextColumn}
      </div>
    );
  }

  // Deux parties → deux colonnes, côté médias selon l'alternance, gouttière nette.
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{MediaColumn}</div>
          <div className="md:order-1">{TextColumn}</div>
        </>
      )}
    </div>
  );
}

function PreviewFigure({
  media,
}: {
  media: ResolvedPreviewMedia;
}): JSX.Element {
  return (
    <figure className="m-0">
      {media.kind === "video" ? (
        <video
          src={media.url}
          poster={media.posterUrl ?? undefined}
          controls
          className="block w-full rounded-md"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={media.caption ?? ""}
          className="block w-full rounded-md object-cover"
        />
      )}
      {media.caption && (
        <figcaption className="mt-1 text-xs text-muted-foreground">
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/AvatarPicker.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/AvatarPicker.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { publicIdToUrl } from "@features/social/userDisplay";

interface AdminCandidate {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  avatar: string | null;
}

function labelFor(a: AdminCandidate): string {
  const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
  return name || a.pseudo || "Admin";
}

/**
 * Sélecteur d'avatar d'administrateur pour le bloc media-text. Liste TOUS les
 * admins (avec placeholder si pas d'avatar). Choisir un admin pose une
 * référence LOGIQUE `{ kind: "avatar", userId }` — la page suivra l'avatar
 * courant de ce user.
 *
 * `selectedUserId` : l'admin actuellement référencé (ou null). `onSelect`
 * reçoit le userId choisi, ou null pour retirer la référence.
 */
export function AvatarPicker({
  selectedUserId,
  onSelect,
}: {
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
}): JSX.Element {
  const [admins, setAdmins] = useState<AdminCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void trpcClient.user.listAvatarCandidates.query().then((rows) => {
      if (cancelled) return;
      setAdmins(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground">Chargement des avatars…</p>
    );
  }

  if (admins.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Aucun administrateur.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {admins.map((a) => {
        const selected = a.id === selectedUserId;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(selected ? null : a.id)}
            className={`flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-colors ${
              selected
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted"
            }`}
            title={labelFor(a)}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-muted">
              {a.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicIdToUrl(a.avatar)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  {labelFor(a).slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
            <span>{labelFor(a)}</span>
          </button>
        );
      })}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blocks/media-text/index.tsx"
cat > 'apps/web/src/features/page-builder/blocks/media-text/index.tsx' << 'FILE_EOF'
import { Columns2 } from "lucide-react";
import type { MediaTextBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { MediaTextEditor } from "./editor.client";
import { MediaTextView } from "./view.server";

export const mediaTextDefinition: BlockDefinition<MediaTextBlockV1> = {
  kind: "media-text",
  label: "Médias + texte",
  icon: <Columns2 className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "media-text",
    // media absent + content absent : le bloc démarre vide des deux côtés.
  }),
  Editor: MediaTextEditor,
  View: MediaTextView,
};
FILE_EOF

echo
echo "Typecheck contracts + backend + web..."
pnpm --filter contracts typecheck && pnpm --filter backend typecheck && pnpm --filter web typecheck

echo
echo "Typecheck OK -> commit."
git add -A
git commit -m "feat(media-text): reference avatar d admin (logique, suit l avatar courant)"
echo "Commit effectue."