"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  CourseForm,
  type CourseFormInput,
} from "@features/admin/courses/forms/CourseForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Édition d'un cours — `/(admin)/dashboard/courses/[id]/edit`.
 *
 * trpc direct (pas de store) : `getById` pour préremplir, `update` au submit,
 * invalidation de `course.getAll`/`getById`, puis `SuccessRedirect` vers la
 * fiche `[id]`. `disciplineId` omis (non modifiable).
 */
export default function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const { id } = use(params);
  const courseId = Number(id);
  const utils = trpc.useUtils();
  const updateMutation = trpc.course.update.useMutation();
  const [done, setDone] = useState(false);

  const {
    data: course,
    isLoading,
    isError,
  } = trpc.course.getById.useQuery(
    { id: courseId },
    { enabled: Number.isFinite(courseId) && courseId > 0 },
  );

  if (isLoading) return <div>Chargement du cours…</div>;
  if (isError || !course) {
    return <div className="text-red-600">Cours introuvable.</div>;
  }

  const handleSubmit = async (input: CourseFormInput): Promise<void> => {
    await updateMutation.mutateAsync({
      id: courseId,
      audience: input.audience,
      day: input.day,
      beginTime: input.beginTime,
      endTime: input.endTime,
      instructorId: input.instructorId,
      requisites: input.requisites,
      content: input.content,
    });
    await utils.course.getAll.invalidate();
    await utils.course.getById.invalidate({ id: courseId });
    setDone(true);
  };

  return (
    <div>
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer le cours</h2>

      {done ? (
        <SuccessRedirect
          target={`/dashboard/courses/${courseId}`}
          message="Cours mis à jour."
        />
      ) : (
        <CourseForm
          initial={course}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      )}
    </div>
  );
}