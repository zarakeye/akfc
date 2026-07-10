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
