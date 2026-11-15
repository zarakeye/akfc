import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@akfc/backend/prisma.ts";
import { PresentationShell } from "#features/admin/common/components/PresentationShell.tsx";
import { ImageRightsSection } from "#features/admin/users/components/ImageRightsSection.tsx";
import { LegalStatusControl } from "#features/admin/users/legal/LegalStatusControl.tsx";
import { CoursesControl } from "#features/admin/users/courses/CoursesControl.tsx";
import { ADULT_GROUP_WHERE } from "@akfc/backend/modules/memberGroups/systemGroups.service.ts";
import { AUDIENCE_LABELS, DAY_LABELS, formatTime } from "#lib/format/index.ts";

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
      memberGroupMemberships: {
        where: { group: ADULT_GROUP_WHERE },
        select: { group: { select: { name: true } } },
        take: 1,
      },
      coursesAsInstructor: {
        select: { day: true, beginTime: true, endTime: true, audience: true, discipline: { select: { name: true } } },
        orderBy: [{ day: "asc" }, { beginTime: "asc" }],
      },
    },
  });
  if (!user) notFound();
  const taught = user.coursesAsInstructor.map(
    (c) =>
      `${c.discipline.name} — ${DAY_LABELS[c.day] ?? c.day} ${formatTime(c.beginTime)}–${formatTime(c.endTime)} · ${AUDIENCE_LABELS[c.audience] ?? c.audience}`,
  );

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
      {/* La date de naissance ne part jamais vers le navigateur : seulement si elle est renseignée. */}
      <LegalStatusControl
        userId={user.id}
        adultGroupName={user.memberGroupMemberships[0]?.group.name ?? null}
        initial={{
          legalAge: user.legalAge,
          hasBirthDate: user.birthDate !== null,
          guardianName: user.guardianName ?? "",
          guardianRelation: user.guardianRelation ?? "",
          guardianEmail: user.guardianEmail ?? "",
          guardianPhone: user.guardianPhone ?? "",
        }}
      />
      <CoursesControl userId={user.id} taught={taught} />
      <ImageRightsSection
        userId={user.id}
        consent={user.imageConsent}
        recordedAt={user.imageConsentAt ? user.imageConsentAt.toISOString() : null}
      />
    </PresentationShell>
  );
}