"use client";

import { useRef, type ComponentType } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { PageBlockV1 } from "@contracts/page";

import { getBlockDefinition } from "../blockRegistry";
import type { BlockEditorProps } from "../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface BlockShellProps {
  block: PageBlockV1;
  onUpdate: (next: PageBlockV1) => void;
  onRemove: () => void;

  /** Côté médias (alternance), transmis à l'Editor pour sa preview. */
  mediaSide?: "left" | "right";

  // État et callbacks de drag-and-drop, pilotés par le PageBuilder parent.
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Chrome transverse autour de l'Editor d'un bloc : barre d'en-tête avec
 * poignée de drag, icône + label de type, bouton supprimer ; puis le
 * corps qui rend l'Editor spécifique au bloc.
 *
 * ─── Le cast de variance ────────────────────────────────────────────────
 *
 * `getBlockDefinition(block.type)` retourne, quand `block.type` est l'union
 * `PageBlockKindV1`, une union de `BlockDefinition<variante>`. Son `.Editor`
 * est donc une union de `ComponentType<BlockEditorProps<variante>>`. Pour
 * le rendre avec `block: PageBlockV1`, on le cast en
 * `ComponentType<BlockEditorProps<PageBlockV1>>`.
 *
 * Ce cast est **sûr par construction** : `getBlockDefinition(block.type)`
 * retourne TOUJOURS la définition dont l'Editor accepte exactement ce
 * `block` — le discriminant `type` garantit la correspondance. TypeScript
 * ne peut pas le prouver à travers l'union (variance contravariante de
 * `TBlock` dans `onChange`), d'où le cast explicite et localisé ici.
 *
 * ─── Drag-and-drop natif ────────────────────────────────────────────────
 *
 * Seul l'en-tête est `draggable` — pas le corps — pour ne pas interférer
 * avec la sélection de texte dans les éditeurs. Au `dragStart`, on force
 * l'image de drag à être le bloc entier (`setDragImage` sur le ref du
 * conteneur) plutôt que juste l'en-tête, pour un retour visuel correct.
 */
export function BlockShell({
  block,
  onUpdate,
  onRemove,
  mediaSide,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: BlockShellProps) {
  const def = getBlockDefinition(block.type);
  const Editor = def.Editor as unknown as ComponentType<
    BlockEditorProps<PageBlockV1>
  >;

  const shellRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={shellRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={clsx(
        "rounded-lg border bg-card transition-colors",
        isDragging && "opacity-50",
        isDragOver ? "border-primary" : "border-border",
      )}
    >
      {/* En-tête : seule zone draggable */}
      <div
        draggable
        onDragStart={(e) => {
          if (shellRef.current) {
            e.dataTransfer.setDragImage(shellRef.current, 0, 0);
          }
          e.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        className="flex items-center gap-2 border-b border-border bg-muted/40 px-2 py-1.5"
      >
        <span className="cursor-grab text-muted-foreground" aria-hidden>
          <GripVertical className="h-4 w-4" />
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {def.icon}
          {def.label}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Supprimer le bloc"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Corps : l'Editor spécifique au bloc */}
      <div className="p-3">
        <Editor block={block} onChange={onUpdate} mediaSide={mediaSide} />
      </div>
    </div>
  );
}
