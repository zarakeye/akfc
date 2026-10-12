import type { PrismaClient } from "@prisma/client";

import { parisClock } from "@backend/modules/tickets/recap.service";
import { sweepOrphanDerivatives } from "@backend/modules/media/services/mediaDerivatives.service";
import { purgeDetachedImageConsentForms } from "@backend/modules/imageConsent/imageConsentForm.service";

/*
 * Durées de conservation (RGPD) APPLIQUÉES, pas seulement annoncées :
 *   - demande close depuis plus de N mois (réglage ticketRetentionMonths) et sans message depuis :
 *     supprimée avec ses messages et son historique ;
 *   - sessions expirées et liens de réinitialisation périmés : supprimés ;
 *   - formulaires de droit à l'image d'un compte supprimé depuis plus de 5 ans : supprimés.
 * Les comptes ne sont JAMAIS supprimés automatiquement (le site ne connaît pas la fin d'adhésion) :
 * listInactiveAccounts les signale aux administrateurs (registre RGPD), qui décident.
 */

const MONTH_MS = 30.4375 * 24 * 3600 * 1000;

export function monthsAgo(now: Date, months: number): Date {
  return new Date(now.getTime() - months * MONTH_MS);
}

export async function retentionSettings(db: PrismaClient): Promise<{ ticketMonths: number; accountMonths: number }> {
  const s = await db.siteSettings.findUnique({
    where: { id: "site" },
    select: { ticketRetentionMonths: true, accountRetentionMonths: true },
  });
  return { ticketMonths: s?.ticketRetentionMonths ?? 36, accountMonths: s?.accountRetentionMonths ?? 12 };
}

export async function purgeExpiredData(db: PrismaClient, now = new Date()) {
  const { ticketMonths } = await retentionSettings(db);
  const cutoff = monthsAgo(now, ticketMonths);
  const tickets = await db.ticket.deleteMany({
    where: { status: "CLOSED", closedAt: { lt: cutoff }, messages: { none: { createdAt: { gte: cutoff } } } },
  });
  const sessions = await db.session.deleteMany({ where: { expiresAt: { lt: now } } });
  const resetTokens = await db.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } });
  // Vignettes et affiches dont la photo ou la vidéo d'origine a disparu (sans R2 configuré : 0).
  const derivatives = await sweepOrphanDerivatives().catch((err) => {
    console.error("[rgpd/purge] déclinaisons :", err instanceof Error ? err.message : err);
    return 0;
  });
  const imageConsentForms = await purgeDetachedImageConsentForms(db, now).catch((err) => {
    console.error("[rgpd/purge] formulaires de droit à l'image :", err instanceof Error ? err.message : err);
    return 0;
  });
  return { tickets: tickets.count, sessions: sessions.count, resetTokens: resetTokens.count, derivatives, imageConsentForms };
}

export type InactiveAccount = {
  id: string;
  name: string;
  email: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  memberSince: Date | null;
};

/** Comptes sans connexion depuis plus de N mois (accountRetentionMonths) : à examiner par un admin. */
export async function listInactiveAccounts(db: PrismaClient, now = new Date()): Promise<{ months: number; accounts: InactiveAccount[] }> {
  const { accountMonths } = await retentionSettings(db);
  const cutoff = monthsAgo(now, accountMonths);
  const users = await db.user.findMany({
    where: { OR: [{ lastLoginAt: { lt: cutoff } }, { lastLoginAt: null, createdAt: { lt: cutoff } }] },
    select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true, createdAt: true, memberSince: true },
    orderBy: [{ lastLoginAt: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
  });
  return {
    months: accountMonths,
    accounts: users.map((u) => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
      email: u.email,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      memberSince: u.memberSince,
    })),
  };
}

let retentionTimer: ReturnType<typeof setInterval> | null = null;

/** Purge quotidienne à 3 h (heure de Paris), plus une passe au démarrage. RETENTION_PURGE_DISABLED=1 la coupe. */
export function startRetentionSchedule(db: PrismaClient): boolean {
  if (process.env.RETENTION_PURGE_DISABLED === "1" || retentionTimer) return false;
  let lastDay: string | null = null;
  let busy = false;
  const run = (now: Date): void => {
    busy = true;
    lastDay = parisClock(now).day;
    purgeExpiredData(db, now)
      .then((r) => {
        if (r.tickets || r.sessions || r.resetTokens || r.derivatives || r.imageConsentForms) {
          console.log(`[rgpd/purge] ${r.tickets} demande(s) close(s), ${r.sessions} session(s), ${r.resetTokens} lien(s) de réinitialisation, ${r.derivatives} vignette(s) orpheline(s), ${r.imageConsentForms} formulaire(s) de droit à l'image supprimé(s)`);
        }
      })
      .catch((err) => console.error("[rgpd/purge] échec :", err instanceof Error ? err.message : err))
      .finally(() => { busy = false; });
  };
  run(new Date());
  retentionTimer = setInterval(() => {
    const now = new Date();
    const c = parisClock(now);
    if (busy || c.hour !== 3 || c.day === lastDay) return;
    run(now);
  }, 60_000);
  return true;
}
