import { WrapText } from "lucide-react";
import type { FloatTextBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { FloatTextEditor } from "./editor.client";
import { FloatTextView } from "./view.server";

/**
 * « Texte avec image flottante » : une image calée à gauche ou à droite, que
 * le texte enrobe puis dépasse. À distinguer du média-texte, qui sépare
 * l'image et le texte en deux colonnes. Ici l'image est DANS le texte.
 */
export const floatTextDefinition: BlockDefinition<FloatTextBlockV1> = {
  kind: "float-text",
  label: "Texte enrobant une image",
  icon: <WrapText className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "float-text",
    // side par défaut : image à gauche, cas le plus courant (portrait en
    // tête d'article). Réglable dans l'éditeur.
    side: "left",
  }),
  Editor: FloatTextEditor,
  View: FloatTextView,
};
