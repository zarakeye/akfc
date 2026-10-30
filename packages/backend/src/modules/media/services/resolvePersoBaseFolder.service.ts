import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Résout le dossier RACINE de l'espace perso d'un admin, SANS sous-dossier de
 * média — partagé entre providers. Chaque zone média s'y accroche :
 *   - photos                       → `${base}/photos`
 *   - documents / audio (plus tard) → `${base}/documents`, `${base}/audio`
 *
 * Dérivé de `userId` (identité AUTHENTIFIÉE, jamais un id fourni par le
 * client) → un membre n'accède qu'à son propre espace. Le suffixe `-${userId}`
 * assure l'unicité ; le slug du nom, lui, n'est calculé qu'à la CRÉATION de
 * l'espace. Un espace existant (dossier ou fichier déjà rangé sous
 * `personal-space/<…>-${userId}`) est réutilisé tel quel : changer de prénom
 * ne doit ni ouvrir un second espace vide, ni masquer les photos déjà là.
 *
 * Toutes les zones passent par ce même résolveur : un seul slug.
 */
export async function resolvePersoBaseFolder(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<string> {
  const { prisma, appRoot, userId } = params;
  const container = `${appRoot}/personal-space/`;

  // Espace déjà ouvert : son segment est l'enfant DIRECT du conteneur qui finit par `-${userId}`.
  const spaceOf = (fullPath: string): string | null => {
    const segment = fullPath.slice(container.length).split("/")[0];
    return segment.endsWith(`-${userId}`) ? `${container}${segment}` : null;
  };
  const folder = await prisma.folder.findFirst({
    where: { appRoot, fullPath: { startsWith: container, endsWith: `-${userId}` } },
    orderBy: { createdAt: "asc" },
    select: { fullPath: true },
  });
  const fromFolder = folder && !folder.fullPath.slice(container.length).includes("/") ? spaceOf(folder.fullPath) : null;
  if (fromFolder) return fromFolder;
  const asset = await prisma.mediaAsset.findFirst({
    where: { appRoot, fullPath: { startsWith: container, contains: `-${userId}/` } },
    orderBy: { createdAt: "asc" },
    select: { fullPath: true },
  });
  const fromAsset = asset ? spaceOf(asset.fullPath) : null;
  if (fromAsset) return fromAsset;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, pseudo: true },
  });

  if (!user) {
    throw new Error(`Membre introuvable (id=${userId})`);
  }

  const fullName = [user.firstName, user.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ");

  const personSlug =
    slug(fullName) || slug(user.pseudo ?? "") || `user-${userId}`;

  return `${container}${personSlug}-${userId}`;
}
