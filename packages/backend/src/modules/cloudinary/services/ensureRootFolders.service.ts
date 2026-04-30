import type { PrismaClient } from "@prisma/client";

/**
 * ensureRootFolders.service.ts
 *
 * Garantit que les 3 dossiers racines immuables (`pending`, `published`, `bin`)
 * existent dans la table `CloudinaryFolder` pour un `appRoot` donné.
 *
 * Ces dossiers sont persistés en DB pour que le Finder les affiche dès le
 * premier rendu, indépendamment de toute présence d'asset sur Cloudinary.
 * Leur immutabilité (ils ne peuvent être ni renommés ni supprimés) est
 * garantie par la garde `assertRootFolder` côté router Cloudinary.
 *
 * Conçu pour être appelé :
 *   - au boot de l'app via `instrumentation.ts` (auto-cicatrisation)
 *   - au seed via `prisma db seed`
 *
 * Idempotent : basé sur un upsert par la clé unique `(appRoot, fullPath)`.
 */

export const ROOT_FOLDER_STATUSES = ["pending", "published", "bin"] as const;
export type RootFolderStatus = (typeof ROOT_FOLDER_STATUSES)[number];

export async function ensureRootFolders(
  prisma: PrismaClient,
  appRoot: string
): Promise<{ created: number; total: number }> {
  let created = 0;

  for (const status of ROOT_FOLDER_STATUSES) {
    const fullPath = `${appRoot}/${status}`;

    const existing = await prisma.cloudinaryFolder.findUnique({
      where: {
        appRoot_fullPath: { appRoot, fullPath },
      },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.cloudinaryFolder.create({
      data: {
        appRoot,
        fullPath,
        status,
      },
    });

    created += 1;
  }

  return { created, total: ROOT_FOLDER_STATUSES.length };
}

/**
 * Teste si un `fullPath` désigne un dossier racine immuable pour `appRoot`.
 *
 * Retourne true pour `<appRoot>/pending`, `<appRoot>/published`, `<appRoot>/bin`
 * et pour la racine du projet `<appRoot>` elle-même.
 *
 * Utilisé par la garde `assertRootFolder` dans le router Cloudinary.
 */
export function isRootFolder(appRoot: string, fullPath: string): boolean {
  const normalized = fullPath.replace(/^\/+|\/+$/g, "");

  if (normalized === appRoot) return true;

  for (const status of ROOT_FOLDER_STATUSES) {
    if (normalized === `${appRoot}/${status}`) return true;
  }

  return false;
}