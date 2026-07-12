"use client";

import { useCallback } from "react";
import type { MediaTextBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { MediaListEditor } from "../../components/MediaListEditor";
import { BuilderTipTapEditor } from "../tiptap/builder-tiptap-editor";
import { MediaTextPreview } from "./MediaTextPreview";
import { AvatarPicker } from "./AvatarPicker";

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
      {/* Média — UN SEUL, au choix : (1) un média de la bibliothèque, ou
          (2) l'avatar d'un admin (référence logique, suit l'avatar courant).
          Les deux sont exclusifs : choisir un avatar retire le média
          bibliothèque et inversement. */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">
          Média (une image/vidéo de la bibliothèque, ou un avatar d'admin)
        </span>

        {/* Option 1 : bibliothèque (masquée si un avatar est référencé) */}
        {(!block.media || block.media.kind === "library") && (
          <MediaListEditor
            items={
              block.media && block.media.kind === "library" ? [block.media] : []
            }
            onChange={(list) =>
              onChange({
                ...block,
                media:
                  list.length > 0
                    ? { ...list[list.length - 1], kind: "library" as const }
                    : undefined,
              })
            }
            itemFactory={(mediaId) => ({ kind: "library" as const, mediaId })}
            getItemText={(item) => item.caption}
            setItemText={(item, value) => ({
              ...item,
              caption: value ?? undefined,
            })}
            textPlaceholder="Légende (optionnelle)"
            addLabel={block.media ? "Remplacer le média" : "Ajouter un média"}
            emptyStateLabel="Aucun média de bibliothèque sélectionné."
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
        )}

        {/* Option 2 : avatar d'admin */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            …ou l'avatar d'un administrateur
          </span>
          <AvatarPicker
            selectedUserId={
              block.media && block.media.kind === "avatar"
                ? block.media.userId
                : null
            }
            onSelect={(userId) =>
              onChange({
                ...block,
                media: userId
                  ? {
                      kind: "avatar",
                      userId,
                      caption:
                        block.media && "caption" in block.media
                          ? block.media.caption
                          : undefined,
                    }
                  : undefined,
              })
            }
          />
        </div>
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
