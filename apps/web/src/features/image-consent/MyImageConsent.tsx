"use client";

import { useState, type JSX } from "react";
import { Eye } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { IMAGE_CONSENT_LABEL } from "@akfc/contracts/legal/imageConsent.ts";
import { BlankConsentFormCard } from "#features/image-consent/BlankConsentFormCard.tsx";
import { ImageConsentFormViewer, type ViewableConsentForm } from "#features/image-consent/ImageConsentFormViewer.tsx";
import { formatDate, formatKeepAfterLeave, formatUsages } from "#features/image-consent/consentFormat.ts";
import { OnlineConsentForm } from "#features/image-consent/OnlineConsentForm.tsx";

/**
 * Profil : droit à l'image du membre connecté — statut, formulaires signés déposés par le club
 * (aperçu au clic, téléchargeables), et formulaire vierge en consultation seule.
 */
export function MyImageConsent(): JSX.Element {
  const { data } = trpc.imageConsent.mine.useQuery();
  const [open, setOpen] = useState<ViewableConsentForm | null>(null);
  const latest = data?.forms[0] ?? null;

  return (
    <div className="mt-6 space-y-3">
      <BlankConsentFormCard />
      {data && (
        <OnlineConsentForm
          key={latest?.id ?? "none"}
          latest={latest ? { usages: latest.usages, keepAfterLeave: latest.keepAfterLeave } : null}
        />
      )}
      {data && (
        <div className="rounded-lg border border-border p-4 text-sm">
          <p>
            <span className="font-semibold">Votre autorisation : </span>
            {IMAGE_CONSENT_LABEL[data.consent]}
            {data.recordedAt && <span className="text-muted-foreground"> (depuis le {formatDate(data.recordedAt)})</span>}
          </p>
          {latest && (
            <p className="mt-1 text-muted-foreground">
              Usages autorisés : {formatUsages(latest.usages)}
              {formatKeepAfterLeave(latest.keepAfterLeave) && <> ; {formatKeepAfterLeave(latest.keepAfterLeave)}</>}.
            </p>
          )}
          {data.forms.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {data.forms.map((f, i) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(f)}
                    className="inline-flex items-center gap-1.5 text-success hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    {i === 0 ? "Voir l'autorisation en vigueur" : "Version précédente"}
                    {f.signedAt ? ` du ${formatDate(f.signedAt)}` : `, déposé le ${formatDate(f.createdAt)}`}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-muted-foreground">Le club n&apos;a pas encore enregistré de formulaire signé.</p>
          )}
          <p className="mt-3 text-muted-foreground">
            Pour changer d&apos;avis, remettez un nouveau formulaire ou écrivez à contact@akfc.fr.
          </p>
        </div>
      )}
      <ImageConsentFormViewer form={open} onClose={() => setOpen(null)} />
    </div>
  );
}
