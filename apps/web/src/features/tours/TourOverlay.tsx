"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { tourStore } from "./tour.store";
import type { Tour, TourStep } from "./tour.types";

/* ►►► Réglages ◄◄◄ */
const PAD = 6; // marge autour de la cible (px)
const BUBBLE_W = 340; // largeur de la bulle (px)
const GAP = 12; // écart bulle ↔ cible (px)
const WAIT_MS = 8000; // délai avant d'abandonner une cible introuvable
const OPTIONAL_WAIT_MS = 1500; // délai avant de passer une étape facultative sans cible
const DIM = "rgba(15, 23, 42, 0.62)"; // voile

type Rect = { top: number; left: number; width: number; height: number };

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height);

/**
 * La cible d'une étape : le premier élément VISIBLE qui porte ce nom. Un même nom peut désigner
 * deux éléments dont un seul s'affiche selon la largeur de l'écran (la barre du header sur un
 * grand écran, le bouton du menu sur un téléphone) ; un élément masqué n'a pas de position.
 */
function findTarget(name: string | undefined): HTMLElement | null {
  if (!name) return null;
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${CSS.escape(name)}"]`)) {
    if (el.getClientRects().length > 0) return el;
  }
  return null;
}

function readValue(el: HTMLElement | null): string {
  if (!el) return "";
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
    return el.value;
  const inner = el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  return inner ? inner.value : (el.textContent ?? "");
}

/**
 * Overlay d'UNE étape : voile percé autour de la cible, clics bloqués partout ailleurs,
 * bulle numérotée. Remonté à chaque étape (`key` dans le provider) : chaque étape repart
 * d'un état propre.
 */
export function TourOverlay({ tour, step, index }: { tour: Tour; step: TourStep; index: number }): JSX.Element | null {
  const [rect, setRect] = useState<Rect | null>(null);
  const [lost, setLost] = useState(false);
  const [inputOk, setInputOk] = useState(false);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const scrolled = useRef(false);
  const total = tour.steps.length;
  const isLast = index === total - 1;
  const advance = step.advance;

  // Suivi de la cible à chaque image : elle peut apparaître après coup (page en cours de
  // chargement), bouger (scroll, redimensionnement) ou changer de valeur (saisie).
  useEffect(() => {
    let raf = 0;
    const started = performance.now();
    const tick = () => {
      const el = findTarget(step.target);
      if (step.target && !el) {
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
          const field = advance.kind === "input" ? (el.matches("input, textarea, select") ? el : el.querySelector<HTMLElement>("input, textarea, select")) : null;
          (field ?? bubbleRef.current)?.focus({ preventScroll: true });
        }
        const r = el.getBoundingClientRect();
        const next = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
        setRect((prev) => (sameRect(prev, next) ? prev : next));
        setLost(false);
        if (advance.kind === "input") {
          const v = readValue(el);
          setInputOk(advance.validate ? advance.validate(v) : v.trim() !== "");
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step.target, step.optional, advance, index]);

  // Étape sans cible : la bulle reçoit le curseur dès son affichage.
  useEffect(() => {
    if (!step.target) bubbleRef.current?.focus({ preventScroll: true });
  }, [step.target]);

  // Étape « click » : le clic sur la cible passe à l'étape suivante (après que l'élément l'a traité).
  useEffect(() => {
    if (advance.kind !== "click") return;
    const onClick = (e: MouseEvent) => {
      const el = findTarget(step.target);
      if (el && e.target instanceof Node && el.contains(e.target)) {
        window.setTimeout(() => tourStore.next(index), 0);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [advance.kind, step.target, index]);

  // Clavier : Échap quitte ; le focus ne sort ni de la cible ni de la bulle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tourStore.stop();
    };
    const onFocus = (e: FocusEvent) => {
      const el = findTarget(step.target);
      const t = e.target as Node | null;
      if (!t || el?.contains(t) || bubbleRef.current?.contains(t)) return;
      (el ?? bubbleRef.current)?.focus?.();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
    };
  }, [step.target]);

  if (typeof document === "undefined") return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const hole = step.target ? rect : null;

  // Position de la bulle : sous la cible s'il y a la place, sinon au-dessus ; centrée sans cible.
  const bubbleStyle: React.CSSProperties = { width: Math.min(BUBBLE_W, vw - 24) };
  if (hole) {
    const left = Math.max(12, Math.min(hole.left + hole.width / 2 - BUBBLE_W / 2, vw - BUBBLE_W - 12));
    bubbleStyle.left = left;
    if (hole.top + hole.height + GAP + 200 < vh) bubbleStyle.top = hole.top + hole.height + GAP;
    else bubbleStyle.bottom = Math.max(12, vh - hole.top + GAP);
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
        <div key={i} className="fixed z-[10000]" style={b} onClick={(e) => e.stopPropagation()} />
      ))}

      {hole && (
        <div
          className="pointer-events-none fixed z-[10001] rounded-lg ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent transition-all duration-200"
          style={hole}
        />
      )}

      <div
        ref={bubbleRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`${tour.title} — étape ${index + 1} sur ${total}`}
        className="fixed z-[10002] rounded-xl bg-white p-4 text-slate-800 shadow-2xl outline-none"
        style={bubbleStyle}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            {index + 1}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Étape {index + 1} sur {total} · {tour.title}
          </span>
        </div>
        <p className="mb-1 font-semibold">{lost ? "Élément introuvable" : step.title}</p>
        <p className="text-sm leading-relaxed text-slate-600">
          {lost
            ? "L'élément de cette étape n'apparaît pas sur la page. Le tuto ne peut pas continuer ici."
            : waiting
              ? "Chargement de la page…"
              : step.body}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => tourStore.stop()}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Quitter
          </button>
          {(advance.kind === "next" || advance.kind === "input") && !lost && (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => (isLast ? tourStore.stop() : tourStore.next(index))}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLast ? "Terminer" : "Suivant"}
            </button>
          )}
          {(advance.kind === "click" || advance.kind === "route") && !lost && (
            <span className="text-xs text-slate-500">
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
