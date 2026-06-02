"use client";

import { type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  DisciplineForm,
  type DisciplineFormInput,
} from "@features/admin/disciplines/forms/DisciplineForm";
import { useDisciplineStore } from "@lib/stores/useDisciplineStore";

export default function CreateDisciplinePage(): JSX.Element {
  const router = useRouter();
  const createDiscipline = useDisciplineStore((s) => s.createDiscipline);

  const handleSubmit = async (input: DisciplineFormInput): Promise<void> => {
    // Types parfaitement alignés : `description: PageContentV1` côté
    // form, idem côté store. Aucun cast nécessaire (contrairement à
    // CourseForm qui type encore son content en JsonValue).
    const created = await createDiscipline({
      name: input.name,
      type: input.type,
      family: input.family,
      school: input.school,
      classification: input.classification,
      originId: input.originId,
      description: input.description,
      categoryId: input.categoryId,
      instructorId: input.instructorId,
    });

    router.push(`/admin/dashboard/disciplines/${created.id}`);
  };

  return (
    <div>
      <Link
        href="/admin/dashboard/disciplines"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une discipline</h2>
      <DisciplineForm onSubmit={handleSubmit} submitLabel="Créer" />
    </div>
  );
}