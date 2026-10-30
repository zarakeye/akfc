import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";
import { AUDIENCE_LABELS, DAY_LABELS, formatTime, formatUserName } from "@lib/format";

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
      discipline: {
        select: {
          name: true,
          instructor: { select: { firstName: true, lastName: true, pseudo: true } },
        },
      },
      instructor: { select: { firstName: true, lastName: true, pseudo: true } },
    },
  });
  if (!course) notFound();

  const content = parsePageContentV1(course.content);
  // Sans instructeur attitré, le créneau est animé par l'instructeur principal de la discipline.
  const instructorName = formatUserName(course.instructor ?? course.discipline.instructor);

  return (
    <PresentationShell
      title={course.discipline.name}
      listHref="/dashboard/courses"
      editHref={`/dashboard/courses/${course.id}/edit`}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {DAY_LABELS[course.day] ?? course.day} • {formatTime(course.beginTime)}–
        {formatTime(course.endTime)} •{" "}
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

      <PageRenderer content={content} audience="admin" />
    </PresentationShell>
  );
}
