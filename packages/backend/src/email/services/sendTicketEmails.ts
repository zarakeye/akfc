import { prisma } from "@backend/prisma";
import { getMailTransport, isMailConfigured, mailFrom, mailReplyTo, siteBaseUrl } from "@backend/email/mailer";
import { isDemoEmail } from "@backend/lib/demoAccounts";
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
  /** Identifiant de la demande : lien direct dans l'avis au club. */
  id?: string;
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
  if (isDemoEmail(t.requester.email)) return; // compte de démonstration : jamais d'e-mail
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
  const link = t.id ? `${siteBaseUrl()}/dashboard/tickets/${t.id}` : null;
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
      ...(link ? [`À traiter ici : ${link}`] : []),
      "",
      t.body,
    ].join("\n"),
    html: wrapHtml(`
      <p>Nouvelle demande <strong>${ref}</strong> pour « ${escapeHtml(t.category.label)} ».</p>
      <p>De : ${escapeHtml(who)} <span style="color: #555;">(${kind})</span><br/>
         Objet : ${escapeHtml(t.subject)}<br/>
         Réponse promise au plus tard le <strong>${escapeHtml(due)}</strong>.</p>
      ${link ? `<p style="margin: 20px 0;"><a href="${link}" style="background: #059669; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Traiter la demande</a></p>` : ""}
      ${quotedHtml(t.body)}`),
  });
}

/* ── Réponse du club ─────────────────────────────────────────────────── */

export type TicketReplyData = {
  number: number;
  subject: string;
  body: string;
  /** Signataire : le membre connecté qui répond. */
  authorName: string;
  category: { label: string; replyTo: string };
  to: { email: string; name: string | null };
  /** Dernier message du demandeur, cité sous la réponse. */
  quoted?: { body: string; createdAt: Date } | null;
};

/** Copie d'archive des réponses du site (Cci) : TICKET_ARCHIVE_BCC, sinon SMTP_REPLY_TO (contact@). */
function archiveBcc(): string | undefined {
  return process.env.TICKET_ARCHIVE_BCC?.trim() || mailReplyTo();
}

/**
 * Envoie la réponse du club au demandeur et renvoie son Message-ID (null si rien n'est parti :
 * compte de démonstration, ou SMTP absent en développement). Lève une erreur si l'envoi échoue.
 * From = noreply@ au nom de la catégorie ; Reply-To = adresse de la catégorie ; signature = le membre.
 * Le texte est envoyé tel qu'écrit (la formule d'appel est proposée par l'écran, pas ajoutée ici).
 */
export async function sendTicketReply(r: TicketReplyData): Promise<string | null> {
  const ref = formatTicketRef(r.number);
  if (isDemoEmail(r.to.email)) return null;
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] réponse ${ref} → ${r.to.email}`);
      return null;
    }
    throw new Error("SMTP non configuré : réponse non envoyée");
  }
  const name = await siteName();
  const when = r.quoted
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" }).format(r.quoted.createdAt)
    : "";
  const info = await getMailTransport().sendMail({
    from: mailFrom(`${name} — ${r.category.label}`),
    to: r.to.email,
    bcc: archiveBcc(),
    replyTo: r.category.replyTo,
    subject: `Re: ${ticketSubject(r.number, r.subject)}`,
    text: [
      r.body,
      "",
      "--",
      r.authorName,
      `${r.category.label} — ${name}`,
      `Référence ${ref} : gardez-la dans l'objet si vous répondez.`,
      ...(r.quoted ? ["", `Votre message du ${when} :`, ...r.quoted.body.split("\n").map((l) => `> ${l}`)] : []),
    ].join("\n"),
    html: wrapHtml(`
      <div style="white-space: pre-wrap;">${escapeHtml(r.body)}</div>
      <p style="margin-top: 24px; color: #555; font-size: 14px;">--<br/>
         <strong style="color: #222;">${escapeHtml(r.authorName)}</strong><br/>
         ${escapeHtml(r.category.label)} — ${escapeHtml(name)}<br/>
         <span style="font-size: 12px;">Référence ${ref} : gardez-la dans l'objet si vous répondez.</span></p>
      ${r.quoted ? `<p style="margin-top: 24px; color: #555; font-size: 13px;">Votre message du ${escapeHtml(when)} :</p>${quotedHtml(r.quoted.body)}` : ""}`),
  });
  return info.messageId ?? null;
}
