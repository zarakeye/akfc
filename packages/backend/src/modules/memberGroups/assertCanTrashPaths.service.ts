import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";

/**
 * Propriétaire d'un segment d'espace `<slug>-<id>` : l'identifiant (cuid, sans tiret) suit le
 * DERNIER tiret. Le chemin est lu PAR POSITION — `<racine>/<conteneur>/<slug>-<id>/…` — et jamais
 * en cherchant le nom du conteneur n'importe où : un dossier nommé « collaborative-group-spaces »
 * rangé ailleurs (sous `courses/`, par exemple) n'ouvre rien. Un chemin qui contient « . » ou « .. »
 * ne désigne pas ce qu'il semble désigner : aucune garde ne l'accepte.
 */
function spaceOwnerId(path: string, container: string): string | null {
  const parts = path.split("/").filter(Boolean);
  if (parts.some((p) => p === "." || p === "..")) return null;
  if (parts[1] !== container || parts.length < 3) return null;
  const segment = parts[2];
  const dash = segment.lastIndexOf("-");
  if (dash === -1) return null;
  const id = segment.slice(dash + 1);
  return id.length > 0 ? id : null;
}

/** Groupe dont l'espace collaboratif contient ce chemin (`<racine>/collaborative-group-spaces/<slug>-<groupId>/…`). */
export function groupIdFromLogicalPath(path: string): string | null {
  return spaceOwnerId(path, "collaborative-group-spaces");
}

/** Membre dont l'espace personnel contient ce chemin (`<racine>/personal-space/<slug>-<userId>/…`). */
export function personalSpaceOwnerId(path: string): string | null {
  return spaceOwnerId(path, "personal-space");
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

  if (await isAdminByGroup(prisma, userId)) return;

  for (const path of paths) {
    const groupId = groupIdFromLogicalPath(path);
    if (!groupId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Suppression hors espace de groupe réservée aux admins.",
      });
    }
    const access = await resolveGroupAccessForUser(prisma, userId, groupId);
    if (access !== "EDITOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Suppression réservée aux éditeurs de ce groupe.",
      });
    }
  }
}
