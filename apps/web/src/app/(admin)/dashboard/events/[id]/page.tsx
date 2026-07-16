import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

function organizerName(
  u: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string {
  if (!u) return "—";
  const parts = [u.firstName, u.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || u.pseudo || u.email;
}

function statut(publicationDate: Date | null): string {
  if (!publicationDate) return "Brouillon";
  const d = new Date(publicationDate);
  return d > new Date()
    ? `Programmé le ${d.toLocaleDateString("fr-FR")}`
    : `Publié le ${d.toLocaleDateString("fr-FR")}`;
}

/**
 * Présentation admin d'un évènement — `/(admin)/dashboard/events/[id]`.
 */
export default async function EventPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isFinite(eventId)) notFound();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      disciplineLinks: { select: { discipline: { select: { name: true } } } },
      origin: { select: { name: true, flag: true } },
      organizer: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      sessions: { orderBy: { date: "asc" } },
    },
  });
  if (!event) notFound();

  const content = parsePageContentV1(event.content);
  // Toutes les disciplines + tous les labels externes ; à défaut, l'origine.
  const rattachements = [
    ...event.disciplineLinks.map((l) => l.discipline.name),
    ...event.externalDisciplineLabels,
  ];
  const rattachement =
    rattachements.length > 0
      ? rattachements.join(', ')
      :
    event.origin?.name ??
    "—";

  return (
    <PresentationShell
      title={event.label}
      listHref="/dashboard/events"
      editHref={`/dashboard/events/${event.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Statut</dt>
          <dd>{statut(event.publicationDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Public</dt>
          <dd>{AUDIENCE_LABELS[event.audience] ?? event.audience}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Rattachement</dt>
          <dd>{rattachement}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Organisateur</dt>
          <dd>{organizerName(event.organizer)}</dd>
        </div>
        {event.slug && (
          <div>
            <dt className="font-medium text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{event.slug}</dd>
          </div>
        )}
        {event.sessions.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">Séances</dt>
            <dd>
              {event.sessions
                .map((s) => new Date(s.date).toLocaleDateString("fr-FR"))
                .join(" • ")}
            </dd>
          </div>
        )}
      </dl>

      <PageRenderer content={content} />
    </PresentationShell>
  );
}
