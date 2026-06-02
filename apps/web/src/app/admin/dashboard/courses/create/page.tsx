"use client";

import { type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  CourseForm,
  type CourseFormInput,
} from "@features/admin/courses/forms/CourseForm";
import {
  useCourseStore,
  type CreateCourseInput,
} from "@lib/stores/useCourseStore";

export default function CreateCoursePage(): JSX.Element {
  const router = useRouter();
  const createCourse = useCourseStore((s) => s.createCourse);

  const handleSubmit = async (input: CourseFormInput): Promise<void> => {
    // Le store accepte `content: JsonValue`. PageContentV1 est
    // structurellement compatible (object + arrays + scalaires), mais
    // le bloc tiptap porte un `content: Record<string, unknown>` qui
    // bloque l'assignation directe (`unknown` n'est pas `JsonValue`).
    // Cast explicite vers le type exact attendu par le store.
    const created = await createCourse({
      disciplineId: input.disciplineId,
      audience: input.audience,
      day: input.day,
      beginTime: input.beginTime,
      endTime: input.endTime,
      instructorId: input.instructorId,
      requisites: input.requisites,
      content: input.content as CreateCourseInput["content"],
    });

    // Redirection vers la page admin d'édition du cours créé — on y
    // retombe avec le builder préfilled depuis la DB, ce qui permet de
    // vérifier que le content a bien été persisté.
    router.push(`/admin/dashboard/courses/${created.id}`);
  };

  return (
    <div>
      <Link
        href="/admin/dashboard/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un cours</h2>
      <CourseForm onSubmit={handleSubmit} submitLabel="Créer" />
    </div>
  );
}
