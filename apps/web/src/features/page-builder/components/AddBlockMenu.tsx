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
  /**
   * Types de blocs proposés. ABSENT = tous (comportement par défaut de
   * l'application). Présent = exactement ceux-là.
   *
   * C'est une liste d'AUTORISATION et non d'interdiction : un type de bloc
   * ajouté plus tard au registre n'apparaît pas ici tant qu'il n'y a pas été
   * inscrit. L'inverse le ferait surgir dans tous les builders restreints
   * sans que personne l'ait décidé.
   */
  allowedBlocks?: readonly PageBlockKindV1[];
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Bouton « + Ajouter un bloc » qui déplie la liste des types disponibles.
 *
 * Trois régimes selon le nombre de types offerts :
 *   - aucun  → le bouton disparaît (rien à ajouter) ;
 *   - un     → le bouton ajoute directement ce type et porte son nom, sans
 *              déplier une liste d'un seul élément ;
 *   - deux+  → le menu déroulant habituel.
 *
 * L'ordre affiché reste celui d'`ALL_BLOCK_DEFINITIONS` et non celui de la
 * liste reçue : le menu se lit pareil partout dans l'application.
 *
 * Le menu se ferme sur clic extérieur (listener sur `document`). Pour v1 le
 * bloc est toujours ajouté en fin de liste.
 */
export function AddBlockMenu({ onAdd, allowedBlocks }: AddBlockMenuProps) {
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

  // Filtrage sans réassignation pendant le rendu (React Compiler strict).
  const definitions =
    allowedBlocks === undefined
      ? ALL_BLOCK_DEFINITIONS
      : ALL_BLOCK_DEFINITIONS.filter((def) =>
          allowedBlocks.includes(def.kind),
        );

  // Les hooks sont appelés au-dessus : les sorties anticipées viennent après,
  // pour que l'ordre des hooks reste stable d'un rendu à l'autre.
  if (definitions.length === 0) return null;

  if (definitions.length === 1) {
    const only = definitions[0];
    return (
      <button
        type="button"
        onClick={() => onAdd(only.kind)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        {only.label}
      </button>
    );
  }

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
          {definitions.map((def) => (
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
