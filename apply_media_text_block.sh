#!/bin/bash
# Nouveau bloc de page-builder « media-text » (non destructif) : un editeur
# tiptap + un picker multi-medias (images et/ou video), les deux parties
# OPTIONNELLES. Rendu public : deux colonnes avec ALTERNANCE automatique du
# cote des medias d un bloc media-text au suivant (calculee par le
# PageRenderer selon la position) ; si une seule partie -> centre pleine
# largeur. Touche : contrat (schema + extraction mediaIds), BlockViewProps
# (champ mediaSide), PageRenderer (calcul alternance), registry, et les 3
# fichiers du bloc.
# À lancer depuis la RACINE du monorepo : bash apply_media_text_block.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

mkdir -p apps/web/src/features/page-builder/blocks/media-text

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
const mediaTextBlockSchema = blockBaseSchema.extend({
  type: z.literal("media-text"),
  /** Texte riche optionnel (ProseMirror). Absent/vide → côté texte masqué. */
  content: proseMirrorContentSchema.optional(),
  /** Médias optionnels (images et/ou vidéo). Vide → côté médias masqué. */
  media: z.array(
    z.object({
      mediaId: z.string().min(1),
      caption: z.string().optional(),
    }),
  ),
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
      // mediaIds directs (tableau media) + images éventuelles du ProseMirror.
      return [
        ...block.media.map((item) => item.mediaId),
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

  if (content.blocks.length === 0) {
    return null;
  }

  return (
    <div className="page-renderer flex flex-col gap-6">
      {(() => {
        // Compteur d'alternance : n'incrémente que sur les blocs media-text,
        // pour que leur côté médias alterne indépendamment des autres blocs
        // intercalés (1er media-text → gauche, 2e → droite, etc.).
        let mediaTextRank = 0;
        return content.blocks.map((block) => {
          const def = getBlockDefinition(block.type);
          const View = def.View as unknown as ComponentType<
            BlockViewProps<PageBlockV1>
          >;
          let mediaSide: "left" | "right" | undefined;
          if (block.type === "media-text") {
            mediaSide = mediaTextRank % 2 === 0 ? "left" : "right";
            mediaTextRank += 1;
          }
          return (
            <View
              key={block.id}
              block={block}
              resolveMedia={resolveMedia}
              mediaSide={mediaSide}
            />
          );
        });
      })()}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/page-builder/blockRegistry.ts"
cat > 'apps/web/src/features/page-builder/blockRegistry.ts' << 'FILE_EOF'
import type { PageBlockKindV1, PageBlockV1 } from "@contracts/page";
import type { BlockDefinition } from "./BlockDefinition.types";

import { tiptapDefinition } from "./blocks/tiptap";
import { imageGalleryDefinition } from "./blocks/image-gallery";
import { audioCollectionDefinition } from "./blocks/audio-collection";
import { documentListDefinition } from "./blocks/document-list";
import { mediaTextDefinition } from "./blocks/media-text";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Type du registry                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Mapped type qui préserve le typage discriminé pour chaque clé.
 *
 * `BlockRegistry['image-gallery']` rend précisément
 * `BlockDefinition<ImageGalleryBlockV1>`, pas l'union dégénérée. C'est
 * cette préservation qui permet à `Editor` et `View` d'accepter des
 * props typées correctement pour leur variante.
 *
 * Contrairement au `providerRegistry` du backend qui avait DÛ utiliser
 * un switch pour préserver le typage (parce que les factories y
 * retournaient des génériques structurellement divergents), ici une
 * mapped type sur un type discriminé suffit — tous les `BlockDefinition`
 * partagent la même forme paramétrée.
 */
type BlockRegistry = {
  [K in PageBlockKindV1]: BlockDefinition<Extract<PageBlockV1, { type: K }>>;
};

/* ─────────────────────────────────────────────────────────────────────── */
/*  Assemblage                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

const BLOCK_REGISTRY: BlockRegistry = {
  "image-gallery": imageGalleryDefinition,
  "audio-collection": audioCollectionDefinition,
  "document-list": documentListDefinition,
  tiptap: tiptapDefinition,
  "media-text": mediaTextDefinition,
};

/* ─────────────────────────────────────────────────────────────────────── */
/*  API publique                                                           */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Récupère la définition complète d'un bloc par sa `kind`.
 *
 * À privilégier sur un accès direct `BLOCK_REGISTRY[kind]` parce que
 * le typage du retour est préservé : `getBlockDefinition('tiptap')`
 * rend `BlockDefinition<TipTapBlockV1>`, donc les props passées à
 * `.Editor` et `.View` sont strictement vérifiées par le compilateur.
 */
export function getBlockDefinition<K extends PageBlockKindV1>(
  kind: K,
): BlockRegistry[K] {
  return BLOCK_REGISTRY[kind];
}

/**
 * Type d'une définition prise au hasard dans le registry — union des
 * quatre variantes typées.
 *
 * **Pourquoi pas `BlockDefinition<PageBlockV1>` ?** Parce que `TBlock`
 * apparaît en position contravariante dans `onChange: (next: TBlock) => void` —
 * un `(tiptapBlock) => void` n'est pas assignable à un `(anyBlock) => void`,
 * la spécialisation est plus stricte. Forcer cette assignabilité demanderait
 * de relâcher le typage de `onChange`, ce qu'on ne veut pas.
 *
 * En revanche, une union des variantes typées (`BlockRegistry[PageBlockKindV1]`)
 * exprime exactement ce qu'on veut : « une définition parmi celles connues »,
 * sans tordre la variance. Les consommateurs qui ont besoin d'un narrowing
 * passent par `getBlockDefinition(kind)`.
 */
export type AnyBlockDefinition = BlockRegistry[PageBlockKindV1];

/**
 * Liste exhaustive des définitions, dans l'ordre d'affichage du menu "+".
 *
 * L'ordre ici détermine l'ordre dans le menu — choisi par fréquence
 * d'usage anticipée plutôt que par ordre alphabétique : tiptap en
 * premier parce que c'est le bloc le plus courant, document-list en
 * dernier parce que c'est le plus rare.
 *
 * Typé sur l'union des variantes (`AnyBlockDefinition`) parce que les
 * consommateurs de cette liste (typiquement le menu "+") n'ont pas
 * besoin de typage par variante — ils itèrent et lisent `kind`, `label`,
 * `icon`. Pour accéder à `Editor` / `View` avec leur typage précis,
 * passer par `getBlockDefinition(kind)`.
 */
export const ALL_BLOCK_DEFINITIONS: ReadonlyArray<AnyBlockDefinition> = [
  tiptapDefinition,
  imageGalleryDefinition,
  audioCollectionDefinition,
  documentListDefinition,
];
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
  mediaSide = "left",
}: BlockViewProps<MediaTextBlockV1>) {
  // Médias résolus (on saute silencieusement ceux qui ne résolvent pas).
  const media = block.media.flatMap((item) => {
    const resolved = resolveMedia(item.mediaId);
    return resolved ? [{ item, resolved }] : [];
  });

  // Texte : présent uniquement si content non vide.
  const hasText =
    block.content !== undefined &&
    block.content !== null &&
    Object.keys(block.content).length > 0;

  const hasMedia = media.length > 0;

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

  const MediaColumn = hasMedia ? (
    <div className="grid gap-3 sm:grid-cols-2">
      {media.map(({ item, resolved }) => (
        <MediaFigure
          key={item.mediaId}
          media={resolved}
          caption={item.caption}
        />
      ))}
    </div>
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
    <div className="grid items-center gap-6 md:grid-cols-2">
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
}: BlockEditorProps<MediaTextBlockV1>) {
  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      onChange({ ...block, content });
    },
    [block, onChange],
  );

  return (
    <div className="space-y-4">
      {/* Médias */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Médias (images et/ou vidéo)
        </span>
        <MediaListEditor
          items={block.media}
          onChange={(media) => onChange({ ...block, media })}
          itemFactory={(mediaId) => ({ mediaId })}
          getItemText={(item) => item.caption}
          setItemText={(item, value) => ({
            ...item,
            caption: value ?? undefined,
          })}
          textPlaceholder="Légende (optionnelle)"
          addLabel="Ajouter des médias"
          emptyStateLabel="Aucun média — le bloc affichera seulement le texte."
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
    media: [],
    // content laissé absent : le bloc démarre vide des deux côtés.
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
git commit -m "feat(page-builder): bloc media-text (tiptap + medias) a mise en page alternee"
echo "Commit effectue."