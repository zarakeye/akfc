"use client"

import { useCallback, useEffect, useState } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import clsx from "clsx"

import { Button } from "@/features/editor-tiptap/ui-primitive/button"
import { CloseIcon } from "@/features/editor-tiptap/icons/close-icon"
import { ImagePlusIcon } from "@/features/editor-tiptap/icons/image-plus-icon"

import type { LibraryImageNodeOptions } from "./library-image-node-extension"

/* ───────────────────────────────────────────────────────────────────────── */
/*  Statut de résolution du mediaId vers une URL                             */
/* ───────────────────────────────────────────────────────────────────────── */

type ResolutionStatus = "loading" | "ready" | "missing"

/* ───────────────────────────────────────────────────────────────────────── */
/*  NodeView                                                                 */
/* ───────────────────────────────────────────────────────────────────────── */

/**
 * Vue React du nœud `library-image` dans l'éditeur TipTap.
 *
 * Affiche l'image résolue depuis le mediaId, expose une légende éditable
 * en place, et propose deux actions au survol/sélection : remplacer
 * l'image (réouverture du picker) et supprimer le bloc.
 *
 * ─── Cycle de résolution ───────────────────────────────────────────────
 *
 *   1. À chaque montage ou changement de `mediaId`, on bascule en `loading`
 *   2. On appelle `options.resolveMediaUrl(mediaId)`
 *   3. Si une URL revient → `ready` ; sinon → `missing` (placeholder)
 *   4. À l'unmount, un flag `cancelled` empêche un setState tardif
 *
 * ─── Édition de la légende ─────────────────────────────────────────────
 *
 * La légende est éditée via un `<input>` placé dans un sous-arbre
 * `contentEditable={false}` (le `<figure>` entier). ProseMirror ne tente
 * alors pas d'intercepter les touches et le caret du document reste à
 * sa place pendant qu'on tape dans le champ.
 *
 * Une chaîne vide en sortie est normalisée en `null` côté attribut —
 * c'est cohérent avec le schema Zod `caption?: string` (optionnel, pas
 * « chaîne vide »).
 *
 * ─── Toolbar révélée au hover / sélection ──────────────────────────────
 *
 * Le wrapper porte la classe `group` et un attribut `data-selected` qui
 * apparaît uniquement quand le nœud est sélectionné. La toolbar utilise
 * `group-hover:opacity-100` ET `group-data-[selected]:opacity-100` pour
 * être visible dans les deux cas. C'est le pattern UX standard pour les
 * éléments embarqués dans un éditeur.
 */
export function LibraryImageNodeView({
  node,
  editor,
  selected,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const mediaId = (node.attrs.mediaId as string | null) ?? null
  const caption = (node.attrs.caption as string | null) ?? null

  const options = getLibraryImageOptions(editor)

  const [url, setUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<ResolutionStatus>("loading")

  useEffect(() => {
    if (!mediaId) {
      setStatus("missing")
      setUrl(null)
      return
    }

    let cancelled = false
    setStatus("loading")
    setUrl(null)

    options
      .resolveMediaUrl(mediaId)
      .then((resolved) => {
        if (cancelled) return
        if (resolved) {
          setUrl(resolved)
          setStatus("ready")
        } else {
          setStatus("missing")
        }
      })
      .catch(() => {
        if (cancelled) return
        setStatus("missing")
      })

    return () => {
      cancelled = true
    }
  }, [mediaId, options])

  const handleReplace = useCallback(async () => {
    const next = await options.openImagePicker()
    if (next) {
      updateAttributes({ mediaId: next })
    }
  }, [options, updateAttributes])

  const handleCaptionChange = useCallback(
    (next: string) => {
      updateAttributes({ caption: next.length > 0 ? next : null })
    },
    [updateAttributes],
  )

  return (
    <NodeViewWrapper
      className={clsx(
        "group relative my-6 rounded-lg outline-2 outline-transparent transition-[outline-color] duration-100",
        selected && "outline-ring",
      )}
      data-status={status}
      data-selected={selected || undefined}
    >
      <figure
        className="m-0 flex flex-col items-stretch gap-2 rounded-[inherit] bg-muted/40 p-3"
        contentEditable={false}
      >
        {status === "loading" && (
          <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Chargement…
          </div>
        )}

        {status === "missing" && (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
            <span>⚠️ Média indisponible</span>
            {mediaId && (
              <code className="font-mono text-xs opacity-70">{mediaId}</code>
            )}
          </div>
        )}

        {status === "ready" && url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={caption ?? ""}
            className="block w-full max-w-full rounded-md object-contain"
            draggable={false}
          />
        )}

        <figcaption className="block">
          <input
            type="text"
            value={caption ?? ""}
            onChange={(event) => handleCaptionChange(event.target.value)}
            placeholder="Légende (optionnelle)"
            className="w-full border-none bg-transparent py-1 text-sm italic text-foreground/70 outline-none placeholder:text-muted-foreground/60 focus:rounded-sm focus:outline focus:outline-1 focus:outline-ring disabled:cursor-default"
            disabled={!editor.isEditable}
          />
        </figcaption>

        {editor.isEditable && (
          <div className="absolute right-2 top-2 flex gap-1 rounded-md bg-background/90 p-1 opacity-0 backdrop-blur-sm transition-opacity duration-100 group-hover:opacity-100 group-data-[selected]:opacity-100">
            <Button
              type="button"
              tooltip="Remplacer l'image"
              aria-label="Remplacer l'image"
              onClick={handleReplace}
            >
              <ImagePlusIcon />
            </Button>
            <Button
              type="button"
              tooltip="Supprimer le bloc"
              aria-label="Supprimer le bloc"
              onClick={deleteNode}
            >
              <CloseIcon />
            </Button>
          </div>
        )}
      </figure>
    </NodeViewWrapper>
  )
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                  */
/* ───────────────────────────────────────────────────────────────────────── */

/**
 * Récupère les options de l'extension `library-image` depuis l'éditeur.
 *
 * Les options TipTap sont stockées sur l'instance d'extension, pas sur
 * l'éditeur lui-même — on passe donc par `extensionManager.extensions`
 * pour les retrouver par nom. Si l'extension n'est pas chargée (cas
 * anormal — la NodeView ne devrait jamais être instanciée dans cet
 * état), on retombe sur des stubs no-op pour ne pas planter l'affichage.
 */
function getLibraryImageOptions(
  editor: NodeViewProps["editor"],
): LibraryImageNodeOptions {
  const extension = editor.extensionManager.extensions.find(
    (ext) => ext.name === "library-image",
  )
  if (extension) {
    return extension.options as LibraryImageNodeOptions
  }
  return {
    resolveMediaUrl: async () => null,
    openImagePicker: async () => null,
    HTMLAttributes: {},
  }
}
