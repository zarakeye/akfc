import type { PrismaClient } from "@prisma/client";

type Access = "VIEWER" | "EDITOR";

/**
 * Espaces collaboratifs accessibles à un membre, HÉRITAGE compris : ses groupes
 * d'appartenance PLUS tous leurs descendants (parcours vers le bas via la
 * hiérarchie), avec le niveau d'accès propagé (max si plusieurs chemins ;
 * EDITOR > VIEWER). Ne renvoie que les groupes COLLABORATIFS.
 *
 * Symétrique de `resolveGroupAccessForUser` (qui remonte les ancêtres pour les
 * gardes) : ici on descend, pour LISTER ce que le membre peut voir.
 */
export async function collaborativeEntriesForMember(
  prisma: PrismaClient,
  userId: string,
): Promise<{ groupId: string; name: string; access: Access }[]> {
  const [allGroups, memberships] = await Promise.all([
    prisma.memberGroup.findMany({
      select: {
        id: true,
        name: true,
        isCollaborative: true,
        parentGroupId: true,
      },
    }),
    prisma.memberGroupMembership.findMany({
      where: { userId },
      select: { groupId: true, access: true },
    }),
  ]);

  const childrenOf = new Map<string, string[]>();
  for (const g of allGroups) {
    if (g.parentGroupId) {
      const arr = childrenOf.get(g.parentGroupId) ?? [];
      arr.push(g.id);
      childrenOf.set(g.parentGroupId, arr);
    }
  }
  const byId = new Map(allGroups.map((g) => [g.id, g]));

  // Parcours vers le bas depuis les groupes d'appartenance ; niveau propagé
  // (max). L'arbre garantit la terminaison ; on ne re-propage qu'à la hausse.
  const effective = new Map<string, Access>();
  const queue: { id: string; access: Access }[] = memberships.map((m) => ({
    id: m.groupId,
    access: m.access,
  }));
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const prev = effective.get(item.id);
    const level: Access =
      item.access === "EDITOR" || prev === "EDITOR" ? "EDITOR" : "VIEWER";
    if (prev === level) continue;
    effective.set(item.id, level);
    for (const childId of childrenOf.get(item.id) ?? []) {
      queue.push({ id: childId, access: level });
    }
  }

  const entries: { groupId: string; name: string; access: Access }[] = [];
  for (const [id, access] of effective) {
    const g = byId.get(id);
    if (!g || !g.isCollaborative) continue;
    entries.push({ groupId: id, name: g.name, access });
  }
  return entries;
}
