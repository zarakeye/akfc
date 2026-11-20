"use client";

import type { JSX } from "react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { formatDate } from "#features/image-consent/consentFormat.ts";

/**
 * Profil d'un membre MINEUR : il ne modifie pas sa date de naissance, il demande à son parent
 * référent de la renseigner, la corriger ou l'effacer. Le parent reçoit un lien personnel ; la
 * demande en cours est rappelée ici.
 */
export function AskGuardianBirthDate({ hasDate }: { hasDate: boolean }): JSX.Element {
  const utils = trpc.useUtils();
  const pending = trpc.imageConsent.birthDateRequestMine.useQuery();
  const ask = trpc.imageConsent.requestBirthDate.useMutation({
    onSuccess: () => utils.imageConsent.birthDateRequestMine.invalidate(),
  });
  const sent = pending.data;
  return (
    <div className="space-y-1 rounded-md border border-border p-3 text-xs">
      <p className="text-muted-foreground">
        C&apos;est votre parent référent qui {hasDate ? "corrige votre date de naissance (ou l'efface)" : "renseigne votre date de naissance"}.
      </p>
      {sent && (
        <p role="status" className="text-success">
          Demande envoyée à {sent.sentToMasked} ; son lien est valable jusqu&apos;au {formatDate(sent.expiresAt)}.
        </p>
      )}
      <button
        type="button"
        onClick={() => ask.mutate()}
        disabled={ask.isPending}
        className="rounded-md border border-border px-2 py-1 font-medium hover:bg-muted disabled:opacity-50"
      >
        {ask.isPending
          ? "Envoi…"
          : `${sent ? "Renvoyer" : "Demander"} à mon parent de ${hasDate ? "corriger" : "renseigner"} ma date de naissance`}
      </button>
      {ask.error && <p className="text-destructive">{ask.error.message}</p>}
    </div>
  );
}
