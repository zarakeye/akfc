/**
 * 👻 dragGhost — Manager impératif du visuel "ghost" pendant un DnD.
 *
 * Ce module gère un seul élément flottant (`<div>` en `position: fixed`)
 * qui suit le curseur pendant un drag, affiche jusqu'à 3 vignettes des
 * items déplacés (avec un compteur "+N" si plus), et un badge de statut
 * "allowed" (vert) ou "forbidden" (rouge) selon la cible survolée.
 *
 * 🎯 Pourquoi un module impératif et pas un composant React ?
 *
 * Le ghost doit suivre la souris en temps réel pendant un événement de
 * drag global, à travers n'importe quel sous-arbre React. Le faire en
 * React imposerait un portail + un setState par mousemove (saturation
 * de re-renders). Un module impératif avec un singleton DOM est ici
 * plus simple et plus performant — c'est aussi l'approche du legacy
 * de l'ancienne implémentation Cloudinary-specific (depuis supprimée).
 *
 * 🔍 Détection du drop target
 *
 * À chaque `dragover` global, on récupère l'élément sous le curseur via
 * `document.elementFromPoint`, puis on remonte chercher un attribut
 * `data-finder-drop-path` (posé par le composant target). Le path lu
 * est passé à `isDropAllowed` pour calculer le badge.
 *
 * 🧹 Cleanup
 *
 * On enregistre des listeners globaux sur `drop` et `dragend` (les deux,
 * car un drag annulé par Esc déclenche `dragend` mais pas `drop`). À la
 * première occurrence, on retire le ghost et tous les listeners.
 */

import { isDropAllowed, type DragItem } from '@features/finder-core/dnd/payload';

const FINDER_DROP_PATH_ATTR = 'data-finder-drop-path';

/* -------------------------------------------------------------------------- */
/*                              GHOST PREVIEW TYPES                           */
/* -------------------------------------------------------------------------- */

/**
 * Une vignette du ghost. Chaque kind reçoit un rendu différent :
 *   - `image`    : aperçu réel via `<img src={url}>`
 *   - `video`    : icône caméra
 *   - `document` : icône document
 *   - `folder`   : icône dossier
 */
export type GhostPreview =
  | { kind: 'folder'; name: string }
  | { kind: 'image'; name: string; url: string }
  | { kind: 'video'; name: string }
  | { kind: 'document'; name: string };

type StartGhostArgs = {
  e: React.DragEvent;
  items: DragItem[];
  previews: GhostPreview[];
};

/* -------------------------------------------------------------------------- */
/*                                 SINGLETONS                                 */
/* -------------------------------------------------------------------------- */

let ghostEl: HTMLDivElement | null = null;
let badgeEl: HTMLDivElement | null = null;
let dragImageEl: HTMLDivElement | null = null;
let itemsRef: DragItem[] = [];

/* -------------------------------------------------------------------------- */
/*                              POSITION / BADGE                              */
/* -------------------------------------------------------------------------- */

function moveGhost(x: number, y: number): void {
  if (!ghostEl) return;
  ghostEl.style.left = `${x + 14}px`;
  ghostEl.style.top = `${y + 14}px`;
}

function setBadgeState(state: 'allowed' | 'forbidden'): void {
  if (!badgeEl) return;

  const base =
    'absolute -top-3 -right-3 z-[99999] w-8 h-8 rounded-full flex items-center justify-center shadow-md';

  badgeEl.className =
    state === 'allowed'
      ? `${base} bg-emerald-400/90`
      : `${base} bg-rose-400/90`;

  // Pas d'innerHTML pour les SVG : ils sont statiques et inoffensifs.
  badgeEl.innerHTML = state === 'allowed' ? svgPlus() : svgX();
}

function svgPlus(): string {
  return `
  <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgX(): string {
  return `
  <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7l10 10M17 7L7 17" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/* -------------------------------------------------------------------------- */
/*                                RENDER GHOST                                */
/* -------------------------------------------------------------------------- */

/**
 * Construit la pile de vignettes (max 3) + compteur "+N" si plus.
 *
 * On utilise `createElement` + `textContent` pour les noms d'items
 * (XSS-safe — un asset Cloudinary nommé `<script>...</script>` ne
 * pourra rien injecter). Les SVG inlinés via innerHTML sont statiques
 * et donc sans risque.
 */
function renderGhost(previews: GhostPreview[]): void {
  if (!ghostEl) return;
  ghostEl.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'relative';

  // Badge — état initial "allowed" (sera mis à jour au premier dragover)
  const badge = document.createElement('div');
  badgeEl = badge;
  setBadgeState('allowed');
  wrapper.appendChild(badge);

  // Pile de vignettes
  const stack = document.createElement('div');
  stack.className = 'relative w-24 h-24 opacity-70';

  const top = previews.slice(0, 3);

  top.forEach((preview, idx) => {
    const card = document.createElement('div');
    card.className =
      'absolute w-24 h-24 rounded border border-gray-200 bg-white/80 overflow-hidden flex flex-col items-center justify-center';

    const dx = idx * 6;
    const dy = idx * 6;
    card.style.transform = `translate(${dx}px, ${dy}px)`;

    appendPreviewContent(card, preview);
    stack.appendChild(card);
  });

  wrapper.appendChild(stack);

  // Compteur "+N" si plus de 3 items
  if (previews.length > 3) {
    const count = document.createElement('div');
    count.className =
      'absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full';
    count.textContent = `+${previews.length - 3}`;
    wrapper.appendChild(count);
  }

  ghostEl.appendChild(wrapper);
}

/**
 * Pose le contenu typé d'une vignette dans son container.
 *
 * Pour les images : `<img>` avec `meta.url`. Si l'URL casse au chargement,
 * le navigateur affiche le placeholder broken-image standard — on accepte
 * ce comportement, qui reste plus utile qu'une icône générique.
 *
 * Pour les autres kinds : icône emoji + nom tronqué. Choix d'emojis :
 *   - 📁 folder
 *   - 🎬 video
 *   - 📄 document
 *   - 🖼️ image (fallback si meta.url manquante)
 */
function appendPreviewContent(card: HTMLElement, preview: GhostPreview): void {
  if (preview.kind === 'image') {
    const img = document.createElement('img');
    img.src = preview.url;
    img.alt = preview.name;
    img.className = 'w-full h-full object-cover bg-gray-50/60';
    card.appendChild(img);
    return;
  }

  const inner = document.createElement('div');
  inner.className = 'flex flex-col items-center justify-center text-center px-2 gap-1';

  const icon = document.createElement('div');
  icon.className = 'text-3xl';
  icon.textContent = iconFor(preview.kind);
  inner.appendChild(icon);

  const name = document.createElement('div');
  name.className = 'text-xs truncate w-full';
  name.textContent = preview.name; // ⚠️ textContent (pas innerHTML) — XSS-safe
  inner.appendChild(name);

  card.appendChild(inner);
}

function iconFor(kind: 'folder' | 'video' | 'document'): string {
  switch (kind) {
    case 'folder':
      return '📁';
    case 'video':
      return '🎬';
    case 'document':
      return '📄';
  }
}

/* -------------------------------------------------------------------------- */
/*                          DOCUMENT-WIDE DRAG TRACKING                       */
/* -------------------------------------------------------------------------- */

function handleDocumentDragOver(e: DragEvent): void {
  if (!ghostEl) return;

  moveGhost(e.clientX, e.clientY);

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const dropZone = el?.closest?.(`[${FINDER_DROP_PATH_ATTR}]`) ?? null;

  if (!dropZone) {
    setBadgeState('forbidden');
    return;
  }

  const targetPath = dropZone.getAttribute(FINDER_DROP_PATH_ATTR);
  if (!targetPath) {
    setBadgeState('forbidden');
    return;
  }

  setBadgeState(isDropAllowed(targetPath, itemsRef) ? 'allowed' : 'forbidden');
}

/* -------------------------------------------------------------------------- */
/*                                  CLEANUP                                   */
/* -------------------------------------------------------------------------- */

function cleanup(): void {
  document.removeEventListener('dragover', handleDocumentDragOver);
  window.removeEventListener('drop', cleanup, true);
  window.removeEventListener('dragend', cleanup, true);

  if (ghostEl) {
    ghostEl.remove();
    ghostEl = null;
  }

  if (dragImageEl) {
    dragImageEl.remove();
    dragImageEl = null;
  }

  badgeEl = null;
  itemsRef = [];
}

/* -------------------------------------------------------------------------- */
/*                                ENTRY POINT                                 */
/* -------------------------------------------------------------------------- */

/**
 * Démarre le ghost et active le tracking pour la durée du drag.
 *
 * À appeler depuis l'`onDragStart` du composant source. Le ghost se
 * cleanup tout seul au `drop` ou au `dragend` — l'appelant n'a rien
 * à faire de spécial à la fin.
 *
 * Si un ghost précédent est encore actif (drag enchaîné très vite),
 * on le nettoie d'abord.
 */
export function startDragGhost(args: StartGhostArgs): void {
  const { e, items, previews } = args;

  // Nettoyage défensif d'un ghost précédent qui n'aurait pas été cleanup.
  cleanup();

  itemsRef = items;

  // Neutralise le ghost natif HTML5 en passant un élément invisible
  // comme dragImage. C'est plus fiable qu'un canvas vide ou un image
  // inexistant qui peuvent laisser des artefacts selon les navigateurs.
  dragImageEl = createTransparentDragImageEl();
  e.dataTransfer.setDragImage(dragImageEl, 0, 0);

  const ghost = document.createElement('div');
  ghost.className = 'fixed z-[9999] pointer-events-none select-none';
  ghost.style.left = '0px';
  ghost.style.top = '0px';

  document.body.appendChild(ghost);
  ghostEl = ghost;

  renderGhost(previews);
  moveGhost(e.clientX, e.clientY);

  document.addEventListener('dragover', handleDocumentDragOver);
  window.addEventListener('drop', cleanup, true);
  window.addEventListener('dragend', cleanup, true);
}

function createTransparentDragImageEl(): HTMLDivElement {
  const el = document.createElement('div');
  el.style.width = '1px';
  el.style.height = '1px';
  el.style.opacity = '0';
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  el.style.top = '-9999px';
  el.style.pointerEvents = 'none';
  document.body.appendChild(el);
  return el;
}
