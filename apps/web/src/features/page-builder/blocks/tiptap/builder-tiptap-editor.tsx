"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EditorContent,
  EditorContext,
  useEditor,
  type Content,
} from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "@/features/editor-tiptap/ui-primitive/button";
import { Spacer } from "@/features/editor-tiptap/ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/features/editor-tiptap/ui-primitive/toolbar";

// --- Tiptap Node ---
import { HorizontalRule } from "@/features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node-extension";
import { LibraryImageNode } from "@/features/editor-tiptap/node/library-image-node";

// --- Node styles (réutilisés du SimpleEditor — fichiers existants du template) ---
import "@features/editor-tiptap/node/blockquote-node/blockquote-node.scss";
import "@features/editor-tiptap/node/code-block-node/code-block-node.scss";
import "@features/editor-tiptap/node/horizontal-rule-node/horizontal-rule-node.scss";
import "@features/editor-tiptap/node/list-node/list-node.scss";
import "@features/editor-tiptap/node/heading-node/heading-node.scss";
import "@features/editor-tiptap/node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/features/editor-tiptap/ui/heading-dropdown-menu";
import { ListDropdownMenu } from "@/features/editor-tiptap/ui/list-dropdown-menu";
import { BlockquoteButton } from "@/features/editor-tiptap/ui/blockquote-button";
import { CodeBlockButton } from "@/features/editor-tiptap/ui/code-block-button";
import { ColorHighlightPopover } from "@/features/editor-tiptap/ui/color-highlight-popover";
import { LinkPopover } from "@/features/editor-tiptap/ui/link-popover";
import { MarkButton } from "@/features/editor-tiptap/ui/mark-button";
import { TextAlignButton } from "@/features/editor-tiptap/ui/text-align-button";
import { UndoRedoButton } from "@/features/editor-tiptap/ui/undo-redo-button";

// --- Icons ---
import { Images } from "lucide-react";

// --- tRPC + Picker + Context ---
import { trpcClient } from "@/core/trpc/trpcClient";
import { MediaPicker } from "@/features/finder-core/components/MediaPicker";
import { usePageBuilderContext } from "../../PageBuilderContext";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface BuilderTipTapEditorProps {
  /** Contenu ProseMirror initial (le `content` du bloc tiptap). */
  content: Record<string, unknown>;
  /** Notifié à chaque édition avec le nouveau JSON ProseMirror. */
  onChange: (content: Record<string, unknown>) => void;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Éditeur TipTap du bloc texte du page-builder.
 *
 * Dérivé du `SimpleEditor` existant, avec trois différences structurelles :
 *
 *   1. **`LibraryImageNode` au lieu de `Image` + `ImageUploadNode`.**
 *      Les images insérées dans le texte référencent la bibliothèque par
 *      mediaId (jamais une URL ou un upload direct). C'est la cohérence
 *      d'ensemble du builder — tout passe par la bibliothèque en
 *      `published`.
 *
 *   2. **Pas de plein écran ni de toolbar mobile.** L'éditeur vit dans un
 *      bloc du builder, pas dans une page dédiée. Toolbar simple sur une
 *      ligne, conteneur bordé qui grandit avec le contenu.
 *
 *   3. **`onChange` propage `editor.getJSON()`** à chaque frappe, vers le
 *      bloc parent. Le `content` initial n'est lu qu'au montage (TipTap ne
 *      réinitialise pas sur changement de prop), donc pas de boucle ni de
 *      saut de curseur.
 *
 * ─── Le pont impératif/déclaratif du picker ────────────────────────────
 *
 * `LibraryImageNode` attend une option `openImagePicker: () => Promise<string | null>`.
 * Or le MediaPicker est un composant modal déclaratif. On fait le pont
 * avec une promesse stockée dans `pickerResolveRef` : `openImagePicker`
 * ouvre la modale et rend une promesse ; au submit (ou à l'annulation),
 * on résout cette promesse avec le mediaId choisi (ou null). C'est ce qui
 * permet à la NodeView (bouton « Remplacer ») ET au toolbar button
 * d'utiliser le même picker via une API asynchrone propre.
 */
export function BuilderTipTapEditor({
  content,
  onChange,
}: BuilderTipTapEditorProps) {
  const { adapter, appRoot } = usePageBuilderContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerResolveRef = useRef<((id: string | null) => void) | null>(null);

  // Ref sur onChange pour éviter toute closure périmée dans `onUpdate`
  // (l'editor n'est créé qu'une fois ; onChange peut changer à chaque
  // render du bloc parent). On met la ref à jour dans un effet — écrire
  // une ref pendant le render est interdit par `react-hooks/refs`.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  /* ── Résolution mediaId → URL pour la NodeView ── */

  const resolveMediaUrl = useCallback(
    async (mediaId: string): Promise<string | null> => {
      const result = await trpcClient.media.resolveByIds.query({
        mediaIds: [mediaId],
      });
      return result[mediaId]?.url ?? null;
    },
    [],
  );

  /* ── Ouverture du picker, résolue au submit/cancel ── */

  const openImagePicker = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      pickerResolveRef.current = resolve;
      setPickerOpen(true);
    });
  }, []);

  const handlePickerSubmit = useCallback(
    async (paths: string[]) => {
      setPickerOpen(false);
      const resolve = pickerResolveRef.current;
      pickerResolveRef.current = null;
      if (!resolve) return;
      if (paths.length === 0) {
        resolve(null);
        return;
      }
      const byPath = await trpcClient.media.resolveByPaths.query({
        appRoot,
        paths,
      });
      const mediaId =
        paths
          .map((p) => byPath[p])
          .find((id): id is string => typeof id === "string") ?? null;
      resolve(mediaId);
    },
    [appRoot],
  );

  const handlePickerClose = useCallback(() => {
    setPickerOpen(false);
    const resolve = pickerResolveRef.current;
    pickerResolveRef.current = null;
    resolve?.(null);
  }, []);

  /* ── Editor ── */

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Contenu du bloc texte.",
        // Rythme vertical de l'éditeur — les deux seules classes à toucher.
        //
        //   leading-snug                interlignage 1.375 (avant : 1.6)
        //   [&_p:not(:first-child)]:mt-2  écart entre paragraphes, 8px
        //                                 (avant : 20px)
        //
        // `line-height` s'hérite : posé ici, il descend aux paragraphes, aux
        // titres et aux items de liste sans qu'on les vise un par un.
        //
        // Les déclarations correspondantes ont été retirées de
        // `paragraph-node.scss` et `list-node.scss` : leurs sélecteurs
        // pesaient plus lourd que ces utilitaires et les auraient annulées.
        class: "simple-editor leading-snug [&_p:not(:first-child)]:mt-2",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      // `openImagePicker` capture `pickerResolveRef` pour résoudre la
      // Promise au submit/cancel du picker : la ref n'est lue qu'à l'appel
      // (événement utilisateur), jamais pendant le render. Mais `useEditor`
      // exécute `configure()` au render, d'où ce faux positif structurel
      // qu'on neutralise localement.
      // eslint-disable-next-line react-hooks/refs
      LibraryImageNode.configure({
        resolveMediaUrl,
        openImagePicker,
      }),
    ],
    content: content as Content,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getJSON() as Record<string, unknown>);
    },
  });

  /* ── Toolbar button : insérer une image de la bibliothèque ── */

  const handleInsertImage = useCallback(async () => {
    if (!editor) return;
    const mediaId = await openImagePicker();
    if (mediaId) {
      editor.commands.insertLibraryImage({ mediaId });
    }
  }, [editor, openImagePicker]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="overflow-hidden rounded-md border border-border">
        <Toolbar>
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={false} />
            <ListDropdownMenu
              types={["bulletList", "orderedList", "taskList"]}
              portal={false}
            />
            <BlockquoteButton />
            <CodeBlockButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <MarkButton type="underline" />
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <Button
              type="button"
              data-style="ghost"
              onClick={handleInsertImage}
              tooltip="Insérer une image de la bibliothèque"
              aria-label="Insérer une image de la bibliothèque"
            >
              <Images className="tiptap-button-icon" />
            </Button>
          </ToolbarGroup>

          <Spacer />
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor px-4 py-3"
        />
      </div>

      {pickerOpen && (
        <MediaPicker
          open
          adapter={adapter}
          rootPath={appRoot}
          onClose={handlePickerClose}
          onSubmit={(paths) => {
            void handlePickerSubmit(paths);
          }}
        />
      )}
    </EditorContext.Provider>
  );
}