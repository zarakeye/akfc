import type { PrismaClient } from "@prisma/client";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";

/**
 * Rend l'espace d'un groupe COLLABORATIF visible (même vide) dans le finder, en
 * créant ses lignes de registre `Folder` — le conteneur `collaborative-group-spaces/` et l'espace
 * lui-même. Le finder lit `Folder` par PRÉFIXE (sans filtre de statut), donc
 * une ligne suffit à afficher le dossier vide.
 *
 * Le statut est posé EXPLICITEMENT (`published`, métadonnée DB) — jamais dérivé
 * du chemin : aucune allusion à la convention `<appRoot>/<status>/…` obsolète.
 * Idempotent (upsert sur la clé unique `appRoot_fullPath`).
 *
 * Lève si le groupe n'est pas collaboratif (resolveGroupBaseFolder) : à
 * n'appeler que pour un groupe collaboratif.
 */
export async function ensureGroupSpaceFolder(params: {
  prisma: PrismaClient;
  appRoot: string;
  groupId: string;
}): Promise<void> {
  const { prisma, appRoot, groupId } = params;

  const base = await resolveGroupBaseFolder({ prisma, appRoot, groupId });

  for (const fullPath of [`${appRoot}/collaborative-group-spaces`, base]) {
    await prisma.folder.upsert({
      where: { appRoot_fullPath: { appRoot, fullPath } },
      create: { appRoot, fullPath, status: "published" },
      update: {},
    });
  }
}
