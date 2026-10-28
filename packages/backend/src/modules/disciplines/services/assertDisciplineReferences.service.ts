import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

/**
 * Les références d'une discipline (catégorie, instructeur, famille, origine) existent-elles ?
 *
 * Partagé par `discipline.create` et `discipline.update`. Une référence absente (`undefined`) n'est
 * pas vérifiée : elle ne change pas. `null` (famille, origine) signifie « détacher » : rien à
 * vérifier non plus. Sans ce contrôle, la base refuserait l'écriture avec une erreur de clé
 * étrangère, incompréhensible pour l'administrateur ; ici, chaque référence manquante a son message.
 */
export async function assertDisciplineReferences(
  prisma: PrismaClient,
  refs: {
    categoryId?: number;
    instructorId?: string;
    familyId?: number | null;
    originId?: number | null;
  },
): Promise<void> {
  if (refs.categoryId !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: refs.categoryId }, select: { id: true } });
    if (!category) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Catégorie introuvable (id=${refs.categoryId}).` });
    }
  }

  if (refs.instructorId !== undefined) {
    const instructor = await prisma.user.findUnique({ where: { id: refs.instructorId }, select: { id: true } });
    if (!instructor) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Instructeur introuvable (id=${refs.instructorId}).` });
    }
  }

  if (refs.familyId !== undefined && refs.familyId !== null) {
    const family = await prisma.disciplineFamily.findUnique({ where: { id: refs.familyId }, select: { id: true } });
    if (!family) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Famille de disciplines introuvable (id=${refs.familyId}).` });
    }
  }

  if (refs.originId !== undefined && refs.originId !== null) {
    const origin = await prisma.origin.findUnique({ where: { id: refs.originId }, select: { id: true } });
    if (!origin) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Origine introuvable (id=${refs.originId}).` });
    }
  }
}
