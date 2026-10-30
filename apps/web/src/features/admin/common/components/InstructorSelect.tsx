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
  /**
   * Libellé de l'option vide (valeur `null`). Par défaut « — Choisir — » : pour une
   * discipline, un stage ou un évènement, la personne est obligatoire. Le formulaire
   * d'un créneau passe « — Celui de la discipline — », car `null` y signifie « par défaut ».
   */
  emptyLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Sélecteur d'instructeur branché sur `user.getAssignableInstructors` (réservée aux
 * administrateurs) : les membres du groupe Administrateurs, plus tous ceux qui ont déjà
 * une responsabilité (instructeur d'une discipline ou d'un créneau, animateur d'un stage,
 * organisateur d'un évènement). Il n'existe pas de rôle « instructeur » en base :
 * l'instructeur se définit par ce qu'il anime.
 *
 * Affichage du nom : `firstName lastName` si dispo, sinon `pseudo`,
 * sinon `email` en dernier recours. Aucun fallback ne masque l'identité.
 *
 * `value === null` est représenté par l'option vide en tête (`emptyLabel`). Pour un
 * créneau, `Course.instructorId` null est une valeur valide : l'instructeur principal de
 * la discipline s'applique alors.
 */
export function InstructorSelect({
  value,
  onChange,
  id,
  className,
  emptyLabel = "— Choisir —",
}: InstructorSelectProps) {
  const { data: instructors, isLoading } = trpc.user.getAssignableInstructors.useQuery();

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
        {isLoading ? "Chargement…" : emptyLabel}
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