"use client";

import { type JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import { EVENT_LABEL, STATUS_CLASS, STATUS_LABEL, dateTime, dueLabel } from "#features/tickets/ticketUi.ts";
import { ReplyTicketForm } from "#features/tickets/reply/ReplyTicketForm.tsx";
import { TransferTicketButton } from "#features/tickets/transfer/TransferTicketForm.tsx";

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

        <div className="mt-4 flex flex-wrap gap-2" data-tour="tickets.actions">
          {!closed && t.assignee?.id !== me && (
            <button
              onClick={() => take.mutate({ id })}
              disabled={take.isPending}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Prendre en charge
            </button>
          )}
          {!closed && <TransferTicketButton ticketId={id} onDone={refresh} />}
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
        <ReplyTicketForm ticketId={id} requesterName={t.requester.name} replyTo={t.category.replyTo} onDone={refresh} />
      )}

      <details className="rounded-lg border border-border p-4 text-sm" data-tour="tickets.history">
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
