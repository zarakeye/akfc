"use client";

import { useCallback, useEffect, useState, type JSX } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";

/**
 * Lightbox carousel des galeries publiques — overlay plein écran à fond
 * translucide (noir 80 % + blur), la liste des contenus de la galerie
 * cliquée se lit sur place : chevrons, flèches clavier, Escape / clic
 * sur le fond / croix pour fermer, compteur, et LECTURE AUTO togglable
 * (~4 s par slide). L'autoplay se coupe sur toute navigation manuelle
 * et pour les vidéos (on ne coupe pas quelqu'un qui regarde).
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

export function GalleryLightbox({
  items,
  initialIndex,
  onClose,
}: GalleryLightboxProps): JSX.Element | null {
  const [index, setIndex] = useState(initialIndex);
  const [autoplay, setAutoplay] = useState(false);

  const count = items.length;
  const current = items[index];

  const goTo = useCallback(
    (next: number, manual: boolean) => {
      setIndex(((next % count) + count) % count);
      if (manual) setAutoplay(false);
    },
    [count],
  );

  // Lecture auto — jamais sur une vidéo (elle a son propre temps).
  useEffect(() => {
    if (!autoplay || count < 2) return;
    if (current?.kind === "video") return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [autoplay, count, current?.kind]);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de la galerie"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Contenu — le clic n'y ferme pas (stopPropagation) */}
      <div
        className="relative flex max-h-[90dvh] max-w-[92vw] flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
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

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Média précédent"
            onClick={() => goTo(index - 1, true)}
            className={controlClass}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

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

          <button
            type="button"
            aria-label="Média suivant"
            onClick={() => goTo(index + 1, true)}
            className={controlClass}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Fermer la visionneuse"
        autoFocus
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
