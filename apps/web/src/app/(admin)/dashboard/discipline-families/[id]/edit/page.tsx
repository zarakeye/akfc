import { notFound } from "next/navigation";
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@backend/prisma";
import { FamilyForm } from "@features/admin/discipline-families/forms/FamilyForm";

/** Édition — `/(admin)/dashboard/discipline-families/[id]/edit`. */
export default async function EditFamilyPage({
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

  return (
    <div>
      <Link
        href={`/dashboard/discipline-families/${familyId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer la famille</h2>
      <FamilyForm initial={family} />
    </div>
  );
}