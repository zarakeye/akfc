'use server';

import { prisma } from "@backend/prisma";
import { getMailTransport, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";

/**
 * E-mail de bienvenue envoyé à la création d'un compte, avec le mot de passe provisoire.
 * Expéditeur : SMTP_FROM_NOREPLY (ex. noreply@akfc.fr). Réponses dirigées vers SMTP_REPLY_TO
 * (ex. contact@akfc.fr) : un membre qui répond arrive dans la boîte du club.
 * @param to - adresse du nouveau membre (c'est aussi son identifiant)
 * @param subject - conservé pour compatibilité d'appel : le sujet est construit ici
 * @param password - mot de passe provisoire
 */
export default async function sendPasswordEmail(to: string, subject: string, password: string): Promise<void> {
  // Identité affichée : SiteSettings gagne, l'env reste le repli.
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "site" } })
    .catch(() => null);
  const shortTitle =
    settings?.shortTitle?.trim() || process.env.APP_SHORT_NAME || "AKFC";
  const longTitle =
    settings?.longTitle?.trim() || process.env.APP_FULL_NAME || shortTitle;
  const supportEmail =
    settings?.supportEmail?.trim() || process.env.APP_SUPPORT_EMAIL || "";
  const siteUrl = siteBaseUrl();
  const replyTo = mailReplyTo();
  const signinUrl = `${siteUrl}/auth/signin`;
  // Information à la collecte (RGPD, art. 13) : le compte est créé par un administrateur.
  const privacyUrl = `${siteUrl}/infos/confidentialite`;

  const contactText = replyTo
    ? "Pour nous écrire, réponds simplement à ce message."
    : supportEmail
      ? `Pour nous écrire : ${supportEmail}.`
      : "";
  const contactHtml = replyTo
    ? "Pour nous écrire, réponds simplement à ce message."
    : supportEmail
      ? `Pour nous écrire : <a href="mailto:${esc(supportEmail)}">${esc(supportEmail)}</a>.`
      : "";

  await getMailTransport().sendMail({
    from: mailFrom(shortTitle),
    to,
    replyTo,
    subject: `Bienvenue à l'${shortTitle} : ton compte est créé`,
    text: [
      `Bienvenue à l'${shortTitle} !`,
      "",
      `Félicitations, ton compte sur le site de l'${longTitle} a bien été créé.`,
      "",
      `Identifiant : ${to}`,
      `Mot de passe provisoire : ${password}`,
      "",
      "Ce mot de passe est temporaire : lors de ta première connexion, tu devras le changer et compléter tes informations personnelles.",
      "",
      `Se connecter : ${signinUrl}`,
      "",
      `Bonne année d'entraînement au sein de l'${longTitle} !`,
      contactText ? `\n${contactText}` : "",
      "",
      `Tes données sont utilisées uniquement pour la vie du club ; tu peux les consulter, les télécharger depuis ton profil, ou en demander la suppression : ${privacyUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Bienvenue à l'${esc(shortTitle)} !</h2>
        <p>Félicitations, ton compte sur le site de l'${esc(longTitle)} a bien été créé.</p>
        <p>Ton identifiant est : <strong>${esc(to)}</strong><br>
           Ton mot de passe provisoire : <strong>${esc(password)}</strong></p>
        <p>Ce mot de passe est temporaire : lors de ta première connexion, tu devras le changer et compléter tes informations personnelles.</p>
        <p style="margin: 24px 0;">
          <a href="${signinUrl}" style="background: #0070f3; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Se connecter</a>
        </p>
        <p>Bonne année d'entraînement au sein de l'${esc(longTitle)} !</p>
        ${contactHtml ? `<p style="font-size: 13px; color: #555;">${contactHtml}</p>` : ""}
        <p style="font-size: 12px; color: #777;">Tes données sont utilisées uniquement pour la vie du club ; tu peux les consulter, les télécharger depuis ton profil, ou en demander la suppression. Voir la <a href="${privacyUrl}">politique de confidentialité</a>.</p>
      </div>`,
  });
  void subject;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
