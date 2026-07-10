"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  EventForm,
  type EventFormInput,
} from "@features/admin/events/forms/EventForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/** Création d'un évènement — `/(admin)/dashboard/events/create`. */
export default function CreateEventPage(): JSX.Element {
  const utils = trpc.useUtils();
  const createMutation = trpc.event.create.useMutation();
  const [createdId, setCreatedId] = useState<number | null>(null);

  const handleSubmit = async (input: EventFormInput): Promise<void> => {
    const created = await createMutation.mutateAsync(input);
    await utils.event.getAllAdmin.invalidate();
    await utils.event.getAll.invalidate();
    setCreatedId(created.id);
  };

  return (
    <div>
      <Link
        href="/dashboard/events"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un évènement</h2>

      {createdId != null ? (
        <SuccessRedirect
          target={`/dashboard/events/${createdId}`}
          message="Évènement créé."
        />
      ) : (
        <EventForm onSubmit={handleSubmit} submitLabel="Créer" />
      )}
    </div>
  );
}