import { notFound } from "next/navigation";
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@backend/prisma";
import { RoleForm } from "@features/admin/roles/forms/RoleForm";

/**
 * Édition — `/(admin)/dashboard/roles/[id]/edit`.
 * On récupère le rôle AVEC ses liaisons de permissions (pour pré-cocher), et
 * on passe les `permissionId` au form.
 */
export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const roleId = Number(id);
  if (!Number.isFinite(roleId)) notFound();

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });
  if (!role) notFound();

  return (
    <div>
      <Link
        href={`/dashboard/roles/${roleId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer le rôle</h2>
      <RoleForm
        initial={role}
        initialPermissionIds={role.permissions.map((rp) => rp.permissionId)}
      />
    </div>
  );
}