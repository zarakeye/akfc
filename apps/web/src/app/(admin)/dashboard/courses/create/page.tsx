"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  CourseForm,
  type CourseFormInput,
} from "@features/admin/courses/forms/CourseForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Création d'un cours — `/(admin)/dashboard/courses/create`.
 * Migré hors de `useCourseStore` : appel `trpc.course.create` direct +
 * invalidation de `course.getAll`.
 */
export default function CreateCoursePage(): JSX.Element {
  const utils = trpc.useUtils();
  const createMutation = trpc.course.create.useMutation();
  const [createdId, setCreatedId] = useState<number | null>(null);

  const handleSubmit = async (input: CourseFormInput): Promise<void> => {
    const created = await createMutation.mutateAsync(input);
    await utils.course.getAll.invalidate();
    setCreatedId(created.id);
  };

  return (
    <div>
      <Link
        href="/dashboard/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un cours</h2>

      {createdId != null ? (
        <SuccessRedirect
          target={`/dashboard/courses/${createdId}`}
          message="Cours créé."
        />
      ) : (
        <CourseForm onSubmit={handleSubmit} submitLabel="Créer" />
      )}
    </div>
  );
}