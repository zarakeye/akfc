import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** Présentation — `/(admin)/dashboard/discipline-families/[id]`. */
export default async function FamilyPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const familyId = Number(id);
  if (!Number.isFinite(familyId)) notFound();

  const family = await prisma.disciplineFamily.findUnique({
    where: { id: familyId },
  });
  if (!family) notFound();

  const disciplineCount = await prisma.discipline.count({
    where: { familyId },
  });

  return (
    <PresentationShell
      title={family.name}
      listHref="/dashboard/discipline-families"
      editHref={`/dashboard/discipline-families/${family.id}/edit`}
    >
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Nom</dt>
          <dd>{family.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Slug</dt>
          <dd className="font-mono">{family.slug}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Ordre</dt>
          <dd>{family.sortOrder}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Disciplines rattachées</dt>
          <dd>{disciplineCount}</dd>
        </div>
      </dl>
    </PresentationShell>
  );
}