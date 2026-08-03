'use client';

import { JSX } from 'react';

import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import FinderSearchBar from '@features/finder-core/components/FinderSearchBar';

/**
 * Recherche du finder, selon la place disponible.
 *
 * À partir de 1280px, la barre tient dans la barre d'outils avec ses 280px.
 * En dessous, elle prend sa propre ligne, pleine largeur.
 *
 * ─── Pourquoi aucune bascule ────────────────────────────────────────────
 *
 * Une loupe qui dépliait le champ a été essayée puis retirée : elle cachait
 * un champ pour le montrer à la ligne suivante, c'est-à-dire là où il se
 * serait trouvé de toute façon. Aucune place horizontale n'était économisée,
 * et le pli coûtait un appui, un état à tenir, un raccourci clavier à
 * réaiguiller et une pastille pour signaler qu'une recherche était active —
 * alors qu'un champ visible porte déjà son contenu.
 *
 * Le seul gain était vertical : une ligne d'environ 28 pixels. Le prix est
 * modeste face à ce qui disparaît.
 *
 * ─── `order-last` ───────────────────────────────────────────────────────
 *
 * Ce composant est monté AVANT les boutons d'état, le sélecteur de vue et le
 * bouton de suppression. Sans `order-last`, sa ligne pleine largeur les
 * pousserait tous sur la ligne du dessous.
 *
 * Contrepartie : `order` ne change que l'ordre visuel. Au clavier, la
 * tabulation suit l'ordre du code, donc ce champ est atteint avant les
 * boutons d'état alors qu'il s'affiche après.
 */
export default function FinderSearchControl(): JSX.Element {
  const isWide = useIsBreakpoint('min', 1280);

  if (isWide) return <FinderSearchBar />;

  return (
    <div className="order-last basis-full pt-1">
      <FinderSearchBar fullWidth />
    </div>
  );
}
