import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "#email/mailer.ts";

/**
 * E-mail au membre qui vient de passer majeur (18 ans, date confirmée par son parent, ou
 * justificatif vu par le club) : c'est désormais lui qui décide de l'usage de son
 * image. Les choix de son parent restent valables jusqu'à ce qu'il confirme ou modifie les siens.
 * Sans SMTP configuré : rien n'est envoyé, le journal le dit.
 */
export async function sendComingOfAgeNotice(params: { to: string; firstName: string; hadGuardianConsent: boolean }): Promise<void> {
  if (!isMailConfigured()) {
    console.log("[majorité] e-mail des 18 ans non envoyé (pas de SMTP)");
    return;
  }
  const url = `${siteBaseUrl()}/profil/droit-a-l-image`;
  const lines = [
    `Bonjour ${params.firstName},`,
    "",
    "Tu es majeur(e) : c'est désormais toi qui décides de l'usage de ton image par l'AKFC (Association Kung Fu Chambéry).",
    ...(params.hadGuardianConsent
      ? [
          "Les choix faits par ton parent restent valables tant que tu n'as pas confirmé les tiens.",
          "Tu les retrouves pré-cochés : confirme-les ou modifie-les en ligne.",
        ]
      : ["Tu peux donner (ou refuser) ton autorisation en ligne."]),
    "",
    url,
  ];
  const replyTo = mailReplyTo();
  await getMailTransport().sendMail({
    from: mailFrom("AKFC — Droit à l'image"),
    to: params.to,
    ...(replyTo ? { replyTo } : {}),
    subject: "Majeur(e) : ton droit à l'image, c'est toi qui décides",
    text: lines.join("\n"),
  });
}
