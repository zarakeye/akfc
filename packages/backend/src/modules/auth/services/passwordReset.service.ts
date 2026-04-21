import crypto from "crypto";

/**
 * passwordReset.service.ts
 *
 * - token brut envoyé par email
 * - token hashé stocké en DB
 * - hash = sha256(token)
 */

export const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 min
export const RESET_TOKEN_COOLDOWN_MS = 1000 * 60 * 2; // 2 min

export function createPasswordResetToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex"); // 64 chars
  const tokenHash = hashResetToken(token);
  return { token, tokenHash };
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}