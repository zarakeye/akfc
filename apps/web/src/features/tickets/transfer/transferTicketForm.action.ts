'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import { transferTicket } from "@akfc/backend/modules/tickets/tickets.service.ts";
import { transferTicketSchema } from "@akfc/contracts/tickets/ticket.schema.ts";
import type {
  TransferTicketField,
  TransferTicketFormState,
} from "#features/tickets/transfer/transferTicketForm.types.ts";

/**
 * Transfert d'une demande : la server action du formulaire « Passer le relais ».
 *
 * Elle valide avec le schéma partagé, lit le membre dans sa session, puis appelle le même service
 * que la procédure ticket.transfer, qui vérifie les droits des deux personnes.
 */
export async function transferTicketFormAction(
  _prevState: TransferTicketFormState,
  formData: FormData,
): Promise<TransferTicketFormState> {
  const parsed = transferTicketSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    toUserId: String(formData.get("toUserId") ?? ""),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Partial<Record<TransferTicketField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "toUserId" || field === "note") && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  const session = await getSessionFromRequest().catch(() => null);
  if (!session?.user) return { status: "error", error: "Votre session a expiré. Reconnectez-vous." };

  try {
    await transferTicket(prisma, parsed.data.id, session.user.id, parsed.data.toUserId, parsed.data.note);
    return { status: "success" };
  } catch (err) {
    // Les refus du service (demande close, personne déjà responsable ou hors du groupe) sont des
    // phrases destinées au membre : on les affiche telles quelles.
    if (err instanceof TRPCError && err.message !== err.code) return { status: "error", error: err.message };
    console.error("[tickets] transfert impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Transfert impossible. Réessayez dans un instant." };
  }
}
