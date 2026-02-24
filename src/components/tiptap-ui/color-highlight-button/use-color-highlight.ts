"use client";

/**
 * use-color-highlight.ts
 *
 * Constat (AKFC):
 * - Le template TipTap UI d'origine supportait 2 modes :
 *   - "mark" : surlignage (Highlight mark) ✅ supporté (extension officielle)
 *   - "node" : background d'un node via commandes:
 *       toggleNodeBackgroundColor / unsetNodeBackgroundColor
 *     ❌ ces commandes proviennent d'une extension CUSTOM qui n'existe pas dans ce repo
 *
 * Décision (solution réellement satisfaisante):
 * - On garde une UX complète de "highlight multicolor" via Highlight mark (officiel)
 * - On conserve l'API publique `mode` pour compat, mais on DÉSACTIVE proprement "node"
 *   (pas de commande fantôme, pas de faux typage, pas de crash runtime)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useHotkeys } from "react-hotkeys-hook";

import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";

export const COLOR_HIGHLIGHT_SHORTCUT_KEY = "mod+shift+h";

export const HIGHLIGHT_COLORS = [
  {
    label: "Default background",
    value: "var(--tt-bg-color)",
    border: "var(--tt-bg-color-contrast)",
  },
  {
    label: "Gray background",
    value: "var(--tt-color-highlight-gray)",
    border: "var(--tt-color-highlight-gray-contrast)",
  },
  {
    label: "Brown background",
    value: "var(--tt-color-highlight-brown)",
    border: "var(--tt-color-highlight-brown-contrast)",
  },
  {
    label: "Orange background",
    value: "var(--tt-color-highlight-orange)",
    border: "var(--tt-color-highlight-orange-contrast)",
  },
  {
    label: "Yellow background",
    value: "var(--tt-color-highlight-yellow)",
    border: "var(--tt-color-highlight-yellow-contrast)",
  },
  {
    label: "Green background",
    value: "var(--tt-color-highlight-green)",
    border: "var(--tt-color-highlight-green-contrast)",
  },
  {
    label: "Blue background",
    value: "var(--tt-color-highlight-blue)",
    border: "var(--tt-color-highlight-blue-contrast)",
  },
  {
    label: "Purple background",
    value: "var(--tt-color-highlight-purple)",
    border: "var(--tt-color-highlight-purple-contrast)",
  },
  {
    label: "Pink background",
    value: "var(--tt-color-highlight-pink)",
    border: "var(--tt-color-highlight-pink-contrast)",
  },
  {
    label: "Red background",
    value: "var(--tt-color-highlight-red)",
    border: "var(--tt-color-highlight-red-contrast)",
  },
] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

/**
 * API conservée pour compat
 * - mark : supporté (Highlight mark)
 * - node : désactivé (extension absente)
 */
export type HighlightMode = "mark" | "node";

export interface UseColorHighlightConfig {
  editor?: Editor | null;
  highlightColor?: string;
  label?: string;
  hideWhenUnavailable?: boolean;
  mode?: HighlightMode;
  onApplied?: (params: { color: string; label: string; mode: HighlightMode }) => void;
}

export function pickHighlightColorsByValue(values: string[]) {
  // Map clé string -> HighlightColor
  const colorMap = new Map<string, HighlightColor>(
    HIGHLIGHT_COLORS.map((c) => [c.value, c])
  );

  return values
    .map((v) => colorMap.get(v))
    .filter((c): c is HighlightColor => !!c);
}

function isNodeModeSupported(mode: HighlightMode) {
  // Ici on centralise la règle : node mode est désactivé.
  return mode !== "node";
}

/**
 * Peut-on appliquer le highlight ?
 */
export function canColorHighlight(editor: Editor | null, mode: HighlightMode = "mark"): boolean {
  if (!editor || !editor.isEditable) return false;

  // node mode: désactivé (extension absente)
  if (!isNodeModeSupported(mode)) return false;

  // Mark highlight doit exister
  if (!isMarkInSchema("highlight", editor)) return false;

  // Évite de “highlight” des nodes non-text (ex: image selection)
  if (isNodeTypeSelected(editor, ["image"])) return false;

  // `setMark('highlight')` doit être possible
  return editor.can().setMark("highlight");
}

/**
 * Le highlight est-il actif ?
 */
export function isColorHighlightActive(
  editor: Editor | null,
  highlightColor?: string,
  mode: HighlightMode = "mark"
): boolean {
  if (!editor || !editor.isEditable) return false;

  if (!isNodeModeSupported(mode)) return false;

  return highlightColor
    ? editor.isActive("highlight", { color: highlightColor })
    : editor.isActive("highlight");
}

/**
 * Retire le highlight (mark)
 */
export function removeHighlight(editor: Editor | null, mode: HighlightMode = "mark"): boolean {
  if (!editor || !editor.isEditable) return false;

  if (!isNodeModeSupported(mode)) return false;
  if (!canColorHighlight(editor, mode)) return false;

  return editor.chain().focus().unsetMark("highlight").run();
}

/**
 * Montrer/masquer le bouton
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  mode: HighlightMode;
}): boolean {
  const { editor, hideWhenUnavailable, mode } = props;

  if (!editor || !editor.isEditable) return false;

  // node mode: on ne l'affiche pas (sinon UX “cassée”)
  if (!isNodeModeSupported(mode)) return false;

  // mark highlight doit exister
  if (!isMarkInSchema("highlight", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canColorHighlight(editor, mode);
  }

  return true;
}

export function useColorHighlight(config: UseColorHighlightConfig) {
  const {
    editor: providedEditor,
    label,
    highlightColor,
    hideWhenUnavailable = false,
    mode = "mark",
    onApplied,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsBreakpoint();
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const canApply = useMemo(() => canColorHighlight(editor, mode), [editor, mode]);
  const isActive = useMemo(
    () => isColorHighlightActive(editor, highlightColor, mode),
    [editor, highlightColor, mode]
  );

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable, mode }));
    };

    handleSelectionUpdate();
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, mode]);

  const handleColorHighlight = useCallback(() => {
    if (!editor || !canApply || !highlightColor) return false;

    // node mode: désactivé
    if (!isNodeModeSupported(mode)) return false;

    // Supprime stored mark highlight avant de toggle (comportement original du template)
    if (editor.state.storedMarks) {
      const highlightMarkType = editor.schema.marks.highlight;
      if (highlightMarkType) {
        editor.view.dispatch(editor.state.tr.removeStoredMark(highlightMarkType));
      }
    }

    // Applique / toggle le highlight
    const success = editor
      .chain()
      .focus()
      .toggleMark("highlight", { color: highlightColor })
      .run();

    if (success) {
      onApplied?.({
        color: highlightColor,
        label: label ?? "Highlight",
        mode,
      });
    }

    return success;
  }, [editor, canApply, highlightColor, label, mode, onApplied]);

  const handleRemoveHighlight = useCallback(() => {
    const success = removeHighlight(editor, mode);
    if (success) {
      onApplied?.({ color: "", label: "Remove highlight", mode });
    }
    return success;
  }, [editor, mode, onApplied]);

  useHotkeys(
    COLOR_HIGHLIGHT_SHORTCUT_KEY,
    (event) => {
      event.preventDefault();
      handleColorHighlight();
    },
    {
      enabled: isVisible && canApply,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  );

  return {
    isVisible,
    isActive,
    handleColorHighlight,
    handleRemoveHighlight,
    canColorHighlight: canApply,
    label: label || "Highlight",
    shortcutKeys: COLOR_HIGHLIGHT_SHORTCUT_KEY,
    Icon: HighlighterIcon,
    mode,
  };
}