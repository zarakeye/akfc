"use client";

import { type JSX, startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "#core/trpc/trpcClient.ts";
import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import {
  submitTicketSchema,
  TICKET_BODY_MAX,
  TICKET_SUBJECT_MAX,
} from "@akfc/contracts/tickets/ticket.schema.ts";
import { submitTicketFormAction } from "#features/contact/submitTicketForm.action.ts";
import {
  initialSubmitTicketFormState,
  type SubmitTicketFormState,
  type SubmitTicketFormValues,
} from "#features/contact/submitTicketForm.types.ts";

/**
 * Formulaire « Écrire au club », sur le modèle hybride :
 *   - React Hook Form et le schéma partagé (submitTicketSchema) signalent les champs manquants ;
 *   - useActionState relie le formulaire à la server action et suit l'envoi ;
 *   - la server action revalide et appelle le service, qui crée la demande (vérité).
 * RÉSERVÉ AUX MEMBRES CONNECTÉS (le serveur refuse les visiteurs ; le public écrit à l'adresse du
 * club) : on écrit sous l'identité du compte, nom et adresse sont affichés, pas saisis.
 * Le champ « website » est un piège à robots, invisible pour les humains.
 */

function frenchDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

export function ContactForm(): JSX.Element | null {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const user = useSessionStore((s) => s.session?.user ?? null);
  // Lire les destinataires reste une lecture tRPC : seule l'écriture passe par le formulaire.
  const { data: categories } = trpc.ticket.categories.useQuery();

  const [state, formAction, isPending] = useActionState<SubmitTicketFormState, FormData>(
    submitTicketFormAction,
    initialSubmitTicketFormState,
  );
  // « Écrire un autre message » range l'état de réussite sans le perdre : le suivant le remplacera.
  const [dismissed, setDismissed] = useState<SubmitTicketFormState | null>(null);

  const form = useForm<SubmitTicketFormValues>({
    resolver: zodResolver(submitTicketSchema),
    defaultValues: { categoryKey: "", subject: "", body: "", website: "" },
    // Erreurs au premier envoi, puis corrigées à la frappe ; pas en quittant le champ (onBlur) :
    // le message disparaîtrait au moment du clic, le bouton bougerait et le clic tomberait à côté.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setError, setValue, reset, formState } = form;

  // Une seule catégorie : pas de choix à proposer, elle est choisie d'office.
  const onlyKey = categories?.length === 1 ? categories[0].key : null;
  useEffect(() => {
    if (onlyKey) setValue("categoryKey", onlyKey);
  }, [onlyKey, setValue]);

  // Les erreurs de champ renvoyées par le serveur se rangent sous les champs, comme les locales.
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(field as keyof SubmitTicketFormValues, { type: "server", message });
    }
  }, [state, setError]);

  // Après un envoi réussi, le formulaire repart vide pour le message suivant.
  useEffect(() => {
    if (state.status === "success") reset({ categoryKey: onlyKey ?? "", subject: "", body: "", website: "" });
  }, [state, reset, onlyKey]);

  if (state.status === "success" && state !== dismissed) {
    const sent = state.data;
    return (
      <div className="rounded-lg border border-emerald-600/40 bg-emerald-50 p-6 text-sm dark:bg-emerald-950/30" role="status">
        <p className="text-base font-semibold">Message envoyé, merci !</p>
        {sent?.ref && (
          <p className="mt-2">
            Référence : <strong>{sent.ref}</strong>
            {sent.dueAt && <> — nous vous répondrons au plus tard le {frenchDate(new Date(sent.dueAt))}.</>}
          </p>
        )}
        <p className="mt-2 text-muted-foreground">
          {sent?.acknowledged !== false
            ? "Un accusé de réception vient de vous être envoyé par e-mail (pensez à vérifier vos indésirables)."
            : "Votre message est bien enregistré, mais l'accusé de réception n'a pas pu partir : nous vous répondrons tout de même."}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(state)}
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
  const errors = formState.errors;
  const otherError = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // La validation de React Hook Form est asynchrone : on suspend TOUJOURS l'envoi (un
        // preventDefault après un await arriverait trop tard), puis on le relance s'il est valide.
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        void form.trigger().then((valid) => {
          if (valid) startTransition(() => formAction(formData));
        });
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <h2 className="text-lg font-semibold">Écrire au club</h2>

      <p className="text-sm text-muted-foreground">
        Vous écrivez en tant que <strong className="text-foreground">{userName || user.email}</strong>
        {userName && <> ({user.email})</>} : la réponse arrivera à cette adresse.
      </p>

      {onlyKey && <input type="hidden" name="categoryKey" value={onlyKey} />}
      {categories && categories.length > 1 && (
        <fieldset className="flex flex-col gap-2 text-sm" data-tour="contact.form.category">
          <legend className="mb-1">Votre message concerne <span className="text-red-600">*</span></legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((c) => (
              <label key={c.key} className="inline-flex items-center gap-2">
                <input type="radio" value={c.key} className="accent-emerald-600" {...register("categoryKey")} />
                {c.label}
              </label>
            ))}
          </div>
          {errors.categoryKey && <span className="text-sm text-red-600">{errors.categoryKey.message}</span>}
        </fieldset>
      )}

      <label className="flex flex-col gap-1 text-sm" data-tour="contact.form.subject">
        <span>Objet <span className="text-red-600">*</span></span>
        <input className={field} maxLength={TICKET_SUBJECT_MAX} {...register("subject")} />
        {errors.subject && <span className="text-sm text-red-600">{errors.subject.message}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm" data-tour="contact.form.body">
        <span>Message <span className="text-red-600">*</span></span>
        <textarea className={`${field} min-h-40 resize-y`} maxLength={TICKET_BODY_MAX} {...register("body")} />
        {errors.body && <span className="text-sm text-red-600">{errors.body.message}</span>}
      </label>

      {/* Piège à robots : hors écran, ignoré des lecteurs d'écran et du clavier. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {otherError && (
        <p className="text-sm text-red-600" role="alert">
          {otherError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3" data-tour="contact.form.submit">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Envoyer"}
        </button>
        <span className="text-xs text-muted-foreground">
          Vous recevrez un accusé de réception avec la référence de votre demande.
        </span>
      </div>
    </form>
  );
}
