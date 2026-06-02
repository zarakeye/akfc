"use client";

import { trpc } from "@/core/trpc/trpcClient";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface AnimatorsMultiSelectProps {
  /** IDs des animateurs sélectionnés. */
  value: string[];
  /** Notifié au changement avec la nouvelle liste d'IDs. */
  onChange: (value: string[]) => void;
  /**
   * ID à exclure de la liste affichée. Sert typiquement à filtrer le
   * `primaryAnimatorId` pour qu'il ne puisse pas être co-animateur
   * de lui-même.
   */
  excludeId?: string | null;
  /** Optionnel : classes Tailwind supplémentaires sur le wrapper. */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Multi-sélecteur d'animateurs sous forme de **liste de checkboxes**.
 *
 * UX volontairement simple — adapté à un club avec quelques dizaines
 * d'instructeurs maximum. Pour une combobox avec search + chips, voir
 * plus tard si le besoin se présente.
 *
 * Branché sur `user.getInstructors` (cf. PATCH user router de la
 * livraison CourseForm v2). Filtre l'`excludeId` côté client (le
 * primaryAnimator du Stage en cours d'édition).
 *
 * Affichage du nom : `firstName lastName` → `pseudo` → `email` en
 * fallback successif, comme `InstructorSelect`.
 */
export function AnimatorsMultiSelect({
  value,
  onChange,
  excludeId,
  className,
}: AnimatorsMultiSelectProps) {
  const { data: instructors, isLoading } = trpc.user.getInstructors.useQuery();

  const filteredInstructors =
    instructors?.filter((u) => u.id !== excludeId) ?? [];

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  if (isLoading) {
    return (
      <div
        className={
          className ??
          "rounded border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
        }
      >
        Chargement…
      </div>
    );
  }

  if (filteredInstructors.length === 0) {
    return (
      <div
        className={
          className ??
          "rounded border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
        }
      >
        Aucun autre instructeur disponible.
      </div>
    );
  }

  return (
    <div
      className={
        className ??
        "flex max-h-48 flex-col gap-1 overflow-y-auto rounded border border-input bg-background p-2"
      }
    >
      {filteredInstructors.map((u) => {
        const checked = value.includes(u.id);
        return (
          <label
            key={u.id}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(u.id)}
              className="h-4 w-4"
            />
            <span>{formatInstructorName(u)}</span>
          </label>
        );
      })}
    </div>
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