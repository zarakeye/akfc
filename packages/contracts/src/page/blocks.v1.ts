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
