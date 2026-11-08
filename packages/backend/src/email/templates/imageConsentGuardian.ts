import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";
import { IMAGE_USAGE_LABEL, IMAGE_USAGE_VALUES, type ImageUsageValue } from "@contracts/legal/imageConsent";

/**
 * E-mails du circuit « droit à l'image d'un mineur, validé par son parent » :
 * - au parent référent : le lien personnel vers le formulaire, pré-rempli des souhaits du membre ;
 * - au membre mineur : l'autorisation validée, avec ce que son parent a changé.
 * (L'avis à la boîte du club reste `sendImageConsentNotice`.)
 * Sans SMTP configuré : rien n'est envoyé, le journal le dit (développement sans boîte mail).
 */

const label = (list: readonly ImageUsageValue[]): string =>
  list.length ? IMAGE_USAGE_VALUES.filter((u) => list.includes(u)).map((u) => IMAGE_USAGE_LABEL[u]).join(", ") : "aucun";

function frDateTime(d: Date): string {
  return d.toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "long", timeStyle: "short" });
}

export async function sendGuardianConsentLink(params: {
  to: string;
  guardianName: string;
  memberName: string;
  token: string;
  expiresAt: Date;
}): Promise<void> {
  if (!isMailConfigured()) {
    console.log(`[droit à l'image] lien pour le parent de ${params.memberName} non envoyé (pas de SMTP)`);
    return;
  }
  const url = `${siteBaseUrl()}/autorisation-parent/${params.token}`;
  const lines = [
    `Bonjour ${params.guardianName},`,
    "",
    `${params.memberName} a indiqué ses souhaits pour l'usage de son image par l'AKFC (Association Kung Fu Chambéry).`,
    "Comme son représentant légal, c'est vous qui donnez l'autorisation. Le formulaire est pré-rempli avec ses souhaits ;",
    "vous pouvez les modifier avant de valider.",
    "",
    `Votre lien personnel (valable jusqu'au ${frDateTime(params.expiresAt)}, utilisable une seule fois) :`,
    url,
    "",
    "Si vous n'êtes pas le représentant légal de ce membre, ignorez cet e-mail et prévenez le club en y répondant.",
  ];
  const replyTo = mailReplyTo();
  await getMailTransport().sendMail({
    from: mailFrom("AKFC — Droit à l'image"),
    to: params.to,
    ...(replyTo ? { replyTo } : {}),
    subject: `Droit à l'image de ${params.memberName} : votre autorisation`,
    text: lines.join("\n"),
  });
}

export async function sendGuardianConsentResultToMember(params: {
  to: string;
  memberName: string;
  guardianName: string;
  usages: readonly ImageUsageValue[];
  changes: readonly string[];
}): Promise<void> {
  if (!isMailConfigured()) {
    console.log(`[droit à l'image] résultat pour ${params.memberName} non envoyé (pas de SMTP)`);
    return;
  }
  const lines = [
    `Bonjour ${params.memberName},`,
    "",
    `${params.guardianName} a validé ton autorisation de droit à l'image.`,
    `Usages autorisés : ${label(params.usages)}.`,
    "",
    ...(params.changes.length
      ? ["Par rapport à tes souhaits, ton parent a changé :", ...params.changes.map((c) => `- ${c}`)]
      : ["Ton parent a gardé tous tes souhaits."]),
    "",
    `Le récapitulatif (PDF) est dans ton profil : ${siteBaseUrl()}/profil`,
  ];
  const replyTo = mailReplyTo();
  await getMailTransport().sendMail({
    from: mailFrom("AKFC — Droit à l'image"),
    to: params.to,
    ...(replyTo ? { replyTo } : {}),
    subject: "Ton autorisation de droit à l'image est validée",
    text: lines.join("\n"),
  });
}
