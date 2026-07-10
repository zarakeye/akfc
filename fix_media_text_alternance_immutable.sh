#!/bin/bash
# Fix React Compiler « Cannot reassign variable after render completes » :
# l alternance media-text utilisait un compteur mutable (mediaTextRank += 1)
# pendant le rendu, interdit par le React Compiler (mode strict). Remplace par
# un calcul 100% IMMUTABLE : le cote d un bloc derive de son rang (indexOf)
# dans la liste filtree des seuls blocs media-text. Applique a PageBuilder
# (preview) et PageRenderer (rendu public), pour coherence.
# À lancer depuis la RACINE : bash fix_media_text_alternance_immutable.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/page-builder/PageBuilder.tsx"
cat > 'apps/web/src/features/page-builder/PageBuilder.tsx' << 'FILE_EOF'
"use client";

import { useState } from "react";
import type { FileAdapter } from "@contracts/finder";
import type {
  PageContentV1,
  PageBlockV1,
  PageBlockKindV1,
} from "@contracts/page";

import { getBlockDefinition } from "./blockRegistry";
import { PageBuilderProvider } from "./PageBuilderContext";
import { BlockShell } from "./components/BlockShell";
import { AddBlockMenu } from "./components/AddBlockMenu";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface PageBuilderProps {
  /** Contenu courant (contrôlé par l'host — typiquement le form du Course). */
  value: PageContentV1;
  /** Émis à chaque mutation (ajout, édition, suppression, réordonnancement). */
  onChange: (next: PageContentV1) => void;
  /** Adapter du finder pour le MediaPicker (Cloudinary pour AKFC). */
  adapter: FileAdapter;
  /** Racine de l'arborescence média (valeur d'`APP_ROOT`). */
  appRoot: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Le composant d'assemblage du builder de page.
 *
 * **Contrôlé** : l'host détient le `value` (typiquement dans le state du
 * formulaire d'édition d'un Course) et reçoit chaque mutation via
 * `onChange`. Le PageBuilder ne garde en interne que l'état d'UI du
 * drag-and-drop.
 *
 * Pas de `useReducer` : en mode contrôlé, chaque handler dérive le
 * prochain `PageContentV1` à partir du `value` courant et le pousse via
 * `onChange`. La logique reste lisible sans la cérémonie d'un reducer.
 *
 * Le `key={block.id}` sur chaque `BlockShell` est essentiel : c'est ce
 * qui permet à React de réconcilier les blocs par identité stable à
 * travers les réordonnancements (et c'est l'une des raisons pour
 * lesquelles chaque bloc porte un `id` dans le contrat).
 *
 * ─── Note perf (v1) ─────────────────────────────────────────────────────
 *
 * Chaque frappe dans un bloc tiptap déclenche `onChange` → nouveau
 * `value` → re-render de tous les `BlockShell`. Acceptable pour une
 * poignée de blocs. Si une page devient très lourde, on mémoïsera
 * `BlockShell` (React.memo + handlers stables) — pas nécessaire pour
 * l'instant.
 */
export function PageBuilder({
  value,
  onChange,
  adapter,
  appRoot,
}: PageBuilderProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /* ── Handlers de mutation (dérivent le prochain content) ── */

  const handleAdd = (kind: PageBlockKindV1) => {
    const def = getBlockDefinition(kind);
    const newBlock = def.defaultData(generateBlockId());
    onChange({ ...value, blocks: [...value.blocks, newBlock] });
  };

  const handleUpdate = (id: string, next: PageBlockV1) => {
    onChange({
      ...value,
      blocks: value.blocks.map((b) => (b.id === id ? next : b)),
    });
  };

  const handleRemove = (id: string) => {
    onChange({
      ...value,
      blocks: value.blocks.filter((b) => b.id !== id),
    });
  };

  const handleMove = (from: number, to: number) => {
    if (from === to) return;
    const blocks = [...value.blocks];
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    onChange({ ...value, blocks });
  };

  /* ── Rendu ── */

  return (
    <PageBuilderProvider value={{ adapter, appRoot }}>
      <div className="flex flex-col gap-3">
        {value.blocks.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Cette page est vide. Ajoute un premier bloc pour commencer.
          </p>
        )}

        {(() => {
          // Alternance media-text SANS aucune mutation pendant le rendu
          // (contrainte du React Compiler) : le côté d'un bloc media-text
          // dérive de son rang dans la liste des seuls blocs media-text.
          const mediaTextIds = value.blocks
            .filter((b) => b.type === "media-text")
            .map((b) => b.id);
          const sideFor = (blockId: string): "left" | "right" | undefined => {
            const rank = mediaTextIds.indexOf(blockId);
            if (rank === -1) return undefined;
            return rank % 2 === 0 ? "left" : "right";
          };
          return value.blocks.map((block, index) => (
            <BlockShell
              key={block.id}
              block={block}
              mediaSide={sideFor(block.id)}
              onUpdate={(next) => handleUpdate(block.id, next)}
              onRemove={() => handleRemove(block.id)}
              isDragging={draggingIndex === index}
              isDragOver={dragOverIndex === index && draggingIndex !== index}
              onDragStart={() => setDraggingIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(index);
              }}
              onDrop={() => {
                if (draggingIndex !== null) {
                  handleMove(draggingIndex, index);
                }
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
            />
          ));
        })()}

        <AddBlockMenu onAdd={handleAdd} />
      </div>
    </PageBuilderProvider>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Génère un identifiant unique de bloc côté client. Le block id vit dans
 * le JSON du composite (pas une clé primaire DB), donc l'unicité suffit —
 * pas besoin d'un cuid spécifiquement. `crypto.randomUUID()` est dispo en
 * contexte sécurisé (localhost + https) ; fallback défensif sinon.
 */
function generateBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
FILE_EOF

echo
echo "Typecheck web..."
pnpm --filter web typecheck

echo
echo "Typecheck OK -> commit."
git add -A
git commit -m "fix(page-builder): alternance media-text immutable (React Compiler)"
echo "Commit effectue."