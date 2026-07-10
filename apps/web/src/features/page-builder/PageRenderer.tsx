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
    <div className="page-renderer flex flex-col gap-6">
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
            mediaSide={sideFor(block.id)}
          />
        );
      })}
    </div>
  );
}
