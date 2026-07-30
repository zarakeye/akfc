"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  DisciplineForm,
  type DisciplineFormInput,
} from "@features/admin/disciplines/forms/DisciplineForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Édition d'une discipline — `/(admin)/dashboard/disciplines/[id]/edit`.
 *
 * Charge la discipline (`getById`), rend `DisciplineForm` en édition. Au
 * succès : invalide `discipline.getAll` + `getById` (liste & fiche à jour),
 * puis affiche `SuccessRedirect` qui ramène à la fiche `[id]` (countdown 3 s
 * ou clic « OK »).
 */
export default function EditDisciplinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const { id } = use(params);
  const disciplineId = Number(id);
  const utils = trpc.useUtils();
  const updateMutation = trpc.discipline.update.useMutation();
  const [done, setDone] = useState(false);

  const {
    data: discipline,
    isLoading,
    isError,
  } = trpc.discipline.getById.useQuery(
    { id: disciplineId },
    { enabled: Number.isFinite(disciplineId) && disciplineId > 0 },
  );

  if (isLoading) return <div>Chargement de la discipline…</div>;
  if (isError || !discipline) {
    return <div className="text-red-600">Discipline introuvable.</div>;
  }

  const handleSubmit = async (input: DisciplineFormInput): Promise<void> => {
    await updateMutation.mutateAsync({
      id: disciplineId,
      name: input.name,
      slug: input.slug,
      type: input.type,
      familyId: input.familyId,
      school: input.school,
      classification: input.classification,
      originId: input.originId,
      instructorId: input.instructorId,
      description: input.description,
      // Énumération explicite ici, contrairement à la page de création qui
      // transmet l'objet entier : sans cette ligne le résumé serait éditable
      // mais jamais enregistré en modification.
      summary: input.summary,
      summaryMediaId: input.summaryMediaId,
    });
    await utils.discipline.getAll.invalidate();
    await utils.discipline.getById.invalidate({ id: disciplineId });
    setDone(true);
  };

  return (
    <div>
      <Link
        href={`/dashboard/disciplines/${disciplineId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer la discipline</h2>

      {done ? (
        <SuccessRedirect
          target={`/dashboard/disciplines/${disciplineId}`}
          message="Discipline mise à jour."
        />
      ) : (
        <DisciplineForm
          initial={discipline}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      )}
    </div>
  );
}