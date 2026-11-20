"use client";

import type { JSX } from "react";
import { Check, X } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import {
  IMAGE_CONSENT_LABEL,
  IMAGE_CONSENT_SOURCE_LABEL,
  IMAGE_USAGE_LABEL,
  IMAGE_USAGE_VALUES,
  type ImageConsentValue,
} from "@akfc/contracts/legal/imageConsent.ts";
import { formatDate, formatKeepAfterLeave } from "#features/image-consent/consentFormat.ts";
import { ImageConsentControl } from "#features/admin/users/components/ImageConsentControl.tsx";
import { GuardianLinkPanel } from "#features/admin/users/components/GuardianLinkPanel.tsx";
import { ImageConsentForms } from "#features/admin/users/components/ImageConsentForms.tsx";

/**
 * Fiche d'un membre (admin) : LE droit à l'image, en une seule section.
 *
 * 1. Ce qui est en vigueur, usage par usage (oui / non), d'après le formulaire le plus récent :
 *    qui l'a donné (le membre, son parent, un formulaire papier) et quand.
 * 2. Pour un mineur, la demande en cours auprès de son parent.
 * 3. L'historique des formulaires, et le dépôt d'un formulaire papier.
 * 4. En dernier recours, la correction du statut à la main.
 */
export function ImageRightsSection({
  userId,
  consent,
  recordedAt,
}: {
  userId: string;
  consent: ImageConsentValue;
  recordedAt: string | null;
}): JSX.Element {
  const list = trpc.imageConsent.listForUser.useQuery({ userId });
  const latest = list.data?.[0] ?? null;

  return (
    <section aria-label="Droit à l'image" className="mt-6 rounded-lg border border-border p-4 text-sm">
      <h3 className="font-medium">Droit à l&apos;image</h3>

      <div className="mt-2" aria-label="En vigueur" role="group">
        {latest ? (
          <>
            <p className="text-muted-foreground">
              En vigueur : {IMAGE_CONSENT_SOURCE_LABEL[latest.source]}
              {latest.signerName && ` (${latest.signerName}${latest.signerQuality ? `, ${latest.signerQuality}` : ""})`},{" "}
              {latest.source !== "PAPER"
                ? `confirmé le ${formatDate(latest.createdAt)}`
                : latest.signedAt
                  ? `signé le ${formatDate(latest.signedAt)}`
                  : `déposé le ${formatDate(latest.createdAt)}`}
              .
            </p>
            <table className="mt-2 w-full max-w-md text-left">
              <tbody>
                {IMAGE_USAGE_VALUES.map((u) => {
                  const oui = latest.usages.includes(u);
                  return (
                    <tr key={u} className="border-b border-border last:border-0">
                      <th scope="row" className="py-1 pr-3 font-normal">
                        {IMAGE_USAGE_LABEL[u]}
                      </th>
                      <td className={`py-1 font-medium ${oui ? "text-success" : "text-destructive"}`}>
                        <span className="inline-flex items-center gap-1">
                          {oui ? <Check aria-hidden="true" className="h-4 w-4" /> : <X aria-hidden="true" className="h-4 w-4" />}
                          {oui ? "Oui" : "Non"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {formatKeepAfterLeave(latest.keepAfterLeave) && (
              <p className="mt-2 text-muted-foreground">Après le départ : {formatKeepAfterLeave(latest.keepAfterLeave)}.</p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            Aucun formulaire : {IMAGE_CONSENT_LABEL[consent].toLowerCase()}
            {recordedAt && ` (depuis le ${new Date(recordedAt).toLocaleDateString("fr-FR")})`}.
          </p>
        )}
      </div>

      <GuardianLinkPanel userId={userId} />
      <ImageConsentForms userId={userId} />

      <details className="mt-4">
        <summary className="cursor-pointer text-muted-foreground">Corriger le statut à la main</summary>
        <ImageConsentControl key={`${consent}-${recordedAt ?? ""}`} userId={userId} initial={consent} recordedAt={recordedAt} />
      </details>
    </section>
  );
}
