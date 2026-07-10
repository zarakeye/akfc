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
