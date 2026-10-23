import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Résout le dossier RACINE de l'espace d'un groupe COLLABORATIF :
 *
 *   → `${appRoot}/collaborative-group-spaces/${groupSlug}-${groupId}`
 *
 * Un espace n'a qu'UN dossier pour toute sa vie. S'il existe déjà (ligne `Folder` dont le
 * chemin se termine par `-${groupId}`), c'est lui qui est renvoyé, même si le groupe a été
 * renommé depuis : renommer le groupe renomme l'espace par le NOM AFFICHÉ (celui du groupe,
 * partout dans le finder), sans déplacer aucun fichier. Le nom technique du dossier garde
 * le slug d'origine. Le plus ancien gagne si un renommage passé en a créé un second.
 * Un nouveau dossier n'est calculé (slug du nom actuel) que pour un groupe qui n'en a
 * encore jamais eu.
 *
 * Lève si le groupe n'existe pas ou n'est pas collaboratif (une liste de diffusion n'a
 * pas d'espace).
 */
export async function resolveGroupBaseFolder(params: {
  prisma: PrismaClient;
  appRoot: string;
  groupId: string;
}): Promise<string> {
  const { prisma, appRoot, groupId } = params;

  const group = await prisma.memberGroup.findUnique({
    where: { id: groupId },
    select: { name: true, isCollaborative: true },
  });

  if (!group) {
    throw new Error(`Member group not found (id=${groupId})`);
  }
  if (!group.isCollaborative) {
    throw new Error(`Member group ${groupId} is not collaborative (no space)`);
  }

  const container = `${appRoot}/collaborative-group-spaces/`;
  const existing = await prisma.folder.findMany({
    where: { appRoot, fullPath: { startsWith: container, endsWith: `-${groupId}` } },
    orderBy: { createdAt: "asc" },
    select: { fullPath: true },
  });
  // Un espace est un enfant DIRECT du conteneur (pas un sous-dossier homonyme).
  const space = existing.find((f) => !f.fullPath.slice(container.length).includes("/"));
  if (space) return space.fullPath;

  const groupSlug = slug(group.name) || `group-${groupId}`;

  return `${container}${groupSlug}-${groupId}`;
}
