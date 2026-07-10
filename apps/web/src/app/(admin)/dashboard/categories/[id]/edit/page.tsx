import { notFound } from "next/navigation";
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@backend/prisma";
import { CategoryForm } from "@features/admin/categories/forms/CategoryForm";

/**
 * Édition d'une catégorie — `/(admin)/dashboard/categories/[id]/edit`.
 * Server Component : on récupère la catégorie via prisma et on la passe en
 * `initial` au form (client). La donnée est sérialisable, donc le passage
 * server → client est direct.
 */
export default async function EditCategoryPage({
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

  return (
    <div>
      <Link
        href={`/dashboard/categories/${categoryId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer la catégorie</h2>

      {/* `initial` présent → mode édition (input caché `id` + update). */}
      <CategoryForm initial={category} />
    </div>
  );
}