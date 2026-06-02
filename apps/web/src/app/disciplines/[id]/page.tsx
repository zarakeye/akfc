import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────────────── */
/*  Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Page publique d'une Discipline — rend le composite `description`
 * édité au PageBuilder.
 *
 * Server Component asynchrone : charge la discipline avec jointures sur
 * `category`, `instructor` et `origin`, valide la description via
 * `parsePageContentV1` (fallback empty si invalide), passe au
 * `PageRenderer`.
 *
 * URL : `/disciplines/[id]` (id numérique). Pas de slug pour
 * l'instant — le modèle Discipline n'a pas de champ slug en v1. Si tu
 * veux un jour des URLs propres `/disciplines/karate-shotokan`,
 * c'est une migration à faire (ajout d'un slug `@unique` sur Discipline).
 */
export default async function PublicDisciplinePage({
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
        select: {
          firstName: true,
          lastName: true,
          pseudo: true,
          email: true,
        },
      },
      origin: {
        select: {
          id: true,
          name: true,
          slug: true,
          flag: true,
          country: true,
          region: true,
        },
      },
    },
  });

  if (!discipline) notFound();

  const description = parsePageContentV1(discipline.description);
  const instructorName = formatInstructorName(discipline.instructor);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-2 text-sm text-muted-foreground">
          {TYPE_LABELS[discipline.type] ?? discipline.type} •{" "}
          {discipline.category.type}
        </p>
        <h1 className="text-3xl font-bold">{discipline.name}</h1>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {discipline.school && (
            <div>
              <dt className="font-medium text-muted-foreground">École</dt>
              <dd>{discipline.school}</dd>
            </div>
          )}
          {discipline.family && (
            <div>
              <dt className="font-medium text-muted-foreground">Famille</dt>
              <dd>{discipline.family}</dd>
            </div>
          )}
          {discipline.classification && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Classification
              </dt>
              <dd>{discipline.classification}</dd>
            </div>
          )}
          {discipline.origin && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Origine culturelle
              </dt>
              <dd>
                {discipline.origin.flag ? `${discipline.origin.flag} ` : ""}
                {discipline.origin.name}
                {discipline.origin.region &&
                  discipline.origin.region !== discipline.origin.name && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({discipline.origin.region})
                    </span>
                  )}
              </dd>
            </div>
          )}
          {instructorName && (
            <div>
              <dt className="font-medium text-muted-foreground">
                Instructeur principal
              </dt>
              <dd>{instructorName}</dd>
            </div>
          )}
        </dl>
      </header>

      <PageRenderer content={description} />
    </article>
  );
}