import type { PrismaClient } from "@prisma/client";

/**
 * Ce qui empêche de supprimer un compte : les rôles que le club lui a confiés.
 *
 * Un instructeur principal de discipline, un animateur principal de stage, un organisateur
 * d'évènement sont des données du CLUB : la base les garde en RESTRICT, et c'est à
 * l'administrateur de désigner quelqu'un d'autre. Le reste de la vie d'un membre sur le site
 * (réactions, votes, commentaires, posts, médias) ne bloque plus rien : voir le schéma.
 *
 * Rend un message lisible (« instructeur de « Tai chi » ; organisateur de « Repas de fin
 * d'année » »), ou `null` si rien ne bloque. Sans lui, la base refuserait la suppression et
 * l'administrateur ne lirait qu'une erreur interne masquée.
 */
export async function clubRolesBlockingDeletion(
  prisma: Pick<PrismaClient, "discipline" | "seminar" | "event">,
  userId: string,
): Promise<string | null> {
  const [disciplines, seminars, events] = await Promise.all([
    prisma.discipline.findMany({ where: { instructorId: userId }, select: { name: true }, take: 3 }),
    prisma.seminar.findMany({ where: { primaryAnimatorId: userId }, select: { label: true }, take: 3 }),
    prisma.event.findMany({ where: { organizerId: userId }, select: { label: true }, take: 3 }),
  ]);
  const quote = (names: string[]) => names.map((n) => `« ${n} »`).join(", ");
  const parts: string[] = [];
  if (disciplines.length) parts.push(`instructeur de ${quote(disciplines.map((d) => d.name))}`);
  if (seminars.length) parts.push(`animateur principal de ${quote(seminars.map((s) => s.label))}`);
  if (events.length) parts.push(`organisateur de ${quote(events.map((e) => e.label))}`);
  if (!parts.length) return null;
  return `Ce membre est encore ${parts.join(" ; ")}. Désignez quelqu'un d'autre avant de supprimer son compte.`;
}
