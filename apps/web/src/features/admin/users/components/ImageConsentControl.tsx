"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";

import { trpc } from "@trpc/trpcClient";
import { IMAGE_CONSENT_LABEL, IMAGE_CONSENT_VALUES, type ImageConsentValue } from "@contracts/legal/imageConsent";

/**
 * Fiche d'un utilisateur (admin) : droit à l'image. L'autorisation est recueillie par le club (par
 * écrit, celle des parents pour un mineur) ; on note ici sa réponse et la date de saisie.
 */
export function ImageConsentControl({
  userId,
  initial,
  recordedAt,
}: {
  userId: string;
  initial: ImageConsentValue;
  recordedAt: string | null;
}): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [value, setValue] = useState<ImageConsentValue>(initial);
  const save = trpc.user.setImageConsent.useMutation({
    onSuccess: async () => {
      await utils.user.getAll.invalidate();
      router.refresh();
    },
  });
  const tone: Record<ImageConsentValue, string> = {
    UNKNOWN: "border-gray-300 text-gray-700",
    GRANTED: "border-emerald-600 bg-emerald-50 text-emerald-800",
    REFUSED: "border-red-500 bg-red-50 text-red-700",
  };

  return (
    <fieldset className="mt-6 rounded-lg border border-border p-4 text-sm">
      <legend className="px-1 font-medium">Droit à l&apos;image</legend>
      <p className="mb-3 text-muted-foreground">
        Autorisation de publier des photos et vidéos où ce membre est reconnaissable (celle des parents pour un
        mineur).
        {recordedAt && <> Dernière saisie : {new Date(recordedAt).toLocaleDateString("fr-FR")}.</>}
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Droit à l'image">
        {IMAGE_CONSENT_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            disabled={save.isPending}
            onClick={() => {
              if (v === value) return;
              setValue(v);
              save.mutate({ userId, consent: v });
            }}
            className={`rounded-full border px-3 py-1.5 ${value === v ? tone[v] + " font-semibold" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            {IMAGE_CONSENT_LABEL[v]}
          </button>
        ))}
      </div>
      {save.isSuccess && <p className="mt-2 text-emerald-700">Enregistré.</p>}
      {save.error && <p className="mt-2 text-red-600">{save.error.message}</p>}
    </fieldset>
  );
}
