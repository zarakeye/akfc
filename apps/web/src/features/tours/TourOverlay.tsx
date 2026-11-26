"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { tourStore } from "./tour.store";
import type { Tour, TourStep } from "./tour.types";

/* ►►► Réglages ◄◄◄ */
const PAD = 6; // marge autour de la cible (px)
const BUBBLE_W = 340; // largeur de la bulle (px)
const GAP = 12; // écart bulle ↔ cible (px)
const BUBBLE_ROOM = 200; // place qu'il faut à la bulle, sous ou au-dessus de la cible (px)
const WAIT_MS = 8000; // délai avant d'abandonner une cible introuvable
const OPTIONAL_WAIT_MS = 1500; // délai avant de passer une étape facultative sans cible
const DIM = "rgba(15, 23, 42, 0.62)"; // voile
const CURSOR_MS = 900; // trajet du curseur guidé d'une cible à la suivante
const TYPE_MS = 45; // « Remplir pour moi » : délai entre deux lettres

/**
 * Le curseur guidé (tuto lancé avec `cursor`, dans la démo) : sa dernière position survit au
 * changement d'étape, pour qu'il parte de la cible précédente plutôt que d'un coin de l'écran.
 */
let lastCursor: { x: number; y: number } | null = null;

type Rect = { top: number; left: number; width: number; height: number };

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height);

/**
 * La cible d'une étape : le premier élément VISIBLE qui porte ce nom. Un même nom peut désigner
 * deux éléments dont un seul s'affiche selon la largeur de l'écran (la barre du header sur un
 * grand écran, le bouton du menu sur un téléphone) ; un élément masqué n'a pas de position.
 */
function findTarget(name: string | undefined, text?: string, pick?: string): HTMLElement | null {
  if (!name) return null;
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(name)}"]`)) {
    if (el.getClientRects().length === 0) continue;
    if (!text) return el;
    // Une ligne d'une table ou d'une liste, reconnue à son texte (`targetText`) ; dedans, au
    // besoin, un élément précis (`targetPick`, un sélecteur CSS : son bouton « Ajouter »…).
    for (const row of el.querySelectorAll<HTMLElement>("tr, li, [role='row']")) {
      if (row.getClientRects().length === 0 || !row.textContent?.includes(text)) continue;
      if (!pick) return row;
      const picked = row.querySelector<HTMLElement>(pick);
      if (picked) return picked;
    }
  }
  return null;
}

/** Le champ d'une cible : elle-même, ou le premier champ qu'elle contient. */
function fieldOf(el: HTMLElement | null): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  if (!el) return null;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el;
  return el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select");
}

/**
 * Écrit dans un champ comme le ferait le clavier : par le setter natif de `value`, puis un
 * évènement `input`. React ne voit pas une simple affectation (`el.value = …`) : son état garde
 * l'ancienne valeur et l'efface au rendu suivant.
 */
function setFieldValue(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  const proto =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : field instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

const INTERACTIVE = "button, a[href], input, select, textarea, summary, [role='button'], [role='menuitem'], [role='link']";
type Spot = { x: number; y: number };
const centerOf = (r: DOMRect): Spot => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

/** Le rectangle du CONTENU d'un élément (son texte, sa case) : pas toute la largeur de sa boîte. */
function contentBox(el: HTMLElement): DOMRect {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? r : el.getBoundingClientRect();
}

/**
 * Tuto guidé : la zone éclairée et l'endroit où s'arrête le curseur, au plus juste de ce qu'il
 * faut toucher. Une cible est souvent un conteneur (`data-tour` sur le bloc d'un bouton, sur une
 * étiquette pleine largeur) : éclairer tout le bloc et viser son centre montrerait un vide, et un
 * clic à cet endroit ne ferait rien. On vise donc :
 *   - pour une saisie, le champ lui-même, à son début (là où l'on clique pour écrire) ;
 *   - pour un clic, l'élément cliquable du bloc (son bouton, son lien) ; une case à cocher dans
 *     son étiquette, l'étiquette réduite à son contenu ;
 *   - pour une ligne de table, toute la ligne (elle est cliquable), le curseur sur sa première case.
 */
function guidedGeometry(el: HTMLElement, kind: TourStep["advance"]["kind"], isRow: boolean): { rect: DOMRect; spot: Spot } {
  if (kind === "input") {
    const r = (fieldOf(el) ?? el).getBoundingClientRect();
    return { rect: r, spot: { x: r.left + Math.min(28, r.width / 2), y: r.top + r.height / 2 } };
  }
  if (isRow) {
    const cell = el.querySelector<HTMLElement>("td, th");
    return { rect: el.getBoundingClientRect(), spot: centerOf(cell ? contentBox(cell) : el.getBoundingClientRect()) };
  }
  if (kind !== "click") {
    const r = el.getBoundingClientRect();
    return { rect: r, spot: centerOf(r) };
  }
  const act = el.matches(INTERACTIVE) || el instanceof HTMLLabelElement ? el : (el.querySelector<HTMLElement>(INTERACTIVE) ?? el);
  if (act instanceof HTMLLabelElement) {
    const box = contentBox(act);
    const box2 = act.querySelector<HTMLElement>("input");
    return { rect: box, spot: box2 ? centerOf(box2.getBoundingClientRect()) : centerOf(box) };
  }
  const r = act.getBoundingClientRect();
  return { rect: r, spot: centerOf(r) };
}

function readValue(el: HTMLElement | null): string {
  if (!el) return "";
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
    return el.value;
  const inner = el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select");
  return inner ? inner.value : (el.textContent ?? "");
}

/**
 * Overlay d'UNE étape : voile percé autour de la cible, clics bloqués partout ailleurs,
 * bulle numérotée. Remonté à chaque étape (`key` dans le provider) : chaque étape repart
 * d'un état propre.
 *
 * Tuto guidé (`cursor`, la démo) : un curseur glisse jusqu'à la cible et s'y arrête ; la bulle
 * n'apparaît qu'à son arrivée, et dit quoi faire (« Cliquez », « Tapez : … »). C'est le visiteur
 * qui fait le geste : le curseur montre le chemin, il ne clique ni ne valide jamais.
 */
export function TourOverlay({
  tour,
  step,
  index,
  cursor = false,
}: {
  tour: Tour;
  step: TourStep;
  index: number;
  cursor?: boolean;
}): JSX.Element | null {
  const [rect, setRect] = useState<Rect | null>(null);
  const [lost, setLost] = useState(false);
  const [inputOk, setInputOk] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [arrived, setArrived] = useState(!cursor || !step.target);
  const [typing, setTyping] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const scrolled = useRef(false);
  const inputOkRef = useRef(false);
  const travelled = useRef(false);
  const spotRef = useRef<Spot | null>(null);
  const holeRef = useRef<Rect | null>(null);
  const arrivalTimer = useRef<number | undefined>(undefined);
  const total = tour.steps.length;
  const isLast = index === total - 1;
  const advance = step.advance;

  // Suivi de la cible à chaque image : elle peut apparaître après coup (page en cours de
  // chargement), bouger (scroll, redimensionnement) ou changer de valeur (saisie).
  useEffect(() => {
    let raf = 0;
    const started = performance.now();
    const tick = () => {
      const el = findTarget(step.target, step.targetText, step.targetPick);
      if (step.target && !el) {
        holeRef.current = null;
        setRect(null);
        const waited = performance.now() - started;
        if (step.optional && waited > OPTIONAL_WAIT_MS) {
          tourStore.next(index); // rien à montrer ici : l'étape s'efface
          return;
        }
        if (waited > WAIT_MS) setLost(true);
      } else if (el) {
        if (!scrolled.current) {
          scrolled.current = true;
          el.scrollIntoView({ block: "center", inline: "nearest" });
          // Le curseur clavier suit l'étape : dans le champ à remplir, sinon sur la bulle (lue par
          // un lecteur d'écran). Sans cela, il restait sur le bouton qui avait lancé le tuto.
          // En tuto guidé, il attend que le curseur soit arrivé (plus bas).
          if (!cursor) {
            const field = advance.kind === "input" ? fieldOf(el) : null;
            (field ?? bubbleRef.current)?.focus({ preventScroll: true });
          }
        }
        // En tuto guidé, la zone se resserre sur ce qu'il faut vraiment toucher ; ailleurs, la cible.
        const geo = cursor ? guidedGeometry(el, advance.kind, !!step.targetText && !step.targetPick) : null;
        spotRef.current = geo?.spot ?? null;
        const r = geo?.rect ?? el.getBoundingClientRect();
        const next = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
        holeRef.current = next;
        setRect((prev) => (sameRect(prev, next) ? prev : next));
        setLost(false);
        if (advance.kind === "input") {
          const v = readValue(el);
          const ok = advance.validate
            ? advance.validate(v)
            : cursor && step.expect !== undefined
              ? v.trim() === step.expect
              : v.trim() !== "";
          inputOkRef.current = ok;
          setInputOk(ok);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step.target, step.targetText, step.targetPick, step.optional, step.expect, advance, index, cursor]);

  // Tuto guidé : le curseur part de sa dernière position (ou du coin du panneau de la démo),
  // glisse jusqu'à la cible, puis la suit si elle bouge. Les mises à jour passent par des images
  // d'animation : jamais d'état modifié directement dans l'effet.
  const isField = advance.kind === "input";
  useEffect(() => {
    if (!cursor || !rect) return;
    // Le point calculé avec la zone (guidedGeometry) ; à défaut, le centre de la zone.
    const dest = spotRef.current ?? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    if (travelled.current) {
      const raf = requestAnimationFrame(() => {
        if (lastCursor) lastCursor = dest;
        setPointer(dest);
      });
      return () => cancelAnimationFrame(raf);
    }
    travelled.current = true;
    const from = lastCursor ?? { x: 48, y: window.innerHeight - 48 };
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      setPointer(from);
      raf2 = requestAnimationFrame(() => setPointer(dest));
    });
    // L'arrivée ne dépend pas des mouvements de la cible pendant le trajet : un minuteur à part,
    // annulé seulement quand l'étape se termine.
    arrivalTimer.current = window.setTimeout(() => {
      lastCursor = dest;
      setArrived(true);
    }, CURSOR_MS + 50);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [cursor, rect]);
  useEffect(() => () => window.clearTimeout(arrivalTimer.current), []);

  // Arrivé : le focus entre dans le champ à remplir (le visiteur voit le curseur d'écriture
  // clignoter). Pour un clic, il ne bouge pas : le retirer à un menu tout juste ouvert le
  // refermerait, et l'élément à toucher disparaîtrait sous le curseur.
  useEffect(() => {
    if (!cursor || !arrived || !isField) return;
    fieldOf(findTarget(step.target, step.targetText, step.targetPick))?.focus({ preventScroll: true });
  }, [cursor, arrived, isField, step.target, step.targetText, step.targetPick]);

  /**
   * « ← Précédent » (tuto guidé) : revoir l'étape d'avant. Si sa cible était sur la page
   * précédente (le bouton qui a ouvert ce formulaire), on y retourne d'abord.
   */
  const goBack = (): void => {
    const prev = tour.steps[index - 1];
    if (prev?.target && !findTarget(prev.target, prev.targetText, prev.targetPick)) window.history.back();
    tourStore.prev(index);
  };

  /** « Remplir pour moi » : la valeur attendue s'écrit lettre par lettre, comme au clavier. */
  const fillForMe = (): void => {
    const field = fieldOf(findTarget(step.target, step.targetText, step.targetPick));
    const text = step.expect;
    if (!field || text === undefined || typing) return;
    setTyping(true);
    field.focus({ preventScroll: true });
    let i = 0;
    const typeNext = (): void => {
      i += 1;
      setFieldValue(field, text.slice(0, i));
      if (i < text.length) window.setTimeout(typeNext, TYPE_MS);
      else setTyping(false);
    };
    setFieldValue(field, "");
    window.setTimeout(typeNext, TYPE_MS);
  };

  // Étape sans cible : la bulle reçoit le curseur dès son affichage.
  useEffect(() => {
    if (!step.target) bubbleRef.current?.focus({ preventScroll: true });
  }, [step.target]);

  // Étape « click » : le clic sur la cible passe à l'étape suivante (après que l'élément l'a traité).
  useEffect(() => {
    if (advance.kind !== "click") return;
    const onClick = (e: MouseEvent) => {
      const el = findTarget(step.target, step.targetText, step.targetPick);
      if (el && e.target instanceof Node && el.contains(e.target)) {
        window.setTimeout(() => tourStore.next(index), 0);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [advance.kind, step.target, step.targetText, step.targetPick, index]);

  // Clavier : Échap quitte ; le focus ne sort ni de la cible ni de la bulle. Pour une étape
  // d'explication, il n'entre pas non plus dans la cible : Tab puis Entrée sur le bouton montré
  // l'activerait, ce que le panneau posé dessus interdit à la souris.
  const explains = advance.kind === "next";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tourStore.stop();
      // Tuto guidé : Entrée dans le champ d'une étape « input » valide l'étape (jamais le
      // formulaire). Hors tuto guidé, Entrée ne fait rien : on passe par « Suivant ».
      if (cursor && e.key === "Enter" && !explains && findTarget(step.target, step.targetText, step.targetPick)?.contains(e.target as Node | null)) {
        const field = e.target;
        // La valeur relue à l'instant : Entrée peut suivre la dernière lettre avant la prochaine image.
        const v = field instanceof HTMLInputElement ? field.value.trim() : "";
        const ok = advance.kind === "input" && (advance.validate ? advance.validate(v) : step.expect !== undefined ? v === step.expect : v !== "");
        if (field instanceof HTMLInputElement && (ok || inputOkRef.current)) {
          e.preventDefault();
          tourStore.next(index);
        }
      }
    };
    const onFocus = (e: FocusEvent) => {
      // Tuto guidé : pas de piège à focus. Un menu qui s'ouvre place le focus sur son premier
      // élément ; le ramener de force sur la cible le refermerait aussitôt.
      if (cursor) return;
      const el = findTarget(step.target, step.targetText, step.targetPick);
      const t = e.target as Node | null;
      if (!t || bubbleRef.current?.contains(t) || (!explains && el?.contains(t))) return;
      ((explains ? null : el) ?? bubbleRef.current)?.focus?.();
    };
    // En capture : un composant qui arrête la propagation de la touche ne prive pas le tuto d'Entrée.
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusin", onFocus);
    };
  }, [step.target, step.targetText, step.targetPick, step.expect, advance, explains, index, cursor]);

  // Aucun formulaire ne part pendant une étape qui n'attend ni clic ni page : Entrée dans un champ
  // à remplir enverrait sinon le formulaire (la demande au club, le lien de réinitialisation).
  // Écouté en capture sur le document, avant que React ne reçoive l'évènement.
  // Tuto guidé : pas de panneaux bloqueurs posés sur la page (ils feraient « sortir » la souris des
  // menus ouverts au survol, qui se refermeraient). Les clics hors de la zone sont arrêtés ici, en
  // capture, avant que la page ne les voie ; le survol, lui, continue de fonctionner.
  useEffect(() => {
    if (!cursor) return;
    const guard = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (t && bubbleRef.current?.contains(t)) return;
      const h = holeRef.current;
      const inHole = !!h && e.clientX >= h.left && e.clientX <= h.left + h.width && e.clientY >= h.top && e.clientY <= h.top + h.height;
      if (inHole && advance.kind !== "next") return;
      e.preventDefault();
      e.stopPropagation();
    };
    const kinds = ["pointerdown", "mousedown", "pointerup", "mouseup", "click", "dblclick", "contextmenu"] as const;
    kinds.forEach((k) => window.addEventListener(k, guard, true));
    return () => kinds.forEach((k) => window.removeEventListener(k, guard, true));
  }, [cursor, advance.kind]);

  const allowsSubmit = advance.kind === "click" || advance.kind === "route";
  useEffect(() => {
    if (allowsSubmit) return;
    const onSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("submit", onSubmit, true);
    return () => document.removeEventListener("submit", onSubmit, true);
  }, [allowsSubmit]);

  if (typeof document === "undefined") return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const hole = step.target ? rect : null;

  // Position de la bulle : sous la cible s'il y a la place, sinon au-dessus ; une cible qui occupe
  // presque tout l'écran (le contenu de la bibliothèque) ne laisse de place ni dessous ni dessus :
  // la bulle se pose alors en bas de l'écran, sur la cible, plutôt que hors de la vue. Centrée sans
  // cible ; jamais plus haute que l'écran.
  const bubbleStyle: React.CSSProperties = {
    width: Math.min(BUBBLE_W, vw - 24),
    maxHeight: vh - 24,
    overflowY: "auto",
  };
  if (hole) {
    const left = Math.max(12, Math.min(hole.left + hole.width / 2 - BUBBLE_W / 2, vw - BUBBLE_W - 12));
    bubbleStyle.left = left;
    const below = vh - (hole.top + hole.height) - GAP;
    const above = hole.top - GAP;
    if (below >= BUBBLE_ROOM) bubbleStyle.top = hole.top + hole.height + GAP;
    else if (above >= BUBBLE_ROOM) bubbleStyle.bottom = vh - hole.top + GAP;
    else bubbleStyle.bottom = 12;
  } else {
    bubbleStyle.left = "50%";
    bubbleStyle.top = "50%";
    bubbleStyle.transform = "translate(-50%, -50%)";
  }

  const canNext = advance.kind === "next" || (advance.kind === "input" && inputOk);
  const waiting = step.target && !hole && !lost;

  // Étape d'explication (« Suivant ») : la cible est montrée mais pas manipulable — on ne laisse
  // agir que lorsque l'étape attend une action.
  const blockers = hole
    ? [
        ...(advance.kind === "next" ? [hole] : []),
        { top: 0, left: 0, width: vw, height: Math.max(0, hole.top) },
        { top: hole.top + hole.height, left: 0, width: vw, height: Math.max(0, vh - hole.top - hole.height) },
        { top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height },
        { top: hole.top, left: hole.left + hole.width, width: Math.max(0, vw - hole.left - hole.width), height: hole.height },
      ]
    : [{ top: 0, left: 0, width: vw, height: vh }];

  return createPortal(
    <div data-tour-overlay="" aria-live="polite">
      {/* Voile percé : un SVG plein écran avec un masque (le trou laisse voir la cible). */}
      <svg className="pointer-events-none fixed inset-0 z-[10000]" width={vw} height={vh} aria-hidden="true">
        <defs>
          <mask id="akfc-tour-mask">
            <rect width={vw} height={vh} fill="white" />
            {hole && <rect x={hole.left} y={hole.top} width={hole.width} height={hole.height} rx={8} fill="black" />}
          </mask>
        </defs>
        <rect width={vw} height={vh} fill={DIM} mask="url(#akfc-tour-mask)" />
      </svg>

      {/* Bloqueurs : quatre panneaux transparents autour du trou captent tous les clics ailleurs. */}
      {blockers.map((b, i) => (
        <div key={i} className={`fixed z-[10000] ${cursor ? "pointer-events-none" : ""}`} style={b} onClick={(e) => e.stopPropagation()} />
      ))}

      {hole && (
        <div
          className="pointer-events-none fixed z-[10001] rounded-lg ring-2 ring-ring ring-offset-2 ring-offset-transparent transition-all duration-200"
          style={hole}
        />
      )}

      {/* Le curseur guidé : il montre le chemin, il ne clique pas (aucun évènement ne le traverse). */}
      {cursor && pointer && (
        <div
          className="pointer-events-none fixed left-0 top-0 z-[10003]"
          style={{
            transform: `translate(${pointer.x}px, ${pointer.y}px)`,
            transition: arrived ? "transform 150ms linear" : `transform ${CURSOR_MS}ms cubic-bezier(0.45, 0, 0.2, 1)`,
          }}
          aria-hidden="true"
        >
          {arrived && <span className="absolute -left-3 -top-3 h-6 w-6 animate-ping rounded-full bg-brand/40" />}
          <svg width="22" height="26" viewBox="0 0 22 26" className="drop-shadow-md">
            <path d="M2 2 L2 21 L7 16.5 L10.5 24 L14 22.5 L10.5 15 L17 15 Z" className="fill-foreground stroke-background" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <div
        ref={bubbleRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`${tour.title} — étape ${index + 1} sur ${total}`}
        className={`fixed z-[10002] rounded-xl bg-card p-4 text-foreground shadow-2xl outline-none transition-opacity duration-200 ${
          arrived || lost ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={bubbleStyle}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
            {index + 1}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Étape {index + 1} sur {total} · {tour.title}
          </span>
        </div>
        <p className="mb-1 font-semibold">{lost ? "Élément introuvable" : step.title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lost
            ? "L'élément de cette étape n'apparaît pas sur la page. Le tuto ne peut pas continuer ici."
            : waiting
              ? "Chargement de la page…"
              : step.body}
        </p>
        {cursor && !lost && arrived && advance.kind === "click" && (
          <p className="mt-3 rounded-md bg-brand/10 px-3 py-2 text-sm font-medium">👉 Cliquez là où s&apos;est arrêté le curseur.</p>
        )}
        {cursor && !lost && advance.kind === "input" && step.expect !== undefined && (
          <div className="mt-3 rounded-md bg-brand/10 px-3 py-2 text-sm">
            <p>
              Tapez : <code className="rounded bg-background px-1.5 py-0.5 font-mono">{step.expect}</code>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Puis validez avec Entrée ou « Suivant ».</p>
            <button
              type="button"
              onClick={fillForMe}
              disabled={typing || inputOk}
              className="mt-2 rounded border border-border px-2 py-0.5 text-xs hover:bg-muted disabled:opacity-50"
            >
              {typing ? "Saisie…" : "Remplir pour moi"}
            </button>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => tourStore.stop()}
              className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Quitter
            </button>
            {cursor && index > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Revenir à l'étape précédente"
              >
                ← Précédent
              </button>
            )}
          </span>
          {(advance.kind === "next" || advance.kind === "input") && !lost && (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => (isLast ? tourStore.stop() : tourStore.next(index))}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLast ? "Terminer" : "Suivant"}
            </button>
          )}
          {(advance.kind === "click" || advance.kind === "route") && !lost && (
            <span className="text-xs text-muted-foreground">
              {advance.kind === "click" || step.target
                ? "Cliquez sur l'élément en surbrillance"
                : "En attente de la page suivante…"}
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
