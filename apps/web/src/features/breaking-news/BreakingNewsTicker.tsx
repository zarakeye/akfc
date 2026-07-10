"use client";

import { type JSX } from "react";
import type { BreakingNews } from "@prisma/client";

/**
 * Ruban défilant des actualités actives — sous le header public.
 *
 * Défilement continu (keyframes CSS, contenu dupliqué pour une boucle
 * sans couture), pause au survol, et respect de
 * `prefers-reduced-motion` (liste statique scrollable à la place).
 *
 * Avec `onSelect`, chaque titre devient un bouton qui ouvre la sidebar
 * sur la fiche correspondante (câblé par BreakingNewsShell).
 *
 * Rend `null` sans actu active — le bandeau n'existe pas à vide.
 */

interface BreakingNewsTickerProps {
  news: BreakingNews[];
  /** Clic sur un titre → ouvre la sidebar sur cette actu. */
  onSelect?: (id: number) => void;
}

export function BreakingNewsTicker({
  news,
  onSelect,
}: BreakingNewsTickerProps): JSX.Element | null {
  if (news.length === 0) return null;

  // Durée proportionnelle au contenu : ~8s par actu, bornée.
  const duration = Math.min(Math.max(news.length * 8, 12), 60);

  const items = (keyPrefix: string) =>
    news.map((n) => (
      <span
        key={`${keyPrefix}-${n.id}`}
        className="inline-flex items-center gap-3 whitespace-nowrap"
      >
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(n.id)}
            className="cursor-pointer font-medium hover:underline"
          >
            {n.title}
          </button>
        ) : (
          <span className="font-medium">{n.title}</span>
        )}
        <span aria-hidden className="text-emerald-300">
          •
        </span>
      </span>
    ));

  return (
    <div
      aria-label="Actualités du club"
      className="akfc-ticker overflow-hidden bg-emerald-700 py-1.5 text-sm text-white"
    >
      <style>{`
        @keyframes akfc-ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .akfc-ticker-track {
          animation: akfc-ticker-scroll ${duration}s linear infinite;
        }
        .akfc-ticker:hover .akfc-ticker-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .akfc-ticker-track { animation: none; }
          .akfc-ticker { overflow-x: auto; }
        }
      `}</style>
      {/* Piste dupliquée : quand la 1re moitié sort à gauche, la 2de est
          identique → boucle invisible. */}
      <div className="akfc-ticker-track flex w-max items-center gap-3 px-3">
        {items("a")}
        {items("b")}
      </div>
    </div>
  );
}
