/**
 * dragGhost.manager.ts
 *
 * Corrections UX :
 * - Ghost plus translucide
 * - Badge au-dessus (z-index élevé)
 * - Suppression fiable du dragImage natif (setDragImage avec élément DOM transparent)
 * - Badge pastel + shadow + icône SVG (traits arrondis)
 */

import type { DragSource, MoveTarget } from '@/shared/cloudinary/move.types';
import { canMove } from '@/server/cloudinary/move.guards';

type Preview =
  | { kind: 'file'; name: string; thumbUrl: string }
  | { kind: 'folder'; name: string };

type DropDataset =
  | { type: 'folder'; fullPath: string }
  | { type: 'virtual-folder'; status: 'pending' | 'published' | 'bin' };

let ghostEl: HTMLDivElement | null = null;
let badgeEl: HTMLDivElement | null = null;
let sourceRef: DragSource | null = null;
let dragImageEl: HTMLDivElement | null = null;

function createTransparentDragImageEl(): HTMLDivElement {
  // ✅ élément DOM transparent, fiable pour neutraliser le ghost natif
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

function moveGhost(x: number, y: number) {
  if (!ghostEl) return;
  ghostEl.style.left = `${x + 14}px`;
  ghostEl.style.top = `${y + 14}px`;
}

function svgPlus() {
  return `
  <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgX() {
  return `
  <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7l10 10M17 7L7 17" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function setBadgeState(state: 'allowed' | 'forbidden') {
  if (!badgeEl) return;

  // ✅ Couleurs pastel + shadow vers le bas + z-index au-dessus du ghost
  const base =
    'absolute -top-3 -right-3 z-[99999] w-8 h-8 rounded-full flex items-center justify-center shadow-md';

  const allowed = 'bg-emerald-400/90';
  const forbidden = 'bg-rose-400/90';

  badgeEl.className = `${base} ${state === 'allowed' ? allowed : forbidden}`;
  badgeEl.innerHTML = state === 'allowed' ? svgPlus() : svgX();
}

function renderGhost(previews: Preview[]) {
  if (!ghostEl) return;
  ghostEl.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'relative';

  // Badge
  const badge = document.createElement('div');
  badgeEl = badge;
  setBadgeState('allowed');
  wrapper.appendChild(badge);

  // Pile
  const stack = document.createElement('div');
  // ✅ Ghost translucide
  stack.className = 'relative w-24 h-24 opacity-70';

  const top = previews.slice(0, 3);

  top.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className =
      'absolute w-24 h-24 rounded border border-gray-200 bg-white/80 overflow-hidden flex items-center justify-center';

    const dx = idx * 6;
    const dy = idx * 6;
    card.style.transform = `translate(${dx}px, ${dy}px)`;

    if (p.kind === 'file') {
      const img = document.createElement('img');
      img.src = p.thumbUrl;
      img.alt = p.name;
      img.className = 'w-full h-full object-contain bg-gray-50/60';
      card.appendChild(img);
    } else {
      const inner = document.createElement('div');
      inner.className = 'flex flex-col items-center justify-center text-center px-2';
      inner.innerHTML = `<div class="text-3xl">📁</div><div class="text-xs truncate w-full">${p.name}</div>`;
      card.appendChild(inner);
    }

    stack.appendChild(card);
  });

  wrapper.appendChild(stack);

  // compteur si > 3
  if (previews.length > 3) {
    const count = document.createElement('div');
    count.className =
      'absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full';
    count.textContent = `+${previews.length - 3}`;
    wrapper.appendChild(count);
  }

  ghostEl.appendChild(wrapper);
}

function parseDropDataset(el: Element | null): DropDataset | null {
  if (!el) return null;

  const type = el.getAttribute('data-drop-type');
  if (!type) return null;

  if (type === 'folder') {
    const fullPath = el.getAttribute('data-drop-path');
    if (!fullPath) return null;
    return { type: 'folder', fullPath };
  }

  if (type === 'virtual-folder') {
    const status = el.getAttribute('data-drop-status') as
      | 'pending'
      | 'published'
      | 'bin'
      | null;
    if (!status) return null;
    return { type: 'virtual-folder', status };
  }

  return null;
}

function buildTargetFromDataset(ds: DropDataset): MoveTarget {
  if (ds.type === 'virtual-folder') return { type: 'virtual-folder', status: ds.status };
  return { type: 'folder', fullPath: ds.fullPath };
}

function handleDocumentDragOver(e: DragEvent) {
  if (!ghostEl || !sourceRef) return;

  moveGhost(e.clientX, e.clientY);

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const dropZone = el?.closest?.('[data-drop-type]') ?? null;

  const ds = parseDropDataset(dropZone);
  if (!ds) {
    setBadgeState('forbidden');
    return;
  }

  const target = buildTargetFromDataset(ds);
  const ok = canMove(sourceRef, target);
  setBadgeState(ok ? 'allowed' : 'forbidden');
}

function cleanup() {
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
  sourceRef = null;
}

export function startDragGhost(args: {
  e: React.DragEvent;
  source: DragSource;
  previews: Preview[];
}) {
  const { e, source, previews } = args;

  sourceRef = source;

  // ✅ Neutralise le ghost natif HTML5
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
