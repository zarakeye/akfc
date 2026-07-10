import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** Présentation admin d'un utilisateur — `/(admin)/dashboard/users/[id]` (lecture seule). */
export default async function UserPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  });
  if (!user) notFound();

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.pseudo ||
    user.email;

  return (
    <PresentationShell
      title={displayName}
      listHref="/dashboard/users"
      editHref={`/dashboard/users/${user.id}/edit`}
    >
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
        </div>
        {user.pseudo && (
          <div>
            <dt className="font-medium text-muted-foreground">Pseudo</dt>
            <dd>{user.pseudo}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-muted-foreground">Rôle</dt>
          <dd>{user.role?.name ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-muted-foreground">
            Permissions héritées du rôle
          </dt>
          <dd>
            {user.role?.permissions && user.role.permissions.length > 0 ? (
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {user.role.permissions.map((rp) => (
                  <li
                    key={rp.permission.id}
                    className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs"
                  >
                    {rp.permission.name}
                  </li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </PresentationShell>
  );
}