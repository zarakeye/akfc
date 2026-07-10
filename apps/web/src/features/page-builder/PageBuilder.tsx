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
          // Alternance media-text (même logique que le PageRenderer public) :
          // le compteur n'avance que sur les blocs media-text, pour que la
          // preview du builder reflète fidèlement le côté public.
          let mediaTextRank = 0;
          return value.blocks.map((block, index) => {
            let mediaSide: "left" | "right" | undefined;
            if (block.type === "media-text") {
              mediaSide = mediaTextRank % 2 === 0 ? "left" : "right";
              mediaTextRank += 1;
            }
            return (
              <BlockShell
                key={block.id}
                block={block}
                mediaSide={mediaSide}
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
            );
          });
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
