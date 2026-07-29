"use client";

import { useCallback } from "react";
import type { FloatTextBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { MediaListEditor } from "../../components/MediaListEditor";
import { BuilderTipTapEditor } from "../tiptap/builder-tiptap-editor";
import { AvatarPicker } from "../media-text/AvatarPicker";
import { FloatTextPreview } from "./FloatTextPreview";

/**
 * Éditeur du bloc « texte enrobant une image ».
 *
 * Trois réglages : l'image (bibliothèque OU avatar, comme le média-texte),
 * son côté (gauche/droite), et le texte. L'`AvatarPicker` est réutilisé
 * depuis le média-texte — c'est le même sélecteur, il n'y a pas lieu de le
 * dupliquer.
 */
export function FloatTextEditor({
  block,
  onChange,
}: BlockEditorProps<FloatTextBlockV1>) {
  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      onChange({ ...block, content });
    },
    [block, onChange],
  );

  return (
    <div className="space-y-4">
      {/* Côté de l'image */}
      <div className="space-y-1">
        <span className="text-sm font-medium text-muted-foreground">
          Côté de l&apos;image
        </span>
        <div className="flex gap-2">
          {(["left", "right"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...block, side: s })}
              className={
                (block.side ?? "left") === s
                  ? "rounded border border-foreground px-3 py-1 text-sm"
                  : "rounded border px-3 py-1 text-sm hover:bg-muted"
              }
            >
              {s === "left" ? "À gauche" : "À droite"}
            </button>
          ))}
        </div>
      </div>

      {/* Image — une seule, bibliothèque ou avatar (exclusifs). */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">
          Image (une image de la bibliothèque, ou un avatar d&apos;admin)
        </span>

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
            addLabel={block.media ? "Remplacer l'image" : "Ajouter une image"}
            emptyStateLabel="Aucune image de bibliothèque sélectionnée."
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

        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            …ou l&apos;avatar d&apos;un administrateur
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

        {/* DIAGNOSTIC — échafaudage temporaire, à retirer.
            Affiche l'état réel de `block.media`, celui-là même que l'aperçu
            reçoit. Permet de distinguer « le clic n'écrit rien » de « le clic
            écrit mais l'aperçu ne le voit pas », deux causes qui appellent
            des correctifs opposés. */}
        <p className="text-[11px] text-muted-foreground">
          État du bloc :{" "}
          {block.media
            ? block.media.kind === "avatar"
              ? `avatar (${block.media.userId})`
              : `bibliothèque (${block.media.mediaId})`
            : "aucune image"}
        </p>
      </div>

      {/* Texte */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Texte
        </span>
        <BuilderTipTapEditor
          content={block.content ?? {}}
          onChange={handleContentChange}
        />
      </div>

      {/* Aperçu */}
      <div className="space-y-2 border-t border-dashed border-border pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Aperçu public
        </span>
        <div className="rounded-md bg-muted/30 p-4">
          <FloatTextPreview block={block} />
        </div>
      </div>
    </div>
  );
}
