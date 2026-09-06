"use client";

import { trpc } from "@trpc/trpcClient";
import { APP_ROOT } from "@config/app";

/**
 * Icône de corbeille commutée sur l'état RÉEL de la corbeille :
 *   - VIDE  : couvercle fermé, propre ;
 *   - PLEINE : papiers qui dépassent + contenu.
 *
 * Elle interroge elle-même `trash.listBin` (limit 1 : on ne veut qu'un booléen
 * « y a-t-il quelque chose ? »). React Query dédoublonne l'appel entre l'arbre
 * et la grille, donc l'appelant n'a qu'à la poser sur le nœud `bin`.
 */
export function BinIcon({ className }: { className?: string }) {
  const { data } = trpc.trash.listBin.useQuery(
    { appRoot: APP_ROOT, limit: 1 },
    { refetchOnWindowFocus: false, staleTime: 10_000 },
  );
  const full = (data?.items?.length ?? 0) > 0;

  const svg = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (full) {
    return (
      <svg {...svg} className={className}>
        <path d="M4 7h16" />
        <path d="M6.3 7l.85 12.5A2 2 0 0 0 9.15 21.4h5.7a2 2 0 0 0 2-1.9L17.7 7" />
        {/* contenu qui déborde du bord */}
        <path d="M6.5 7q1.4-2.2 2.9 0 1.4-2.2 2.9 0 1.4-2.2 2.9 0" />
        <path d="M10.5 11.5v5.5" />
        <path d="M13.5 11.5v5.5" />
      </svg>
    );
  }

  return (
    <svg {...svg} className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4.6A1.6 1.6 0 0 1 10.6 3h2.8A1.6 1.6 0 0 1 15 4.6V7" />
      <path d="M6.3 7l.85 12.5A2 2 0 0 0 9.15 21.4h5.7a2 2 0 0 0 2-1.9L17.7 7" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
