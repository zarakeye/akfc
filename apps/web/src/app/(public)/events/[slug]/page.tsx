import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import {
  formatUserName,
  formatTime,
  formatSessionDate,
  AUDIENCE_LABELS,
} from "@lib/format";

/**
 * Page publique d'un Event par slug — `/evenements/[slug]`.
 *
 * Un seul composite (`content`), rendu via `PageRenderer`. Header de
 * métadonnées (rattachement, audience, organisateur) + sessions datées.
 *
 * **Garde de publication** : un Event dont `publicationDate` est `null`
 * (brouillon) ou dans le futur (programmé) n'est pas visible
 * publiquement → `notFound()`. Cohérent avec le filtre du `event.getAll`
 * du router. Le `getBySlug`, lui, ne filtre pas (il peut servir une
 * preview admin), donc le contrôle se fait ici, côté page publique.
 */
export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      discipline: { select: { name: true, slug: true } },
      origin: { select: { name: true, slug: true, flag: true } },
      organizer: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      sessions: { orderBy: { date: "asc" } },
    },
  });

  if (!event) notFound();

  // Garde de publication : pas visible si brouillon ou programmé.
  if (!event.publicationDate || event.publicationDate > new Date()) {
    notFound();
  }

  const content = parsePageContentV1(event.content);
  const organizerName = formatUserName(event.organizer);
  const rattachement =
    event.discipline?.name ??
    event.externalDisciplineLabel ??
    event.origin?.name ??
    null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          Événement • {AUDIENCE_LABELS[event.audience] ?? event.audience}
        </p>
        <h1 className="text-3xl font-bold">{event.label}</h1>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {rattachement && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Rattachement
              </dt>
              <dd>
                {event.origin?.flag ? `${event.origin.flag} ` : ""}
                {rattachement}
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

        {event.sessions.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Dates
            </h2>
            <ul className="flex flex-col gap-1 text-sm">
              {event.sessions.map((s) => (
                <li key={s.id}>
                  <span className="font-medium capitalize">
                    {formatSessionDate(s.date)}
                  </span>{" "}
                  — {formatTime(s.beginTime)}–{formatTime(s.endTime)}
                  {s.location && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {s.location}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <PageRenderer content={content} />
    </article>
  );
}
