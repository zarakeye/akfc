"use client";

import { useEffect, useRef, useState, type JSX, type ReactNode } from "react";

/**
 * Clamp visuel « façon Facebook » pour le contenu d'un post sur le mur.
 *
 * Le contenu (un RSC : PageRenderer) est passé en `children` — il est
 * donc DÉJÀ rendu côté serveur ; « Voir → » ne fetch rien, il lève
 * simplement le clamp CSS. La troncature est visuelle, pas textuelle :
 * un post ouvrant sur une galerie est clampé aussi bien qu'un texte.
 *
 * Le bouton n'apparaît que si le contenu déborde réellement (mesure via
 * ResizeObserver — robuste face aux images qui chargent après coup).
 */

interface ExpandableContentProps {
  children: ReactNode;
  /** Hauteur repliée, en px. */
  collapsedHeight?: number;
  /**
   * Mode CONTRÔLÉ. Fourni, l'état de dépliage appartient au parent — ce qui
   * permet un accordéon, où déplier une carte replie la précédente. Absent,
   * le composant garde son état pour lui (comportement du mur de posts,
   * inchangé).
   */
  expanded?: boolean;
  onToggle?: () => void;
  /** Libellés, pour adapter au contexte (« Voir → », « Lire la suite »…). */
  expandLabel?: string;
  collapseLabel?: string;
}

/** Marge anti-oscillation : on ne clampe pas pour gagner 24px. */
const OVERFLOW_TOLERANCE = 24;

export function ExpandableContent({
  children,
  collapsedHeight = 300,
  expanded: controlledExpanded,
  onToggle,
  expandLabel = "Voir →",
  collapseLabel = "Réduire",
}: ExpandableContentProps): JSX.Element {
  const innerRef = useRef<HTMLDivElement>(null);
  const [selfExpanded, setSelfExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  // Contrôlé dès que le parent fournit `expanded`. Le hook d'état interne
  // reste appelé dans tous les cas — l'ordre des hooks ne doit pas dépendre
  // des props.
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : selfExpanded;
  const toggle = () => {
    if (isControlled) onToggle?.();
    else setSelfExpanded((e) => !e);
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const check = () =>
      setOverflowing(el.scrollHeight > collapsedHeight + OVERFLOW_TOLERANCE);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  const clamped = overflowing && !expanded;

  return (
    <div>
      <div
        className="relative overflow-hidden"
        style={clamped ? { maxHeight: collapsedHeight } : undefined}
      >
        <div ref={innerRef}>{children}</div>

        {clamped && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>

      {overflowing && (
        <button
          type="button"
          onClick={toggle}
          className="mt-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  );
}
