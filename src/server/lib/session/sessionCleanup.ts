// src/lib/session/sessionCleanup.ts
import { prisma } from "@/server/prisma";

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Supprime toutes les sessions expirées dans la DB
 */
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const deleted = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (deleted.count > 0) {
      console.log(`🧹 Session cleanup: ${deleted.count} sessions expirées supprimées`);
    }
  } catch (err) {
    console.error("Erreur lors du nettoyage des sessions expirées:", err);
  }
}

/**
 * Lance le cron interne pour nettoyer les sessions périodiquement
 */
export function startSessionCleanupCron(): void {
  // Au démarrage
  cleanupExpiredSessions();

  // Répétition périodique
  setInterval(() => {
    cleanupExpiredSessions();
  }, CLEANUP_INTERVAL_MS);
}
