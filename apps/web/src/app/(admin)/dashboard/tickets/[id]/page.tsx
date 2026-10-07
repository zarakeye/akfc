"use client";

import { type JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { EVENT_LABEL, STATUS_CLASS, STATUS_LABEL, dateTime, dueLabel } from "@features/tickets/ticketUi";

/**
 * Une demande — `/dashboard/tickets/[id]` : fil des messages, réponse signée, prise en charge,
 * transfert (note obligatoire), clôture / réouverture, historique.
 */
export default function TicketPage({ params }: { params: Promise<{ id: string }> }): JSX.Element {
  const { id } = use(params);
  const utils = trpc.useUtils();
  const me = useSessionStore((s) => s.session?.user?.id ?? null);
  const ticket = trpc.ticket.get.useQuery({ id });
  const [now] = useState(() => Date.now());

  const refresh = async (): Promise<void> => {
    await Promise.all([utils.ticket.get.invalidate({ id }), utils.ticket.inbox.invalidate(), utils.ticket.access.invalidate()]);
  };
  const take = trpc.ticket.take.useMutation({ onSuccess: refresh });
  const close = trpc.ticket.close.useMutation({ onSuccess: refresh });
  const reopen = trpc.ticket.reopen.useMutation({ onSuccess: refresh });

  if (ticket.isLoading) return <p className="p-6">Chargement…</p>;
  if (ticket.error || !ticket.data) {
    return <p className="p-6 text-red-600">{ticket.error?.message ?? "Demande introuvable."}</p>;
  }
  const t = ticket.data;
  const closed = t.status === "CLOSED";
  const actionError = take.error ?? close.error ?? reopen.error;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <Link href="/dashboard/tickets" className="mb-4 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline dark:text-emerald-400">
        <ArrowLeft className="h-4 w-4" /> Toutes les demandes
      </Link>

      <header className="mb-6 rounded-lg border border-border p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono text-muted-foreground">{t.ref}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[t.status]}`}>{STATUS_LABEL[t.status]}</span>
          <span className="text-muted-foreground">· {t.category.label}</span>
        </div>
        <h1 className="mt-2 text-xl font-bold sm:text-2xl">{t.subject}</h1>
        <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="inline text-muted-foreground">De : </dt>
            <dd className="inline">
              {t.requester.name ? `${t.requester.name} — ` : ""}
              {t.requester.email}
              {!t.requester.isMember && <span className="text-muted-foreground"> (visiteur, adresse non vérifiée)</span>}
            </dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">Responsable : </dt>
            <dd className="inline">{t.assignee ? (t.assignee.id === me ? "vous" : t.assignee.name) : "personne"}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">Reçue : </dt>
            <dd className="inline">{dateTime(t.createdAt)}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">Première réponse : </dt>
            <dd className={`inline ${t.overdue ? "font-semibold text-red-600" : ""}`}>
              {t.firstResponseAt ? dateTime(t.firstResponseAt) : `attendue ${dueLabel(t.dueAt, now)} (${dateTime(t.dueAt)})`}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          {!closed && t.assignee?.id !== me && (
            <button
              onClick={() => take.mutate({ id })}
              disabled={take.isPending}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Prendre en charge
            </button>
          )}
          {!closed && <TransferButton ticketId={id} onDone={refresh} />}
          {closed ? (
            <button
              onClick={() => reopen.mutate({ id })}
              disabled={reopen.isPending}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Rouvrir
            </button>
          ) : (
            <button
              onClick={() => close.mutate({ id })}
              disabled={close.isPending}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              Clore la demande
            </button>
          )}
        </div>
        {actionError && <p className="mt-2 text-sm text-red-600">{actionError.message}</p>}
      </header>

      <ol className="mb-6 flex flex-col gap-4">
        {t.messages.map((m) => (
          <li
            key={m.id}
            className={`max-w-[92%] rounded-lg border p-4 sm:max-w-[80%] ${
              m.direction === "OUT"
                ? "self-end border-emerald-600/40 bg-emerald-50 dark:bg-emerald-950/30"
                : "self-start border-border bg-background"
            }`}
          >
            <p className="mb-2 text-xs text-muted-foreground">
              <strong className="text-foreground">{m.authorName ?? m.fromEmail ?? "—"}</strong>
              {m.direction === "OUT" ? " · réponse du club" : ""} · {dateTime(m.createdAt)}
            </p>
            <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
          </li>
        ))}
      </ol>

      {closed ? (
        <p className="mb-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Demande close. Si le demandeur écrit de nouveau, elle se rouvrira ; vous pouvez aussi la rouvrir pour lui répondre.
        </p>
      ) : (
        <ReplyBox ticketId={id} requesterName={t.requester.name} replyTo={t.category.replyTo} onDone={refresh} />
      )}

      <details className="rounded-lg border border-border p-4 text-sm">
        <summary className="cursor-pointer font-medium">Historique</summary>
        <ul className="mt-3 flex flex-col gap-2">
          {t.events.map((e) => (
            <li key={e.id} className="flex flex-wrap gap-x-2">
              <span className="text-muted-foreground">{dateTime(e.createdAt)}</span>
              <span>
                {EVENT_LABEL[e.type] ?? e.type}
                {e.actorName && ` par ${e.actorName}`}
                {e.toUserName && ` à ${e.toUserName}`}
              </span>
              {e.note && <span className="w-full pl-4 italic text-muted-foreground">« {e.note} »</span>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function ReplyBox({
  ticketId,
  requesterName,
  replyTo,
  onDone,
}: {
  ticketId: string;
  requesterName: string | null;
  replyTo: string;
  onDone: () => Promise<void>;
}): JSX.Element {
  const greeting = requesterName ? `Bonjour ${requesterName},\n\n` : "Bonjour,\n\n";
  const [body, setBody] = useState(greeting);
  const [notice, setNotice] = useState<string | null>(null);
  const mailIntake = trpc.ticket.access.useQuery().data?.mailIntake === true;
  const reply = trpc.ticket.reply.useMutation({
    onSuccess: async (res) => {
      setBody(greeting);
      setNotice(res.emailed ? "Réponse envoyée." : "Réponse enregistrée (aucun e-mail : compte de démonstration ou envoi désactivé).");
      await onDone();
    },
  });
  const empty = body.trim() === "" || body.trim() === greeting.trim();

  return (
    <form
      className="mb-6 rounded-lg border border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setNotice(null);
        if (!empty) reply.mutate({ id: ticketId, body });
      }}
    >
      <label className="mb-2 block text-sm font-medium" htmlFor="ticket-reply">
        Répondre
      </label>
      <textarea
        id="ticket-reply"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-44 w-full resize-y rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Envoyé par e-mail depuis l&apos;adresse du site, signé de votre nom.{" "}
        {mailIntake
          ? "S'il répond à cet e-mail, sa réponse s'ajoutera ici."
          : `S'il répond, sa réponse arrivera à ${replyTo}.`}
      </p>
      {reply.error && <p className="mt-2 text-sm text-red-600">{reply.error.message}</p>}
      {notice && <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}
      <button
        type="submit"
        disabled={empty || reply.isPending}
        className="mt-3 rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {reply.isPending ? "Envoi…" : "Envoyer la réponse"}
      </button>
    </form>
  );
}

function TransferButton({ ticketId, onDone }: { ticketId: string; onDone: () => Promise<void> }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [toUserId, setToUserId] = useState("");
  const [note, setNote] = useState("");
  const handlers = trpc.ticket.handlers.useQuery({ id: ticketId }, { enabled: open });
  const transfer = trpc.ticket.transfer.useMutation({
    onSuccess: async () => {
      setOpen(false);
      setToUserId("");
      setNote("");
      await onDone();
    },
  });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
        Transférer…
      </button>
    );
  }
  return (
    <div className="w-full rounded-md border border-border p-3">
      <p className="mb-2 text-sm font-medium">Passer le relais</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="">Choisir une personne…</option>
          {(handlers.data ?? [])
            .filter((h) => !h.isSelf)
            .map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note pour la personne (obligatoire)"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Le délai de réponse promis au demandeur ne change pas.</p>
      {transfer.error && <p className="mt-1 text-sm text-red-600">{transfer.error.message}</p>}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => transfer.mutate({ id: ticketId, toUserId, note })}
          disabled={!toUserId || note.trim() === "" || transfer.isPending}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Transférer
        </button>
        <button onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-sm hover:bg-muted">
          Annuler
        </button>
      </div>
    </div>
  );
}
