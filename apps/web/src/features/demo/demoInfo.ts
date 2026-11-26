import "server-only";

import { IS_DEMO } from "#config/siteUrl.ts";

/**
 * Ce que le panneau de la démo affiche, lu AU LANCEMENT du serveur (pas au build : l'image est la
 * même pour toutes les sessions) :
 *   - DEMO_ENDS_AT   fin de la session, en secondes depuis 1970 (posée par le scénario Killercoda ;
 *                    absente en local : pas de compte à rebours) ;
 *   - DEMO_MAIL_URL  l'adresse de Mailpit vue par le navigateur.
 */
const runtimeEnv = process.env;

export type DemoInfo = { endsAt: number | null; mailUrl: string };

export function getDemoInfo(): DemoInfo | null {
  if (!IS_DEMO) return null;
  const endsAt = Number(runtimeEnv.DEMO_ENDS_AT);
  return {
    endsAt: Number.isFinite(endsAt) && endsAt > 0 ? endsAt * 1000 : null,
    mailUrl: (runtimeEnv.DEMO_MAIL_URL || "http://localhost:8025").replace(/\/+$/, ""),
  };
}
