"use client";

import { type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  EventForm,
  type EventFormInput,
} from "@features/admin/events/forms/EventForm";
import { useEventStore } from "@lib/stores/useEventStore";

export default function CreateEventPage(): JSX.Element {
  const router = useRouter();
  const createEvent = useEventStore((s) => s.createEvent);

  const handleSubmit = async (input: EventFormInput): Promise<void> => {
    const created = await createEvent({
      label: input.label,
      content: input.content,
      audience: input.audience,
      disciplineId: input.disciplineId,
      externalDisciplineLabel: input.externalDisciplineLabel,
      originId: input.originId,
      organizerId: input.organizerId,
      publicationDate: input.publicationDate,
    });

    router.push(`/admin/dashboard/events/${created.id}`);
  };

  return (
    <div>
      <Link
        href="/admin/dashboard/events"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un événement</h2>
      <EventForm onSubmit={handleSubmit} submitLabel="Créer" />
    </div>
  );
}