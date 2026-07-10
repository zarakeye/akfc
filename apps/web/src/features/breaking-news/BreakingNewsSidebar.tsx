"use client";

import { useEffect, useRef, type JSX } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Megaphone,
} from "lucide-react";
import type { BreakingNews } from "@prisma/client";

/**
 * Sidebar droite escamotable des actualités (fiches « Announcement »).
 *
 * Panneau fixed glissant (translate-x), CENTRÉ VERTICALEMENT (il ne
 * couvre pas le héros/carousel, et reste stable sur toutes les pages).
 * Languette accrochée à son bord gauche — elle glisse AVEC lui et
 * reste donc toujours saisissable. Neutre (même fond que le panneau,
 * dont elle semble une excroissance), coins extérieurs arrondis, et
 * congés CONCAVES à la jonction (quarts de cercle inversés en
 * box-shadow — la technique de l'onglet de classeur). Le badge de
 * non-vues est porté par la languette (calculé par le Shell).
 *
 * `selectedId` (clic sur le ruban) : scroll la fiche en vue + halo.
 */

interface BreakingNewsSidebarProps {
  news: BreakingNews[];
  open: boolean;
  onToggle: () => void;
  unseenCount: number;
  selectedId: number | null;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

function AnnouncementCard({
  news,
  highlighted,
}: {
  news: BreakingNews;
  highlighted: boolean;
}): JSX.Element {
  const external = news.href?.startsWith("http") ?? false;
  return (
    <article
      id={`announcement-${news.id}`}
      className={`rounded-lg border bg-white p-4 shadow-sm transition-shadow ${
        highlighted
          ? "border-emerald-500 ring-2 ring-emerald-200"
          : "border-gray-200"
      }`}
    >
      <h3 className="text-sm font-semibold">{news.title}</h3>
      {news.publicationDate && (
        <time className="text-xs text-gray-500">
          {formatDate(news.publicationDate)}
        </time>
      )}
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
        {news.body}
      </p>
      {news.href && (
        <a
          href={news.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          En savoir plus
          {external && <ExternalLink className="h-3.5 w-3.5" />}
        </a>
      )}
    </article>
  );
}

export function BreakingNewsSidebar({
  news,
  open,
  onToggle,
  unseenCount,
  selectedId,
}: BreakingNewsSidebarProps): JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);

  // Fiche sélectionnée depuis le ruban → scroll en vue une fois ouvert.
  useEffect(() => {
    if (!open || selectedId == null) return;
    const el = panelRef.current?.querySelector(`#announcement-${selectedId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open, selectedId]);

  return (
    <aside
      aria-label="Panneau des actualités"
      className={`fixed right-0 top-1/2 z-40 transition-transform duration-500 ease-in-out ${
        open
          ? "-translate-y-1/2 translate-x-0"
          : "-translate-y-1/2 translate-x-full"
      }`}
    >
      {/* Languette — accrochée au bord gauche du panneau, glisse avec lui */}
      <style>{`
        .akfc-tab-fillet {
          position: absolute;
          right: 0;
          width: 12px;
          height: 12px;
          background: transparent;
          pointer-events: none;
        }
        .akfc-tab-fillet-top {
          top: -12px;
          border-bottom-right-radius: 12px;
          box-shadow: 4px 4px 0 4px rgb(249 250 251); /* gray-50 = fond languette/panneau */
        }
        .akfc-tab-fillet-bottom {
          bottom: -12px;
          border-top-right-radius: 12px;
          box-shadow: 4px -4px 0 4px rgb(249 250 251);
        }
      `}</style>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? "Fermer les actualités" : "Ouvrir les actualités"}
        className="absolute -left-10 top-1/2 flex h-24 w-10 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-l-lg bg-gray-50 text-gray-500 shadow-[-3px_0_8px_rgba(0,0,0,0.08)] transition-colors hover:text-gray-800"
      >
        <span aria-hidden className="akfc-tab-fillet akfc-tab-fillet-top" />
        <span aria-hidden className="akfc-tab-fillet akfc-tab-fillet-bottom" />
        {open ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
        <Megaphone className="h-4 w-4" />
        {!open && unseenCount > 0 && (
          <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold">
            {unseenCount}
          </span>
        )}
      </button>

      <div
        ref={panelRef}
        className="flex max-h-[70dvh] w-80 flex-col gap-3 overflow-y-auto rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 p-4 shadow-xl"
      >
        <h2 className="text-base font-bold">Actualités du club</h2>
        {news.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune actualité en ce moment.
          </p>
        ) : (
          news.map((n) => (
            <AnnouncementCard
              key={n.id}
              news={n}
              highlighted={n.id === selectedId}
            />
          ))
        )}
      </div>
    </aside>
  );
}
