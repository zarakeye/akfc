import type { PrismaClient } from "@prisma/client";

/**
 * Garantit au démarrage les deux catégories de demandes et le groupe « Support » :
 *   - « gestion » → groupe Administrateurs, réponses vers admin@akfc.fr ;
 *   - « support » → groupe « Support » (créé s'il n'existe pas, rattaché aux
 *     Administrateurs), réponses vers support@akfc.fr.
 * Ne modifie JAMAIS une catégorie existante : libellé, groupe et adresse restent ceux réglés
 * par les administrateurs. Sans groupe Administrateurs (ensureAdminGroup pas encore passé),
 * ne fait rien.
 */
export const TICKET_CATEGORY_DEFAULTS = [
  { key: "gestion", label: "Gestion du club", replyTo: "admin@akfc.fr", position: 0 },
  { key: "support", label: "Support du site", replyTo: "support@akfc.fr", position: 1 },
] as const;

const SUPPORT_GROUP_NAME = "Support";

export async function ensureTicketCategories(
  prisma: PrismaClient,
): Promise<{ created: string[]; supportGroupCreated: boolean }> {
  const admin = await prisma.memberGroup.findFirst({
    where: { isAdminGroup: true },
    select: { id: true },
  });
  if (!admin) return { created: [], supportGroupCreated: false };

  const existing = await prisma.ticketCategory.findMany({ select: { key: true } });
  const have = new Set(existing.map((c) => c.key));
  const created: string[] = [];
  let supportGroupCreated = false;

  for (const def of TICKET_CATEGORY_DEFAULTS) {
    if (have.has(def.key)) continue;
    let groupId = admin.id;
    if (def.key === "support") {
      let support = await prisma.memberGroup.findFirst({
        where: { name: SUPPORT_GROUP_NAME, isAdminGroup: false },
        select: { id: true },
      });
      if (!support) {
        support = await prisma.memberGroup.create({
          data: { name: SUPPORT_GROUP_NAME, isCollaborative: false, parentGroupId: admin.id },
          select: { id: true },
        });
        supportGroupCreated = true;
      }
      groupId = support.id;
    }
    await prisma.ticketCategory.create({ data: { ...def, groupId } });
    created.push(def.key);
  }
  return { created, supportGroupCreated };
}
