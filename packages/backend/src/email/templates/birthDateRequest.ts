import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "#email/mailer.ts";

/**
 * E-mails du circuit « date de naissance d'un mineur, renseignée par son parent » :
 * - au parent référent : le lien personnel vers la page où il la renseigne, la corrige ou l'efface ;
 * - au membre mineur : sa date a été mise à jour (sans la redire : il la voit dans son profil).
 * Sans SMTP configuré : rien n'est envoyé, le journal le dit.
 */

function frDateTime(d: Date): string {
  return d.toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "long", timeStyle: "short" });
}

async function send(to: string, subject: string, lines: string[]): Promise<void> {
  const replyTo = mailReplyTo();
  await getMailTransport().sendMail({
    from: mailFrom("AKFC — Date de naissance"),
    to,
    ...(replyTo ? { replyTo } : {}),
    subject,
    text: lines.join("\n"),
  });
}

export async function sendBirthDateLink(params: {
  to: string;
  guardianName: string;
  memberName: string;
  token: string;
  expiresAt: Date;
  hasDate: boolean;
}): Promise<void> {
  if (!isMailConfigured()) {
    console.log(`[date de naissance] lien pour le parent de ${params.memberName} non envoyé (pas de SMTP)`);
    return;
  }
  await send(params.to, `Date de naissance de ${params.memberName}`, [
    `Bonjour ${params.guardianName},`,
    "",
    params.hasDate
      ? `${params.memberName} vous demande de vérifier sa date de naissance enregistrée par l'AKFC (Association Kung Fu Chambéry) : vous pouvez la corriger ou l'effacer.`
      : `${params.memberName} vous demande de renseigner sa date de naissance auprès de l'AKFC (Association Kung Fu Chambéry).`,
    "Elle sert à savoir quand il deviendra majeur et décidera seul de l'usage de son image.",
    "",
    `Votre lien personnel (valable jusqu'au ${frDateTime(params.expiresAt)}, utilisable une seule fois) :`,
    `${siteBaseUrl()}/date-de-naissance-parent/${params.token}`,
    "",
    "Si vous n'êtes pas le représentant légal de ce membre, ignorez cet e-mail et prévenez le club en y répondant.",
  ]);
}

export async function sendBirthDateUpdatedToMember(params: {
  to: string;
  firstName: string;
  guardianName: string;
  cleared: boolean;
}): Promise<void> {
  if (!isMailConfigured()) {
    console.log("[date de naissance] e-mail au membre non envoyé (pas de SMTP)");
    return;
  }
  await send(params.to, "Ta date de naissance", [
    `Bonjour ${params.firstName},`,
    "",
    params.cleared
      ? `${params.guardianName} a effacé ta date de naissance.`
      : `${params.guardianName} a mis à jour ta date de naissance : tu la retrouves dans ton profil.`,
    "",
    `${siteBaseUrl()}/profil`,
  ]);
}
