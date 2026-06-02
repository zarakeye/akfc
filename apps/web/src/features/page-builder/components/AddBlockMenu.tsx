"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { PageBlockKindV1 } from "@contracts/page";

import { ALL_BLOCK_DEFINITIONS } from "../blockRegistry";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface AddBlockMenuProps {
  onAdd: (kind: PageBlockKindV1) => void;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Bouton « + Ajouter un bloc » qui déplie la liste des types disponibles,
 * alimentée par `ALL_BLOCK_DEFINITIONS`. Chaque entrée montre l'icône et
 * le label du bloc, et l'ajoute au clic.
 *
 * Le menu se ferme sur clic extérieur (listener sur `document`) — pattern
 * minimal sans dépendance à une lib de popover. Pour v1 le bloc est
 * toujours ajouté en fin de liste ; l'insertion à une position précise
 * pourra venir plus tard (un « + » entre chaque bloc).
 */
export function AddBlockMenu({ onAdd }: AddBlockMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Ajouter un bloc
      </button>

      {open && (
        <div className="absolute left-1/2 z-10 mt-1 w-56 -translate-x-1/2 rounded-md border border-border bg-popover p-1 shadow-md">
          {ALL_BLOCK_DEFINITIONS.map((def) => (
            <button
              key={def.kind}
              type="button"
              onClick={() => {
                onAdd(def.kind);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-popover-foreground transition-colors hover:bg-muted"
            >
              {def.icon}
              {def.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
