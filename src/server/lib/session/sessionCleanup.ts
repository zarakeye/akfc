// src/lib/session/sessionCleanup.ts
import { prisma } from "@/server/prisma";

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Supprime toutes les sessions expirées dans la base de données.
 * Si des sessions sont supprimées, affiche un message de log indiquant le nombre de sessions supprimées.
 * Si une erreur survient, affiche un message d'erreur avec le détail de l'erreur.
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
 * Lance le nettoyage des sessions expirées de manière périodique.
 * Au démarrage, nettoie les sessions expirées.
 * Ensuite, lance une boucle d'appel répétée toutes les 10 minutes pour nettoyer les sessions expirées.
 */
export function startSessionCleanupCron(): void {
  // Au démarrage
  cleanupExpiredSessions();

  // Répétition périodique
  setInterval(() => {
    cleanupExpiredSessions();
  }, CLEANUP_INTERVAL_MS);
}
