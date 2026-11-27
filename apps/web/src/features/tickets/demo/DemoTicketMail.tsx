"use client";

import { type JSX, useState } from "react";
import { FlaskConical, Mail, MailWarning, Send } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { useDemoMode } from "#features/demo/demoMode.ts";

/*
 * La démo seulement : ce que la boîte noreply@ et l'horloge feraient, à la demande (voir
 * demoMail.service côté serveur). Rien ne s'affiche hors de la démo, et le serveur y refuse ces
 * procédures.
 */

const SET_ASIDE: Record<string, string> = {
  "sender-mismatch":
    "Mise de côté : l'expéditeur n'est pas le demandeur. Sans cette règle, n'importe qui pourrait écrire dans une demande en recopiant sa référence. Sur le site du club, le message attend dans un dossier « à vérifier » de la boîte.",
  "auto-reply": "Mise de côté : une réponse automatique (absence, rebond) n'entre jamais dans une demande.",
  "unknown-ticket": "Mise de côté : aucune demande ne porte ce numéro.",
  empty: "Mise de côté : une fois la citation retirée, il ne restait rien.",
};

/** Sous le fil d'une demande : le demandeur répond par e-mail, ou quelqu'un d'autre. */
export function DemoTicketReply({ ticketId, onDone }: { ticketId: string; onDone: () => Promise<void> }): JSX.Element | null {
  const demo = useDemoMode();
  const [result, setResult] = useState<string | null>(null);
  const reply = trpc.ticket.demoReply.useMutation({
    onSuccess: async (r) => {
      setResult(
        r.kind === "added"
          ? `Rattachée à la demande${r.reopened ? ", qui se rouvre" : ""} : seul le nouveau texte est gardé, la citation est retirée. Le responsable en est averti (Mailpit).`
          : r.kind === "set-aside"
            ? (SET_ASIDE[r.reason] ?? "Mise de côté.")
            : "Ignorée : ce n'est pas une réponse à une demande.",
      );
      await onDone();
    },
    onError: (err) => setResult(err.message),
  });
  if (!demo) return null;
  return (
    <div className="mb-6 rounded-lg border border-dashed border-info/50 bg-info-muted p-4 text-sm" data-tour="tickets.demo">
      <p className="mb-1 inline-flex items-center gap-1.5 font-medium text-info">
        <FlaskConical className="h-4 w-4" aria-hidden />
        Démo : une réponse par e-mail
      </p>
      <p className="mb-3 text-muted-foreground">
        Sur le site du club, le demandeur répond depuis sa messagerie et le site relève la boîte noreply@. La démo n&apos;a
        pas de boîte : ces boutons fabriquent l&apos;e-mail et le confient au même traitement.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={reply.isPending}
          onClick={() => reply.mutate({ id: ticketId, fromOther: false })}
          data-tour="tickets.demo.reply"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-50"
        >
          <Mail className="h-4 w-4" aria-hidden />
          Le demandeur répond
        </button>
        <button
          type="button"
          disabled={reply.isPending}
          onClick={() => reply.mutate({ id: ticketId, fromOther: true })}
          data-tour="tickets.demo.reply-other"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-50"
        >
          <MailWarning className="h-4 w-4" aria-hidden />
          Quelqu&apos;un d&apos;autre répond
        </button>
      </div>
      {result && (
        <p className="mt-3" role="status" data-tour="tickets.demo.result">
          {result}
        </p>
      )}
    </div>
  );
}

/** En tête de la liste : le récapitulatif du matin, tout de suite. */
export function DemoTicketRecap(): JSX.Element | null {
  const demo = useDemoMode();
  const [result, setResult] = useState<string | null>(null);
  const recap = trpc.ticket.demoRecap.useMutation({
    onSuccess: (r) =>
      setResult(
        r.sent > 0
          ? `Envoyé à ${r.sent} personne${r.sent > 1 ? "s" : ""} : chacune reçoit les demandes ouvertes de ses groupes (Mailpit).`
          : "Rien à envoyer : aucune demande ouverte.",
      ),
    onError: (err) => setResult(err.message),
  });
  if (!demo) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm" data-tour="tickets.demo.recap-box">
      <button
        type="button"
        disabled={recap.isPending}
        onClick={() => recap.mutate()}
        data-tour="tickets.demo.recap"
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-info/50 bg-info-muted px-3 py-1.5 text-info hover:bg-info/10 disabled:opacity-50"
      >
        <Send className="h-4 w-4" aria-hidden />
        Démo : envoyer le récapitulatif maintenant
      </button>
      {result && (
        <span role="status" data-tour="tickets.demo.recap-result">
          {result}
        </span>
      )}
    </div>
  );
}
