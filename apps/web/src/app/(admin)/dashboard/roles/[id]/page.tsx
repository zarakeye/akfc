import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** Présentation — `/(admin)/dashboard/roles/[id]`. */
export default async function RolePresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const roleId = Number(id);
  if (!Number.isFinite(roleId)) notFound();

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: { include: { permission: true } } },
  });
  if (!role) notFound();

  return (
    <PresentationShell
      title={role.name}
      listHref="/dashboard/roles"
      editHref={`/dashboard/roles/${role.id}/edit`}
    >
      <dl className="grid grid-cols-1 gap-3 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">Nom</dt>
          <dd>{role.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">
            Permissions ({role.permissions.length})
          </dt>
          <dd>
            {role.permissions.length === 0 ? (
              "—"
            ) : (
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {role.permissions.map((rp) => (
                  <li
                    key={rp.permissionId}
                    className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs"
                  >
                    {rp.permission.name}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>
    </PresentationShell>
  );
}