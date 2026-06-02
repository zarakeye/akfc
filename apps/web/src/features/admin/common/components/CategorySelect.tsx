"use client";

import { trpc } from "@/core/trpc/trpcClient";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface CategorySelectProps {
  /**
   * ID de la catégorie sélectionnée. `0` = placeholder (rien de choisi).
   * Convention alignée sur `DisciplineSelect`.
   */
  value: number;
  /** Notifié au changement avec le nouvel ID. */
  onChange: (value: number) => void;
  /** Optionnel : ID du select pour `<label htmlFor>`. */
  id?: string;
  /** Optionnel : classes Tailwind supplémentaires. */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Sélecteur de Category branché sur `category.getAll`. Affiche le
 * `type` de chaque catégorie (qui sert de libellé d'affichage) et
 * retourne son `id`.
 *
 * Convention : `value === 0` représente « rien de sélectionné », et
 * fait apparaître une option placeholder en tête de liste. Le caller
 * doit valider que la valeur finale est différente de 0 avant de
 * soumettre (cf. DisciplineForm).
 *
 * Réutilisable dans tout form qui doit sélectionner une catégorie.
 * Vit sous `features/admin/common/components/` parce que pas
 * spécifique à une entité métier.
 */
export function CategorySelect({
  value,
  onChange,
  id,
  className,
}: CategorySelectProps) {
  const { data: categories, isLoading } = trpc.category.getAll.useQuery();

  return (
    <select
      id={id}
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      className={
        className ??
        "rounded border border-input bg-background px-2 py-1 text-sm"
      }
    >
      <option value="0">
        {isLoading ? "Chargement…" : "— Sélectionner une catégorie —"}
      </option>
      {categories?.map((c) => (
        <option key={c.id} value={String(c.id)}>
          {c.type}
        </option>
      ))}
    </select>
  );
}