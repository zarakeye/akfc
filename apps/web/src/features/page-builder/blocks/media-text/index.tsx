import { Columns2 } from "lucide-react";
import type { MediaTextBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { MediaTextEditor } from "./editor.client";
import { MediaTextView } from "./view.server";

export const mediaTextDefinition: BlockDefinition<MediaTextBlockV1> = {
  kind: "media-text",
  label: "Médias + texte",
  icon: <Columns2 className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "media-text",
    // media absent + content absent : le bloc démarre vide des deux côtés.
  }),
  Editor: MediaTextEditor,
  View: MediaTextView,
};
