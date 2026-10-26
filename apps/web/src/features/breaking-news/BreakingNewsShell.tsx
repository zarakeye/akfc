"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type JSX } from "react";
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
 * Lu par `useSyncExternalStore` : le rendu serveur (et l'hydratation)
 * voient « inconnu » → pas de badge, puis le navigateur lit sa valeur ;
 * pas de mismatch d'hydratation, et pas de setState dans un effet.
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

/*
 * La date de dernière ouverture, vue comme une source externe : React s'y abonne et relit sa
 * valeur quand elle change, dans cet onglet (writeLastSeen) ou dans un autre (événement storage).
 */
const lastSeenListeners = new Set<() => void>();
function subscribeLastSeen(onChange: () => void): () => void {
  lastSeenListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    lastSeenListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}
const readLastSeen = (): string => window.localStorage.getItem(LAST_SEEN_KEY) ?? "";
function writeLastSeen(iso: string): void {
  window.localStorage.setItem(LAST_SEEN_KEY, iso);
  lastSeenListeners.forEach((listener) => listener());
}

function countUnseen(news: BreakingNews[], raw: string): number {
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const interactedRef = useRef(false);

  // Badge : null côté serveur et pendant l'hydratation (valeur inconnue → pas de badge).
  const lastSeenRaw = useSyncExternalStore(subscribeLastSeen, readLastSeen, () => null);
  const unseenCount = lastSeenRaw === null ? 0 : countUnseen(news, lastSeenRaw);

  // Auto-apparition, une fois par session, seulement si non-vues.
  useEffect(() => {
    if (news.length === 0) return;
    if (window.sessionStorage.getItem(AUTOSHOW_SESSION_KEY)) return;
    if (countUnseen(news, readLastSeen()) === 0) return;
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
  const markSeen = () => writeLastSeen(new Date().toISOString());

  const handleToggle = () => {
    interactedRef.current = true;
    // Hors de la fonction de mise à jour de setOpen : celle-ci doit rester pure (React peut
    // l'appeler deux fois), alors que marquer « vu » écrit dans le localStorage.
    if (!open) markSeen();
    setOpen(!open);
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
