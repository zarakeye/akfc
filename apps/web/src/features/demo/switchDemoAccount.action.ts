'use server';

import { TRPCError } from "@trpc/server";

import { IS_DEMO } from "#config/siteUrl.ts";
import { loginService } from "@akfc/backend/modules/auth/services/auth.service.ts";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "#features/demo/demoAccounts.ts";

export type SwitchDemoAccountResult = { ok: true } | { ok: false; error: string };

/**
 * « Me connecter en tant que… » : connecte le visiteur à un compte de la démo, par le même service
 * que le formulaire de connexion (le cookie de session est posé de la même façon). Refusé hors
 * démo : en production, cette action ne fait rien d'autre que répondre non.
 */
export async function switchDemoAccountAction(key: string): Promise<SwitchDemoAccountResult> {
  if (!IS_DEMO) return { ok: false, error: "Réservé à la démo." };
  const account = DEMO_ACCOUNTS.find((a) => a.key === key);
  if (!account) return { ok: false, error: "Compte de démo inconnu." };
  try {
    await loginService(account.email, DEMO_PASSWORD);
    return { ok: true };
  } catch (err) {
    if (err instanceof TRPCError && err.message === "INVALID_CREDENTIALS") {
      return { ok: false, error: "Ce compte n'accepte plus le mot de passe de la démo (il a été changé pendant la visite)." };
    }
    if (err instanceof TRPCError && err.message === "TOO_MANY_ATTEMPTS") {
      return { ok: false, error: "Trop d'essais sur ce compte : réessayez dans quelques minutes." };
    }
    console.error("[demo] changement de compte impossible :", err instanceof Error ? err.message : err);
    return { ok: false, error: "Changement de compte impossible." };
  }
}
