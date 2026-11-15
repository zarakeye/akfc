"use client";

import type { JSX } from "react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { courseLabel } from "#features/admin/users/courses/CoursesPicker.tsx";

/**
 * Les créneaux qu'un instructeur DONNE, une case par créneau. Cocher en fait l'instructeur attitré :
 * la ligne dit qui il remplace. Un créneau qu'il donne par sa discipline (sans attitré) est coché
 * d'office, sans case à décocher : il se règle sur la discipline.
 *
 * `value` : les créneaux dont il est (ou sera) l'attitré ; `userId` : null à la création.
 */
export function TaughtCoursesPicker({
  userId,
  value,
  onChange,
}: {
  userId: string | null;
  value: number[];
  onChange: (ids: number[]) => void;
}): JSX.Element {
  const { data: courses, isLoading } = trpc.course.listForEnrollment.useQuery();

  if (isLoading) return <p className="text-xs text-muted-foreground">Chargement des cours…</p>;
  if (!courses || courses.length === 0) {
    return <p className="text-xs text-muted-foreground">Aucun cours n&apos;est encore créé.</p>;
  }

  return (
    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded border border-input bg-background p-2">
      {courses.map((c) => {
        const mine = userId !== null && c.instructorId === userId;
        const byDiscipline = mine && c.instructorFromDiscipline && !value.includes(c.id);
        const checked = byDiscipline || value.includes(c.id);
        const other = !mine && c.instructorName ? c.instructorName : null;
        return (
          <label
            key={c.id}
            className={`flex items-center gap-2 rounded px-1 py-0.5 ${byDiscipline ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted"}`}
          >
            <input
              type="checkbox"
              disabled={byDiscipline}
              checked={checked}
              onChange={(e) => onChange(e.target.checked ? [...value, c.id] : value.filter((id) => id !== c.id))}
            />
            <span>{courseLabel(c)}</span>
            {byDiscipline && <span className="text-xs text-muted-foreground">par sa discipline</span>}
            {other && (
              <span className={`text-xs ${checked ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}>
                {checked ? `remplace ${other}` : `actuellement : ${other}`}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
