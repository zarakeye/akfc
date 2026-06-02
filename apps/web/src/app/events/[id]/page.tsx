import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";
import { formatHHMM } from "@features/admin/common/components/TimeInput";
import { AddToCalendarLinks } from "@features/calendar/AddToCalendarLinks";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

function formatInstructorName(
  user: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string | null {
  if (!user) return null;
  const fullName = [user.firstName, user.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return fullName || user.pseudo || user.email;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Page publique d'un Event — rend le composite `content` édité au
 * PageBuilder, plus l'en-tête et les sessions.
 *
 * ⚠️ **Garde de publication** : contrairement à Stage (toujours
 * visible), un Event a un cycle brouillon/publié. Cette page refuse
 * (404) les events non publiés — `publicationDate` null ou dans le
 * futur. Le back-office, lui, voit tout via `getAllAdmin`.
 *
 * URL : `/evenements/[id]` (français, sans accent dans le path pour
 * éviter les soucis d'encoding). Si tu préfères `/events`, renomme le
 * dossier — rien d'autre n'en dépend.
 */
export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isFinite(eventId)) notFound();

  // Garde de publication déléguée à la requête : on ne récupère
  // l'event que s'il est publié (publicationDate non null et passée).
  // Reproduit la logique de `event.getAll` côté router, et évite tout
  // appel impur (`Date.now`) pendant le render du Server Component.
  // `findFirst` (et non `findUnique`) car on ajoute une condition
  // non-unique sur publicationDate.
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      publicationDate: { not: null, lte: new Date() },
    },
    include: {
      discipline: { select: { id: true, name: true } },
      origin: {
        select: { id: true, name: true, slug: true, flag: true },
      },
      organizer: {
        select: {
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
      sessions: {
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      },
    },
  });

  if (!event) notFound();

  const content = parsePageContentV1(event.content);
  const organizerName = formatInstructorName(event.organizer);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          Événement • {AUDIENCE_LABELS[event.audience] ?? event.audience}
        </p>
        <h1 className="text-3xl font-bold">{event.label}</h1>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {event.discipline && (
            <div>
              <dt className="font-medium text-muted-foreground">Discipline</dt>
              <dd>{event.discipline.name}</dd>
            </div>
          )}
          {event.externalDisciplineLabel && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Discipline (externe)
              </dt>
              <dd>{event.externalDisciplineLabel}</dd>
            </div>
          )}
          {event.origin && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Origine culturelle
              </dt>
              <dd>
                {event.origin.flag ? `${event.origin.flag} ` : ""}
                {event.origin.name}
              </dd>
            </div>
          )}
          {organizerName && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Organisateur
              </dt>
              <dd>{organizerName}</dd>
            </div>
          )}
        </dl>
      </header>

      {/* ── Contenu ──────────────────────────────────────────────────── */}
      <section className="mb-10">
        <PageRenderer content={content} />
      </section>

      {/* ── Sessions ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dates</h2>
          {event.sessions.length > 0 && (
            <a
              href={`/api/calendar/events/${event.id}`}
              download
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Ajouter à mon agenda
            </a>
          )}
        </div>
        {event.sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Pas encore de dates programmées.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {event.sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium capitalize">
                    {formatDate(session.date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatHHMM(session.beginTime)}–
                    {formatHHMM(session.endTime)}
                    {session.location && ` • ${session.location}`}
                  </p>
                  {session.notes && (
                    <p className="mt-2 text-sm">{session.notes}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <AddToCalendarLinks
                    event={{
                      title: event.label,
                      date: session.date,
                      beginTime: session.beginTime,
                      endTime: session.endTime,
                      location: session.location,
                      description: session.notes,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}