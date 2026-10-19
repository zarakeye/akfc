import type { PrismaClient } from "@prisma/client";

import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";

/** Segments de statut qui peuvent encore précéder le chemin logique (anciens binaires). */
const STRATA = new Set(["pending", "published"]);

/**
 * Lecture d'un fichier privé par la route `/api/media/r2/…` : qui peut obtenir l'URL signée ?
 *
 *   - un administrateur : tout ;
 *   - un membre d'un groupe collaboratif (VIEWER ou EDITOR) : les fichiers de l'espace de ce groupe
 *     (`<appRoot>/collaborative-group-spaces/<slug>-<groupId>/…`) ;
 *   - chacun : son propre espace personnel (`<appRoot>/personal-space/<slug>-<userId>/…`).
 *
 * Tout le reste est refusé. Le chemin est analysé par POSITION (juste après l'appRoot, et après un
 * éventuel segment de statut hérité), jamais par simple recherche d'un segment : un dossier nommé
 * « collaborative-group-spaces » ailleurs dans l'arborescence n'ouvre rien.
 */
export async function canReadStorageKey(params: {
  prisma: PrismaClient;
  userId: string;
  key: string;
}): Promise<boolean> {
  const { prisma, userId, key } = params;

  if (await isAdminByGroup(prisma, userId)) return true;

  const parts = key.split("/").filter(Boolean);
  // parts[0] = appRoot ; un éventuel segment de statut hérité est ignoré.
  const rest = STRATA.has(parts[1] ?? "") ? parts.slice(2) : parts.slice(1);
  const [space, owner] = rest;
  if (!space || !owner || rest.length < 3) return false;

  const id = owner.slice(owner.lastIndexOf("-") + 1);
  if (!id || owner.lastIndexOf("-") === -1) return false;

  if (space === "personal-space") return id === userId;

  if (space === "collaborative-group-spaces") {
    const access = await resolveGroupAccessForUser(prisma, userId, id);
    return access !== "NONE";
  }

  return false;
}
