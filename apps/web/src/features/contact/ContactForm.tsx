"use client";

import { type JSX, useState } from "react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import {
  TICKET_BODY_MAX,
  TICKET_SUBJECT_MAX,
} from "@contracts/tickets/ticket.schema";

/**
 * Formulaire « Écrire au club » : crée une demande (ticket.submit). RÉSERVÉ AUX MEMBRES
 * CONNECTÉS (le serveur refuse les visiteurs ; le public écrit à l'adresse du club) : on écrit
 * sous l'identité du compte, nom et adresse sont affichés, pas saisis. Rien hors connexion.
 * Le champ « website » est un piège à robots, invisible pour les humains.
 */

type Sent = { ref: string | null; dueAt: Date | null; acknowledged: boolean };

function frenchDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

export function ContactForm(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user ?? null);
  const { data: categories } = trpc.ticket.categories.useQuery();
  const submit = trpc.ticket.submit.useMutation();

  const [categoryKey, setCategoryKey] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);

  // Une seule catégorie : pas de choix à proposer.
  const effectiveKey = categoryKey || (categories?.length === 1 ? categories[0].key : "");
  const canSend =
    user !== null && effectiveKey !== "" && subject.trim() !== "" && body.trim() !== "" && !submit.isPending;

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!canSend) return;
    const res = await submit
      .mutateAsync({
        categoryKey: effectiveKey,
        subject,
        body,
        website: website || undefined,
      })
      .catch(() => null);
    if (res) {
      setSent(res);
      setSubject("");
      setBody("");
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-emerald-600/40 bg-emerald-50 p-6 text-sm dark:bg-emerald-950/30" role="status">
        <p className="text-base font-semibold">Message envoyé, merci !</p>
        {sent.ref && (
          <p className="mt-2">
            Référence : <strong>{sent.ref}</strong>
            {sent.dueAt && <> — nous vous répondrons au plus tard le {frenchDate(new Date(sent.dueAt))}.</>}
          </p>
        )}
        <p className="mt-2 text-muted-foreground">
          {sent.acknowledged
            ? "Un accusé de réception vient de vous être envoyé par e-mail (pensez à vérifier vos indésirables)."
            : "Votre message est bien enregistré, mais l'accusé de réception n'a pas pu partir : nous vous répondrons tout de même."}
        </p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-4 text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Écrire un autre message
        </button>
      </div>
    );
  }

  if (!user) return null;

  const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";
  const userName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <h2 className="text-lg font-semibold">Écrire au club</h2>

      <p className="text-sm text-muted-foreground">
        Vous écrivez en tant que <strong className="text-foreground">{userName || user.email}</strong>
        {userName && <> ({user.email})</>} : la réponse arrivera à cette adresse.
      </p>

      {categories && categories.length > 1 && (
        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">Votre message concerne <span className="text-red-600">*</span></legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((c) => (
              <label key={c.key} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  value={c.key}
                  checked={categoryKey === c.key}
                  onChange={() => setCategoryKey(c.key)}
                  className="accent-emerald-600"
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span>Objet <span className="text-red-600">*</span></span>
        <input className={field} value={subject} maxLength={TICKET_SUBJECT_MAX} onChange={(e) => setSubject(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>Message <span className="text-red-600">*</span></span>
        <textarea className={`${field} min-h-40 resize-y`} value={body} maxLength={TICKET_BODY_MAX} onChange={(e) => setBody(e.target.value)} />
      </label>

      {/* Piège à robots : hors écran, ignoré des lecteurs d'écran et du clavier. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {submit.error && (
        <p className="text-sm text-red-600" role="alert">
          {submit.error.data?.code === "TOO_MANY_REQUESTS" || submit.error.data?.code === "BAD_REQUEST"
            ? submit.error.message
            : "L'envoi a échoué. Réessayez dans un instant."}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submit.isPending ? "Envoi…" : "Envoyer"}
        </button>
        <span className="text-xs text-muted-foreground">
          Vous recevrez un accusé de réception avec la référence de votre demande.
        </span>
      </div>
    </form>
  );
}
