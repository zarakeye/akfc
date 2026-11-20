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
 *
 * `exclusiveMinor` (un simple membre) : un créneau pour mineurs coché, les autres se grisent, sauf
 * ceux « Tous publics ». Un adolescent ne suit pas un cours d'adultes.
 *
 * `except` : des créneaux à ne pas proposer (ceux qu'un instructeur donne : il ne les suit pas).
 */
export function CoursesPicker({
  value,
  onChange,
  exclusiveMinor = false,
  except = [],
}: {
  value: number[];
  onChange: (ids: number[], courses: EnrollableCourse[]) => void;
  exclusiveMinor?: boolean;
  except?: number[];
}): JSX.Element {
  const { data: all, isLoading } = trpc.course.listForEnrollment.useQuery();
  const courses = all?.filter((c) => !except.includes(c.id));

  if (isLoading) return <p className="text-xs text-muted-foreground">Chargement des cours…</p>;
  if (!courses || courses.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {all && all.length > 0 ? "Aucun autre cours." : "Aucun cours n'est encore créé."}
      </p>
    );
  }

  const minorChosen =
    exclusiveMinor && courses.some((c) => value.includes(c.id) && isMinorAudience(c.audience));
  const locked = (c: EnrollableCourse) => minorChosen && !value.includes(c.id) && c.audience !== "ALL_AGES";

  return (
    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded border border-input bg-background p-2">
      {courses.map((c) => (
        <label
          key={c.id}
          className={`flex items-center gap-2 rounded px-1 py-0.5 ${locked(c) ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted"}`}
        >
          <input
            type="checkbox"
            disabled={locked(c)}
            checked={value.includes(c.id)}
            onChange={(e) => {
              const ids = e.target.checked ? [...value, c.id] : value.filter((id) => id !== c.id);
              onChange(ids, courses.filter((x) => ids.includes(x.id)));
            }}
          />
          <span>{courseLabel(c)}</span>
          {isMinorAudience(c.audience) && (
            <span className="rounded-full bg-info-muted px-1.5 text-[10px] font-semibold text-info">
              mineurs
            </span>
          )}
        </label>
      ))}
    </div>
  );
}
