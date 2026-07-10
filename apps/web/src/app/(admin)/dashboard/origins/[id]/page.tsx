import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** Présentation — `/(admin)/dashboard/origins/[id]`. */
export default async function OriginPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const originId = Number(id);
  if (!Number.isFinite(originId)) notFound();

  const origin = await prisma.origin.findUnique({ where: { id: originId } });
  if (!origin) notFound();

  const [disciplineCount, stageCount, eventCount] = await Promise.all([
    prisma.discipline.count({ where: { originId } }),
    prisma.stage.count({ where: { originId } }),
    prisma.event.count({ where: { originId } }),
  ]);

  return (
    <PresentationShell
      title={`${origin.flag ? `${origin.flag} ` : ""}${origin.name}`}
      listHref="/dashboard/origins"
      editHref={`/dashboard/origins/${origin.id}/edit`}
    >
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Nom</dt>
          <dd>{origin.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Slug</dt>
          <dd className="font-mono">{origin.slug}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Pays</dt>
          <dd>{origin.country ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Région</dt>
          <dd>{origin.region ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Période historique</dt>
          <dd>{origin.historicalPeriod ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Ordre</dt>
          <dd>{origin.sortOrder}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-muted-foreground">Description</dt>
          <dd className="whitespace-pre-wrap">{origin.description ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-muted-foreground">Rattachements</dt>
          <dd>
            {disciplineCount} discipline(s), {stageCount} stage(s),{" "}
            {eventCount} événement(s)
          </dd>
        </div>
      </dl>
    </PresentationShell>
  );
}