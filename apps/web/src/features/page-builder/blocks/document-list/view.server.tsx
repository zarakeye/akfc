import { Download, FileText } from "lucide-react";
import type { DocumentListBlockV1 } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc `document-list`.
 *
 * Liste verticale, chaque item est un lien de téléchargement avec icône
 * document, libellé (ou nom de fichier en repli) et icône download à
 * droite. L'attribut `download={media.fileName}` suggère au navigateur
 * de déclencher un téléchargement plutôt qu'une navigation, avec le
 * nom de fichier original.
 *
 * Items dont le mediaId ne résout pas : silencieusement omis.
 *
 * ⚠️ Même limitation R2 qu'`audio-collection` : la route
 * `/api/media/r2/...` exige une session admin. Pour le visiteur
 * anonyme, le clic redirigera vers une 401. Solution publique au
 * sous-chantier 6c.
 *
 * Note ergonomie : on garde un seul niveau d'iconographie pour ne pas
 * surcharger. Discriminer le type de document (PDF vs DOCX vs autre)
 * via le `mimeType` pour adapter l'icône est une évolution sympathique
 * mais non prioritaire.
 */
export function DocumentListView({
  block,
  resolveMedia,
}: BlockViewProps<DocumentListBlockV1>) {
  const items = block.items.flatMap((item) => {
    const media = resolveMedia(item.mediaId);
    return media ? [{ item, media }] : [];
  });

  if (items.length === 0) return null;

  return (
    <ul
      className="flex flex-col"
      style={{ gap: "var(--akfc-item-gap)" }}
    >
      {items.map(({ item, media }) => (
        <li key={item.mediaId}>
          <a
            href={media.url}
            download={media.fileName}
            className="flex items-center gap-3 rounded-md border border-border bg-card transition-colors hover:bg-muted"
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
          </a>
        </li>
      ))}
    </ul>
  );
}
