"use client";

import { useCallback, useState, type JSX } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Content,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";

import type { ProseMirrorContent } from "@contracts/shared/prosemirror";

/**
 * Éditeur de commentaire — instance tiptap INDÉPENDANTE du PageBuilder.
 *
 * Volontairement bridé (décision verrouillée : gras/italique/liens,
 * rien d'autre) : le StarterKit v3 embarque déjà Link, on désactive
 * tout le reste. Pas de MediaPicker, pas de PageBuilderContext, pas de
 * heading/blocs — un commentaire n'est pas une page.
 *
 * Mode `compact` (mur façon Facebook) : replié en une ligne sans
 * toolbar ni boutons ; s'étend au focus, se replie au blur si vide.
 *
 * La non-vacuité est portée ICI (bouton désactivé si `editor.isEmpty`),
 * le backend validant le contenu comme un objet ProseMirror opaque
 * (cf. contracts/shared/prosemirror.ts).
 */

interface CommentEditorProps {
  /** Contenu initial (mode édition). Absent = éditeur vide (création). */
  initialContent?: ProseMirrorContent;
  onSubmit: (content: ProseMirrorContent) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  /** Replié en une ligne tant que l'éditeur n'a pas le focus (mur). */
  compact?: boolean;
}

export function CommentEditor({
  initialContent,
  onSubmit,
  onCancel,
  placeholder = "",
  submitLabel = "Envoyer",
  compact = false,
}: CommentEditorProps): JSX.Element {
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Écrire un commentaire.",
        class:
          "min-h-[2.5rem] w-full px-3 py-2 text-sm focus:outline-none " +
          "[&_a]:text-primary [&_a]:underline",
      },
    },
    extensions: [
      StarterKit.configure({
        // Bridage : un commentaire n'a ni titres, ni blocs, ni décorations.
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        strike: false,
        underline: false,
        code: false,
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: (initialContent as Content | undefined) ?? null,
  });

  // Abonnement granulaire (tiptap v3 ne re-rend plus à chaque transaction).
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isEmpty: ctx.editor?.isEmpty ?? true,
      bold: ctx.editor?.isActive("bold") ?? false,
      italic: ctx.editor?.isActive("italic") ?? false,
      link: ctx.editor?.isActive("link") ?? false,
    }),
  });
  const state = editorState ?? {
    isEmpty: true,
    bold: false,
    italic: false,
    link: false,
  };

  // Étendu si : pas compact, ou focus, ou contenu déjà saisi (on ne
  // replie jamais un brouillon en cours).
  const expanded = !compact || focused || !state.isEmpty;

  const handleLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL du lien :", "https://");
    if (url === null) return; // saisie annulée
    const trimmed = url.trim();
    if (trimmed === "") return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
  }, [editor]);

  const handleSubmit = async () => {
    if (!editor || editor.isEmpty) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(editor.getJSON() as ProseMirrorContent);
      editor.commands.clearContent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toolbarButton = (
    active: boolean,
    label: string,
    ariaLabel: string,
    onClick: () => void,
    extraClass = "",
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!editor}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground"
      } ${extraClass}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div
        className={
          "rounded border border-input bg-background " +
          "focus-within:ring-1 focus-within:ring-ring " +
          // Placeholder tiptap (classe is-editor-empty + attr data-placeholder)
          "[&_p.is-editor-empty:first-child]:before:pointer-events-none " +
          "[&_p.is-editor-empty:first-child]:before:float-left " +
          "[&_p.is-editor-empty:first-child]:before:h-0 " +
          "[&_p.is-editor-empty:first-child]:before:text-muted-foreground " +
          "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]"
        }
      >
        {expanded && (
          <div
            className="flex items-center gap-1 border-b border-input/50 px-2 py-1"
            // Empêche le blur de l'éditeur quand on clique la toolbar
            onMouseDown={(e) => e.preventDefault()}
          >
            {toolbarButton(
              state.bold,
              "G",
              "Gras",
              () => editor?.chain().focus().toggleBold().run(),
              "font-bold",
            )}
            {toolbarButton(
              state.italic,
              "I",
              "Italique",
              () => editor?.chain().focus().toggleItalic().run(),
              "italic",
            )}
            {toolbarButton(state.link, "Lien", "Insérer un lien", handleLink)}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {expanded && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || state.isEmpty}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Envoi…" : submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
}
