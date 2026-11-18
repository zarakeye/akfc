'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import { answerTicket } from "@akfc/backend/modules/tickets/answerTicket.service.ts";
import { replyTicketSchema } from "@akfc/contracts/tickets/ticket.schema.ts";
import type { ReplyTicketFormState } from "#features/tickets/reply/replyTicketForm.types.ts";

/**
 * Réponse à une demande : la server action du formulaire de la page de la demande.
 *
 * Elle valide avec le schéma partagé, lit le membre dans sa session, puis appelle le même service
 * que la procédure ticket.reply ; c'est le service qui vérifie que ce membre traite la catégorie.
 */
export async function replyTicketFormAction(
  _prevState: ReplyTicketFormState,
  formData: FormData,
): Promise<ReplyTicketFormState> {
  const parsed = replyTicketSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "body") return { status: "error", error: issue.message, fieldErrors: { body: issue.message } };
    return { status: "error", error: "Demande introuvable : rechargez la page." };
  }

  const session = await getSessionFromRequest().catch(() => null);
  if (!session?.user) return { status: "error", error: "Votre session a expiré. Reconnectez-vous." };

  try {
    const res = await answerTicket(prisma, { ticketId: parsed.data.id, userId: session.user.id, body: parsed.data.body });
    return { status: "success", data: { emailed: res.emailed } };
  } catch (err) {
    // Les refus du service (demande close, pas de droit, e-mail parti en échec) sont des phrases
    // destinées au membre : on les affiche telles quelles.
    if (err instanceof TRPCError && err.message !== err.code) return { status: "error", error: err.message };
    console.error("[tickets] réponse impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Réponse impossible. Réessayez dans un instant." };
  }
}
