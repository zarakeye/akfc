import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { formatHHMM } from "@lib/time/formatHHMM";
import { AddToCalendarLinks } from "@features/calendar/AddToCalendarLinks";
import {
  formatUserName,
  formatSessionDate,
  AUDIENCE_LABELS,
} from "@lib/format";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Page publique d'un Stage par slug — `/stages/[slug]`.
 *
 * Rend les deux composites (description et program) édités au PageBuilder,
 * plus l'en-tête riche (rattachement, animateurs, prérequis) et la liste
 * des sessions associées.
 *
 * **Garde de publication** : un Stage dont `publicationDate` est `null`
 * (brouillon) ou dans le futur (programmé) n'est pas visible publiquement
 * → `notFound()`. Cohérent avec le filtrage public du router.
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
      discipline: {
        select: { id: true, name: true },
      },
      origin: {
        select: { id: true, name: true, slug: true, flag: true, region: true },
      },
      primaryAnimator: {
        select: {
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
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
      sessions: {
        orderBy: [{ date: "asc" }, { beginTime: "asc" }],
      },
    },
  });

  if (!stage) notFound();

  // Garde de publication : pas visible si brouillon (null) ou programmé (futur).
  if (!stage.publicationDate || stage.publicationDate > new Date()) {
    notFound();
  }

  const description = parsePageContentV1(stage.description);
  const program = parsePageContentV1(stage.program);
  const primaryAnimatorName = formatUserName(stage.primaryAnimator);

  // Co-animateurs = animators[] moins le primaryAnimator
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
          {stage.discipline && (
            <div>
              <dt className="font-medium text-muted-foreground">Discipline</dt>
              <dd>{stage.discipline.name}</dd>
            </div>
          )}
          {stage.externalDisciplineLabel && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Discipline (externe)
              </dt>
              <dd>{stage.externalDisciplineLabel}</dd>
            </div>
          )}
          {stage.origin && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Origine culturelle
              </dt>
              <dd>
                {stage.origin.flag ? `${stage.origin.flag} ` : ""}
                {stage.origin.name}
              </dd>
            </div>
          )}
          {primaryAnimatorName && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Animateur principal
              </dt>
              <dd>{primaryAnimatorName}</dd>
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
          {stage.preRegistered.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="font-medium text-muted-foreground">Prérequis</dt>
              <dd>
                <ul className="list-inside list-disc">
                  {stage.preRegistered.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {/* ── Description ──────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Présentation</h2>
        <PageRenderer content={description} />
      </section>

      {/* ── Programme ────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Programme</h2>
        <PageRenderer content={program} />
      </section>

      {/* ── Sessions ─────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sessions</h2>
          {stage.sessions.length > 0 && (
            <a
              href={`/api/calendar/stages/${stage.id}`}
              download
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Ajouter à mon agenda
            </a>
          )}
        </div>
        {stage.sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Pas encore de sessions programmées.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {stage.sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium capitalize">
                    {formatSessionDate(session.date)}
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
                      title: stage.label,
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
