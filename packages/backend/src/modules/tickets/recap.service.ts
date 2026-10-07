import type { PrismaClient } from "@prisma/client";

import { getMailTransport, isMailConfigured, mailFrom, siteBaseUrl } from "@backend/email/mailer";
import { formatTicketRef } from "./ticketRef";

/*
 * Récapitulatif quotidien des demandes, envoyé à l'ADRESSE DE CHAQUE CATÉGORIE (admin@, support@ ;
 * jamais aux boîtes personnelles). Il sert aussi de relance : les demandes en retard ou proches de
 * leur échéance y figurent en tête.
 *
 * Contenu : ce qui attend le CLUB (en retard, échéance sous 48 h, autres demandes en attente ou en
 * cours) ; les demandes « répondues » (la balle est chez le demandeur) ne sont que comptées.
 * Rien à faire pour le club ⇒ pas d'e-mail.
 *
 * Planification (startTicketRecapSchedule) : chaque jour à TICKET_RECAP_HOUR heures, heure de
 * Paris (8 par défaut). TICKET_RECAP_DISABLED=1 désactive. Sans stockage : un redémarrage
 * pendant le quart d'heure d'envoi peut, au pire, doubler le récapitulatif de ce jour-là.
 */

const SOON_MS = 48 * 3600 * 1000;

export type RecapItem = {
  id: string;
  ref: string;
  subject: string;
  requester: string;
  assignee: string | null;
  dueAt: Date;
  categoryLabel: string;
};

export type Recap = {
  to: string;
  overdue: RecapItem[];
  dueSoon: RecapItem[];
  pending: RecapItem[];
  answeredCount: number;
};

function personName(u: { firstName: string | null; lastName: string | null; email: string }): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

/** Récapitulatifs par adresse de catégorie (seulement ceux qui demandent une action). */
export async function buildTicketRecaps(db: PrismaClient, now = new Date()): Promise<Recap[]> {
  const open = await db.ticket.findMany({
    where: { status: { not: "CLOSED" }, category: { isActive: true } },
    orderBy: { dueAt: "asc" },
    select: {
      id: true, number: true, subject: true, status: true, dueAt: true, firstResponseAt: true,
      requesterName: true, requesterEmail: true,
      category: { select: { label: true, replyTo: true } },
      assignee: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  const byAddress = new Map<string, Recap>();
  for (const t of open) {
    const to = t.category.replyTo.toLowerCase();
    const r = byAddress.get(to) ?? { to, overdue: [], dueSoon: [], pending: [], answeredCount: 0 };
    byAddress.set(to, r);
    if (t.status === "ANSWERED") { r.answeredCount++; continue; }
    const item: RecapItem = {
      id: t.id,
      ref: formatTicketRef(t.number),
      subject: t.subject,
      requester: t.requesterName ?? t.requesterEmail,
      assignee: t.assignee ? personName(t.assignee) : null,
      dueAt: t.dueAt,
      categoryLabel: t.category.label,
    };
    const unanswered = t.firstResponseAt === null;
    if (unanswered && t.dueAt.getTime() < now.getTime()) r.overdue.push(item);
    else if (unanswered && t.dueAt.getTime() - now.getTime() <= SOON_MS) r.dueSoon.push(item);
    else r.pending.push(item);
  }
  return [...byAddress.values()].filter((r) => r.overdue.length + r.dueSoon.length + r.pending.length > 0);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function dueText(d: Date, now: Date): string {
  const days = Math.round((d.getTime() - now.getTime()) / (24 * 3600 * 1000));
  const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(d);
  if (days < 0) return `échéance dépassée depuis le ${date}`;
  if (days === 0) return "échéance aujourd'hui";
  return `échéance le ${date}`;
}

export function recapSubject(r: Recap, siteName: string): string {
  const parts: string[] = [];
  if (r.overdue.length) parts.push(`${r.overdue.length} en retard`);
  const todo = r.dueSoon.length + r.pending.length;
  if (todo) parts.push(`${todo} à traiter`);
  return `${siteName} — demandes : ${parts.join(", ")}`;
}

export function renderRecap(r: Recap, siteName: string, now = new Date()): { text: string; html: string } {
  const base = siteBaseUrl();
  const sections: Array<[string, RecapItem[], string]> = [
    ["En retard (aucune réponse dans le délai promis)", r.overdue, "#dc2626"],
    ["Échéance dans les 48 heures", r.dueSoon, "#d97706"],
    ["Autres demandes qui attendent le club", r.pending, "#374151"],
  ];
  const line = (i: RecapItem): string =>
    `- ${i.ref} · ${i.subject} — ${i.requester} · ${i.assignee ? `responsable : ${i.assignee}` : "SANS RESPONSABLE"} · ${dueText(i.dueAt, now)}\n  ${base}/dashboard/tickets/${i.id}`;
  const text = [
    "Bonjour,",
    "",
    "Voici les demandes adressées au club qui attendent une action.",
    ...sections.filter(([, items]) => items.length).flatMap(([title, items]) => ["", `${title} :`, ...items.map(line)]),
    ...(r.answeredCount ? ["", `Par ailleurs, ${r.answeredCount} demande(s) répondue(s) attendent le retour du demandeur.`] : []),
    "",
    `Toutes les demandes : ${base}/dashboard/tickets`,
    "",
    `— ${siteName} (récapitulatif automatique, envoyé seulement quand une action est attendue)`,
  ].join("\n");
  const row = (i: RecapItem): string => `
    <tr>
      <td style="padding: 6px 8px; white-space: nowrap;"><a href="${base}/dashboard/tickets/${i.id}" style="color: #059669;">${i.ref}</a></td>
      <td style="padding: 6px 8px;">${escapeHtml(i.subject)}<br/><span style="color: #555; font-size: 12px;">${escapeHtml(i.requester)} · ${escapeHtml(i.categoryLabel)}</span></td>
      <td style="padding: 6px 8px; font-size: 12px;">${i.assignee ? escapeHtml(i.assignee) : '<strong style="color: #dc2626;">sans responsable</strong>'}</td>
      <td style="padding: 6px 8px; font-size: 12px; white-space: nowrap;">${escapeHtml(dueText(i.dueAt, now))}</td>
    </tr>`;
  const html = `<div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; color: #222;">
    <p>Bonjour,</p>
    <p>Voici les demandes adressées au club qui attendent une action.</p>
    ${sections
      .filter(([, items]) => items.length)
      .map(([title, items, color]) => `<h3 style="color: ${color}; margin: 24px 0 8px;">${escapeHtml(title)} (${items.length})</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">${items.map(row).join("")}</table>`)
      .join("")}
    ${r.answeredCount ? `<p style="margin-top: 20px; color: #555;">Par ailleurs, ${r.answeredCount} demande(s) répondue(s) attendent le retour du demandeur.</p>` : ""}
    <p style="margin: 24px 0;"><a href="${base}/dashboard/tickets" style="background: #059669; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Toutes les demandes</a></p>
    <p style="font-size: 12px; color: #777;">${escapeHtml(siteName)} — récapitulatif automatique, envoyé seulement quand une action est attendue.</p>
  </div>`;
  return { text, html };
}

/** Envoie les récapitulatifs du moment. Renvoie le nombre d'e-mails partis. */
export async function sendTicketRecaps(db: PrismaClient, now = new Date()): Promise<number> {
  const recaps = await buildTicketRecaps(db, now);
  if (recaps.length === 0) return 0;
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV !== "production") console.log(`[DEV] récapitulatif des demandes → ${recaps.map((r) => r.to).join(", ")}`);
    return 0;
  }
  const s = await db.siteSettings.findUnique({ where: { id: "site" }, select: { shortTitle: true } }).catch(() => null);
  const siteName = s?.shortTitle?.trim() || process.env.APP_SHORT_NAME || "AKFC";
  let sent = 0;
  for (const r of recaps) {
    const { text, html } = renderRecap(r, siteName, now);
    try {
      await getMailTransport().sendMail({ from: mailFrom(`${siteName} — demandes`), to: r.to, subject: recapSubject(r, siteName), text, html });
      sent++;
    } catch (err) {
      console.error(`[tickets/recap] récapitulatif pour ${r.to} non envoyé :`, err instanceof Error ? err.message : err);
    }
  }
  return sent;
}

/** Date (AAAA-MM-JJ), heure et minute à Paris. */
export function parisClock(d: Date): { day: string; hour: number; minute: number } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute) };
}

/** Vrai si c'est le moment d'envoyer (quart d'heure suivant l'heure prévue) et que ce jour n'est pas déjà fait. */
export function isRecapDue(now: Date, hour: number, lastDay: string | null): boolean {
  const c = parisClock(now);
  return c.hour === hour && c.minute < 15 && c.day !== lastDay;
}

let recapTimer: ReturnType<typeof setInterval> | null = null;

export function startTicketRecapSchedule(db: PrismaClient): { started: boolean; hour: number } {
  const hour = Math.min(23, Math.max(0, Number.parseInt(process.env.TICKET_RECAP_HOUR || "8", 10) || 8));
  if (process.env.TICKET_RECAP_DISABLED === "1" || recapTimer) return { started: false, hour };
  let lastDay: string | null = null;
  let busy = false;
  recapTimer = setInterval(() => {
    const now = new Date();
    if (busy || !isRecapDue(now, hour, lastDay)) return;
    busy = true;
    lastDay = parisClock(now).day;
    sendTicketRecaps(db, now)
      .then((n) => { if (n) console.log(`[tickets/recap] ${n} récapitulatif(s) envoyé(s)`); })
      .catch((err) => console.error("[tickets/recap] échec :", err instanceof Error ? err.message : err))
      .finally(() => { busy = false; });
  }, 60_000);
  return { started: true, hour };
}
