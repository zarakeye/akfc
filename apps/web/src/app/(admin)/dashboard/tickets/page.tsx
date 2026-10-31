"use client";

import { type JSX, useState } from "react";
import Link from "next/link";

import { trpc } from "@trpc/trpcClient";
import { STATUS_CLASS, STATUS_LABEL, dueLabel, shortDate } from "@features/tickets/ticketUi";

/**
 * Demandes — `/dashboard/tickets`.
 * Ouvert aux administrateurs et aux membres d'un groupe responsable d'une catégorie (Support…) :
 * chacun ne voit que les demandes qu'il peut traiter (filtrage côté serveur).
 */

type Scope = "open" | "mine" | "unassigned" | "closed";
const TABS: Array<{ key: Scope; label: string }> = [
  { key: "open", label: "Ouvertes" },
  { key: "mine", label: "À moi" },
  { key: "unassigned", label: "Sans responsable" },
  { key: "closed", label: "Closes" },
];

export default function TicketsPage(): JSX.Element {
  const [scope, setScope] = useState<Scope>("open");
  const access = trpc.ticket.access.useQuery();
  const inbox = trpc.ticket.inbox.useQuery({ scope }, { enabled: access.data?.canHandle === true });
  const [now] = useState(() => Date.now());

  if (access.isLoading) return <p className="p-6">Chargement…</p>;
  if (!access.data?.canHandle) {
    return <p className="p-6 text-muted-foreground">Vous ne traitez aucune catégorie de demandes.</p>;
  }
  const counts: Partial<Record<Scope, number>> = { open: access.data.open, mine: access.data.mine };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Demandes</h1>
        {access.data.overdue > 0 && (
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            {access.data.overdue} sans réponse au-delà du délai
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" data-tour="tickets.tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={scope === tab.key}
            onClick={() => setScope(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              scope === tab.key ? "bg-emerald-600 text-white" : "border border-border hover:bg-muted"
            }`}
          >
            {tab.label}
            {typeof counts[tab.key] === "number" && counts[tab.key]! > 0 && (
              <span className="ml-1.5 opacity-80">({counts[tab.key]})</span>
            )}
          </button>
        ))}
      </div>

      {inbox.isLoading ? (
        <p>Chargement…</p>
      ) : inbox.error ? (
        <p className="text-red-600">{inbox.error.message}</p>
      ) : (inbox.data ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Aucune demande ici.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {(inbox.data ?? []).map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/tickets/${t.id}`}
                data-tour="tickets.item"
                className="grid gap-1 p-4 hover:bg-muted/60 sm:grid-cols-[7rem_minmax(0,1fr)_10rem_9rem] sm:items-center sm:gap-4"
              >
                <span className="font-mono text-xs text-muted-foreground">{t.ref}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{t.subject}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t.requester.name ?? t.requester.email ?? "Membre"}
                    {!t.requester.isMember && " · visiteur"} · {t.category.label}
                    {t.messageCount > 1 && ` · ${t.messageCount} messages`}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_CLASS[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                  <span className="text-muted-foreground">{t.assignee?.name ?? "—"}</span>
                </span>
                <span className={`text-xs ${t.overdue ? "font-semibold text-red-600" : "text-muted-foreground"}`}>
                  {t.status === "CLOSED" && t.closedAt
                    ? `close le ${shortDate(t.closedAt)}`
                    : t.answered
                      ? `reçue le ${shortDate(t.createdAt)}`
                      : `réponse ${dueLabel(t.dueAt, now)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
