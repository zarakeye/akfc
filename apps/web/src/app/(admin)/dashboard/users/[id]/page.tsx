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
      </dl>
    </PresentationShell>
  );
}