"use client";

import { useState, type JSX } from "react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { CoursesPicker } from "#features/admin/users/courses/CoursesPicker.tsx";
import { TaughtCoursesPicker } from "#features/admin/users/courses/TaughtCoursesPicker.tsx";

const sorted = (ids: number[]) => [...ids].sort((a, b) => a - b).join(",");
const BUTTON =
  "rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";

/**
 * Fiche d'un membre : ses cours.
 * - Simple membre : les cours qu'il SUIT, comme élève.
 * - Instructeur (groupe Instructeurs) : les cours qu'il DONNE, puis ceux qu'il suit aussi,
 *   gratuitement, sans être compté comme élève. Il ne suit pas un cours qu'il donne.
 */
export function CoursesControl({ userId, isInstructor }: { userId: string; isInstructor: boolean }): JSX.Element {
  const { data: courses } = trpc.course.listForEnrollment.useQuery();
  const taughtIds = (courses ?? []).filter((c) => c.instructorId === userId).map((c) => c.id);
  return (
    <>
      {isInstructor && <TaughtSection userId={userId} />}
      <FollowedSection userId={userId} isInstructor={isInstructor} except={isInstructor ? taughtIds : []} />
    </>
  );
}

function TaughtSection({ userId }: { userId: string }): JSX.Element {
  const utils = trpc.useUtils();
  const { data: courses } = trpc.course.listForEnrollment.useQuery();
  // Attitré seulement : ceux qu'il donne par sa discipline ne se règlent pas ici.
  const saved = (courses ?? []).filter((c) => c.instructorId === userId && !c.instructorFromDiscipline).map((c) => c.id);
  const [draft, setDraft] = useState<number[] | null>(null);
  const [done, setDone] = useState(false);
  const save = trpc.user.setTaughtCourses.useMutation({
    onSuccess: async () => {
      setDraft(null);
      setDone(true);
      await Promise.all([utils.course.listForEnrollment.invalidate(), utils.user.coursesOf.invalidate({ userId })]);
    },
  });
  const value = draft ?? saved;
  const changed = draft !== null && sorted(draft) !== sorted(saved);

  return (
    <section aria-label="Cours donnés" className="mt-6 space-y-2 text-sm">
      <h3 className="font-semibold">Cours donnés</h3>
      <TaughtCoursesPicker
        userId={userId}
        value={value}
        onChange={(ids) => {
          setDone(false);
          setDraft(ids);
        }}
      />
      {save.error && <p className="text-destructive">{save.error.message}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!changed || save.isPending}
          onClick={() => save.mutate({ userId, courseIds: value })}
          className={BUTTON}
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer les cours donnés"}
        </button>
        {done && (
          <span role="status" className="text-success">
            Cours donnés enregistrés.
          </span>
        )}
      </div>
    </section>
  );
}

function FollowedSection({
  userId,
  isInstructor,
  except,
}: {
  userId: string;
  isInstructor: boolean;
  except: number[];
}): JSX.Element {
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

  const value = (draft ?? saved ?? []).filter((id) => !except.includes(id));
  const changed = draft !== null && sorted(value) !== sorted((saved ?? []).filter((id) => !except.includes(id)));
  const title = isInstructor ? "Autres cours suivis" : "Cours suivis";

  return (
    <section aria-label={title} className="mt-6 space-y-2 text-sm">
      <h3 className="font-semibold">{title}</h3>
      {isInstructor && (
        <p className="text-xs text-muted-foreground">
          Un instructeur suit d&apos;autres cours gratuitement, sans être compté comme élève.
        </p>
      )}
      <CoursesPicker
        value={value}
        except={except}
        onChange={(ids) => {
          setDone(false);
          setDraft(ids);
        }}
      />
      {save.error && <p className="text-destructive">{save.error.message}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!changed || save.isPending}
          onClick={() => save.mutate({ userId, courseIds: value })}
          className={BUTTON}
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer les cours"}
        </button>
        {done && (
          <span role="status" className="text-success">
            Cours enregistrés.
          </span>
        )}
      </div>
    </section>
  );
}
