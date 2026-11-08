import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";
import { IMAGE_USAGE_LABEL, IMAGE_USAGE_VALUES, type ImageUsageValue } from "@contracts/legal/imageConsent";

/**
 * Avis à la boîte du club (contact@) : une nouvelle version de l'autorisation de droit à l'image a
 * été enregistrée. La boîte du club garde ainsi la mémoire des autorisations. Un RETRAIT (usage
 * autorisé avant, plus maintenant) est signalé dans l'objet : quelqu'un doit retirer les images
 * concernées des supports du club, le site ne le fait pas seul.
 */
export async function sendImageConsentNotice(params: {
  userId: string;
  memberName: string;
  /** « en ligne par le membre », « en ligne par son parent référent (mère) »… */
  via: string;
  usages: readonly ImageUsageValue[];
  /** Usages de la version précédente ; null : première autorisation. */
  previousUsages: readonly ImageUsageValue[] | null;
  /** Validation par le parent : ce qu'il a changé par rapport aux souhaits du membre (vide : rien). */
  guardianChanges?: readonly string[];
}): Promise<void> {
  const to = mailReplyTo();
  if (!to || !isMailConfigured()) {
    console.log(`[droit à l'image] avis pour ${params.memberName} non envoyé (pas de boîte du club ou pas de SMTP)`);
    return;
  }
  const withdrawn = params.previousUsages
    ? params.previousUsages.filter((u) => !params.usages.includes(u))
    : [];
  const label = (list: readonly ImageUsageValue[]): string =>
    list.length ? IMAGE_USAGE_VALUES.filter((u) => list.includes(u)).map((u) => IMAGE_USAGE_LABEL[u]).join(", ") : "aucun";
  const subject = withdrawn.length
    ? `⚠ Droit à l'image : retrait d'autorisation — ${params.memberName}`
    : `Droit à l'image : nouvelle autorisation — ${params.memberName}`;
  const lines = [
    `Une nouvelle autorisation de droit à l'image a été enregistrée pour ${params.memberName}, ${params.via}.`,
    "",
    `Usages autorisés : ${label(params.usages)}.`,
    ...(params.previousUsages ? [`Version précédente : ${label(params.previousUsages)}.`] : ["Première autorisation enregistrée."]),
    ...(params.guardianChanges
      ? params.guardianChanges.length
        ? ["", "Changements du parent par rapport aux souhaits du membre :", ...params.guardianChanges.map((c) => `- ${c}`)]
        : ["", "Le parent a gardé tous les souhaits du membre."]
      : []),
    ...(withdrawn.length
      ? [
          "",
          `RETRAIT : ${label(withdrawn)}.`,
          "Les images où ce membre est reconnaissable doivent être retirées de ces supports (en ligne).",
          "Le retrait vaut pour l'avenir : les imprimés distribués et les articles parus ne sont pas rappelés.",
        ]
      : []),
    "",
    `Fiche du membre : ${siteBaseUrl()}/dashboard/users/${params.userId}`,
  ];
  await getMailTransport().sendMail({
    from: mailFrom("Droit à l'image"),
    to,
    subject,
    text: lines.join("\n"),
  });
}
