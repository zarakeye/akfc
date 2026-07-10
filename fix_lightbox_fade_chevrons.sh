#!/bin/bash
# Lightbox : (1) voile moins sombre (bg-black/80 -> /60) ; (2) transition
# FONDU entre medias (effet brouillard, FADE_MS) au lieu d une bascule brute ;
# (3) chevrons plus GROS (h-9) et LATERAUX de part et d autre de l image,
# dans la zone du voile (au lieu de groupes en bas). Compteur + autoplay
# restent en bas.
# À lancer depuis la RACINE du monorepo : bash fix_lightbox_fade_chevrons.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/gallery-public/GalleryLightbox.tsx"
cat > 'apps/web/src/features/gallery-public/GalleryLightbox.tsx' << 'FILE_EOF'
"use client";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";

/**
 * Lightbox carousel des galeries publiques — overlay plein écran à fond
 * translucide (noir 60 % + blur), la liste des contenus de la galerie
 * cliquée se lit sur place : chevrons LATÉRAUX de part et d'autre (dans le
 * voile), flèches clavier, Escape / clic sur le fond / croix pour fermer,
 * compteur, et LECTURE AUTO togglable (~4 s par slide). L'autoplay se coupe
 * sur toute navigation manuelle et pour les vidéos.
 *
 * Transition FONDU entre médias : le média sortant s'estompe, le nouveau
 * apparaît en fondu (effet « brouillard »). Le changement d'index réel est
 * différé le temps du fondu-sortie pour que la bascule ne soit pas brute.
 */

export interface LightboxItem {
  mediaAssetId: string;
  url: string;
  kind: string;
  posterUrl: string | null;
  fileName: string;
}

interface GalleryLightboxProps {
  items: LightboxItem[];
  initialIndex: number;
  onClose: () => void;
}

const AUTOPLAY_MS = 4000;
const FADE_MS = 250;

export function GalleryLightbox({
  items,
  initialIndex,
  onClose,
}: GalleryLightboxProps): JSX.Element | null {
  const [index, setIndex] = useState(initialIndex);
  const [autoplay, setAutoplay] = useState(false);
  // Opacité du média courant : 1 = visible, 0 = estompé (pendant la bascule).
  const [shown, setShown] = useState(true);
  const fadeTimer = useRef<number | null>(null);

  const count = items.length;
  const current = items[index];

  // Change de média avec fondu : estompe (shown=false), puis après FADE_MS
  // bascule l'index et ré-affiche (shown=true → fondu-entrée).
  const goTo = useCallback(
    (next: number, manual: boolean) => {
      if (manual) setAutoplay(false);
      setShown(false);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => {
        setIndex(((next % count) + count) % count);
        setShown(true);
      }, FADE_MS);
    },
    [count],
  );

  useEffect(() => {
    return () => {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  // Lecture auto — jamais sur une vidéo (elle a son propre temps).
  useEffect(() => {
    if (!autoplay || count < 2) return;
    if (current?.kind === "video") return;
    const t = setInterval(() => {
      goTo(index + 1, false);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [autoplay, count, current?.kind, index, goTo]);

  // Clavier : ← → naviguent (manuel), Escape ferme.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goTo(index + 1, true);
      else if (e.key === "ArrowLeft") goTo(index - 1, true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, onClose]);

  if (!current) return null;

  const controlClass =
    "rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25";

  // Chevron latéral (grand, centré verticalement, dans la zone du voile).
  const sideChevron =
    "absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center " +
    "rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de la galerie"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Chevron gauche — bord gauche du voile, hors du contenu cliquable */}
      {count > 1 && (
        <button
          type="button"
          aria-label="Média précédent"
          onClick={(e) => {
            e.stopPropagation();
            goTo(index - 1, true);
          }}
          className={`${sideChevron} left-4`}
        >
          <ChevronLeft className="h-9 w-9" />
        </button>
      )}

      {/* Contenu — le clic n'y ferme pas (stopPropagation) */}
      <div
        className="relative flex max-h-[90dvh] max-w-[92vw] flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Média, en fondu (opacité pilotée par `shown`) */}
        <div
          className="transition-opacity ease-in-out"
          style={{
            opacity: shown ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          {current.kind === "video" ? (
            <video
              key={current.mediaAssetId}
              src={current.url}
              poster={current.posterUrl ?? undefined}
              controls
              className="max-h-[78dvh] max-w-[92vw] rounded-md"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- URL proxy signée, dimensions inconnues
            <img
              key={current.mediaAssetId}
              src={current.url}
              alt={current.fileName}
              className="max-h-[78dvh] max-w-[92vw] rounded-md object-contain"
            />
          )}
        </div>

        {/* Barre du bas : autoplay + compteur (chevrons désormais latéraux) */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-pressed={autoplay}
            aria-label={
              autoplay ? "Arrêter la lecture auto" : "Lancer la lecture auto"
            }
            onClick={() => setAutoplay((a) => !a)}
            className={controlClass}
          >
            {autoplay ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          <span className="text-sm tabular-nums text-white/80">
            {index + 1} / {count}
          </span>
        </div>
      </div>

      {/* Chevron droit — bord droit du voile */}
      {count > 1 && (
        <button
          type="button"
          aria-label="Média suivant"
          onClick={(e) => {
            e.stopPropagation();
            goTo(index + 1, true);
          }}
          className={`${sideChevron} right-4`}
        >
          <ChevronRight className="h-9 w-9" />
        </button>
      )}

      <button
        type="button"
        aria-label="Fermer la visionneuse"
        autoFocus
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
FILE_EOF

echo
echo "Typecheck web..."
pnpm --filter web typecheck

echo
echo "Typecheck OK -> commit."
git add -A
git commit -m "feat(lightbox): voile allege, fondu entre medias, chevrons lateraux agrandis"
echo "Commit effectue."