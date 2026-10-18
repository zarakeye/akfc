"use client";

import { JSX, useState } from "react";
import { Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

export interface DeleteRowButtonProps {
  /** Article défini + nom du type : « l'article », « la discipline »… */
  entityLabel: string;
  /** Nom de l'élément (sert aussi à la phrase de confirmation). */
  name: string;
  /** Conséquence à connaître avant de confirmer. */
  consequence?: string;
  /** Supprime (mutation + invalidation des listes). */
  onDelete: () => Promise<void>;
  /** Si présent : suppression impossible ici, la corbeille est grisée et le motif en infobulle. */
  disabledReason?: string | null;
}

/**
 * Corbeille rouge d'une ligne de liste du tableau de bord. Le clic ne remonte pas jusqu'à la
 * ligne (qui ouvrirait la fiche) et ouvre la confirmation « supprimer <nom> ».
 */
export function DeleteRowButton({
  entityLabel,
  name,
  consequence,
  onDelete,
  disabledReason,
}: DeleteRowButtonProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const label = disabledReason ?? `Supprimer ${entityLabel} « ${name} »`;

  return (
    <>
      <button
        type="button"
        title={label}
        aria-label={label}
        disabled={!!disabledReason}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {open && (
        <ConfirmDeleteDialog
          entityLabel={entityLabel}
          name={name}
          consequence={consequence}
          onConfirm={onDelete}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
