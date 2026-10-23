import type SMTPTransport from "nodemailer/lib/smtp-transport";

import { prisma } from "@backend/prisma";
import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";

/*
 * E-mail de bienvenue (avec le mot de passe généré) et avis au club.
 *
 * Le mot de passe ne doit aboutir QUE dans la boîte du membre :
 *   - pas d'en-tête Reply-To vers contact@ : une réponse (qui citerait le mot de passe) revient à
 *     noreply@, où un filtre de la messagerie la supprime (objet « ton compte est créé ») ;
 *   - avis de non-remise demandé « en-têtes seulement » (DSN, RET=HDRS) : les filtres de noreply@
 *     transfèrent les rebonds à contact@, et celui-ci ne recopie pas le message, donc pas le mot
 *     de passe ;
 *   - contact@ reçoit à la place un AVIS sans mot de passe : compte créé, ou e-mail impossible à
 *     envoyer.
 * L'objet WELCOME_SUBJECT_MARK sert de condition au filtre de noreply@ : ne pas le modifier sans
 * mettre ce filtre à jour.
 */

export const WELCOME_SUBJECT_MARK = "ton compte est créé";

/** Adresse du club affichée au membre pour écrire (noreply@ ne reçoit pas de réponses). */
async function clubContactAddress(): Promise<string> {
  const s = await prisma.siteSettings
    .findUnique({ where: { id: "site" }, select: { contactEmail: true, supportEmail: true } })
    .catch(() => null);
  return s?.contactEmail?.trim() || s?.supportEmail?.trim() || mailReplyTo() || process.env.APP_SUPPORT_EMAIL || "";
}

async function siteNames(): Promise<{ shortTitle: string; longTitle: string }> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } }).catch(() => null);
  const shortTitle = settings?.shortTitle?.trim() || process.env.APP_SHORT_NAME || "AKFC";
  const longTitle = settings?.longTitle?.trim() || process.env.APP_FULL_NAME || shortTitle;
  return { shortTitle, longTitle };
}

/**
 * E-mail de bienvenue envoyé à la création d'un compte, avec le mot de passe généré.
 * @param to - adresse du nouveau membre (c'est aussi son identifiant)
 * @param password - mot de passe généré par le serveur
 */
export async function sendWelcomeEmail(params: { to: string; password: string }): Promise<void> {
  const { to, password } = params;
  const { shortTitle, longTitle } = await siteNames();
  const siteUrl = siteBaseUrl();
  const contact = await clubContactAddress();
  // Information à la collecte (RGPD, art. 13) : le compte est créé par un administrateur.
  const privacyUrl = `${siteUrl}/infos/confidentialite`;

  const contactText = contact
    ? `Ce message vient d'une adresse qui ne reçoit pas de réponses. Pour nous écrire : ${contact}.`
    : "Ce message vient d'une adresse qui ne reçoit pas de réponses.";
  const contactHtml = contact
    ? `Ce message vient d'une adresse qui ne reçoit pas de réponses. Pour nous écrire : <a href="mailto:${esc(contact)}">${esc(contact)}</a>.`
    : "Ce message vient d'une adresse qui ne reçoit pas de réponses.";

  // Options SMTP (et non génériques) : `dsn` n'existe que pour le transport SMTP.
  const message: SMTPTransport.Options = {
    from: mailFrom(shortTitle),
    to,
    // Pas de replyTo : une réponse citerait le mot de passe.
    // Rebond : en-têtes seulement (jamais le corps, donc jamais le mot de passe).
    // (Transmis seulement si le serveur SMTP annonce l'extension DSN.)
    dsn: { ret: "HDRS", notify: ["FAILURE", "DELAY"], orcpt: to },
    subject: `Bienvenue à l'${shortTitle} : ${WELCOME_SUBJECT_MARK}`,
    text: [
      `Bienvenue à l'${shortTitle} !`,
      "",
      `Ton compte sur le site de l'${longTitle} a bien été créé.`,
      "",
      `Identifiant : ${to}`,
      `Mot de passe : ${password}`,
      "",
      "Ce mot de passe a été généré pour toi selon les règles d'un mot de passe robuste. Tu peux le garder, ou le changer à tout moment depuis ton profil. Ne le communique à personne : le club ne te le demandera jamais.",
      "",
      `Se connecter : ${siteUrl}`,
      "À ta première connexion, le site te proposera de compléter ton profil.",
      "",
      `Bonne année d'entraînement au sein de l'${longTitle} !`,
      "",
      contactText,
      "",
      `Tes données sont utilisées uniquement pour la vie du club ; tu peux les consulter, les télécharger depuis ton profil, ou en demander la suppression : ${privacyUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Bienvenue à l'${esc(shortTitle)} !</h2>
        <p>Ton compte sur le site de l'${esc(longTitle)} a bien été créé.</p>
        <p>Ton identifiant est : <strong>${esc(to)}</strong><br>
           Ton mot de passe : <strong>${esc(password)}</strong></p>
        <p>Ce mot de passe a été généré pour toi selon les règles d'un mot de passe robuste. Tu peux le garder,
           ou le changer à tout moment depuis ton profil. Ne le communique à personne : le club ne te le demandera jamais.</p>
        <p style="margin: 24px 0;">
          <a href="${siteUrl}" style="background: #0070f3; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Se connecter</a>
        </p>
        <p>À ta première connexion, le site te proposera de compléter ton profil.</p>
        <p>Bonne année d'entraînement au sein de l'${esc(longTitle)} !</p>
        <p style="font-size: 13px; color: #555;">${contactHtml}</p>
        <p style="font-size: 12px; color: #777;">Tes données sont utilisées uniquement pour la vie du club ; tu peux les consulter, les télécharger depuis ton profil, ou en demander la suppression. Voir la <a href="${privacyUrl}">politique de confidentialité</a>.</p>
      </div>`,
  };
  await getMailTransport().sendMail(message);
}

/**
 * Avis à la boîte du club (SMTP_REPLY_TO, ex. contact@) — JAMAIS de mot de passe.
 *   - `sent` : compte créé, e-mail de bienvenue parti ;
 *   - `send-failed` : compte créé, mais l'e-mail n'a pas pu partir (SMTP refusé).
 * Un rebond éventuel (adresse inexistante…) arrive ensuite à contact@ par les filtres de noreply@.
 * Sans boîte du club configurée : rien n'est envoyé (journal seulement).
 */
export async function sendWelcomeNotice(params: {
  kind: "sent" | "send-failed";
  memberEmail: string;
  groupNames?: string[];
  createdBy?: string | null;
  detail?: string | null;
}): Promise<void> {
  const to = mailReplyTo();
  const { kind, memberEmail } = params;
  if (!to || !isMailConfigured()) {
    console.log(`[bienvenue] avis « ${kind} » pour ${memberEmail} non envoyé (pas de boîte du club ou pas de SMTP)`);
    return;
  }
  const { shortTitle } = await siteNames();
  const usersUrl = `${siteBaseUrl()}/dashboard/users`;
  const subject = {
    sent: `Compte créé : e-mail de bienvenue envoyé à ${memberEmail}`,
    "send-failed": `⚠ Compte créé, mais e-mail de bienvenue NON ENVOYÉ à ${memberEmail}`,
  }[kind];
  const lines = {
    sent: [
      `Un compte a été créé pour ${memberEmail}${params.createdBy ? ` par ${params.createdBy}` : ""}.`,
      ...(params.groupNames && params.groupNames.length > 0 ? [`Groupes : ${params.groupNames.join(", ")}.`] : []),
      "L'e-mail de bienvenue, avec ses identifiants, lui a été envoyé.",
      "Si l'adresse est erronée, un avis de non-remise vous parviendra.",
    ],
    "send-failed": [
      `Le compte de ${memberEmail} a été créé, mais l'e-mail de bienvenue n'a pas pu partir.`,
      ...(params.detail ? [`Erreur : ${params.detail}`] : []),
      "Le membre peut obtenir un mot de passe avec « Mot de passe oublié » sur le site, une fois le problème d'envoi réglé.",
    ],
  }[kind];
  await getMailTransport().sendMail({
    from: mailFrom(`${shortTitle} — comptes`),
    to,
    subject,
    text: [...lines, "", `Comptes : ${usersUrl}`, "", "Cet avis ne contient aucun mot de passe."].join("\n"),
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
