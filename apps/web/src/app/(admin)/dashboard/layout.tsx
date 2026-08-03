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
