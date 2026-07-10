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
