import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { audienceFor, DraftBanner, draftAccess, isLive } from "@features/editorial/editorialGate";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { DAY_LABELS, formatTime, formatUserName } from "@lib/format";

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
 * correct. Les images doivent s'afficher, les audio R2
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

  // Un créneau n'est public que si sa discipline l'est : celui d'un brouillon répond 404 (aperçu
  // pour un administrateur), comme la page de la discipline elle-même.
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      discipline: {
        select: {
          name: true,
          publicationDate: true,
          // Instructeur principal : celui du créneau quand le créneau n'en a pas.
          instructor: { select: { firstName: true, lastName: true, pseudo: true } },
        },
      },
      instructor: { select: { firstName: true, lastName: true, pseudo: true } },
    },
  });

  if (!course) notFound();
  const access = await draftAccess(isLive(course.discipline.publicationDate));
  if (!access) notFound();

  const content = parsePageContentV1(course.content);
  // Hiérarchie des instructeurs : `Course.instructorId` null veut dire « celui de la discipline ».
  const instructorName = formatUserName(course.instructor ?? course.discipline.instructor);

  return (
    <article className="akfc-page py-12">
      {access === "preview" && <DraftBanner />}
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">{course.discipline.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {DAY_LABELS[course.day] ?? course.day} •{" "}
          {formatTime(course.beginTime)}–{formatTime(course.endTime)}
          {instructorName && <> • Animé par {instructorName}</>}
        </p>
      </header>

      <PageRenderer content={content} audience={audienceFor(access)} />
    </article>
  );
}
