import { notFound } from "next/navigation";
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@backend/prisma";
import { PermissionForm } from "@features/admin/permissions/forms/PermissionForm";

/** Édition — `/(admin)/dashboard/permissions/[id]/edit`. */
export default async function EditPermissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const permissionId = Number(id);
  if (!Number.isFinite(permissionId)) notFound();

  const permission = await prisma.permission.findUnique({
    where: { id: permissionId },
  });
  if (!permission) notFound();

  return (
    <div>
      <Link
        href={`/dashboard/permissions/${permissionId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer la permission</h2>
      <PermissionForm initial={permission} />
    </div>
  );
}