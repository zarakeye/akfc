"use client";

import type { JSX, ReactNode } from "react";
import { Download, FileText } from "lucide-react";

import type { DocumentListBlockV1 } from "@contracts/page";

import { useResolvedMediaList } from "../../components/useResolvedMediaList";

/**
 * Aperçu client de la liste de documents, reproduisant `DocumentListView` —
 * mêmes rangées, mêmes icônes, mêmes variables. Les liens ne sont pas
 * cliquables ici : un aperçu ne doit pas déclencher de téléchargement.
 */
export function DocumentListPreview({
  block,
}: {
  block: DocumentListBlockV1;
}): JSX.Element {
  const { byId, status } = useResolvedMediaList(
    block.items.map((i) => i.mediaId),
  );

  const items = block.items.flatMap((item) => {
    const media = byId[item.mediaId];
    return media ? [{ item, media }] : [];
  });

  const missing = block.items.length - items.length;

  if (block.items.length === 0) {
    return <Notice>Aucun document : ajoutez-en pour voir la liste.</Notice>;
  }
  if (status === "loading") return <Notice>Chargement des documents…</Notice>;
  if (status === "error") {
    return <Notice>Échec de la requête de résolution des documents.</Notice>;
  }
  if (items.length === 0) {
    return (
      <Notice>
        Aucun des documents sélectionnés n&apos;a pu être résolu.
      </Notice>
    );
  }

  return (
    <div>
      {missing > 0 && (
        <Notice>{missing} document(s) introuvable(s) — non affiché(s).</Notice>
      )}
      <ul className="flex flex-col" style={{ gap: "var(--akfc-item-gap)" }}>
        {items.map(({ item, media }) => (
          <li key={item.mediaId}>
            <div
              className="flex items-center gap-3 rounded-md border border-border bg-card"
              style={{ padding: "var(--akfc-card-padding)" }}
            >
              <FileText
                className="h-5 w-5 flex-shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="flex-1 text-sm">
                {item.label ?? media.fileName}
              </span>
              <Download
                className="h-4 w-4 flex-shrink-0 text-muted-foreground"
                aria-hidden
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ children }: { children: ReactNode }): JSX.Element {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
