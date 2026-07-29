"use client";

import { Music } from "lucide-react";
import type { AudioCollectionBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import {
  MediaListEditor,
  type MediaPreviewProps,
} from "../../components/MediaListEditor";
import { AudioCollectionPreview } from "./AudioCollectionPreview";

type AudioItem = AudioCollectionBlockV1["items"][number];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Editor                                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Editor du bloc `audio-collection`.
 *
 * Réplique du pattern `image-gallery`, deux différences :
 *   - le champ texte secondaire est `title` (et non `caption`)
 *   - pas de sélecteur de layout — le rendu audio est toujours une liste
 *     verticale, donc rien à configurer côté disposition
 *
 * Le preview n'est pas une vignette (un fichier audio n'a pas d'aperçu
 * visuel) mais une icône dans une pastille, dont la teinte varie selon
 * le statut de résolution.
 */
export function AudioCollectionEditor({
  block,
  onChange,
}: BlockEditorProps<AudioCollectionBlockV1>) {
  return (
    <div className="space-y-4">
      <MediaListEditor<AudioItem>
        items={block.items}
        onChange={(items) => onChange({ ...block, items })}
        itemFactory={(mediaId) => ({ mediaId })}
        getItemText={(item) => item.title}
        setItemText={(item, value) => ({ ...item, title: value ?? undefined })}
        textPlaceholder="Titre (optionnel)"
        addLabel="Ajouter des pistes audio"
        emptyStateLabel="Aucune piste — clique sur « Ajouter des pistes audio » pour en sélectionner."
        renderPreview={AudioPreview}
      />

      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <AudioCollectionPreview block={block} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Preview                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Pastille d'icône audio. Teinte neutre en `ready`, destructive en
 * `missing`, pulse en `loading`.
 */
function AudioPreview({ status }: MediaPreviewProps<AudioItem>) {
  if (status === "loading") {
    return <div className="h-full w-full animate-pulse bg-muted" aria-hidden />;
  }
  const tone =
    status === "missing"
      ? "bg-destructive/5 text-destructive"
      : "bg-muted text-muted-foreground";
  return (
    <div className={`flex h-full w-full items-center justify-center ${tone}`}>
      <Music className="h-5 w-5" aria-hidden />
    </div>
  );
}
