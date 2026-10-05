import { prisma } from "@backend/prisma";
import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";

/**
 * Envoie le lien de réinitialisation de mot de passe (« mot de passe oublié »).
 *
 * Le lien contient le jeton EN CLAIR : il ne doit jamais apparaître dans les journaux en
 * production, car quiconque les lit pourrait réinitialiser le compte pendant 30 minutes.
 * Sans SMTP configuré : en développement, le lien est affiché dans la console (marqué [DEV]) ;
 * en production, l'envoi échoue, et l'appelant journalise l'échec sans le jeton.
 */
export async function sendPasswordResetEmail(params: { toEmail: string; token: string }): Promise<void> {
  const { toEmail, token } = params;
  const resetLink = `${siteBaseUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;

  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] lien de réinitialisation pour ${toEmail} : ${resetLink}`);
      return;
    }
    throw new Error("SMTP non configuré : e-mail de réinitialisation non envoyé");
  }

  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "site" }, select: { shortTitle: true } })
    .catch(() => null);
  const name = settings?.shortTitle?.trim() || process.env.APP_SHORT_NAME || "AKFC";
  const safeName = escapeHtml(name);

  await getMailTransport().sendMail({
    from: mailFrom(name),
    to: toEmail,
    replyTo: mailReplyTo(),
    subject: `${name} — réinitialisation de votre mot de passe`,
    text: [
      "Bonjour,",
      "",
      `Une réinitialisation du mot de passe de votre compte ${name} a été demandée.`,
      "Pour choisir un nouveau mot de passe, ouvrez ce lien (valable 30 minutes, une seule fois) :",
      "",
      resetLink,
      "",
      "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste valable.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Bonjour,</p>
        <p>Une réinitialisation du mot de passe de votre compte ${safeName} a été demandée.</p>
        <p>Pour choisir un nouveau mot de passe, cliquez sur le bouton ci-dessous.
           Le lien est valable <strong>30 minutes</strong> et ne peut servir qu'une fois.</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}" style="background: #0070f3; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Choisir un nouveau mot de passe</a>
        </p>
        <p style="font-size: 13px; color: #555;">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message :
           votre mot de passe actuel reste valable.</p>
      </div>`,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
