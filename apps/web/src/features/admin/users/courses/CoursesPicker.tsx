"use client";

import type { JSX } from "react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { AUDIENCE_LABELS, DAY_LABELS, formatTime } from "#lib/format/index.ts";
import { isMinorAudience, type EnrollableCourse } from "@akfc/contracts/courses/enrollment.ts";

/** « Tchoy Lee Fut — Jeudi 18h00–19h30 · Ados ». */
export function courseLabel(c: EnrollableCourse): string {
  return `${c.disciplineName} — ${DAY_LABELS[c.day] ?? c.day} ${formatTime(c.beginTime)}–${formatTime(c.endTime)} · ${AUDIENCE_LABELS[c.audience] ?? c.audience}`;
}

/**
 * Les créneaux suivis par un membre, une case par créneau. Les créneaux pour enfants ou adolescents
 * portent une pastille « mineurs » : à la création d'un compte, en cocher un pré-coche « Mineur ».
 */
export function CoursesPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (ids: number[], courses: EnrollableCourse[]) => void;
}): JSX.Element {
  const { data: courses, isLoading } = trpc.course.listForEnrollment.useQuery();

  if (isLoading) return <p className="text-xs text-muted-foreground">Chargement des cours…</p>;
  if (!courses || courses.length === 0) {
    return <p className="text-xs text-muted-foreground">Aucun cours n&apos;est encore créé.</p>;
  }

  return (
    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded border border-input bg-background p-2">
      {courses.map((c) => (
        <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-muted">
          <input
            type="checkbox"
            checked={value.includes(c.id)}
            onChange={(e) => {
              const ids = e.target.checked ? [...value, c.id] : value.filter((id) => id !== c.id);
              onChange(ids, courses.filter((x) => ids.includes(x.id)));
            }}
          />
          <span>{courseLabel(c)}</span>
          {isMinorAudience(c.audience) && (
            <span className="rounded-full bg-sky-100 px-1.5 text-[10px] font-semibold text-sky-900 dark:bg-sky-900 dark:text-sky-100">
              mineurs
            </span>
          )}
        </label>
      ))}
    </div>
  );
}
