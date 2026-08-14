import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

/**
 * Extrait le groupId d'un chemin (logique ou physique) situé dans l'espace d'un
 * groupe collaboratif : `.../groups/${slug}-${groupId}/...`. Le groupId (cuid)
 * ne contient pas de tiret, il suit donc le DERNIER tiret du segment.
 * Renvoie null si le chemin n'est pas dans un espace de groupe.
 */
export function groupIdFromLogicalPath(path: string): string | null {
  const parts = path.split("/").filter(Boolean);
  const i = parts.indexOf("groups");
  if (i === -1 || i + 1 >= parts.length) return null;
  const segment = parts[i + 1];
  const dash = segment.lastIndexOf("-");
  if (dash === -1) return null;
  const groupId = segment.slice(dash + 1);
  return groupId.length > 0 ? groupId : null;
}

/**
 * Garde de SUPPRESSION (mise en corbeille) : un ADMIN peut tout envoyer à la
 * corbeille ; un non-admin ne le peut QUE pour des cibles situées dans un
 * espace de groupe collaboratif dont il est membre EDITOR. Toute cible hors
 * d'un espace de groupe, ou dans un groupe où il n'est pas EDITOR, est refusée.
 */
export async function assertCanTrashPaths(params: {
  prisma: PrismaClient;
  userId: string;
  paths: readonly string[];
}): Promise<void> {
  const { prisma, userId, paths } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  if (user?.role?.name === "ADMIN") return;

  for (const path of paths) {
    const groupId = groupIdFromLogicalPath(path);
    if (!groupId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Suppression hors espace de groupe réservée aux admins.",
      });
    }
    const membership = await prisma.memberGroupMembership.findUnique({
      where: { groupId_userId: { groupId, userId } },
      select: { access: true },
    });
    if (!membership || membership.access !== "EDITOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Suppression réservée aux éditeurs de ce groupe.",
      });
    }
  }
}
