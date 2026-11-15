"use client";

import { useState, type JSX } from "react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { CoursesPicker } from "#features/admin/users/courses/CoursesPicker.tsx";

/**
 * Fiche d'un membre : les créneaux qu'il DONNE (instructeur, en lecture seule : ils se règlent sur
 * le cours) et ceux qu'il SUIT comme élève, modifiables.
 */
export function CoursesControl({ userId, taught = [] }: { userId: string; taught?: string[] }): JSX.Element {
  const utils = trpc.useUtils();
  const { data: saved } = trpc.user.coursesOf.useQuery({ userId });
  const [draft, setDraft] = useState<number[] | null>(null);
  const [done, setDone] = useState(false);
  const save = trpc.user.setCourses.useMutation({
    onSuccess: async () => {
      setDraft(null);
      setDone(true);
      await utils.user.coursesOf.invalidate({ userId });
    },
  });

  const value = draft ?? saved ?? [];
  const sorted = (ids: number[]) => [...ids].sort((a, b) => a - b).join(",");
  const changed = draft !== null && sorted(draft) !== sorted(saved ?? []);

  return (
    <>
    {taught.length > 0 && (
      <section aria-label="Cours donnés" className="mt-6 space-y-1 text-sm">
        <h3 className="font-semibold">Cours donnés</h3>
        <ul className="list-inside list-disc text-muted-foreground">
          {taught.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    )}
    <section aria-label="Cours suivis" className="mt-6 space-y-2 text-sm">
      <h3 className="font-semibold">Cours suivis</h3>
      <CoursesPicker
        value={value}
        onChange={(ids) => {
          setDone(false);
          setDraft(ids);
        }}
      />
      {save.error && <p className="text-red-600">{save.error.message}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!changed || save.isPending}
          onClick={() => save.mutate({ userId, courseIds: value })}
          className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer les cours"}
        </button>
        {done && (
          <span role="status" className="text-emerald-700 dark:text-emerald-400">
            Cours enregistrés.
          </span>
        )}
      </div>
    </section>
    </>
  );
}
