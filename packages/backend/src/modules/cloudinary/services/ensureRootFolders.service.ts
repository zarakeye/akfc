import type { PrismaClient } from "@prisma/client";

/**
 * ensureRootFolders.service.ts
 *
 * Garantit que les 3 dossiers racines immuables (`pending`, `published`, `bin`)
 * existent dans la table `Folder` pour un `appRoot` donné.
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

export const ROOT_FOLDER_STATUSES = ["bin"] as const;
export type RootFolderStatus = (typeof ROOT_FOLDER_STATUSES)[number];

export async function ensureRootFolders(
  prisma: PrismaClient,
  appRoot: string
): Promise<{ created: number; total: number }> {
  let created = 0;

  for (const status of ROOT_FOLDER_STATUSES) {
    const fullPath = `${appRoot}/${status}`;

    const existing = await prisma.folder.findUnique({
      where: {
        appRoot_fullPath: { appRoot, fullPath },
      },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.folder.create({
      data: {
        appRoot,
        fullPath,
        status,
      },
    });

    created += 1;
  }

  // Libellé humain FIXE du Dépôt commun : le path reste
  // `${appRoot}/common-repository` (racine structurelle), seul l'affichage
  // change (le finder lit FolderLabel[path]). Forcé → auto-cicatrisation.
  await prisma.folderLabel.upsert({
    where: { path: `${appRoot}/common-repository` },
    update: { displayName: "Dépôt commun" },
    create: { path: `${appRoot}/common-repository`, displayName: "Dépôt commun" },
  });

  // Libellé d'affichage de la corbeille (path `bin` inchangé).
  await prisma.folderLabel.upsert({
    where: { path: `${appRoot}/bin` },
    update: { displayName: "Corbeille" },
    create: { path: `${appRoot}/bin`, displayName: "Corbeille" },
  });

  // Libellés FR des autres racines : chemins EN, affichage humain via
  // FolderLabel (forcés → auto-cicatrisation, comme bin/common-repository).
  const ROOT_LABELS: Array<{ segment: string; label: string }> = [
    { segment: "personal-spaces", label: "Espaces personnels" },
    { segment: "collaborative-group-spaces", label: "Espaces de groupes collaboratifs" },
    { segment: "seminars", label: "Stages" },
    { segment: "events", label: "Événements" },
  ];
  for (const { segment, label } of ROOT_LABELS) {
    const path = `${appRoot}/${segment}`;
    await prisma.folderLabel.upsert({
      where: { path },
      update: { displayName: label },
      create: { path, displayName: label },
    });
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
  // Racine structurelle du Dépôt commun : jamais renommable/supprimable
  // (la renommer casserait resolver + query + finder + permissions).
  if (normalized === `${appRoot}/common-repository`) return true;

  for (const status of ROOT_FOLDER_STATUSES) {
    if (normalized === `${appRoot}/${status}`) return true;
  }

  return false;
}