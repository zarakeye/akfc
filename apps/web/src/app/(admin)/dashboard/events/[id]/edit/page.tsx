"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const [done, setDone] = useState(false);

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
      ) : (
        <EventForm
          initial={event}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      )}
    </div>
  );
}