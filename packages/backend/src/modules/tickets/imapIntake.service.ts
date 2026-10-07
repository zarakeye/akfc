import type { PrismaClient } from "@prisma/client";

import { processInboundEmail, type InboundEmail, type InboundOutcome } from "./inboundEmail";
import { sendTicketFollowUpNotification } from "@backend/email/services/sendTicketEmails";

/*
 * Relève de la boîte noreply@ (IMAP) : les réponses des demandeurs rejoignent leur demande.
 *
 * Activée seulement si TICKET_IMAP_HOST est défini. Identifiants : TICKET_IMAP_USER /
 * TICKET_IMAP_PASSWORD, sinon ceux du SMTP (même boîte noreply@). Toutes les
 * TICKET_IMAP_INTERVAL_SEC secondes (120 par défaut) :
 *   - réponse rattachée (ou déjà importée)  → dossier « Tickets traités » (TICKET_IMAP_DONE_FOLDER)
 *   - à regarder par un humain (expéditeur ≠ demandeur, demande inconnue, réponse automatique,
 *     rebond) → dossier « Tickets à vérifier » (TICKET_IMAP_REVIEW_FOLDER)
 *   - tout le reste (sans référence [AKFC-…]) reste en place, marqué d'un mot-clé pour n'être
 *     lu qu'une fois ; l'état lu / non lu n'est jamais modifié.
 * Le site ne détient que le mot de passe de noreply@ (jamais celui de contact@).
 */

const SKIP_KEYWORD = "$AkfcSkipped";

export type IntakeConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  folder: string;
  doneFolder: string;
  reviewFolder: string;
};

export function intakeConfigFromEnv(): IntakeConfig | null {
  const host = process.env.TICKET_IMAP_HOST?.trim();
  if (!host) return null;
  const port = Number.parseInt(process.env.TICKET_IMAP_PORT || "993", 10);
  const user = process.env.TICKET_IMAP_USER?.trim() || process.env.SMTP_USER?.trim() || "";
  const password = process.env.TICKET_IMAP_PASSWORD || process.env.SMTP_PASSWORD || "";
  if (!user || !password) return null;
  return {
    host,
    port,
    secure: port === 993,
    user,
    password,
    folder: process.env.TICKET_IMAP_FOLDER?.trim() || "INBOX",
    doneFolder: process.env.TICKET_IMAP_DONE_FOLDER?.trim() || "Tickets traités",
    reviewFolder: process.env.TICKET_IMAP_REVIEW_FOLDER?.trim() || "Tickets à vérifier",
  };
}

/** Vrai si la relève est configurée : les e-mails de demande invitent alors à répondre à noreply@. */
export function isTicketIntakeEnabled(): boolean {
  return intakeConfigFromEnv() !== null;
}

type Headers = Map<string, unknown>;

function headerText(h: Headers, name: string): string {
  const v = h.get(name);
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "value" in v) return String((v as { value: unknown }).value);
  return String(v);
}

/** Réponse automatique, rebond ou envoi de masse : jamais ajouté à une demande. */
export function looksAutomatic(h: Headers, fromEmail: string, contentType: string): boolean {
  const auto = headerText(h, "auto-submitted").toLowerCase();
  if (auto && auto !== "no") return true;
  if (h.has("x-autoreply") || h.has("x-autorespond") || h.has("x-autoresponse")) return true;
  if (/^(auto_reply|bulk|junk|list)$/i.test(headerText(h, "precedence").trim())) return true;
  if (/multipart\/report/i.test(contentType)) return true;
  return /^(mailer-daemon|postmaster|no-?reply)@/i.test(fromEmail);
}

export type IntakeReport = { scanned: number; added: number; duplicate: number; review: number; skipped: number };

/** Une relève. Ouvre et ferme sa propre connexion. */
export async function pollTicketMailbox(db: PrismaClient, cfg: IntakeConfig): Promise<IntakeReport> {
  const { ImapFlow } = await import("imapflow");
  const { simpleParser } = await import("mailparser");
  const client = new ImapFlow({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
    logger: false,
  });
  const report: IntakeReport = { scanned: 0, added: 0, duplicate: 0, review: 0, skipped: 0 };
  await client.connect();
  try {
    for (const folder of [cfg.doneFolder, cfg.reviewFolder]) {
      await client.mailboxCreate(folder).catch(() => undefined); // existe déjà : sans effet
    }
    const lock = await client.getMailboxLock(cfg.folder);
    try {
      const uids = (await client.search({ unKeyword: SKIP_KEYWORD }, { uid: true })) || [];
      for (const uid of uids) {
        const msg = await client.fetchOne(String(uid), { source: true }, { uid: true });
        if (!msg || !msg.source) continue;
        report.scanned++;
        const parsed = await simpleParser(msg.source);
        const from = parsed.from?.value?.[0];
        const fromEmail = (from?.address ?? "").toLowerCase();
        const refs = [
          ...(parsed.inReplyTo ? [parsed.inReplyTo] : []),
          ...(Array.isArray(parsed.references) ? parsed.references : parsed.references ? [parsed.references] : []),
        ];
        const inbound: InboundEmail = {
          messageId: parsed.messageId ?? null,
          references: refs,
          subject: parsed.subject ?? "",
          fromEmail,
          fromName: from?.name?.trim() || null,
          text: parsed.text ?? "",
          attachmentNames: (parsed.attachments ?? [])
            .filter((a) => a.contentDisposition === "attachment" || !a.related)
            .map((a) => a.filename ?? "sans nom"),
          autoReply: looksAutomatic(parsed.headers as Headers, fromEmail, headerText(parsed.headers as Headers, "content-type")),
        };
        let outcome: InboundOutcome;
        try {
          outcome = await processInboundEmail(db, inbound);
        } catch (err) {
          console.error(`[tickets/imap] message ${uid} non traité :`, err instanceof Error ? err.message : err);
          continue; // réessayé à la prochaine relève
        }
        if (outcome.kind === "added") {
          report.added++;
          await client.messageMove(String(uid), cfg.doneFolder, { uid: true });
          await notifyClub(db, outcome, inbound).catch((err) =>
            console.error(`[tickets/imap] avis au club non envoyé :`, err instanceof Error ? err.message : err),
          );
        } else if (outcome.kind === "duplicate") {
          report.duplicate++;
          await client.messageMove(String(uid), cfg.doneFolder, { uid: true });
        } else if (outcome.kind === "review") {
          report.review++;
          await client.messageMove(String(uid), cfg.reviewFolder, { uid: true });
          console.warn(`[tickets/imap] message pour la demande ${outcome.number ?? "?"} mis de côté (${outcome.reason})`);
        } else {
          report.skipped++;
          await client.messageFlagsAdd(String(uid), [SKIP_KEYWORD], { uid: true });
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
  return report;
}

async function notifyClub(
  db: PrismaClient,
  o: Extract<InboundOutcome, { kind: "added" }>,
  mail: InboundEmail,
): Promise<void> {
  const t = await db.ticket.findUniqueOrThrow({
    where: { id: o.ticketId },
    select: {
      subject: true,
      category: { select: { label: true, replyTo: true } },
      assignee: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  await sendTicketFollowUpNotification({
    id: o.ticketId,
    number: o.number,
    subject: t.subject,
    body: o.body,
    from: { email: mail.fromEmail, name: mail.fromName },
    category: t.category,
    reopened: o.reopened,
    assigneeName: t.assignee ? [t.assignee.firstName, t.assignee.lastName].filter(Boolean).join(" ").trim() || t.assignee.email : null,
  });
}

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;

/** Lance la relève périodique (au démarrage du serveur). Sans configuration : ne fait rien. */
export function startTicketMailboxPolling(db: PrismaClient): boolean {
  const cfg = intakeConfigFromEnv();
  if (!cfg || timer) return false;
  const everySec = Math.max(30, Number.parseInt(process.env.TICKET_IMAP_INTERVAL_SEC || "120", 10) || 120);
  const tick = async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      const r = await pollTicketMailbox(db, cfg);
      if (r.added || r.review) {
        console.log(`[tickets/imap] relève : ${r.added} réponse(s) ajoutée(s), ${r.review} mise(s) de côté`);
      }
    } catch (err) {
      console.error(`[tickets/imap] relève impossible (${cfg.user}@${cfg.host}) :`, err instanceof Error ? err.message : err);
    } finally {
      running = false;
    }
  };
  setTimeout(() => void tick(), 15_000);
  timer = setInterval(() => void tick(), everySec * 1000);
  return true;
}
