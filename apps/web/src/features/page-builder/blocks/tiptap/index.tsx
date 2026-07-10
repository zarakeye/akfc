import { Type } from "lucide-react";
import type { TipTapBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { TipTapEditor } from "./editor.client";
import { TipTapView } from "./view.server";

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
  View: TipTapView,
};
