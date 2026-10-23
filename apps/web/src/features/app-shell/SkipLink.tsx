"use client";

import type { JSX } from "react";

/**
 * Lien d'évitement « Aller au contenu » : premier arrêt de la touche Tab, invisible jusqu'à ce
 * qu'il ait le curseur. Il saute le header (et le ruban) pour aller droit au contenu de la page.
 *
 * Le curseur est posé sur la cible SANS défilement : le header est collant (sticky), et un saut
 * d'ancre classique ferait glisser le haut du contenu sous lui. Sans JavaScript, l'ancre `href`
 * fonctionne quand même.
 */
export function SkipLink({ targetId }: { targetId: string }): JSX.Element {
  return (
    <a
      href={`#${targetId}`}
      onClick={(e) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        target.focus({ preventScroll: true });
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-black focus:shadow-lg"
    >
      Aller au contenu
    </a>
  );
}
