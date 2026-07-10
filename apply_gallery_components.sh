#!/bin/bash
# Galeries publiques — 3 composants decouples :
#  (a) GalleryGrid : grille de medias, zoom au survol, clic -> index.
#  (b) GalleryLightbox : existant, inchange (visionneuse).
#  (c) GalleryAccordion : liste de galeries depliables (chevron),
#      MULTI-OUVERTURE, monte la grille dans chaque panneau.
# La page /gallery devient un simple orchestrateur (fetch session-aware).
# À lancer depuis la RACINE du monorepo : bash apply_gallery_components.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/gallery-public/GalleryGrid.tsx"
cat > 'apps/web/src/features/gallery-public/GalleryGrid.tsx' << 'FILE_EOF'
"use client";

import { type JSX } from "react";
import { Play } from "lucide-react";

import { type LightboxItem } from "@features/gallery-public/GalleryLightbox";

/**
 * (a) Grille de médias d'une galerie.
 *
 * Présentationnel pur : reçoit les items et un callback de clic (l'index
 * dans la liste, pour que le parent ouvre le lightbox au bon média).
 * Vignettes carrées, agrandissement au survol (scale), icône Play sur
 * les vidéos (poster affiché comme aperçu). Réutilisable partout où une
 * galerie doit se montrer en grille.
 */

interface GalleryGridProps {
  items: LightboxItem[];
  onItemClick: (index: number) => void;
}

export function GalleryGrid({
  items,
  onItemClick,
}: GalleryGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item, i) => (
        <button
          key={item.mediaAssetId}
          type="button"
          onClick={() => onItemClick(i)}
          className="group relative aspect-square overflow-hidden rounded-md bg-gray-100"
          aria-label={`Ouvrir ${item.fileName} dans la visionneuse`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- URLs proxy signées */}
          <img
            src={
              item.kind === "video" ? (item.posterUrl ?? item.url) : item.url
            }
            alt={item.fileName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {item.kind === "video" && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/25">
              <Play className="h-8 w-8 text-white drop-shadow" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/gallery-public/GalleryAccordion.tsx"
cat > 'apps/web/src/features/gallery-public/GalleryAccordion.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> apps/web/src/app/(public)/gallery/page.tsx"
cat > 'apps/web/src/app/(public)/gallery/page.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import {
  GalleryLightbox,
  type LightboxItem,
} from "@features/gallery-public/GalleryLightbox";
import {
  GalleryAccordion,
  type AccordionGallery,
} from "@features/gallery-public/GalleryAccordion";

/**
 * Page publique des galeries — `/gallery`.
 *
 * Orchestrateur : fetch SESSION-AWARE (anonyme = PUBLIC, connecté =
 * +MEMBERS ; le cookie voyage avec la requête, re-fetch au changement de
 * session) puis assemble les trois composants découplés :
 *   (c) GalleryAccordion — liste dépliable multi-ouverture,
 *   (a) GalleryGrid — grille montée dans chaque galerie dépliée,
 *   (b) GalleryLightbox — visionneuse ouverte au média cliqué.
 */

type PublicGallery = Awaited<
  ReturnType<typeof trpcClient.gallery.getPublicIndex.query>
>[number];

export default function PublicGalleryPage(): JSX.Element {
  const userId = useSessionStore((s) => s.session?.user?.id ?? null);
  const [galleries, setGalleries] = useState<PublicGallery[] | null>(null);
  const [lightbox, setLightbox] = useState<{
    items: LightboxItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void trpcClient.gallery.getPublicIndex.query().then((data) => {
      if (!cancelled) setGalleries(data);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const visible: AccordionGallery[] = (galleries ?? [])
    .filter((g) => g.items.length > 0)
    .map((g) => ({
      id: g.id,
      title: g.title,
      date: g.date,
      visibility: g.visibility,
      items: g.items,
    }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">La galerie</h1>

      {galleries === null ? (
        <p className="text-gray-500">Chargement…</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-500">Aucune galerie pour l&apos;instant.</p>
      ) : (
        <GalleryAccordion
          galleries={visible}
          onItemClick={(items, index) => setLightbox({ items, index })}
        />
      )}

      {lightbox && (
        <GalleryLightbox
          items={lightbox.items}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck