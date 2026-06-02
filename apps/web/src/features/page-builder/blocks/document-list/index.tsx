import { FileText } from "lucide-react";
import type { DocumentListBlockV1 } from "@contracts/page";

import type { BlockDefinition } from "../../BlockDefinition.types";

import { DocumentListEditor } from "./editor.client";
import { DocumentListView } from "./view.server";

export const documentListDefinition: BlockDefinition<DocumentListBlockV1> = {
  kind: "document-list",
  label: "Documents",
  icon: <FileText className="h-4 w-4" aria-hidden />,
  defaultData: (id) => ({
    id,
    type: "document-list",
    items: [],
  }),
  Editor: DocumentListEditor,
  View: DocumentListView,
};
