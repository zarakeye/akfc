"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  SeminarForm,
  type SeminarFormInput,
} from "@features/admin/seminars/forms/SeminarForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Édition d'un stage — `/(admin)/dashboard/seminars/[id]/edit`.
 * `getById` (inclut `animators`) → `SeminarForm initial` → `stage.update` →
 * invalidation → `SuccessRedirect` vers la fiche.
 */
export default function EditStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const { id } = use(params);
  const seminarId = Number(id);
  const utils = trpc.useUtils();
  const updateMutation = trpc.seminar.update.useMutation();
  const deleteMutation = trpc.seminar.delete.useMutation();
  const [done, setDone] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    data: stage,
    isLoading,
    isError,
  } = trpc.seminar.getByIdAdmin.useQuery(
    { id: seminarId },
    { enabled: Number.isFinite(seminarId) && seminarId > 0 },
  );

  if (isLoading) return <div>Chargement du stage…</div>;
  if (isError || !stage) {
    return <div className="text-red-600">Stage introuvable.</div>;
  }

  const handleSubmit = async (input: SeminarFormInput): Promise<void> => {
    await updateMutation.mutateAsync({ id: seminarId, ...input });
    await utils.seminar.getAllAdmin.invalidate();
    await utils.seminar.getByIdAdmin.invalidate({ id: seminarId });
    setDone(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (
      !window.confirm(
        "Supprimer définitivement ce stage ? Cette action est irréversible.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: seminarId });
      await utils.seminar.getAllAdmin.invalidate();
      setDeleted(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <Link
        href={`/dashboard/seminars/${seminarId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer le stage</h2>

      {done ? (
        <SuccessRedirect
          target={`/dashboard/seminars/${seminarId}`}
          message="Stage mis à jour."
        />
      ) : deleted ? (
        <SuccessRedirect target="/dashboard/seminars" message="Stage supprimé." />
      ) : (
        <>
          <SeminarForm
            initial={stage}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer"
          />
          <div className="mt-8 border-t pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Suppression…" : "Supprimer le stage"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}