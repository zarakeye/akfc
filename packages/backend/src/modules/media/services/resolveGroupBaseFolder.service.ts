import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Résout le dossier RACINE de l'espace d'un groupe COLLABORATIF, SANS
 * sous-dossier de média — même logique que `resolvePersoBaseFolder`, mais
 * dérivée du groupe. Le segment `-${groupId}` assure l'unicité et reste STABLE
 * même si le nom (donc le slug) change.
 *
 *   → `${appRoot}/groups/${groupSlug}-${groupId}`
 *
 * Lève si le groupe n'existe pas ou n'est pas collaboratif (une liste de
 * diffusion n'a pas d'espace). Pas encore branché sur l'upload : ce sera
 * l'incrément 1b (destination + gardes de dépôt/suppression/consultation).
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

  const groupSlug = slug(group.name) || `group-${groupId}`;

  return `${appRoot}/groups/${groupSlug}-${groupId}`;
}
