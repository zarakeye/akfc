#!/usr/bin/env bash
#
# step_search_always_visible.sh
#
# La loupe disparaît : sous 1280px, la barre de recherche reste affichée en
# permanence sur sa propre ligne.
#
# ─── Pourquoi la bascule ne valait rien ────────────────────────────────────
#
# Elle cachait un champ… pour le montrer à la ligne suivante, exactement là où
# il se serait trouvé de toute façon. Le pli n'économisait donc AUCUNE place
# horizontale : la barre d'outils garde sa première ligne dans les deux cas.
#
# Ce qu'elle coûtait, en revanche : un appui de plus, un état à tenir, un
# raccourci clavier à réaiguiller, une pastille pour signaler qu'une recherche
# était active alors qu'un champ visible porte déjà son propre contenu — et un
# champ qu'il faut savoir trouver.
#
# Le seul gain réel était vertical : une ligne d'environ 28 pixels, toujours
# occupée. C'est le prix, et il est modeste face à ce qu'on retire.
#
# ─── Ce que la simplification supprime ─────────────────────────────────────
#
#   - l'état `expanded` et le bouton loupe ;
#   - la pastille d'activité, qui n'a plus d'objet ;
#   - le bouton de fermeture ;
#   - le réaiguillage de `Cmd+F` : le champ étant toujours monté, le raccourci
#     que `FinderSearchBar` porte déjà retrouve sa cible sans intermédiaire.
#
# Il reste douze lignes qui choisissent une largeur. C'est tout ce que le
# problème demandait.
#
# `order-last` est conservé : la barre est montée avant les boutons d'état et
# le sélecteur de vue, et sa ligne pleine largeur les pousserait sans lui.
#
# Usage :
#   bash step_search_always_visible.sh
#   AKFC_APPLY_ONLY=1 bash step_search_always_visible.sh
#
set -euo pipefail

control="apps/web/src/features/finder-core/components/FinderSearchControl.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

if ! grep -q "expanded" "$control" 2>/dev/null; then
  echo "✓ déjà appliqué (barre toujours visible) — rien à faire"
  exit 0
fi

[ -f "$control" ] || { echo "✗ introuvable : $control"; exit 1; }

cat > "$control" <<'TSX'
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
TSX
echo "  ~ FinderSearchControl.tsx (réécrit, sans bascule)"

echo "✓ barre de recherche toujours visible"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "refactor(finder): la recherche reste visible, la loupe disparait

La bascule cachait un champ pour le montrer a la ligne suivante,
c'est-a-dire la ou il se serait trouve de toute facon : elle
n'economisait AUCUNE place horizontale, la barre d'outils gardant sa
premiere ligne dans les deux cas.

Elle coutait en revanche un appui de plus, un etat a tenir, un raccourci
clavier a reaiguiller, une pastille pour signaler qu'une recherche etait
active — alors qu'un champ visible porte deja son contenu — et un champ
qu'il fallait savoir trouver.

Le seul gain reel etait vertical : une ligne d'environ 28 pixels,
desormais toujours occupee. Prix modeste face a ce qui disparait.

Cmd+F retrouve sa cible sans intermediaire, le champ etant toujours
monte : le raccourci que FinderSearchBar porte deja suffit.

Il reste douze lignes qui choisissent une largeur. order-last est
conserve : la barre est montee avant les boutons d'etat et sa ligne
pleine largeur les pousserait sans lui."

echo "✓ commité"
git log -1 --oneline