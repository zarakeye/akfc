"use client";

import type { JSX } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { IMAGE_CONSENT_LABEL } from "@akfc/contracts/legal/imageConsent.ts";
import { formatDate } from "#features/image-consent/consentFormat.ts";

/**
 * Profil : le RÉSUMÉ du droit à l'image (statut, date) et le bouton qui mène à la page dédiée,
 * /profil/droit-a-l-image, où se trouvent le formulaire en ligne, les formulaires signés et le
 * formulaire à imprimer. Tant que rien n'est enregistré, le bloc est mis en avant.
 */
export function ImageConsentSummary(): JSX.Element {
  const { data } = trpc.imageConsent.mine.useQuery();
  const aFaire = data?.consent === "UNKNOWN";

  return (
    <section
      aria-label="Mon droit à l'image"
      className={`mt-6 rounded-lg border p-4 text-sm ${aFaire ? "border-warning/40 bg-warning-muted" : "border-border"}`}
    >
      <p className="flex items-center gap-2 font-semibold">
        <Camera aria-hidden="true" className="h-4 w-4" />
        Droit à l&apos;image
      </p>
      {data && (
        <p className="mt-1">
          Votre autorisation : {IMAGE_CONSENT_LABEL[data.consent]}
          {data.recordedAt && <span className="text-muted-foreground"> (depuis le {formatDate(data.recordedAt)})</span>}
        </p>
      )}
      {aFaire && (
        <p className="mt-1 text-warning">
          Le club n&apos;a encore aucune autorisation de votre part pour vos photos et vidéos.
        </p>
      )}
      <Link
        href="/profil/droit-a-l-image"
        className="mt-3 inline-flex items-center rounded-md bg-brand px-3 py-2 font-medium text-brand-foreground hover:bg-brand/90"
      >
        {aFaire ? "Donner mon autorisation" : "Voir ou modifier mon autorisation"}
      </Link>
    </section>
  );
}
