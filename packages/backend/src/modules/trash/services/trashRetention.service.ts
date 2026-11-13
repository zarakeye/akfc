import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { SpaceBinItem } from "@contracts/trash/trash.dto";

import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";
import { groupIdFromLogicalPath } from "@backend/modules/memberGroups/assertCanTrashPaths.service";
import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";
import { deleteForever } from "@backend/modules/trash/services/deleteForever.service";
import { bigIntToSafeNumber } from "@backend/modules/trash/utils";

/*
 * Conservation de la corbeille.
 *   - Un élément jeté est supprimé définitivement N jours après sa mise à la corbeille
 *     (réglage SiteSettings.trashRetentionDays, 90 par défaut), par la purge de nuit.
 *   - Les admins sont prévenus 7 jours avant (compteur binExpiringSoon de la cloche).
 *   - Restauration : un admin restaure tout ; un éditeur d'un groupe restaure ce qui a été jeté
 *     dans l'espace de ce groupe, quel que soit l'auteur ; ailleurs, chacun ne restaure que ce
 *     qu'il a jeté lui-même.
 */

export const DEFAULT_TRASH_RETENTION_DAYS = 90;
/** Préavis donné aux admins avant la suppression définitive. */
export const TRASH_NOTICE_DAYS = 7;

const DAY_MS = 24 * 3600 * 1000;

export async function trashRetentionDays(db: PrismaClient): Promise<number> {
  const s = await db.siteSettings.findUnique({ where: { id: "site" }, select: { trashRetentionDays: true } });
  return s?.trashRetentionDays ?? DEFAULT_TRASH_RETENTION_DAYS;
}

/** Date de suppression définitive d'un élément jeté à `trashedAt`. */
export function purgeAtOf(trashedAt: Date, days: number): Date {
  return new Date(trashedAt.getTime() + days * DAY_MS);
}

/**
 * Nom affiché de l'auteur d'une mise à la corbeille. null : inconnu (élément jeté avant le suivi,
 * ou compte supprimé depuis, la référence passant alors à NULL).
 */
export function trashedByNameOf(
  u: { firstName: string | null; lastName: string | null; email: string } | null,
): string | null {
  if (!u) return null;
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

/** Nombre d'éléments de la corbeille supprimés définitivement dans les 7 prochains jours. */
export async function countBinExpiringSoon(db: PrismaClient, now = new Date()): Promise<number> {
  const days = await trashRetentionDays(db);
  const cutoff = new Date(now.getTime() - (days - TRASH_NOTICE_DAYS) * DAY_MS);
  return db.trashEntry.count({ where: { status: "IN_BIN", trashedAt: { lt: cutoff } } });
}

/** Purge de nuit : supprime définitivement ce qui a dépassé la durée de conservation. */
export async function purgeExpiredTrash(db: PrismaClient, now = new Date()): Promise<number> {
  const days = await trashRetentionDays(db);
  const cutoff = new Date(now.getTime() - days * DAY_MS);
  const rows = await db.trashEntry.findMany({
    where: { status: "IN_BIN", trashedAt: { lt: cutoff } },
    select: { id: true, appRoot: true },
  });
  let done = 0;
  // Une entrée à la fois : l'échec de l'une (stockage indisponible…) n'arrête pas les autres.
  for (const r of rows) {
    try {
      await deleteForever({ prisma: db, input: { appRoot: r.appRoot, ids: [r.id] } });
      done += 1;
    } catch (err) {
      console.error(`[corbeille/purge] ${r.id} :`, err instanceof Error ? err.message : err);
    }
  }
  return done;
}

/**
 * Garde de RESTAURATION. Refuse (FORBIDDEN) si une seule des entrées n'est pas restaurable
 * par l'utilisateur ; les entrées introuvables sont laissées au service (NOT_FOUND).
 */
export async function assertCanRestoreEntries(params: {
  prisma: PrismaClient;
  userId: string;
  appRoot: string;
  ids: readonly string[];
}): Promise<void> {
  const { prisma, userId, appRoot, ids } = params;
  if (await isAdminByGroup(prisma, userId)) return;

  const entries = await prisma.trashEntry.findMany({
    where: { appRoot, id: { in: [...ids] }, status: "IN_BIN" },
    select: { previousPath: true, trashedById: true },
  });
  const access = new Map<string, string>();
  for (const e of entries) {
    const groupId = groupIdFromLogicalPath(e.previousPath);
    if (groupId) {
      if (!access.has(groupId)) access.set(groupId, await resolveGroupAccessForUser(prisma, userId, groupId));
      if (access.get(groupId) === "EDITOR") continue;
      throw new TRPCError({ code: "FORBIDDEN", message: "Restauration réservée aux éditeurs de ce groupe." });
    }
    if (e.trashedById === userId) continue;
    throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez restaurer que ce que vous avez jeté." });
  }
}

/**
 * Corbeille vue d'un membre : ce qui a été jeté dans les espaces de groupe où il est éditeur,
 * du plus récent au plus ancien (200 au plus). Un admin a la corbeille complète (listBin).
 */
export async function listSpacesBin(params: {
  prisma: PrismaClient;
  userId: string;
  appRoot: string;
}): Promise<SpaceBinItem[]> {
  const { prisma, userId, appRoot } = params;
  const days = await trashRetentionDays(prisma);
  const rows = await prisma.trashEntry.findMany({
    where: { appRoot, status: "IN_BIN", previousPath: { startsWith: `${appRoot}/collaborative-group-spaces/` } },
    orderBy: [{ trashedAt: "desc" }, { id: "desc" }],
    take: 500,
    select: {
      id: true,
      kind: true,
      displayName: true,
      previousPath: true,
      trashedAt: true,
      sizeBytes: true,
      trashedBy: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  const admin = await isAdminByGroup(prisma, userId);
  const allowed = new Map<string, boolean>();
  const kept: Array<(typeof rows)[number] & { groupId: string }> = [];
  for (const r of rows) {
    const groupId = groupIdFromLogicalPath(r.previousPath);
    if (!groupId) continue;
    if (!allowed.has(groupId)) {
      allowed.set(groupId, admin || (await resolveGroupAccessForUser(prisma, userId, groupId)) === "EDITOR");
    }
    if (allowed.get(groupId)) kept.push({ ...r, groupId });
    if (kept.length >= 200) break;
  }

  const groups = await prisma.memberGroup.findMany({
    where: { id: { in: [...new Set(kept.map((r) => r.groupId))] } },
    select: { id: true, name: true },
  });
  const nameOf = new Map(groups.map((g) => [g.id, g.name]));

  return kept.map((r) => ({
    id: r.id,
    kind: r.kind === "folder" ? "folder" : "file",
    displayName: r.displayName,
    previousPath: r.previousPath,
    groupId: r.groupId,
    groupName: nameOf.get(r.groupId) ?? "Groupe supprimé",
    trashedAt: r.trashedAt.toISOString(),
    purgeAt: purgeAtOf(r.trashedAt, days).toISOString(),
    trashedByName: trashedByNameOf(r.trashedBy),
    sizeBytes: bigIntToSafeNumber(r.sizeBytes),
  }));
}
