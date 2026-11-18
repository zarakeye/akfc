"use client";

import { startTransition, useActionState, useEffect, useState, type JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from "#core/trpc/trpcClient.ts";
import { transferTicketSchema } from "@akfc/contracts/tickets/ticket.schema.ts";
import { transferTicketFormAction } from "#features/tickets/transfer/transferTicketForm.action.ts";
import {
  initialTransferTicketFormState,
  type TransferTicketField,
  type TransferTicketFormState,
} from "#features/tickets/transfer/transferTicketForm.types.ts";

type TransferValues = { id: string; toUserId: string; note: string };

/** Le bouton « Transférer… », qui ouvre le formulaire ; refermé, le formulaire repart de zéro. */
export function TransferTicketButton({ ticketId, onDone }: { ticketId: string; onDone: () => Promise<void> }): JSX.Element {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
        Transférer…
      </button>
    );
  }
  return (
    <TransferTicketForm
      ticketId={ticketId}
      onCancel={() => setOpen(false)}
      onDone={async () => {
        setOpen(false);
        await onDone();
      }}
    />
  );
}

/**
 * Passer le relais (page d'une demande), sur le modèle hybride : React Hook Form et le schéma
 * partagé dans le navigateur, server action transferTicketFormAction pour l'enregistrement.
 * La personne choisie doit traiter la catégorie, et une note est obligatoire.
 */
function TransferTicketForm({
  ticketId,
  onCancel,
  onDone,
}: {
  ticketId: string;
  onCancel: () => void;
  onDone: () => Promise<void>;
}): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const handlers = trpc.ticket.handlers.useQuery({ id: ticketId });

  const [state, formAction, isPending] = useActionState<TransferTicketFormState, FormData>(
    transferTicketFormAction,
    initialTransferTicketFormState,
  );

  const form = useForm<TransferValues>({
    resolver: zodResolver(transferTicketSchema),
    defaultValues: { id: ticketId, toUserId: "", note: "" },
    // Erreurs au premier envoi, puis corrigées à la frappe (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setError, formState } = form;

  useEffect(() => {
    if (state.status === "success") {
      void onDone();
      return;
    }
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [name, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(name as TransferTicketField, { type: "server", message });
    }
  }, [state, onDone, setError]);

  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;

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
      noValidate
      className="w-full rounded-md border border-border p-3"
    >
      <input type="hidden" {...register("id")} />
      <p className="mb-2 text-sm font-medium">Passer le relais</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          aria-label="Personne qui reprend la demande"
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          {...register("toUserId")}
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
          aria-label="Note pour la personne"
          placeholder="Note pour la personne (obligatoire)"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          {...register("note")}
        />
      </div>
      {formState.errors.toUserId && <p className="mt-1 text-sm text-red-600">{formState.errors.toUserId.message}</p>}
      {formState.errors.note && <p className="mt-1 text-sm text-red-600">{formState.errors.note.message}</p>}
      <p className="mt-1 text-xs text-muted-foreground">Le délai de réponse promis au demandeur ne change pas.</p>
      {errMsg && <p className="mt-1 text-sm text-red-600">{errMsg}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Transférer
        </button>
        <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-sm hover:bg-muted">
          Annuler
        </button>
      </div>
    </form>
  );
}
