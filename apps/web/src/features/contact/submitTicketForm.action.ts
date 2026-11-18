'use server';

import { headers } from "next/headers";
import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import { getRequestIp } from "@akfc/backend/lib/security/requestIp.ts";
import { submitTicket } from "@akfc/backend/modules/tickets/submitTicket.service.ts";
import { submitTicketSchema } from "@akfc/contracts/tickets/ticket.schema.ts";
import type {
  SubmitTicketField,
  SubmitTicketFormState,
} from "#features/contact/submitTicketForm.types.ts";

/**
 * « Écrire au club » : la server action du formulaire de contact.
 *
 * Elle lit le formulaire, le valide avec le schéma partagé, puis appelle le même service que la
 * procédure tRPC ticket.submit. Le demandeur vient de la session, jamais du formulaire : un
 * membre écrit sous l'identité de son compte. Le service refuse un visiteur non connecté, et les
 * envois en rafale ; ses refus portent un message, que l'action renvoie tel quel.
 */
export async function submitTicketFormAction(
  _prevState: SubmitTicketFormState,
  formData: FormData,
): Promise<SubmitTicketFormState> {
  // FormData est une matière première : une valeur absente vaut null, on la ramène à une chaîne.
  const parsed = submitTicketSchema.safeParse({
    categoryKey: String(formData.get("categoryKey") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    body: String(formData.get("body") ?? ""),
    website: String(formData.get("website") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<SubmitTicketField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "categoryKey" || field === "subject" || field === "body") && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  const session = await getSessionFromRequest().catch(() => null);
  const h = await headers();

  try {
    const sent = await submitTicket(prisma, {
      userId: session?.user?.id ?? null,
      categoryKey: parsed.data.categoryKey,
      subject: parsed.data.subject,
      body: parsed.data.body,
      website: parsed.data.website,
      requestIp: getRequestIp(h),
    });
    return { status: "success", data: sent };
  } catch (err) {
    // Refus attendus (non connecté, envois en rafale, texte refusé) : leur message dit quoi faire.
    if (
      err instanceof TRPCError &&
      ["UNAUTHORIZED", "TOO_MANY_REQUESTS", "BAD_REQUEST"].includes(err.code) &&
      err.message !== err.code
    ) {
      return { status: "error", error: err.message };
    }
    console.error("[tickets] dépôt impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "L'envoi a échoué. Réessayez dans un instant." };
  }
}
