"use client";

import { trpc } from "@/core/trpc/trpcClient";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface OriginSelectProps {
  /**
   * ID de l'origine sélectionnée. `null` = « Aucune » sélectionnée.
   * Sémantique métier : `null` est une valeur valide pour une discipline
   * sans origine renseignée, ou pour un stage/event sans rattachement
   * culturel.
   */
  value: number | null;
  /** Notifié au changement avec le nouvel ID ou `null`. */
  onChange: (value: number | null) => void;
  /** Optionnel : ID du select pour `<label htmlFor>`. */
  id?: string;
  /** Optionnel : classes Tailwind supplémentaires. */
  className?: string;
  /** Optionnel : label pour l'option « Aucune ». Default "— Aucune —". */
  emptyLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Sélecteur d'origine culturelle branché sur `origin.getAll`. Affiche
 * le `flag` (s'il existe) suivi du `name`. Le router retourne déjà les
 * origines triées par `sortOrder` puis `name`.
 *
 * `value === null` = « Aucune ». Aligne avec la sémantique métier :
 * `Discipline.originId`, `Stage.originId`, `Event.originId` sont tous
 * nullables.
 *
 * Réutilisable dans les forms admin Discipline, Stage et Event qui
 * arriveront dans les prochaines livraisons. Vit dans
 * `features/admin/common/components/` parce qu'il n'est spécifique à
 * aucune entité métier — comme `DisciplineSelect` et `InstructorSelect`.
 */
export function OriginSelect({
  value,
  onChange,
  id,
  className,
  emptyLabel = "— Aucune —",
}: OriginSelectProps) {
  const { data: origins, isLoading } = trpc.origin.getAll.useQuery();

  return (
    <select
      id={id}
      value={value === null ? "" : String(value)}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
      className={
        className ??
        "rounded border border-input bg-background px-2 py-1 text-sm"
      }
    >
      <option value="">{isLoading ? "Chargement…" : emptyLabel}</option>
      {origins?.map((o) => (
        <option key={o.id} value={String(o.id)}>
          {o.flag ? `${o.flag} ${o.name}` : o.name}
        </option>
      ))}
    </select>
  );
}