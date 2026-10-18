import type { Column } from "react-ts-tab-lib";

import { DeleteRowButton } from "./DeleteRowButton";

/**
 * Colonne « Supprimer » pour les tableaux `react-ts-tab-lib`.
 *
 * La bibliothèque ne passe à `render` que la VALEUR de la cellule, pas la ligne : chaque ligne
 * porte donc une propriété `supprimer` égale à son identifiant, et la colonne retrouve la ligne
 * par cet identifiant. (Une valeur simple, et non un objet, car la recherche du tableau appelle
 * `toString()` sur chaque cellule.)
 */
export function deleteColumn<R extends { supprimer: string | number }>(
  rows: R[],
  opts: {
    entityLabel: string;
    nameOf: (row: R) => string;
    onDelete: (row: R) => Promise<void>;
    consequence?: string;
    disabledReason?: (row: R) => string | null;
  },
): Column<R> {
  const byKey = new Map(rows.map((r) => [r.supprimer, r]));
  return {
    property: "supprimer",
    displayName: "Supprimer",
    type: "custom",
    render: (value) => {
      const row = byKey.get(value as R["supprimer"]);
      if (!row) return null;
      return (
        <DeleteRowButton
          entityLabel={opts.entityLabel}
          name={opts.nameOf(row)}
          consequence={opts.consequence}
          disabledReason={opts.disabledReason?.(row) ?? null}
          onDelete={() => opts.onDelete(row)}
        />
      );
    },
  };
}
