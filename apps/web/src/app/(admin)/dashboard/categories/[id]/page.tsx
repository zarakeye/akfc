import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/**
 * Présentation admin d'une catégorie — `/(admin)/dashboard/categories/[id]`.
 * Entité plate : carte des champs + compteur d'usage (utile car la
 * suppression est refusée tant que des entités y sont rattachées).
 */
export default async function CategoryPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isFinite(categoryId)) notFound();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) notFound();

  const [disciplineCount, mediaCount] = await Promise.all([
    prisma.discipline.count({ where: { categoryId } }),
    prisma.mediaAsset.count({ where: { categoryId } }),
  ]);

  return (
    <PresentationShell
      title={category.type}
      listHref="/dashboard/categories"
      editHref={`/dashboard/categories/${category.id}/edit`}
    >
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Type</dt>
          <dd>{category.type}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Utilisée par</dt>
          <dd>
            {disciplineCount} discipline(s), {mediaCount} média(s)
          </dd>
        </div>
      </dl>
    </PresentationShell>
  );
}