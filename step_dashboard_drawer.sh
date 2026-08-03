#!/usr/bin/env bash
#
# step_dashboard_drawer.sh
#
# Premier pas du responsive côté dashboard : la coquille.
#
# ─── Un vrai bug, pas seulement de l'inconfort ─────────────────────────────
#
# La sidebar était en `hidden md:flex` : sous 768px elle disparaissait, et
# RIEN ne permettait de la rouvrir. Un administrateur sur téléphone n'avait
# aucune navigation dans le panneau de contrôle — seulement la page où il
# était arrivé.
#
# ─── Le seuil passe de 768 à 1024 ──────────────────────────────────────────
#
# À 768px, la sidebar laissait 528px au contenu, moins 80px de rembourrage :
# 448px pour des formulaires qui portent des builders et des grilles à deux
# colonnes. C'était tenir sans être utilisable.
#
# La sidebar reste donc affichée en permanence à partir de `lg` (1024px), où
# le contenu garde 784px, et devient un tiroir en dessous.
#
# ─── Pourquoi un bouton et non une languette ───────────────────────────────
#
# Une languette collée au bord ne se découvre pas si l'on ne sait pas qu'elle
# est là, et sa zone tactile entre en conflit avec le geste de retour du
# navigateur sur iOS. Un bouton nommé dans une barre d'outils est bavard et
# sans conflit.
#
# Il est LIBELLÉ « Panneau de contrôle » plutôt que réduit à une icône, parce
# que le header porte déjà un burger — celui de la navigation du site. Deux
# burgers identiques dans la même colonne d'écran, l'un sous l'autre, seraient
# indistinguables.
#
# ─── Refermer le tiroir sans effet ─────────────────────────────────────────
#
# La sidebar navigue par `router.push` sur des BOUTONS, pas des liens : la
# délégation sur les ancres utilisée dans le header ne s'applique pas ici.
#
# On emploie donc l'autre patron sanctionné par React : l'ajustement d'état
# pendant le rendu. On garde le dernier chemin connu ; s'il a changé, on
# referme et on met à jour, dans le corps du composant. React relance alors le
# rendu SANS valider le premier — il n'y a ni effet, ni rendu supplémentaire
# affiché, donc pas de cascade. C'est ce que la documentation recommande pour
# ajuster un état quand une valeur dérivée change.
#
# ─── Rembourrage ───────────────────────────────────────────────────────────
#
# `p-10` fixe coûtait 80px de largeur sur un téléphone qui en a 390. Il
# devient `p-4` et ne reprend ses 40px qu'à partir de `lg`.
#
# Usage :
#   bash step_dashboard_drawer.sh
#   AKFC_APPLY_ONLY=1 bash step_dashboard_drawer.sh
#
set -euo pipefail

layout_file="apps/web/src/app/(admin)/dashboard/layout.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "sidebarOpen" "$layout_file" 2>/dev/null; then
  echo "✓ déjà appliqué (tiroir posé) — rien à faire"
  exit 0
fi

[ -f "$layout_file" ] || { echo "✗ introuvable : $layout_file"; exit 1; }

cat > "$layout_file" <<'TSX'
'use client';

import { JSX, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PanelLeft, X } from 'lucide-react';

import Header from '@features/app-shell/Header';
import ControlPanelSidebar from '@features/app-shell/ControlPanelSidebar';
import { Providers } from '@app/(admin)/dashboard/providers';

interface Props {
  children: React.ReactNode;
}

/**
 * Layout du panneau de contrôle.
 *
 * Header sticky en haut, puis rangée [sidebar | contenu]. Conteneur racine en
 * `h-dvh` (hauteur ferme) ; la rangée remplit l'espace restant.
 *
 * ─── Scroll du contenu ──────────────────────────────────────────────────────
 *
 * Le <main> scrolle VERTICALEMENT par défaut (`overflow-y-auto`) : c'est le
 * comportement attendu par la grande majorité des pages (listes longues
 * d'utilisateurs, cours, etc.), dont le contenu dépasse la hauteur d'écran.
 *
 * Cas particulier : la bibliothèque (Finder) gère son PROPRE scroll interne et
 * a besoin d'occuper exactement la hauteur disponible sans scroll de page. Elle
 * se contraint donc elle-même (sa racine en `h-full overflow-hidden`), ce qui
 * neutralise le scroll du <main> pour elle seule. Principe : le cas général
 * scrolle, le cas spécial se borne.
 *
 * ─── Sidebar : permanente à partir de `lg`, tiroir en dessous ───────────────
 *
 * Elle était en `hidden md:flex` : sous 768px elle disparaissait sans qu'AUCUN
 * geste ne permette de la rouvrir. Un administrateur sur téléphone n'avait
 * donc aucune navigation.
 *
 * Le seuil monte à `lg` (1024px) : à 768, la sidebar ne laissait que 448px
 * utiles au contenu, ce qui ne suffit pas aux formulaires qui portent des
 * builders et des grilles à deux colonnes.
 */
export default function DashboardLayout({ children }: Props): JSX.Element {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refermeture du tiroir à la navigation, par AJUSTEMENT D'ÉTAT PENDANT LE
  // RENDU et non par un effet.
  //
  // La sidebar navigue par `router.push` sur des boutons, donc la délégation
  // sur les liens employée dans le header ne s'applique pas. Et un effet
  // appelant `setState` déclencherait une cascade de rendus (React le signale
  // explicitement). Ici React relance le rendu sans valider le premier : rien
  // n'est affiché entre les deux.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSidebarOpen(false);
  }

  // Échap referme, et le corps de page ne défile plus derrière le tiroir.
  // `setState` vit ici dans un écouteur d'événement — un abonnement à un
  // système extérieur, cas pour lequel les effets sont faits.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <Providers>
      <div className="flex h-dvh flex-col bg-background">
        <div className="sticky top-0 z-50 shrink-0 bg-background">
          <Header />
        </div>

        {/* Barre d'ouverture du tiroir — sous `lg` uniquement.
            Bouton LIBELLÉ et non icône seule : le header porte déjà un
            burger, celui de la navigation du site. Deux burgers identiques
            l'un sous l'autre seraient indistinguables. */}
        <div className="shrink-0 border-b border-border bg-background px-4 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <PanelLeft className="h-4 w-4" />
            Panneau de contrôle
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Sidebar permanente — à partir de `lg`. Scroll propre si la
              liste dépasse. */}
          <div className="hidden overflow-y-auto lg:flex [&>aside]:h-full [&>aside]:min-h-full">
            <ControlPanelSidebar />
          </div>

          {/* ⚠️ le main DOIT être relative.
              overflow-y-auto : scroll vertical naturel du contenu long.
              Rembourrage réduit sous `lg` : `p-10` coûtait 80px de largeur
              sur un téléphone qui en a 390. */}
          <main className="relative min-h-0 flex-1 overflow-y-auto p-4 lg:p-10">
            {children}
          </main>
        </div>

        {/* Tiroir — sous `lg` uniquement. */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="relative flex h-full w-[min(85vw,20rem)] flex-col overflow-y-auto bg-gray-800">
              <div className="flex items-center justify-between px-4 py-3 text-white">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Panneau de contrôle
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Fermer le panneau"
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* La sidebar impose sa propre largeur (`w-60`) : on la laisse
                  s'étirer au tiroir, plus large sur les grands téléphones. */}
              <div className="[&>aside]:w-full">
                <ControlPanelSidebar />
              </div>
            </div>
          </div>
        )}
      </div>
    </Providers>
  );
}
TSX
echo "  ~ dashboard/layout.tsx (réécrit)"

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
git commit -m "feat(responsive): tiroir de navigation dans le panneau de controle

Un vrai bug corrige, pas seulement de l'inconfort : la sidebar etait en
hidden md:flex, donc sous 768px elle disparaissait et RIEN ne permettait
de la rouvrir. Un administrateur sur telephone n'avait aucune
navigation dans le dashboard.

Le seuil monte de md a lg. A 768px la sidebar ne laissait que 448px
utiles au contenu, ce qui ne suffit pas aux formulaires portant des
builders et des grilles a deux colonnes. Elle reste permanente a partir
de 1024 et devient un tiroir en dessous.

Bouton libelle plutot que languette : une languette collee au bord ne
se decouvre pas et entre en conflit avec le geste de retour d'iOS. Et
libelle plutot qu'icone seule parce que le header porte deja un burger,
celui de la navigation du site — deux burgers identiques l'un sous
l'autre seraient indistinguables.

Refermeture a la navigation par AJUSTEMENT D'ETAT PENDANT LE RENDU : la
sidebar navigue par router.push sur des boutons, donc la delegation sur
les liens du header ne s'applique pas, et un effet appelant setState
declencherait la cascade que React signale. React relance ici le rendu
sans valider le premier.

Rembourrage du main a p-4 sous lg : p-10 coutait 80px de largeur sur un
telephone qui en a 390."

echo "✓ commité"
git log -1 --oneline