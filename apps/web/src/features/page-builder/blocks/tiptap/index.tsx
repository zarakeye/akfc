import { Type } from "lucide-react";
import type { TipTapBlockV1 } from "@contracts/page";

import type {
  BlockDefinition,
  BlockViewProps,
} from "../../BlockDefinition.types";

import { TipTapEditor } from "./editor.client";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Stub de View — sera implémenté au sous-chantier 6 (RSC)                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Stub de View — sera implémenté au sous-chantier 6 (RSC) :
 *   1. extrait les mediaIds du contenu ProseMirror via
 *      `extractMediaIdsFromContent`
 *   2. résout les URLs en batch via `media.resolveByIds`
 *   3. émet du HTML statique via `generateHTML` de `@tiptap/html`
 *      avec un sérialiseur custom pour `library-image` qui injecte
 *      les URLs de la map résolue
 */
function StubView({ block }: BlockViewProps<TipTapBlockV1>) {
  return (
    <div className="text-sm text-muted-foreground">
      [View tiptap — stub] {block.id}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Définition exportée                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

export const tiptapDefinition: BlockDefinition<TipTapBlockV1> = {
  kind: "tiptap",
  label: "Texte",
  icon: <Type className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "tiptap",
    content: { type: "doc", content: [] },
  }),
  Editor: TipTapEditor,
  View: StubView,
};
