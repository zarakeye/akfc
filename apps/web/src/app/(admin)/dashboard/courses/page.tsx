"use client";

import { useMemo, type JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { formatHHMM } from "@lib/time/formatHHMM";
import { AUDIENCE_LABELS, DAY_LABELS } from "@lib/format";
import { DeleteRowButton } from "@features/admin/common/delete";

export default function CoursesListPage(): JSX.Element {
  const { data: courses, isLoading, isError } = trpc.course.getAll.useQuery();
  const { data: disciplines } = trpc.discipline.getAll.useQuery();
  const utils = trpc.useUtils();
  const remove = trpc.course.delete.useMutation();

  const disciplineById = useMemo(() => {
    const map = new Map<number, string>();
    (disciplines ?? []).forEach((d) => map.set(d.id, d.name));
    return map;
  }, [disciplines]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cours</h2>
        <Link
          href="/dashboard/courses/create"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un cours
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">
          Erreur lors du chargement des cours.
        </p>
      ) : (courses ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun cours pour le moment. Clique sur « Créer un cours » pour
          commencer.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {(courses ?? []).map((course) => (
            <li key={course.id} className="flex items-center gap-2">
              <Link
                href={`/dashboard/courses/${course.id}`}
                className="flex min-w-0 flex-1 items-center justify-between rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted"
              >
                <span className="font-medium">
                  {disciplineById.get(course.disciplineId) ??
                    `Discipline #${course.disciplineId}`}
                </span>
                <span className="text-sm text-muted-foreground">
                  {DAY_LABELS[course.day] ?? course.day} •{" "}
                  {formatHHMM(course.beginTime)}–{formatHHMM(course.endTime)} •{" "}
                  {AUDIENCE_LABELS[course.audience] ?? course.audience}
                </span>
              </Link>
              <DeleteRowButton
                entityLabel="le cours"
                name={`${disciplineById.get(course.disciplineId) ?? `Discipline ${course.disciplineId}`} ${(DAY_LABELS[course.day] ?? course.day).toLowerCase()} ${formatHHMM(course.beginTime)}`}
                onDelete={async () => {
                  await remove.mutateAsync({ id: course.id });
                  await utils.course.getAll.invalidate();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}