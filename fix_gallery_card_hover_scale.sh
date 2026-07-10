#!/bin/bash
# Grille galerie : au survol, c est la CARTE entiere qui grossit (elle + son
# contenu), pas seulement l image dans un cadre fixe. Le scale/transition
# passe de l <img> au <button> ; overflow-hidden retire ; hover:z-10 pour que
# la carte agrandie passe au-dessus de ses voisines. Effet inverse en quittant.
# À lancer depuis la RACINE du monorepo : bash fix_gallery_card_hover_scale.sh
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
 * Vignettes carrées ; au survol, la CARTE entière grossit (elle et son
 * contenu) et passe au-dessus de ses voisines, effet inverse en quittant.
 * Icône Play sur les vidéos (poster affiché comme aperçu). Réutilisable
 * partout où une galerie doit se montrer en grille.
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
          className="group relative aspect-square rounded-md bg-gray-100 transition-transform duration-300 hover:z-10 hover:scale-105"
          aria-label={`Ouvrir ${item.fileName} dans la visionneuse`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- URLs proxy signées */}
          <img
            src={
              item.kind === "video" ? (item.posterUrl ?? item.url) : item.url
            }
            alt={item.fileName}
            loading="lazy"
            className="h-full w-full rounded-md object-cover"
          />
          {item.kind === "video" && (
            <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/25">
              <Play className="h-8 w-8 text-white drop-shadow" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
FILE_EOF
pnpm --filter web typecheck