"use client";

import { trpc } from "@/core/trpc/trpcClient";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface InstructorSelectProps {
  /** ID de l'instructeur sélectionné, ou `null` pour aucun. */
  value: string | null;
  /** Notifié au changement avec le nouvel ID ou `null`. */
  onChange: (value: string | null) => void;
  /** Optionnel : ID du select pour `<label htmlFor>`. */
  id?: string;
  /** Optionnel : classes Tailwind supplémentaires. */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Sélecteur d'instructeur branché sur `user.getInstructors` — une
 * nouvelle procédure tRPC qui ramène tout user ayant **au moins une
 * relation d'instruction** (`disciplinesAsInstructor`,
 * `coursesAsInstructor`, `stagesAsPrimaryAnimator`, `stagesAsAnimator`).
 *
 * C'est une définition **factuelle** de l'instructeur : qui anime
 * déjà quelque chose dans le club. Volontaire pour éviter de dépendre
 * d'un rôle nominal (« instructor ») qui n'existe pas en schéma. Si tu
 * veux désigner un nouvel instructeur qui n'anime encore rien, il faudra
 * un autre signal (rôle dédié ou flag) à introduire plus tard.
 *
 * Affichage du nom : `firstName lastName` si dispo, sinon `pseudo`,
 * sinon `email` en dernier recours. Aucun fallback ne masque l'identité.
 *
 * `value === null` est représenté par une option « Aucun » en tête —
 * le `Course.instructorId` est nullable, donc « pas d'instructeur
 * spécifique pour ce créneau » est une valeur sémantiquement valide
 * (l'instructeur de la discipline par défaut s'applique alors).
 */
export function InstructorSelect({
  value,
  onChange,
  id,
  className,
}: InstructorSelectProps) {
  const { data: instructors, isLoading } = trpc.user.getInstructors.useQuery();

  return (
    <select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className={
        className ??
        "rounded border border-input bg-background px-2 py-1 text-sm"
      }
    >
      <option value="">
        {isLoading ? "Chargement…" : "— Aucun —"}
      </option>
      {instructors?.map((u) => (
        <option key={u.id} value={u.id}>
          {formatInstructorName(u)}
        </option>
      ))}
    </select>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helper d'affichage                                                     */
/* ─────────────────────────────────────────────────────────────────────── */

function formatInstructorName(user: {
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
}): string {
  const fullName = [user.firstName, user.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return fullName || user.pseudo || user.email;
}