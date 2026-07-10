import type { JSX } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";

import { prisma } from "@backend/prisma";
import { formatSessionDate, AUDIENCE_LABELS } from "@lib/format";

/**
 * Page de liste publique des Events — `/events`.
 *
 * Server Component : liste les events PUBLIÉS (publicationDate non null et
 * passée), triés par date de publication décroissante. Chaque carte pointe
 * vers la page de détail `/events/[slug]`.
 */
export default async function PublicEventsListPage(): Promise<JSX.Element> {
  const events = await prisma.event.findMany({
    where: { publicationDate: { not: null, lte: new Date() } },
    orderBy: { publicationDate: "desc" },
    include: {
      discipline: { select: { name: true } },
      origin: { select: { name: true, flag: true } },
      sessions: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-bold">Nos évènements</h1>
        <p className="text-muted-foreground">
          Démonstrations, ateliers et temps forts de la vie du club.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun évènement à venir pour le moment.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map((event) => {
            const rattachement =
              event.discipline?.name ??
              event.externalDisciplineLabel ??
              event.origin?.name ??
              null;
            const nextSession = event.sessions[0];
            return (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="flex h-full flex-col gap-2 rounded-lg border border-border p-5 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold">{event.label}</h2>
                    <PartyPopper className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {AUDIENCE_LABELS[event.audience] ?? event.audience}
                    {rattachement && (
                      <>
                        {" • "}
                        {event.origin?.flag ? `${event.origin.flag} ` : ""}
                        {rattachement}
                      </>
                    )}
                  </p>
                  {nextSession && (
                    <p className="mt-auto text-sm font-medium capitalize">
                      Prochaine session : {formatSessionDate(nextSession.date)}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
