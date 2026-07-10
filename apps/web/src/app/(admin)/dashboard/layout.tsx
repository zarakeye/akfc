'use client';

import { JSX } from 'react';
import Header from '@features/app-shell/Header';
import ControlPanelSidebar from '@features/app-shell/ControlPanelSidebar';
import { Providers } from '@app/(admin)/dashboard/providers';

interface Props {
  children: React.ReactNode;
}

/**
 * Layout de la page d'administration (dashboard).
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
 */
export default function DashboardLayout({ children }: Props): JSX.Element {
  return (
    <Providers>
      <div className="flex h-dvh flex-col bg-background">
        <div className="sticky top-0 z-50 shrink-0 bg-background">
          <Header />
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Sidebar — masquée sous md. Scroll propre si la liste dépasse. */}
          <div className="hidden overflow-y-auto md:flex [&>aside]:h-full [&>aside]:min-h-full">
            <ControlPanelSidebar />
          </div>

          {/* ⚠️ le main DOIT être relative.
              overflow-y-auto : scroll vertical naturel du contenu long. */}
          <main className="relative min-h-0 flex-1 overflow-y-auto p-10">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}