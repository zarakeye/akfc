"use client";

import { useCallback } from "react";
import type { TipTapBlockV1 } from "@contracts/page";

import type { BlockEditorProps } from "../../BlockDefinition.types";
import { BuilderTipTapEditor } from "./builder-tiptap-editor";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Editor                                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Editor du bloc `tiptap`.
 *
 * Adaptateur fin entre le contrat `BlockEditorProps<TipTapBlockV1>` et
 * le `BuilderTipTapEditor` : il ne fait que transformer le `onChange`
 * sur le `content` brut en un `onChange` sur le bloc complet.
 *
 * Le `content` du bloc est le JSON ProseMirror opaque (`Record<string, unknown>`
 * dans le contrat). On le passe tel quel à l'éditeur, qui sait le lire.
 */
export function TipTapEditor({
  block,
  onChange,
}: BlockEditorProps<TipTapBlockV1>) {
  const handleContentChange = useCallback(
    (content: Record<string, unknown>) => {
      onChange({ ...block, content });
    },
    [block, onChange],
  );

  return (
    <BuilderTipTapEditor
      content={block.content}
      onChange={handleContentChange}
    />
  );
}
