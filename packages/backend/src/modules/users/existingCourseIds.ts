import { TRPCError } from "@trpc/server";

/** Les créneaux demandés, sans doublon, après vérification qu'ils existent tous. */
export async function existingCourseIds(
  prisma: { course: { count: (args: { where: { id: { in: number[] } } }) => Promise<number> } },
  requested: number[],
): Promise<number[]> {
  const ids = [...new Set(requested)];
  if (ids.length === 0) return ids;
  const found = await prisma.course.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Créneau inconnu : rechargez la page." });
  }
  return ids;
}
