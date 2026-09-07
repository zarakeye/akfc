"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  EventForm,
  type EventFormInput,
} from "@features/admin/events/forms/EventForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Édition d'un évènement — `/(admin)/dashboard/events/[id]/edit`.
 * `getById` → `EventForm initial` → `event.update` → invalidation
 * (`getAllAdmin` + `getById`) → `SuccessRedirect` vers la fiche.
 */
export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const { id } = use(params);
  const eventId = Number(id);
  const utils = trpc.useUtils();
  const updateMutation = trpc.event.update.useMutation();
  const deleteMutation = trpc.event.delete.useMutation();
  const [done, setDone] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    data: event,
    isLoading,
    isError,
  } = trpc.event.getByIdAdmin.useQuery(
    { id: eventId },
    { enabled: Number.isFinite(eventId) && eventId > 0 },
  );

  if (isLoading) return <div>Chargement de l&apos;évènement…</div>;
  if (isError || !event) {
    return <div className="text-red-600">Évènement introuvable.</div>;
  }

  const handleSubmit = async (input: EventFormInput): Promise<void> => {
    await updateMutation.mutateAsync({ id: eventId, ...input });
    // La liste admin lit `getAllAdmin` (brouillons inclus) ; on invalide
    // les deux par sûreté.
    await utils.event.getAllAdmin.invalidate();
    await utils.event.getAll.invalidate();
    await utils.event.getByIdAdmin.invalidate({ id: eventId });
    setDone(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (
      !window.confirm(
        "Supprimer définitivement cet évènement ? Cette action est irréversible.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: eventId });
      await utils.event.getAllAdmin.invalidate();
      await utils.event.getAll.invalidate();
      setDeleted(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <Link
        href={`/dashboard/events/${eventId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer l&apos;évènement</h2>

      {done ? (
        <SuccessRedirect
          target={`/dashboard/events/${eventId}`}
          message="Évènement mis à jour."
        />
      ) : deleted ? (
        <SuccessRedirect target="/dashboard/events" message="Évènement supprimé." />
      ) : (
        <>
          <EventForm
            initial={event}
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
              {deleting ? "Suppression…" : "Supprimer l'évènement"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}