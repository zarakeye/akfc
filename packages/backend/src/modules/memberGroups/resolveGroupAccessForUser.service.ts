import type { PrismaClient } from "@prisma/client";

export type GroupAccessLevel = "NONE" | "VIEWER" | "EDITOR";

/**
 * Accès EFFECTIF d'un utilisateur à l'espace d'un groupe, HÉRITAGE compris.
 *
 * On remonte la chaîne des ancêtres (parentGroupId) depuis le groupe visé et on
 * prend le niveau MAXIMUM parmi l'appartenance directe et celles aux groupes
 * ancêtres (EDITOR > VIEWER > NONE). Un membre d'un groupe parent hérite ainsi
 * de l'accès (même niveau) aux espaces des groupes descendants.
 *
 * NB : ne traite PAS l'admin (les gardes court-circuitent l'admin en amont).
 */
export async function resolveGroupAccessForUser(
  prisma: PrismaClient,
  userId: string,
  groupId: string,
): Promise<GroupAccessLevel> {
  let best: GroupAccessLevel = "NONE";
  let cursor: string | null = groupId;
  const seen = new Set<string>();

  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);

    const membership = await prisma.memberGroupMembership.findUnique({
      where: { groupId_userId: { groupId: cursor, userId } },
      select: { access: true },
    });
    if (membership?.access === "EDITOR") return "EDITOR";
    if (membership?.access === "VIEWER") best = "VIEWER";

    const group: { parentGroupId: string | null } | null =
      await prisma.memberGroup.findUnique({
        where: { id: cursor },
        select: { parentGroupId: true },
      });
    cursor = group?.parentGroupId ?? null;
  }

  return best;
}
