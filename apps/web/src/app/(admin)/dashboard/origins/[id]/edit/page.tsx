import { notFound } from "next/navigation";
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@backend/prisma";
import { OriginForm } from "@features/admin/origins/forms/OriginForm";

/** Édition — `/(admin)/dashboard/origins/[id]/edit`. */
export default async function EditOriginPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const originId = Number(id);
  if (!Number.isFinite(originId)) notFound();

  const origin = await prisma.origin.findUnique({ where: { id: originId } });
  if (!origin) notFound();

  return (
    <div>
      <Link
        href={`/dashboard/origins/${originId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer l&apos;origine</h2>
      <OriginForm initial={origin} />
    </div>
  );
}