import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;
export function slugForContainer(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Chemin physique du conteneur d'un dépôt commun, pour un utilisateur + un sujet.
 * SOURCE UNIQUE : utilisé par le resolver (à l'upload) ET par setCommonRepositoryLabel
 * (pose du libellé) → jamais de divergence de chemin.
 *
 * Format : `${appRoot}/common_repository/{slug(sujet)}_{personSlug}-{userId}`,
 * ou `depot_{personSlug}-{userId}` si le sujet est vide.
 */
export async function commonRepositoryContainerPath(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
  subject?: string | null;
}): Promise<string> {
  const { prisma, appRoot, userId, subject } = params;
  const person = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, pseudo: true },
  });
  const personName =
    [person?.firstName, person?.lastName].filter(Boolean).join(" ").trim() ||
    person?.pseudo ||
    "";
  const personSlug = slugForContainer(personName) || `user-${userId}`;
  const personSegment = `${personSlug}-${userId}`;
  const subjectSlug = subject ? slugForContainer(subject) : "";
  const segment = subjectSlug
    ? `${subjectSlug}_${personSegment}`
    : `depot_${personSegment}`;
  return `${appRoot}/common_repository/${segment}`;
}
