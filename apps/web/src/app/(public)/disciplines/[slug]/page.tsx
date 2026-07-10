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
 * Page publique d'un Stage par slug — `/stages/[slug]`.
 *
 * Le Stage porte **deux composites** (`description` et `program`), rendus
 * via deux `PageRenderer`. Header de métadonnées (rattachement, audience,
 * animateurs) + liste des sessions datées.
 */
export default async function PublicStagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  const stage = await prisma.stage.findUnique({
    where: { slug },
    include: {
      discipline: { select: { name: true, slug: true } },
      origin: { select: { name: true, slug: true, flag: true } },
      primaryAnimator: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      animators: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
      sessions: { orderBy: { date: "asc" } },
    },
  });

  if (!stage) notFound();

  const description = parsePageContentV1(stage.description);
  const program = parsePageContentV1(stage.program);

  const primaryName = formatUserName(stage.primaryAnimator);
  const rattachement =
    stage.discipline?.name ??
    stage.externalDisciplineLabel ??
    stage.origin?.name ??
    null;

  // Co-animateurs = animators sans le principal.
  const coAnimators = stage.animators
    .filter((a) => a.id !== stage.primaryAnimatorId)
    .map((a) => formatUserName(a))
    .filter((n): n is string => Boolean(n));

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          Stage • {AUDIENCE_LABELS[stage.audience] ?? stage.audience}
        </p>
        <h1 className="text-3xl font-bold">{stage.label}</h1>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {rattachement && (
            <div>
              <dt className="font-medium text-muted-foreground">Discipline</dt>
              <dd>
                {stage.origin?.flag ? `${stage.origin.flag} ` : ""}
                {rattachement}
              </dd>
            </div>
          )}
          {primaryName && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Animateur principal
              </dt>
              <dd>{primaryName}</dd>
            </div>
          )}
          {coAnimators.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">
                Co-animateurs
              </dt>
              <dd>{coAnimators.join(", ")}</dd>
            </div>
          )}
        </dl>

        {stage.sessions.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              Dates
            </h2>
            <ul className="flex flex-col gap-1 text-sm">
              {stage.sessions.map((s) => (
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

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Présentation</h2>
        <PageRenderer content={description} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Programme</h2>
        <PageRenderer content={program} />
      </section>
    </article>
  );
}
