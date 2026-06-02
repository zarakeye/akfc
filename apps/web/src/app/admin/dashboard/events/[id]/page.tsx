"use client";

import { use, useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import type { Event } from "@prisma/client";

import {
  EventForm,
  type EventFormInput,
} from "@features/admin/events/forms/EventForm";
import { useEventStore } from "@lib/stores/useEventStore";
import { useEventSessionStore } from "@lib/stores/useEventSessionStore";
import {
  SessionsManager,
  type SessionDraft,
} from "@features/admin/common/components/SessionsManager";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const eventId = Number(id);

  const fetchEventById = useEventStore((s) => s.fetchEventById);
  const updateEvent = useEventStore((s) => s.updateEvent);
  const deleteEvent = useEventStore((s) => s.deleteEvent);

  const sessions = useEventSessionStore((s) => s.sessions);
  const fetchSessions = useEventSessionStore((s) => s.fetchByEvent);
  const createSession = useEventSessionStore((s) => s.createSession);
  const updateSession = useEventSessionStore((s) => s.updateSession);
  const deleteSession = useEventSessionStore((s) => s.deleteSession);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchEventById(eventId).then((e) => {
      if (!cancelled) {
        setEvent(e);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, fetchEventById]);

  // Charge les sessions de l'event en parallèle.
  useEffect(() => {
    void fetchSessions(eventId);
  }, [eventId, fetchSessions]);

  const handleSubmit = async (input: EventFormInput): Promise<void> => {
    const updated = await updateEvent({
      id: eventId,
      label: input.label,
      content: input.content,
      audience: input.audience,
      disciplineId: input.disciplineId,
      externalDisciplineLabel: input.externalDisciplineLabel,
      originId: input.originId,
      organizerId: input.organizerId,
      publicationDate: input.publicationDate,
    });
    setEvent(updated);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    const confirmed = window.confirm(
      "Supprimer cet événement ? Les sessions associées seront aussi " +
        "supprimées (cascade). Cette action est irréversible.",
    );
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      router.push("/admin/dashboard/events");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  if (!event) {
    return (
      <div>
        <Link
          href="/admin/dashboard/events"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <p className="text-sm">Événement introuvable.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/dashboard/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <Link
          href={`/evenements/${event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Voir la page publique
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Éditer {event.label}</h2>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>

      {deleteError && (
        <pre className="mb-4 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {deleteError}
        </pre>
      )}

      <EventForm
        initial={event}
        onSubmit={handleSubmit}
        submitLabel="Mettre à jour"
      />

      <SessionsManager
        sessions={sessions}
        onCreate={async (draft: SessionDraft) => {
          await createSession({ eventId, ...draft });
        }}
        onUpdate={async (id: number, draft: SessionDraft) => {
          await updateSession({ id, ...draft });
        }}
        onDelete={(id: number) => deleteSession(id)}
      />
    </div>
  );
}