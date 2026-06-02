import { Music } from "lucide-react";
import type { AudioCollectionBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { AudioCollectionEditor } from "./editor.client";
import { AudioCollectionView } from "./view.server";

export const audioCollectionDefinition: BlockDefinition<AudioCollectionBlockV1> = {
  kind: "audio-collection",
  label: "Pistes audio",
  icon: <Music className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "audio-collection",
    items: [],
  }),
  Editor: AudioCollectionEditor,
  View: AudioCollectionView,
};
