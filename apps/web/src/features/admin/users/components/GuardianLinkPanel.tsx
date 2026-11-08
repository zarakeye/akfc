"use client";

import type { JSX } from "react";
import { Send } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { formatDate, formatUsages } from "@features/image-consent/consentFormat";

/**
 * Fiche d'un membre mineur (admin) : la demande envoyée à son parent référent — souhaits du
 * membre, lien envoyé, validité — et « Renvoyer le lien » (lien perdu ou expiré). Rien à
 * afficher tant que le membre n'a pas indiqué ses souhaits.
 */
export function GuardianLinkPanel({ userId }: { userId: string }): JSX.Element | null {
  const utils = trpc.useUtils();
  const pending = trpc.imageConsent.guardianPendingForUser.useQuery({ userId });
  const resend = trpc.imageConsent.resendGuardianForUser.useMutation({
    onSuccess: () => utils.imageConsent.guardianPendingForUser.invalidate({ userId }),
  });
  const p = pending.data;
  if (!p) return null;

  return (
    <fieldset className="mt-6 rounded-lg border border-border p-4 text-sm">
      <legend className="px-1 font-medium">Demande au parent référent</legend>
      <p>
        Souhaits du membre : {formatUsages(p.usages)}.{" "}
        {p.sentAt ? (
          p.active ? (
            <>
              Lien envoyé à {p.sentToMasked} le {formatDate(p.sentAt)}, valable jusqu&apos;au {formatDate(p.expiresAt)} : en
              attente du parent.
            </>
          ) : (
            <span className="text-amber-800">Le lien envoyé le {formatDate(p.sentAt)} a expiré.</span>
          )
        ) : (
          <span className="text-amber-800">Aucun lien valable : l&apos;envoi a échoué.</span>
        )}
      </p>
      {resend.error && <p className="mt-2 text-red-600">{resend.error.message}</p>}
      {resend.isSuccess && <p className="mt-2 text-emerald-700">Nouveau lien envoyé à {resend.data.sentToMasked}.</p>}
      <button
        type="button"
        onClick={() => resend.mutate({ userId })}
        disabled={resend.isPending}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {resend.isPending ? "Envoi…" : "Renvoyer le lien au parent"}
      </button>
    </fieldset>
  );
}
