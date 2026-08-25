"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const del = trpc.discipline.delete.useMutation({
    onSuccess: async () => {
      await utils.discipline.getAll.invalidate();
      router.push("/dashboard/disciplines");
    },
  });

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
      publicationDate: input.publicationDate,
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

      {!done && (
        <div className="mt-8 border-t border-red-200 pt-4">
          <p className="mb-2 text-sm font-medium text-red-700">Zone dangereuse</p>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Supprimer la discipline
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Supprimer « {discipline.name} » ? Son dossier doit être vide.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={del.isPending}
                  onClick={() => del.mutate({ id: disciplineId })}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Confirmer la suppression
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          {del.error && (
            <p className="mt-2 text-sm text-red-600">{del.error.message}</p>
          )}
        </div>
      )}
    </div>
  );
}