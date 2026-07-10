import type { JSX, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

/**
 * Coque réutilisable d'une page de présentation `[id]`.
 *
 * Server-safe (aucun hook, juste des `Link`). Fournit le lien de retour à la
 * liste, le titre, le bouton « Éditer » (vers `[id]/edit`), et un slot pour le
 * contenu spécifique à l'entité (métadonnées, PageRenderer, etc.).
 */
export function PresentationShell({
  title,
  listHref,
  editHref,
  children,
}: {
  title: string;
  listHref: string;
  editHref: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div>
      <Link
        href={listHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link
          href={editHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Éditer
        </Link>
      </div>

      {children}
    </div>
  );
}