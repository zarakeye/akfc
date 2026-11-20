"use client";

import { startTransition, useActionState, useEffect, type JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "#core/trpc/trpcClient.ts";
import { replyTicketSchema } from "@akfc/contracts/tickets/ticket.schema.ts";
import { replyTicketFormAction } from "#features/tickets/reply/replyTicketForm.action.ts";
import {
  initialReplyTicketFormState,
  type ReplyTicketFormState,
} from "#features/tickets/reply/replyTicketForm.types.ts";

type ReplyValues = { id: string; body: string };

/**
 * Réponse au demandeur (page d'une demande), sur le modèle hybride : React Hook Form et le
 * schéma partagé dans le navigateur, server action replyTicketFormAction pour l'envoi. Le texte
 * commence par une formule d'appel ; laissée seule, elle ne fait pas une réponse.
 */
export function ReplyTicketForm({
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
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const greeting = requesterName ? `Bonjour ${requesterName},\n\n` : "Bonjour,\n\n";
  const mailIntake = trpc.ticket.access.useQuery().data?.mailIntake === true;

  const [state, formAction, isPending] = useActionState<ReplyTicketFormState, FormData>(
    replyTicketFormAction,
    initialReplyTicketFormState,
  );

  // Le schéma partagé, plus une règle propre à ce formulaire : la formule d'appel seule est vide.
  const schema = replyTicketSchema.refine((v) => v.body.trim() !== greeting.trim(), {
    path: ["body"],
    message: "Écrivez votre réponse.",
  });
  const form = useForm<ReplyValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: ticketId, body: greeting },
    // Erreurs au premier envoi, puis corrigées à la frappe (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, reset, setError, formState } = form;

  useEffect(() => {
    if (state.status === "success") {
      reset({ id: ticketId, body: greeting });
      void onDone();
      return;
    }
    if (state.status === "error" && state.fieldErrors?.body) {
      setError("body", { type: "server", message: state.fieldErrors.body });
    }
  }, [state, reset, setError, onDone, ticketId, greeting]);

  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;
  // Le compte rendu du dernier envoi, effacé dès qu'un nouvel envoi part.
  const notice =
    state.status === "success" && !isPending
      ? state.data?.emailed
        ? "Réponse envoyée."
        : "Réponse enregistrée (aucun e-mail : compte de démonstration ou envoi désactivé)."
      : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Lu tout de suite, tant que l'évènement est disponible.
        const formData = new FormData(e.currentTarget);
        // handleSubmit arrête l'envoi natif, valide, et ne relance l'action que si tout est valide.
        void form.handleSubmit(() => startTransition(() => formAction(formData)))(e);
      }}
      noValidate
      className="mb-6 rounded-lg border border-border p-4"
      data-tour="tickets.reply"
    >
      <input type="hidden" {...register("id")} />
      <label className="mb-2 block text-sm font-medium" htmlFor="ticket-reply">
        Répondre
      </label>
      <textarea
        id="ticket-reply"
        className="min-h-44 w-full resize-y rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        {...register("body")}
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Envoyé par e-mail depuis l&apos;adresse du site, signé de votre nom.{" "}
        {mailIntake
          ? "S'il répond à cet e-mail, sa réponse s'ajoutera ici."
          : `S'il répond, sa réponse arrivera à ${replyTo}.`}
      </p>
      {formState.errors.body && <p className="mt-2 text-sm text-destructive">{formState.errors.body.message}</p>}
      {errMsg && <p className="mt-2 text-sm text-destructive">{errMsg}</p>}
      {notice && <p className="mt-2 text-sm text-success">{notice}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mt-3 rounded-md bg-brand px-5 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Envoi…" : "Envoyer la réponse"}
      </button>
    </form>
  );
}
