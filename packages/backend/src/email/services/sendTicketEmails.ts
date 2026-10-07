import { prisma } from "@backend/prisma";
import { getMailTransport, isMailConfigured, mailFrom } from "@backend/email/mailer";
import { formatTicketRef, ticketSubject } from "@backend/modules/tickets/ticketRef";

/*
 * E-mails d'une nouvelle demande, tous envoyés par l'adresse d'envoi du site (noreply@) :
 *   - accusé de réception au demandeur : référence, délai de réponse promis, copie du message ;
 *     Reply-To = adresse de la catégorie (admin@, support@), pour qu'une réponse arrive au club ;
 *   - avis au club, à l'adresse de la catégorie ; Reply-To = le demandeur (adresse du compte
 *     pour un membre connecté, adresse saisie pour un visiteur).
 * L'objet porte toujours « [AKFC-0042] » : c'est ce qui relie un e-mail à sa demande.
 */

export type TicketMailData = {
  number: number;
  subject: string;
  body: string;
  dueAt: Date;
  responseDays: number;
  category: { label: string; replyTo: string };
  requester: { email: string; name: string | null; isMember: boolean };
};

async function siteName(): Promise<string> {
  const s = await prisma.siteSettings
    .findUnique({ where: { id: "site" }, select: { shortTitle: true } })
    .catch(() => null);
  return s?.shortTitle?.trim() || process.env.APP_SHORT_NAME || "AKFC";
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function frenchDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(d);
}

/** Bloc HTML d'un message cité (texte brut, retours à la ligne conservés). */
function quotedHtml(body: string): string {
  return `<blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #10b981; background: #f6f6f6; white-space: pre-wrap;">${escapeHtml(body)}</blockquote>`;
}

function wrapHtml(inner: string): string {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #222;">${inner}</div>`;
}

export async function sendTicketAcknowledgement(t: TicketMailData): Promise<void> {
  const ref = formatTicketRef(t.number);
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] accusé de réception ${ref} → ${t.requester.email}`);
      return;
    }
    throw new Error("SMTP non configuré : accusé de réception non envoyé");
  }
  const name = await siteName();
  const hello = t.requester.name ? `Bonjour ${t.requester.name},` : "Bonjour,";
  const due = frenchDate(t.dueAt);
  await getMailTransport().sendMail({
    from: mailFrom(name),
    to: t.requester.email,
    replyTo: t.category.replyTo,
    subject: ticketSubject(t.number, t.subject),
    text: [
      hello,
      "",
      `Votre message à « ${t.category.label} » a bien été reçu. Sa référence : ${ref}.`,
      `Nous vous répondrons au plus tard le ${due} (sous ${t.responseDays} jours).`,
      "",
      "Pour compléter votre demande, répondez à cet e-mail en gardant la référence dans l'objet.",
      "",
      "Votre message :",
      "",
      t.body,
      "",
      `— ${name}`,
    ].join("\n"),
    html: wrapHtml(`
      <p>${escapeHtml(hello)}</p>
      <p>Votre message à « ${escapeHtml(t.category.label)} » a bien été reçu.
         Sa référence : <strong>${ref}</strong>.</p>
      <p>Nous vous répondrons au plus tard le <strong>${escapeHtml(due)}</strong> (sous ${t.responseDays} jours).</p>
      <p style="font-size: 13px; color: #555;">Pour compléter votre demande, répondez à cet e-mail en gardant la référence dans l'objet.</p>
      <p style="margin-top: 24px; font-weight: bold;">Votre message :</p>
      ${quotedHtml(t.body)}
      <p>— ${escapeHtml(name)}</p>`),
  });
}

export async function sendTicketNotification(t: TicketMailData): Promise<void> {
  const ref = formatTicketRef(t.number);
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] avis de nouvelle demande ${ref} → ${t.category.replyTo}`);
      return;
    }
    throw new Error("SMTP non configuré : avis de nouvelle demande non envoyé");
  }
  const name = await siteName();
  const who = t.requester.name ? `${t.requester.name} <${t.requester.email}>` : t.requester.email;
  const kind = t.requester.isMember ? "membre connecté" : "visiteur (adresse non vérifiée)";
  const due = frenchDate(t.dueAt);
  await getMailTransport().sendMail({
    from: mailFrom(`${name} — demandes`),
    to: t.category.replyTo,
    replyTo: t.requester.email,
    subject: ticketSubject(t.number, `Nouvelle demande : ${t.subject}`),
    text: [
      `Nouvelle demande ${ref} pour « ${t.category.label} ».`,
      "",
      `De : ${who} (${kind})`,
      `Objet : ${t.subject}`,
      `Réponse promise au plus tard le ${due}.`,
      "",
      t.body,
    ].join("\n"),
    html: wrapHtml(`
      <p>Nouvelle demande <strong>${ref}</strong> pour « ${escapeHtml(t.category.label)} ».</p>
      <p>De : ${escapeHtml(who)} <span style="color: #555;">(${kind})</span><br/>
         Objet : ${escapeHtml(t.subject)}<br/>
         Réponse promise au plus tard le <strong>${escapeHtml(due)}</strong>.</p>
      ${quotedHtml(t.body)}`),
  });
}
