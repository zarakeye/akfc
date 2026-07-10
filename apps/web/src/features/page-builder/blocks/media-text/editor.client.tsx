"use client";

import { useCallback } from "react";
import type { MediaTextBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { MediaListEditor } from "../../components/MediaListEditor";
import { BuilderTipTapEditor } from "../tiptap/builder-tiptap-editor";
import { MediaTextPreview } from "./MediaTextPreview";

/**
 * Editor du bloc `media-text`.
 *
 * Deux sections empilées dans l'éditeur (la mise en page côte à côte /
 * alternée est une affaire de rendu public, pas d'édition) :
 *
 *   1. Le picker de médias (MediaListEditor partagé) — plusieurs images
 *      et/ou une vidéo, avec légende optionnelle par média.
 *   2. L'éditeur de texte riche (BuilderTipTapEditor, même instance que le
 *      bloc tiptap).
 *
 * Les deux parties sont optionnelles : l'admin peut ne renseigner que l'une
 * ou l'autre — le rendu public centrera alors le contenu présent.
 */
export function MediaTextEditor({
  block,
  onChange,
  mediaSide,
}: BlockEditorProps<MediaTextBlockV1>) {
  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      onChange({ ...block, content });
    },
    [block, onChange],
  );

  return (
    <div className="space-y-4">
      {/* Médias */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Médias (images et/ou vidéo)
        </span>
        <MediaListEditor
          items={block.media}
          onChange={(media) => onChange({ ...block, media })}
          itemFactory={(mediaId) => ({ mediaId })}
          getItemText={(item) => item.caption}
          setItemText={(item, value) => ({
            ...item,
            caption: value ?? undefined,
          })}
          textPlaceholder="Légende (optionnelle)"
          addLabel="Ajouter des médias"
          emptyStateLabel="Aucun média — le bloc affichera seulement le texte."
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
            if (resolved.kind === "video") {
              return (
                <div className="flex h-full w-full items-center justify-center bg-black text-[10px] text-white">
                  vidéo
                </div>
              );
            }
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolved.url}
                alt=""
                className="h-full w-full object-cover"
              />
            );
          }}
        />
      </div>

      {/* Texte */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Texte (optionnel)
        </span>
        <BuilderTipTapEditor
          content={block.content ?? {}}
          onChange={handleContentChange}
        />
      </div>

      {/* Aperçu du rendu public (mise en page réelle, alternance incluse) */}
      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <MediaTextPreview block={block} mediaSide={mediaSide} />
        </div>
      </div>
    </div>
  );
}
