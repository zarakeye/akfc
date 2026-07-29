"use client";

import { FileText } from "lucide-react";
import type { DocumentListBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import {
  MediaListEditor,
  type MediaPreviewProps,
} from "../../components/MediaListEditor";
import { DocumentListPreview } from "./DocumentListPreview";

type DocumentItem = DocumentListBlockV1["items"][number];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Editor                                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Editor du bloc `document-list`.
 *
 * Réplique du pattern `audio-collection` : pas de layout, liste verticale,
 * preview en icône. Seule différence : le champ texte est `label` (le
 * libellé du lien de téléchargement côté rendu) et l'icône est un
 * document.
 */
export function DocumentListEditor({
  block,
  onChange,
}: BlockEditorProps<DocumentListBlockV1>) {
  return (
    <div className="space-y-4">
      <MediaListEditor<DocumentItem>
        items={block.items}
        onChange={(items) => onChange({ ...block, items })}
        itemFactory={(mediaId) => ({ mediaId })}
        getItemText={(item) => item.label}
        setItemText={(item, value) => ({ ...item, label: value ?? undefined })}
        textPlaceholder="Libellé (optionnel)"
        addLabel="Ajouter des documents"
        emptyStateLabel="Aucun document — clique sur « Ajouter des documents » pour en sélectionner."
        renderPreview={DocumentPreview}
      />

      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <DocumentListPreview block={block} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Preview                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Pastille d'icône document. Même logique de teinte que l'audio.
 */
function DocumentPreview({ status }: MediaPreviewProps<DocumentItem>) {
  if (status === "loading") {
    return <div className="h-full w-full animate-pulse bg-muted" aria-hidden />;
  }
  const tone =
    status === "missing"
      ? "bg-destructive/5 text-destructive"
      : "bg-muted text-muted-foreground";
  return (
    <div className={`flex h-full w-full items-center justify-center ${tone}`}>
      <FileText className="h-5 w-5" aria-hidden />
    </div>
  );
}
