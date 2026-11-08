import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";

/**
 * Une personne a été taguée sur des photos ou vidéos du club : un e-mail par séance de tags (au plus
 * un par jour), qui renvoie vers « Où j'apparais ». Le texte ne joint aucune image : elles restent
 * derrière la connexion.
 */
export async function sendMediaTagDigest(params: { to: string; firstName: string; count: number }): Promise<void> {
  if (!isMailConfigured()) {
    console.log("[tags] e-mail non envoyé (pas de SMTP)");
    return;
  }
  const n = params.count;
  const lines = [
    `Bonjour ${params.firstName},`.replace(" ,", ","),
    "",
    n > 1
      ? `Le club vous a identifié(e) sur ${n} nouvelles photos ou vidéos.`
      : "Le club vous a identifié(e) sur une nouvelle photo ou vidéo.",
    "Vous pouvez les voir, et savoir où elles sont montrées, depuis votre espace :",
    `${siteBaseUrl()}/profil/ou-j-apparais`,
    "",
    "Ce qui s'affiche dépend de votre droit à l'image, que vous pouvez donner ou modifier à tout moment depuis votre profil.",
    "Si vous ne vous reconnaissez pas, répondez à cet e-mail : le club retirera l'identification.",
  ];
  const replyTo = mailReplyTo();
  await getMailTransport().sendMail({
    from: mailFrom("AKFC — Droit à l'image"),
    to: params.to,
    ...(replyTo ? { replyTo } : {}),
    subject: n > 1 ? `Vous apparaissez sur ${n} nouvelles photos du club` : "Vous apparaissez sur une nouvelle photo du club",
    text: lines.join("\n"),
  });
}
