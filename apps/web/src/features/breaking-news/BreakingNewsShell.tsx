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
