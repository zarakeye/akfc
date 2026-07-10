"use client";

import { useState, type JSX } from "react";
import { ChevronRight, Lock } from "lucide-react";

import { GalleryGrid } from "@features/gallery-public/GalleryGrid";
import { type LightboxItem } from "@features/gallery-public/GalleryLightbox";

/**
 * (c) Liste des galeries, chacune dépliable par un chevron.
 *
 * MULTI-OUVERTURE (décision 2026-07-03) : plusieurs galeries peuvent être
 * ouvertes simultanément — l'état est un Set d'ids ouverts, pas un id
 * unique. Repliées par défaut (on déplie à la demande). Le dépli monte
 * `GalleryGrid` (a) ; un clic dans la grille remonte au parent via
 * `onItemClick(items, index)` pour qu'il ouvre le lightbox (b).
 *
 * Pastille cadenas sur les galeries MEMBERS (visibilité par galerie).
 */

export interface AccordionGallery {
  id: number;
  title: string;
  date: Date | null;
  visibility: string;
  items: LightboxItem[];
}

interface GalleryAccordionProps {
  galleries: AccordionGallery[];
  onItemClick: (items: LightboxItem[], index: number) => void;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function GalleryAccordion({
  galleries,
  onItemClick,
}: GalleryAccordionProps): JSX.Element {
  // Multi-ouverture : un Set des ids dépliés.
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200">
      {galleries.map((g) => {
        const open = openIds.has(g.id);
        return (
          <div key={g.id}>
            <button
              type="button"
              onClick={() => toggle(g.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <ChevronRight
                className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                  open ? "rotate-90" : ""
                }`}
                aria-hidden
              />
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-lg font-semibold">{g.title}</span>
                {g.date && (
                  <span className="text-sm text-gray-500">
                    {formatDate(g.date)}
                  </span>
                )}
                {g.visibility === "MEMBERS" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    <Lock className="h-3 w-3" />
                    Membres
                  </span>
                )}
                <span className="text-sm text-gray-400">
                  ({g.items.length})
                </span>
              </span>
            </button>

            {open && (
              <div className="px-4 pb-4">
                <GalleryGrid
                  items={g.items}
                  onItemClick={(index) => onItemClick(g.items, index)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
