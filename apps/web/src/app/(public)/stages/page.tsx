import type { JSX } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

import { prisma } from "@backend/prisma";
import { formatSessionDate, AUDIENCE_LABELS } from "@lib/format";

/**
 * Page de liste publique des Stages — `/stages`.
 *
 * Server Component : liste les stages PUBLIÉS (publicationDate non null et
 * passée), triés par date de publication décroissante. Chaque carte pointe
 * vers la page de détail `/stages/[slug]`.
 */
export default async function PublicStagesListPage(): Promise<JSX.Element> {
  const stages = await prisma.stage.findMany({
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
    <div className="akfc-page py-12">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-bold">Nos stages</h1>
        <p className="text-muted-foreground">
          Sessions intensives et rencontres ponctuelles proposées par le club.
        </p>
      </header>

      {stages.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun stage à venir pour le moment.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stages.map((stage) => {
            const rattachement =
              stage.discipline?.name ??
              stage.externalDisciplineLabel ??
              stage.origin?.name ??
              null;
            const nextSession = stage.sessions[0];
            return (
              <li key={stage.id}>
                <Link
                  href={`/stages/${stage.slug}`}
                  className="flex h-full flex-col gap-2 rounded-lg border border-border p-5 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold">{stage.label}</h2>
                    <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {AUDIENCE_LABELS[stage.audience] ?? stage.audience}
                    {rattachement && (
                      <>
                        {" • "}
                        {stage.origin?.flag ? `${stage.origin.flag} ` : ""}
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
