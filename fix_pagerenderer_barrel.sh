#!/bin/bash
# Fix "PageRenderer is an async Client Component" + "suspended by an uncached
# promise". Cause racine : PageRenderer (RSC async, importe prisma) etait
# importe depuis le BARIL @features/page-builder/index.ts, qui reexporte
# AUSSI des modules client (PageBuilder, usePageBuilderContext...). Tout
# consommateur tirait le baril mixte -> PageRenderer classe du mauvais cote
# de la frontiere serveur/client. Fix : importer PageRenderer DIRECTEMENT
# depuis son fichier (pas le baril). + Suspense autour du PageRenderer async
# dans PostCard (rendu dans l arbre du client ExpandableContent).
# À lancer depuis la RACINE du monorepo : bash fix_pagerenderer_barrel.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/social/PostCard.tsx"
cat > 'apps/web/src/features/social/PostCard.tsx' << 'FILE_EOF'
import { Suspense, type JSX } from "react";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import type { GroupedReaction } from "@backend/modules/reactions/router";

import {
  UserPortrait,
  formatUserName,
  type DisplayUser,
} from "@features/social/userDisplay";
import { ExpandableContent } from "@features/social/ExpandableContent";
import { PollWidget } from "@features/social/PollWidget";
import { PostInteractions } from "@features/social/PostInteractions";

/**
 * Carte d'un post sur le mur de la home — Server Component.
 *
 * Le contenu composite (PageBuilder) est rendu INTÉGRALEMENT côté
 * serveur par `PageRenderer` (RSC async), puis clampé visuellement par
 * l'îlot client `ExpandableContent` (pattern RSC-dans-children-de-client) :
 * « Voir → » ne déclenche ni fetch ni re-render serveur.
 *
 * Le mur est l'unique lieu de vie public du post (l'ancienne page
 * `/actualites/[id]` a été supprimée) ; l'ancre `post-<id>` sert de
 * cible au lien de prévisualisation de l'admin.
 */

interface PostCardProps {
  post: {
    id: number;
    title: string;
    publicationDate: Date | null;
    content: unknown;
    author: DisplayUser | null;
    poll: { id: number } | null;
  };
  reactions: GroupedReaction[];
  commentCount: number;
}

function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
}

export function PostCard({
  post,
  reactions,
  commentCount,
}: PostCardProps): JSX.Element {
  const content = parsePageContentV1(post.content);

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <header className="mb-4 flex items-center gap-3">
        {post.author && <UserPortrait user={post.author} size="md" />}
        <div className="min-w-0">
          {post.author && (
            <p className="text-sm font-medium">{formatUserName(post.author)}</p>
          )}
          {post.publicationDate && (
            <time className="text-xs text-gray-500">
              {formatPostDate(post.publicationDate)}
            </time>
          )}
        </div>
      </header>

      <h3 className="mb-3 text-lg font-semibold">{post.title}</h3>

      <ExpandableContent>
        <Suspense
          fallback={<div className="h-24 animate-pulse rounded bg-gray-100" />}
        >
          <PageRenderer content={content} />
        </Suspense>
      </ExpandableContent>

      {/* Hors du clamp : un appel à voter ne se cache pas derrière « Voir → ». */}
      {post.poll && (
        <div className="mt-4">
          <PollWidget postId={post.id} />
        </div>
      )}

      <PostInteractions
        postId={post.id}
        initialReactions={reactions}
        initialCommentCount={commentCount}
      />
    </article>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/disciplines/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/disciplines/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

const TYPE_LABELS: Record<string, string> = {
  MARTIAL_ART: "Art martial",
  CALLIGRAPHY: "Calligraphie",
};

function formatInstructorName(
  instructor: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string | null {
  if (!instructor) return null;
  const parts = [instructor.firstName, instructor.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || instructor.pseudo || instructor.email;
}

/**
 * Présentation admin d'une discipline — `/(admin)/dashboard/disciplines/[id]`.
 *
 * Server Component : charge la discipline, affiche ses métadonnées + le rendu
 * de sa `description` (PageRenderer), le tout dans `PresentationShell` qui
 * fournit le retour à la liste et le bouton « Éditer » → `[id]/edit`.
 */
export default async function DisciplinePresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const disciplineId = Number(id);
  if (!Number.isFinite(disciplineId)) notFound();

  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
    include: {
      category: { select: { type: true } },
      instructor: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      origin: { select: { name: true, flag: true, region: true } },
      family: { select: { name: true } },
    },
  });
  if (!discipline) notFound();

  const description = parsePageContentV1(discipline.description);
  const instructorName = formatInstructorName(discipline.instructor);

  return (
    <PresentationShell
      title={discipline.name}
      listHref="/dashboard/disciplines"
      editHref={`/dashboard/disciplines/${discipline.id}/edit`}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {TYPE_LABELS[discipline.type] ?? discipline.type} •{" "}
        {discipline.category.type}
      </p>

      <dl className="mb-8 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        {discipline.slug && (
          <div>
            <dt className="font-medium text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{discipline.slug}</dd>
          </div>
        )}
        {discipline.family && (
          <div>
            <dt className="font-medium text-muted-foreground">Famille</dt>
            <dd>{discipline.family.name}</dd>
          </div>
        )}
        {discipline.school && (
          <div>
            <dt className="font-medium text-muted-foreground">École</dt>
            <dd>{discipline.school}</dd>
          </div>
        )}
        {discipline.classification && (
          <div>
            <dt className="font-medium text-muted-foreground">Classification</dt>
            <dd>{discipline.classification}</dd>
          </div>
        )}
        {discipline.origin && (
          <div>
            <dt className="font-medium text-muted-foreground">Origine</dt>
            <dd>
              {discipline.origin.flag ? `${discipline.origin.flag} ` : ""}
              {discipline.origin.name}
            </dd>
          </div>
        )}
        {instructorName && (
          <div>
            <dt className="font-medium text-muted-foreground">Instructeur</dt>
            <dd>{instructorName}</dd>
          </div>
        )}
      </dl>

      <PageRenderer content={description} />
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/stages/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/stages/[id]/page.tsx' << 'FILE_EOF'
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

function animatorName(a: {
  firstName: string | null;
  lastName: string | null;
}): string {
  return [a.firstName, a.lastName].filter(Boolean).join(" ").trim() || "—";
}

/**
 * Présentation admin d'un stage — `/(admin)/dashboard/stages/[id]`.
 * Deux composites (description + programme) → deux PageRenderer.
 */
export default async function StagePresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const stageId = Number(id);
  if (!Number.isFinite(stageId)) notFound();

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      discipline: { select: { name: true } },
      origin: { select: { name: true, flag: true } },
      animators: { select: { id: true, firstName: true, lastName: true } },
      sessions: { orderBy: { date: "asc" } },
    },
  });
  if (!stage) notFound();

  const description = parsePageContentV1(stage.description);
  const program = parsePageContentV1(stage.program);
  const rattachement =
    stage.discipline?.name ??
    stage.externalDisciplineLabel ??
    stage.origin?.name ??
    "—";

  return (
    <PresentationShell
      title={stage.label}
      listHref="/dashboard/stages"
      editHref={`/dashboard/stages/${stage.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Rattachement</dt>
          <dd>{rattachement}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Public</dt>
          <dd>{AUDIENCE_LABELS[stage.audience] ?? stage.audience}</dd>
        </div>
        {stage.slug && (
          <div>
            <dt className="font-medium text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{stage.slug}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-muted-foreground">Animateurs</dt>
          <dd>
            {stage.animators
              .map(
                (a) =>
                  animatorName(a) +
                  (a.id === stage.primaryAnimatorId ? " (principal)" : ""),
              )
              .join(", ") || "—"}
          </dd>
        </div>
        {stage.sessions.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="font-medium text-muted-foreground">Séances</dt>
            <dd>
              {stage.sessions
                .map((s) => new Date(s.date).toLocaleDateString("fr-FR"))
                .join(" • ")}
            </dd>
          </div>
        )}
      </dl>

      <section className="mb-8">
        <h3 className="mb-2 text-lg font-semibold">Présentation</h3>
        <PageRenderer content={description} />
      </section>

      <section>
        <h3 className="mb-2 text-lg font-semibold">Programme</h3>
        <PageRenderer content={program} />
      </section>
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/posts/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/posts/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** null → Brouillon, future → Programmé, passée → Publié. */
function statut(publicationDate: Date | null): string {
  if (!publicationDate) return "Brouillon";
  return publicationDate > new Date()
    ? `Programmé le ${publicationDate.toLocaleDateString("fr-FR")}`
    : `Publié le ${publicationDate.toLocaleDateString("fr-FR")}`;
}

/**
 * Présentation admin d'un article — `/(admin)/dashboard/posts/[id]` (lecture seule).
 *
 * Server Component en Prisma direct (pattern des fiches stages/disciplines/
 * users) : `PageRenderer` est un RSC async, inrendable depuis un Client
 * Component — l'ancienne version client (React Query) crashait pour cette
 * raison. Contrepartie assumée : la fiche est fraîche au chargement de la
 * page, plus par le cache React Query (une navigation retour depuis /edit
 * refetch côté serveur, ce qui revient au même).
 *
 * La garde d'accès est portée par le proxy (matcher /dashboard) — comme
 * pour les autres fiches RSC de l'admin.
 */
export default async function PostPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) notFound();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) notFound();

  const content = parsePageContentV1(post.content);

  return (
    <PresentationShell
      title={post.title}
      listHref="/dashboard/posts"
      editHref={`/dashboard/posts/${post.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Statut</dt>
          <dd>{statut(post.publicationDate)}</dd>
        </div>
      </dl>

      <PageRenderer content={content} />
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/events/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/events/[id]/page.tsx' << 'FILE_EOF'
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
      discipline: { select: { name: true } },
      origin: { select: { name: true, flag: true } },
      organizer: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
      sessions: { orderBy: { date: "asc" } },
    },
  });
  if (!event) notFound();

  const content = parsePageContentV1(event.content);
  const rattachement =
    event.discipline?.name ??
    event.externalDisciplineLabel ??
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
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/courses/[id]/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/courses/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

/** HHMM (1830) → "18h30". Fonction pure inline — évite le `formatHHMM` du
 *  module `'use client'` TimeInput, inappelable depuis un Server Component. */
const fmtHHMM = (t: number): string =>
  `${Math.floor(t / 100)}h${String(t % 100).padStart(2, "0")}`;

function formatInstructorName(
  instructor: {
    firstName: string | null;
    lastName: string | null;
    pseudo: string | null;
    email: string;
  } | null,
): string | null {
  if (!instructor) return null;
  const parts = [instructor.firstName, instructor.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || instructor.pseudo || instructor.email;
}

/**
 * Présentation admin d'un cours — `/(admin)/dashboard/courses/[id]`.
 */
export default async function CoursePresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      discipline: { select: { name: true } },
      instructor: {
        select: { firstName: true, lastName: true, pseudo: true, email: true },
      },
    },
  });
  if (!course) notFound();

  const content = parsePageContentV1(course.content);
  const instructorName = formatInstructorName(course.instructor);

  return (
    <PresentationShell
      title={course.discipline.name}
      listHref="/dashboard/courses"
      editHref={`/dashboard/courses/${course.id}/edit`}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {DAY_LABELS[course.day] ?? course.day} • {fmtHHMM(course.beginTime)}–
        {fmtHHMM(course.endTime)} •{" "}
        {AUDIENCE_LABELS[course.audience] ?? course.audience}
        {instructorName && <> • Animé par {instructorName}</>}
      </p>

      {course.requisites.length > 0 && (
        <div className="mb-8 border-b border-border pb-6">
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
            Prérequis
          </h3>
          <ul className="list-disc pl-5 text-sm">
            {course.requisites.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <PageRenderer content={content} />
    </PresentationShell>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/disciplines/[slug]/page.tsx"
cat > 'apps/web/src/app/(public)/disciplines/[slug]/page.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> apps/web/src/app/(public)/stages/[slug]/page.tsx"
cat > 'apps/web/src/app/(public)/stages/[slug]/page.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> apps/web/src/app/(public)/events/[slug]/page.tsx"
cat > 'apps/web/src/app/(public)/events/[slug]/page.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> apps/web/src/app/(public)/course/[id]/page.tsx"
cat > 'apps/web/src/app/(public)/course/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};

function formatTime(hhmm: number): string {
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function formatInstructorName(
  instructor: { firstName: string | null; lastName: string | null; pseudo: string | null; email: string } | null,
): string | null {
  if (!instructor) return null;
  const parts = [instructor.firstName, instructor.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return parts || instructor.pseudo || instructor.email;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Page publique d'un Course — rend le composite édité dans l'admin.
 *
 * Server Component asynchrone : charge le Course depuis Prisma avec
 * jointure sur Discipline et Instructor, valide le `content` via
 * `parsePageContentV1` (fallback sur empty si invalide), et passe au
 * `PageRenderer` qui orchestre la résolution batch des mediaIds.
 *
 * Pour le smoke test : c'est ici que tu vois si le rendu final est
 * correct. Les images Cloudinary doivent s'afficher, les audio R2
 * doivent jouer (route publique sous-chantier 6c), les documents R2
 * doivent télécharger, et le texte enrichi avec ses inline images doit
 * être présent.
 */
export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId)) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      discipline: { select: { name: true } },
      instructor: {
        select: {
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
    },
  });

  if (!course) notFound();

  const content = parsePageContentV1(course.content);
  const instructorName = formatInstructorName(course.instructor);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">{course.discipline.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {DAY_LABELS[course.day] ?? course.day} •{" "}
          {formatTime(course.beginTime)}–{formatTime(course.endTime)}
          {instructorName && <> • Animé par {instructorName}</>}
        </p>
      </header>

      <PageRenderer content={content} />
    </article>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck