"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  DisciplineForm,
  type DisciplineFormInput,
} from "@features/admin/disciplines/forms/DisciplineForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/** Création d'une discipline — `/(admin)/dashboard/disciplines/create`. */
export default function CreateDisciplinePage(): JSX.Element {
  const utils = trpc.useUtils();
  const createMutation = trpc.discipline.create.useMutation();
  const [createdId, setCreatedId] = useState<number | null>(null);

  const handleSubmit = async (input: DisciplineFormInput): Promise<void> => {
    const created = await createMutation.mutateAsync(input);
    await utils.discipline.getAll.invalidate();
    setCreatedId(created.id);
  };

  return (
    <div>
      <Link
        href="/dashboard/disciplines"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une discipline</h2>

      {createdId != null ? (
        <SuccessRedirect
          target={`/dashboard/disciplines/${createdId}`}
          message="Discipline créée."
        />
      ) : (
        <DisciplineForm onSubmit={handleSubmit} submitLabel="Créer" />
      )}
    </div>
  );
}