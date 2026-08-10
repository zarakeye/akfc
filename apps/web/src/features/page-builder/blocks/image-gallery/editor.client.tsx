"use client";

import type { ImageGalleryBlockV1, ImageGalleryLayout } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { MediaListEditor } from "../../components/MediaListEditor";
import { ImageGalleryPreview } from "./ImageGalleryPreview";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Sélecteur de layout                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

const LAYOUT_OPTIONS: ReadonlyArray<{
  value: ImageGalleryLayout;
  label: string;
}> = [
  { value: "grid", label: "Grille" },
  { value: "carousel", label: "Carrousel" },
  { value: "masonry", label: "Mosaïque" },
];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Editor                                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Editor du bloc `image-gallery`.
 *
 * Compose deux pièces :
 *
 *   1. Un sélecteur de `layout` (grid / carousel / masonry) en haut —
 *      détermine le rendu côté View (sous-chantier 6), pas l'apparence
 *      dans l'éditeur. L'éditeur affiche toujours sa liste verticale.
 *
 *   2. Le `MediaListEditor` partagé, configuré pour des items
 *      `{ mediaId, caption? }` avec preview en vignette carrée.
 *
 * La normalisation `caption: "" → null` est faite par MediaListEditor
 * dans son `handleTextChange`, et le mapper `setItemText` ici la
 * convertit en `undefined` pour respecter la forme du contrat
 * (`caption?: string` — pas `caption: string | null`).
 */
export function ImageGalleryEditor({
  block,
  onChange,
}: BlockEditorProps<ImageGalleryBlockV1>) {
  return (
    <div className="space-y-3">
      {/* Sélecteur de layout */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Disposition :</label>
        <select
          value={block.layout}
          onChange={(e) =>
            onChange({
              ...block,
              layout: e.target.value as ImageGalleryLayout,
            })
          }
          className="rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          {LAYOUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Liste d'items */}
      <MediaListEditor
        items={block.items}
        onChange={(items) => onChange({ ...block, items })}
        itemFactory={(mediaId) => ({ mediaId })}
        getItemText={(item) => item.caption}
        setItemText={(item, value) => ({
          ...item,
          caption: value ?? undefined,
        })}
        textPlaceholder="Légende (optionnelle)"
        addLabel="Ajouter des images"
        emptyStateLabel="Aucune image — clique sur « Ajouter des images » pour en sélectionner."
        renderPreview={({ resolved, status }) => {
          if (status === "loading") {
            return <div className="h-full w-full animate-pulse bg-muted" />;
          }
          if (status === "missing" || !resolved) {
            return (
              <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                indispo
              </div>
            );
          }
          const isVideo = resolved.kind === "video";
          return (
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  isVideo ? (resolved.posterUrl ?? resolved.url) : resolved.url
                }
                alt=""
                className="h-full w-full object-cover"
              />
              {isVideo && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-0.5 h-4 w-4 fill-white"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />

      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <ImageGalleryPreview block={block} />
        </div>
      </div>
    </div>
  );
}
