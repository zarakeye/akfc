'use server';

import nodemail from "nodemailer";

import { prisma } from "@backend/prisma";

const transporter = nodemail.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Send a password email to the user.
 * @param {string} to - the recipient's email address
 * @param {string} subject - the email subject
 * @param {string} password - the temporary password
 * @returns {Promise<void>} - a promise that resolves when the email has been sent
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
  // URL canonique (infra, pas éditable admin) — alignée sur siteUrl.ts.
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://akfc.fr"
  ).replace(/\/+$/, "");

  const mailInfo = {
    from: `${shortTitle} <${process.env.SMTP_FROM_NOREPLY}@${process.env.APP_DOLMAIN}>`,
    to,
    subject: `Création de compte ${shortTitle} réussie`,
    html: `
      <div style="font-family: Arial, sans-serif; maw-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Bienvenue à l'${shortTitle}, ${longTitle}</h2>
      <p>Felicitations, ton compte a bien été créé !</p>
      <p>Ton identifiant est : <strong>${to}</strong> et ton mot de passe provisoire : <strong>${password}</strong></p>
      <p>Ce mot de passe est temporaire. Lors de ta première connexion, tu devras le changer et renseigner tes informations personnelles.</p>
      <p>Si tu as des questions, n'hesitez pas a nous contacter sur <a href="mailto:${supportEmail}">${supportEmail}</a></p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #888;">Cet email a été envoyé automatiquement par l'application ${longTitle} et ne peut recevoir aucun message.</p>
      <p>Bonne année d'entraînement au sein de l'${longTitle}!</p>
      <a href="${siteUrl}/auth/signin" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Se connecter</a>
    `,
  };

  await transporter.sendMail(mailInfo);
}

