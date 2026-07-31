"use client";

import { useState, type JSX, type ReactNode } from "react";

import { trpc, trpcClient } from "@/core/trpc/trpcClient";
import { MediaPicker } from "@/features/finder-core/components/MediaPicker";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";
import { PageBuilder } from "@features/page-builder";
import {
  plainTextFromPageContentV1,
  DISCIPLINE_SUMMARY_MAX_CHARS,
  type PageContentV1,
} from "@contracts/page";

/**
 * Bloc « présentation synthétique », partagé par les formulaires de
 * discipline, de stage et d'événement.
 *
 * Écrit une fois plutôt que recopié trois fois : trois exemplaires
 * divergeraient à la première correction, qui n'en toucherait qu'un.
 *
 * L'image passe par un CHAMP et non par un bloc du builder. Les blocs
 * porteurs d'images ont chacun leur mise en page propre — ratios, côté,
 * seuils de bascule — inutile ici où la carte impose sa disposition, et déjà
 * source d'ennuis. Le builder est donc limité au bloc TEXTE : plus rien dans
 * le contenu ne peut décider de la mise en page.
 */

const SUMMARY_BLOCKS = ["tiptap"] as const;

/**
 * Réglages éditoriaux PARTAGÉS (une seule ligne `SiteStyle`).
 *
 * Exposés par un hook plutôt que passés en props : l'hôte en a besoin pour
 * refuser l'enregistrement au-delà de la limite — c'est lui qui possède le
 * bouton — et le bloc en a besoin pour son compteur. Les deux consomment la
 * même requête, que react-query dédoublonne.
 */
export function useSummaryLimits(): {
  maxChars: number;
  cardCollapsedHeight: number;
} {
  const limits = trpc.siteStyle.getLimits.useQuery();
  return {
    maxChars: limits.data?.summaryMaxChars ?? DISCIPLINE_SUMMARY_MAX_CHARS,
    cardCollapsedHeight: limits.data?.cardCollapsedHeight ?? 220,
  };
}

export function SummaryFieldset({
  legend,
  help,
  summary,
  onSummaryChange,
  mediaId,
  onMediaIdChange,
}: {
  legend: string;
  help: ReactNode;
  summary: PageContentV1;
  onSummaryChange: (next: PageContentV1) => void;
  mediaId: string | null;
  onMediaIdChange: (next: string | null) => void;
}): JSX.Element {
  const { maxChars } = useSummaryLimits();
  const saveLimits = trpc.siteStyle.saveLimits.useMutation();
  const currentLimits = trpc.siteStyle.getLimits.useQuery();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [maxCharsDraft, setMaxCharsDraft] = useState<number | null>(null);
  const [cardHeightDraft, setCardHeightDraft] = useState<number | null>(null);

  const effectiveMax = maxCharsDraft ?? maxChars;
  const effectiveHeight =
    cardHeightDraft ?? currentLimits.data?.cardCollapsedHeight ?? 220;

  const persistLimits = () => {
    saveLimits.mutate({
      summaryMaxChars: effectiveMax,
      cardCollapsedHeight: effectiveHeight,
    });
  };

  const image = trpc.media.resolveByIds.useQuery(
    { mediaIds: mediaId ? [mediaId] : [] },
    { enabled: mediaId !== null },
  );
  const imageUrl = mediaId ? (image.data?.[mediaId]?.url ?? null) : null;

  const chars = plainTextFromPageContentV1(summary).length;
  const overLimit = chars > effectiveMax;

  return (
    <fieldset className="rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-medium">{legend}</legend>
      <p className="mb-3 text-xs text-muted-foreground">{help}</p>

      <div className="mb-4 space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Image de la carte
        </span>
        <div className="flex items-start gap-3">
          <div className="h-24 w-40 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                {mediaId ? "Chargement…" : "Aucune image"}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              {mediaId ? "Remplacer l'image" : "Choisir une image"}
            </button>
            {mediaId && (
              <button
                type="button"
                onClick={() => onMediaIdChange(null)}
                className="text-left text-xs text-muted-foreground hover:text-destructive"
              >
                Retirer l&apos;image
              </button>
            )}
          </div>
        </div>
      </div>

      <PageBuilder
        value={summary}
        onChange={onSummaryChange}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
        allowedBlocks={SUMMARY_BLOCKS}
      />

      <p
        className={
          overLimit
            ? "mt-2 text-right text-xs font-medium text-destructive"
            : chars > effectiveMax * 0.85
              ? "mt-2 text-right text-xs font-medium text-amber-600"
              : "mt-2 text-right text-xs text-muted-foreground"
        }
      >
        {chars} / {effectiveMax} caractères
        {overLimit && " — enregistrement bloqué"}
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-dashed border-border pt-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Limite de caractères
          <input
            type="number"
            min={100}
            max={3000}
            step={50}
            value={effectiveMax}
            onChange={(e) => setMaxCharsDraft(Number(e.target.value))}
            onBlur={persistLimits}
            className="w-28 rounded-md border border-border px-2 py-1 text-sm text-foreground"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Hauteur repliée des cartes (px)
          <input
            type="number"
            min={80}
            max={1000}
            step={10}
            value={effectiveHeight}
            onChange={(e) => setCardHeightDraft(Number(e.target.value))}
            onBlur={persistLimits}
            className="w-28 rounded-md border border-border px-2 py-1 text-sm text-foreground"
          />
        </label>

        <p className="flex-1 text-xs text-muted-foreground">
          Ces deux réglages valent pour TOUTES les cartes du site — disciplines,
          stages et événements. Une règle éditoriale n&apos;a de sens que si
          elle est la même partout.
          {saveLimits.isPending && " Enregistrement…"}
        </p>
      </div>

      {pickerOpen && (
        <MediaPicker
          open
          adapter={finderStorageAdapter}
          rootPath={APP_ROOT}
          onClose={() => setPickerOpen(false)}
          onSubmit={(paths) => {
            setPickerOpen(false);
            if (paths.length === 0) return;
            // Le picker rend des CHEMINS ; la conversion en identifiant est
            // celle du builder, pour que les deux voies produisent la même
            // référence.
            void trpcClient.media.resolveByPaths
              .query({ appRoot: APP_ROOT, paths })
              .then((resolved) => {
                const found = Object.values(resolved).find(
                  (id): id is string => id !== null,
                );
                if (found) onMediaIdChange(found);
              });
          }}
        />
      )}
    </fieldset>
  );
}
