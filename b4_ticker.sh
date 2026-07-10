#!/bin/bash
# Chantier BreakingNews — B.4 : ruban défilant sous le header public,
# alimenté par le layout (RSC, Prisma direct, zéro requête client).
# À lancer depuis la RACINE du monorepo : bash apply_b4_ticker.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

mkdir -p apps/web/src/features/breaking-news

echo "-> apps/web/src/features/breaking-news/BreakingNewsTicker.tsx"
cat > 'apps/web/src/features/breaking-news/BreakingNewsTicker.tsx' << 'FILE_EOF'
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
 * B.4 : les titres sont informatifs. B.5 les rendra cliquables pour
 * ouvrir la sidebar sur la fiche correspondante.
 *
 * Rend `null` sans actu active — le bandeau n'existe pas à vide.
 */

interface BreakingNewsTickerProps {
  news: BreakingNews[];
}

export function BreakingNewsTicker({
  news,
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
        <span className="font-medium">{n.title}</span>
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
FILE_EOF

echo "-> apps/web/src/app/(public)/layout.tsx"
cat > 'apps/web/src/app/(public)/layout.tsx' << 'FILE_EOF'
import { JSX } from "react";

import Header from "@features/app-shell/Header";
import { prisma } from "@backend/prisma";
import { BreakingNewsTicker } from "@features/breaking-news/BreakingNewsTicker";

/**
 * Layout du SITE PUBLIC.
 *
 * Contrairement au shell admin, le public est constitué de pages longues
 * (home avec carousel + sections, disciplines, stages…). On laisse donc le
 * DOCUMENT scroller naturellement : aucune hauteur fixe, aucun
 * `overflow-hidden`. Header sticky en haut, contenu qui s'étend en dessous.
 *
 * Le layout fetch les BreakingNews ACTIVES (publiées, non expirées) en
 * Prisma direct — même logique que `breakingNews.getActive` côté tRPC —
 * et les sert au ruban (et à la sidebar, B.5) sur TOUTES les pages
 * publiques, sans une seule requête client. Le ruban vit sous le header,
 * hors du bloc sticky : il défile avec la page au lieu de consommer de
 * la hauteur en permanence.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const now = new Date();
  const activeNews = await prisma.breakingNews.findMany({
    where: {
      publicationDate: { not: null, lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { publicationDate: "desc" },
    take: 20,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-50 bg-background">
        <Header />
      </div>
      <BreakingNewsTicker news={activeNews} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck