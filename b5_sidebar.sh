#!/bin/bash
# Chantier BreakingNews — B.5 (final) : sidebar escamotable + fiches
# Announcement + languette à badge (localStorage) + clic-ruban câblé.
# À lancer depuis la RACINE du monorepo : bash apply_b5_sidebar.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

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
FILE_EOF

echo "-> apps/web/src/features/breaking-news/BreakingNewsSidebar.tsx"
cat > 'apps/web/src/features/breaking-news/BreakingNewsSidebar.tsx' << 'FILE_EOF'
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
 * Panneau fixed glissant (translate-x), languette accrochée à son bord
 * gauche — elle glisse AVEC lui et reste donc toujours saisissable. Le
 * badge de non-vues est porté par la languette (calculé par le Shell,
 * qui possède l'état et le localStorage).
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
      className={`fixed right-0 top-24 z-40 transition-transform duration-500 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Languette — accrochée au bord gauche du panneau, glisse avec lui */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? "Fermer les actualités" : "Ouvrir les actualités"}
        className="absolute -left-10 top-6 flex h-24 w-10 flex-col items-center justify-center gap-1 rounded-l-lg bg-emerald-700 text-white shadow-md transition-colors hover:bg-emerald-600"
      >
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
FILE_EOF

echo "-> apps/web/src/features/breaking-news/BreakingNewsShell.tsx"
cat > 'apps/web/src/features/breaking-news/BreakingNewsShell.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import type { BreakingNews } from "@prisma/client";

import { BreakingNewsTicker } from "@features/breaking-news/BreakingNewsTicker";
import { BreakingNewsSidebar } from "@features/breaking-news/BreakingNewsSidebar";

/**
 * Orchestrateur client du dispositif BreakingNews public :
 * ruban (teaser) + sidebar (fiches), état partagé, badge de non-vues.
 *
 * **Badge sans backend** : `localStorage` garde l'horodatage de la
 * dernière ouverture du panneau ; non-vues = actus publiées depuis.
 * Zéro table de lecture, et ça marche pour les visiteurs anonymes.
 * Lu dans un effet (jamais au rendu) pour éviter tout mismatch
 * d'hydratation — le badge apparaît juste après le montage.
 *
 * **Auto-apparition** (spec handoff : « apparaît qq s puis glisse ») :
 * 2 s après le chargement le panneau glisse en vue, 7 s plus tard il
 * s'escamote — MAIS uniquement s'il y a du non-vu, et une fois par
 * session (sessionStorage) : une sidebar qui surgit à chaque page
 * serait une nuisance, pas une information. Toute interaction manuelle
 * annule l'escamotage automatique.
 */

const LAST_SEEN_KEY = "akfc-news-last-seen";
const AUTOSHOW_SESSION_KEY = "akfc-news-autoshown";

interface BreakingNewsShellProps {
  news: BreakingNews[];
}

function countUnseen(news: BreakingNews[]): number {
  const raw = window.localStorage.getItem(LAST_SEEN_KEY);
  const lastSeen = raw ? new Date(raw) : null;
  if (!lastSeen || Number.isNaN(lastSeen.getTime())) return news.length;
  return news.filter(
    (n) => n.publicationDate && new Date(n.publicationDate) > lastSeen,
  ).length;
}

export function BreakingNewsShell({
  news,
}: BreakingNewsShellProps): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const interactedRef = useRef(false);

  // Badge : lecture localStorage post-montage (pas de mismatch SSR).
  useEffect(() => {
    setUnseenCount(countUnseen(news));
  }, [news]);

  // Auto-apparition, une fois par session, seulement si non-vues.
  useEffect(() => {
    if (news.length === 0) return;
    if (window.sessionStorage.getItem(AUTOSHOW_SESSION_KEY)) return;
    if (countUnseen(news) === 0) return;
    window.sessionStorage.setItem(AUTOSHOW_SESSION_KEY, "1");
    const show = setTimeout(() => setOpen(true), 2000);
    const hide = setTimeout(() => {
      if (!interactedRef.current) setOpen(false);
    }, 9000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [news]);

  // Ouvrir = tout marquer vu.
  const markSeen = () => {
    window.localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    setUnseenCount(0);
  };

  const handleToggle = () => {
    interactedRef.current = true;
    setOpen((o) => {
      if (!o) markSeen();
      return !o;
    });
  };

  const handleSelect = (id: number) => {
    interactedRef.current = true;
    setSelectedId(id);
    markSeen();
    setOpen(true);
  };

  if (news.length === 0) return null;

  return (
    <>
      <BreakingNewsTicker news={news} onSelect={handleSelect} />
      <BreakingNewsSidebar
        news={news}
        open={open}
        onToggle={handleToggle}
        unseenCount={unseenCount}
        selectedId={selectedId}
      />
    </>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/layout.tsx"
cat > 'apps/web/src/app/(public)/layout.tsx' << 'FILE_EOF'
import { JSX } from "react";

import Header from "@features/app-shell/Header";
import { prisma } from "@backend/prisma";
import { BreakingNewsShell } from "@features/breaking-news/BreakingNewsShell";

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
 * et les sert au ruban et à la sidebar (via BreakingNewsShell) sur TOUTES les pages
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
      <BreakingNewsShell news={activeNews} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck