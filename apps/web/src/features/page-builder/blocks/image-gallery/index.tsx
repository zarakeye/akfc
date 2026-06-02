import { Images } from "lucide-react";
import type { ImageGalleryBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { ImageGalleryEditor } from "./editor.client";
import { ImageGalleryView } from "./view.server";

export const imageGalleryDefinition: BlockDefinition<ImageGalleryBlockV1> = {
  kind: "image-gallery",
  label: "Galerie d'images",
  icon: <Images className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "image-gallery",
    items: [],
    layout: "grid",
  }),
  Editor: ImageGalleryEditor,
  View: ImageGalleryView,
};
