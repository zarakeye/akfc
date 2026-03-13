'use client';

import { JSX } from 'react';
import ControlPanelSidebar from '@/features/app-shell/ControlPanelSidebar';
import { Providers } from '@/app/admin/dashboard/providers';

interface Props {
  children: React.ReactNode;
}

/**
 * Composant qui encapsule le layout de la page d'administration.
 * Il prend en paramètre un élément React qui sera rendu dans le composant <main>.
 * Ce composant est entouré d'un composant <Providers> qui fournit les providers de l'application.
 * Le composant <ControlPanelSidebar> est également rendu dans le composant <div>.
 */
export default function DashboardLayout({ children }: Props): JSX.Element {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <ControlPanelSidebar />

      {/* ⚠️ le main DOIT être relative */}
      <main className="relative flex-1 p-10 overflow-hidden">
        {children}
      </main>
    </div>
    </Providers>
  );
}