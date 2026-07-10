import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** Présentation — `/(admin)/dashboard/permissions/[id]`. */
export default async function PermissionPresentationPage({
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

  const roleCount = await prisma.rolePermissions.count({
    where: { permissionId },
  });

  return (
    <PresentationShell
      title={permission.name}
      listHref="/dashboard/permissions"
      editHref={`/dashboard/permissions/${permission.id}/edit`}
    >
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Nom</dt>
          <dd className="font-mono">{permission.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">Assignée à</dt>
          <dd>{roleCount} rôle(s)</dd>
        </div>
      </dl>
    </PresentationShell>
  );
}