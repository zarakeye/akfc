import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";
import { formatHHMM } from "@features/admin/common/components/TimeInput";

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
          {formatHHMM(course.beginTime)}–{formatHHMM(course.endTime)}
          {instructorName && <> • Animé par {instructorName}</>}
        </p>
      </header>

      <PageRenderer content={content} />
    </article>
  );
}