import { z } from 'zod';

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

/**
 * Le contenu ProseMirror est traité comme une donnée opaque par le contrat.
 *
 * Raison : la grammaire ProseMirror est récursive et dépend des extensions
 * TipTap chargées. La modéliser strictement reviendrait à dupliquer ce
 * que TipTap valide déjà à l'hydratation. On exige juste que ce soit un
 * objet (pas null, pas un primitive), ce qui filtre les payloads
 * grossièrement corrompus sans contraindre la structure interne.
 *
 * Note importante : l'extracteur (cf. extractMediaIds.ts) traverse cet
 * arbre pour collecter les `mediaId` des nodes `library-image`. Cette
 * traversée est défensive — elle ne fait aucune hypothèse forte sur la
 * structure, donc un payload mal formé rend une liste vide plutôt que
 * de jeter.
 */
const proseMirrorContentSchema = z.record(z.string(), z.unknown());

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
  type: z.literal('tiptap'),
  content: proseMirrorContentSchema,
});

export type TipTapBlockV1 = z.infer<typeof tiptapBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Bloc image-gallery                                                        */
/* -------------------------------------------------------------------------- */

const imageGalleryLayoutSchema = z.enum(['grid', 'carousel', 'masonry']);

export type ImageGalleryLayout = z.infer<typeof imageGalleryLayoutSchema>;

const imageGalleryBlockSchema = blockBaseSchema.extend({
  type: z.literal('image-gallery'),
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
  layout: imageGalleryLayoutSchema.default('grid'),
});

export type ImageGalleryBlockV1 = z.infer<typeof imageGalleryBlockSchema>;

/* -------------------------------------------------------------------------- */
/*  Bloc audio-collection                                                     */
/* -------------------------------------------------------------------------- */

const audioCollectionBlockSchema = blockBaseSchema.extend({
  type: z.literal('audio-collection'),
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
  type: z.literal('document-list'),
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
/*  Union discriminée                                                         */
/* -------------------------------------------------------------------------- */

export const pageBlockSchemaV1 = z.discriminatedUnion('type', [
  tiptapBlockSchema,
  imageGalleryBlockSchema,
  audioCollectionBlockSchema,
  documentListBlockSchema,
]);

export type PageBlockV1 = z.infer<typeof pageBlockSchemaV1>;

/**
 * Union des `type` littéraux acceptés en v1.
 *
 * Pratique pour typer les clés d'un registry — voir
 * `features/page-builder/blockRegistry.ts` (sous-chantier 5).
 */
export type PageBlockKindV1 = PageBlockV1['type'];

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