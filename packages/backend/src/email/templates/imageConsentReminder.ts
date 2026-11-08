import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";

/**
 * Relance du droit à l'image (un admin, depuis les tags d'un média) : le membre est invité à donner
 * son autorisation en ligne (majeur) ou à indiquer ses souhaits pour son parent (mineur).
 * Le texte ne dit pas sur quelle photo le membre apparaît : la page de son profil le dira.
 */
export async function sendImageConsentReminder(params: {
  to: string;
  firstName: string;
  kind: "ADULT" | "MINOR_WISHES";
}): Promise<void> {
  if (!isMailConfigured()) {
    console.log("[droit à l'image] relance non envoyée (pas de SMTP)");
    return;
  }
  const url = `${siteBaseUrl()}/profil`;
  const lines =
    params.kind === "ADULT"
      ? [
          `Bonjour ${params.firstName},`,
          "",
          "Le club aimerait utiliser des photos ou vidéos où vous apparaissez, mais n'a pas encore votre réponse sur le droit à l'image.",
          "Vous pouvez la donner (ou refuser) en deux minutes depuis votre profil, usage par usage :",
          url,
          "",
          "L'autorisation est facultative : la refuser ne change rien à votre inscription.",
        ]
      : [
          `Bonjour ${params.firstName},`,
          "",
          "Le club aimerait utiliser des photos ou vidéos où tu apparais. Comme tu es mineur, c'est ton parent qui décide :",
          "indique d'abord tes souhaits depuis ton profil, puis clique sur « Envoyer à mon parent ».",
          url,
        ];
  const replyTo = mailReplyTo();
  await getMailTransport().sendMail({
    from: mailFrom("AKFC — Droit à l'image"),
    to: params.to,
    ...(replyTo ? { replyTo } : {}),
    subject: params.kind === "ADULT" ? "Droit à l'image : votre réponse" : "Droit à l'image : tes souhaits",
    text: lines.join("\n"),
  });
}
