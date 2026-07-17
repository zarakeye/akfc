import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Résout le dossier RACINE de l'espace perso d'un admin, SANS sous-dossier de
 * média — partagé entre providers. Chaque zone média s'y accroche :
 *   - photos (Cloudinary)          → `${base}/photos`
 *   - documents / audio (R2, plus tard) → `${base}/documents`, `${base}/audio`
 *
 * Dérivé de `userId` (identité AUTHENTIFIÉE, jamais un id fourni par le
 * client) → un admin n'accède qu'à son propre espace. Le segment `-${userId}`
 * assure l'unicité et reste STABLE même si le nom (donc le slug) change.
 *
 * Cette extraction évite la divergence de slug entre Cloudinary et R2 : les
 * deux passeront par ce même résolveur.
 */
export async function resolvePersoBaseFolder(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<string> {
  const { prisma, appRoot, userId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, pseudo: true },
  });

  if (!user) {
    throw new Error(`Acting user not found (id=${userId})`);
  }

  const fullName = [user.firstName, user.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ");

  const personSlug =
    slug(fullName) || slug(user.pseudo ?? "") || `user-${userId}`;

  return `${appRoot}/persos/${personSlug}-${userId}`;
}
