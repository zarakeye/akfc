/**
 * sendPasswordResetEmail.ts
 *
 * Remplace ce fichier par ton provider email (Resend, SES, Nodemailer, etc.)
 * On garde une implémentation safe pour dev.
 */

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(params: { toEmail: string; token: string }) {
  const { toEmail, token } = params;

  const resetLink = `${APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;

  // ✅ DEV STUB: log
  // En prod: envoyer un email HTML/text
  console.log("🔐 Password reset email");
  console.log("To:", toEmail);
  console.log("Link:", resetLink);

  return { ok: true as const };
}