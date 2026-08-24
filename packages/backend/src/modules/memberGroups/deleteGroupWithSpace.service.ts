import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";

/**
 * Supprime un groupe et son espace, en cascade SÛRE.
 *
 * Invariants respectés (décisions Stéphane A→E) :
 *  - le groupe Administrateurs (isAdminGroup) n'est jamais supprimable ;
 *  - l'espace doit être VIDE de contenu géré (fichiers Cloudinary ET R2 via
 *    MediaAsset, + sous-dossiers Folder) — sinon on refuse et on invite à
 *    vider ; le layout étant PLAT, les espaces des groupes enfants sont des
 *    dossiers frères (pas sous ce chemin) → ils ne comptent pas ;
 *  - les groupes enfants sont RE-PARENTÉS vers le parent du groupe supprimé
 *    (au pire Administrateurs, puisqu'on interdit sa suppression) AVANT delete,
 *    pour éviter le SetNull qui les enverrait à la racine.
 *
 * Résolution du chemin d'espace : par le SUFFIXE `-{groupId}` dans le registre
 * Folder (stable même après renommage), avec repli sur le chemin canonique.
 */
export async function deleteGroupWithSpace(params: {
  prisma: PrismaClient;
  appRoot: string;
  groupId: string;
}): Promise<void> {
  const { prisma, appRoot, groupId } = params;

  const group = await prisma.memberGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      isAdminGroup: true,
      isCollaborative: true,
      parentGroupId: true,
    },
  });
  if (!group) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Groupe introuvable." });
  }
  if (group.isAdminGroup) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Le groupe Administrateurs ne peut pas être supprimé.",
    });
  }

  // ── Chemin(s) de l'espace : suffixe -{groupId} (robuste au renommage) ──
  const registered = await prisma.folder.findMany({
    where: { appRoot, fullPath: { endsWith: `-${groupId}` } },
    select: { fullPath: true },
  });
  const spacePaths = new Set<string>(
    registered.map((r) => r.fullPath).filter((fp) => fp.includes("/groups/")),
  );
  if (spacePaths.size === 0 && group.isCollaborative) {
    try {
      spacePaths.add(await resolveGroupBaseFolder({ prisma, appRoot, groupId }));
    } catch {
      // groupe non collaboratif ou espace jamais matérialisé → rien à vérifier
    }
  }

  // ── Vérifie que chaque espace est VIDE (contenu géré : fichiers + sous-dossiers) ──
  for (const sp of spacePaths) {
    const [asset, sub] = await Promise.all([
      prisma.mediaAsset.findFirst({
        where: { appRoot, fullPath: { startsWith: `${sp}/` } },
        select: { id: true },
      }),
      prisma.folder.findFirst({
        where: { appRoot, fullPath: { startsWith: `${sp}/` } },
        select: { id: true },
      }),
    ]);
    if (asset || sub) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `L'espace du groupe « ${group.name} » n'est pas vide. Videz-le (fichiers et sous-dossiers) avant de supprimer le groupe.`,
      });
    }
  }

  // ── Re-parente les enfants vers le parent (AVANT le delete) ──
  await prisma.memberGroup.updateMany({
    where: { parentGroupId: groupId },
    data: { parentGroupId: group.parentGroupId },
  });

  // ── Supprime les lignes de registre de l'espace (vide) ──
  if (spacePaths.size > 0) {
    await prisma.folder.deleteMany({
      where: { appRoot, fullPath: { in: [...spacePaths] } },
    });
  }

  // ── Supprime le groupe (cascade DB : memberships + liens documents) ──
  await prisma.memberGroup.delete({ where: { id: groupId } });
}
