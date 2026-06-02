"use client";

import { trpc } from "@/core/trpc/trpcClient";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface DisciplineSelectProps {
  /** ID de la discipline sélectionnée. `0` = placeholder (rien de choisi). */
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
 * Sélecteur de Discipline branché sur `discipline.getAll` (publicProcedure
 * existante). Affiche le `name` de chaque discipline et retourne son `id`.
 *
 * Convention : `value === 0` représente « rien de sélectionné », et fait
 * apparaître une option placeholder en tête de liste. Le caller doit
 * valider que la valeur finale est différente de 0 avant de soumettre
 * (cf. `CourseForm`).
 *
 * Pendant le chargement, le select reste utilisable mais ne montre que
 * le placeholder — pas de skeleton compliqué, juste un état honnête de
 * « pas encore prêt ».
 */
export function DisciplineSelect({
  value,
  onChange,
  id,
  className,
}: DisciplineSelectProps) {
  const { data: disciplines, isLoading } = trpc.discipline.getAll.useQuery();

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
        {isLoading ? "Chargement…" : "— Sélectionner une discipline —"}
      </option>
      {disciplines?.map((d) => (
        <option key={d.id} value={String(d.id)}>
          {d.name}
        </option>
      ))}
    </select>
  );
}