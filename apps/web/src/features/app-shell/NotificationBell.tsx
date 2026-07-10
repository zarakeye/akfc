"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { Bell, HardDrive } from "lucide-react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Cloche de notifications de la bibliothèque — à gauche de l'avatar.
 *
 * Sans rien à traiter, la cloche cède la place à un DISQUE DUR : le
 * raccourci vers la bibliothèque demeure, mais muet (ni badge, ni
 * secousse, ni tooltip). La cloche n'existe que quand elle a quelque
 * chose à dire.
 *
 * Badge = assets « pending » + entrées de corbeille. Tooltip au survol
 * avec la formulation adaptée (les deux / attente seule / corbeille
 * seule, singulier/pluriel géré). La cloche entière est un LIEN vers la
 * bibliothèque ; si la variante dropdown (liens pending/corbeille
 * séparés) est retenue plus tard, seule la partie basse du composant
 * change — les données et le message sont déjà isolés.
 *
 * Gating : visible uniquement pour les utilisateurs ayant AU MOINS UNE
 * permission (tout gestionnaire de contenu) — pas de permission
 * bibliothèque dédiée à ce jour, et un membre simple n'a rien à faire
 * de ces compteurs.
 *
 * Secousse : uniquement quand il y a du contenu à traiter — un wiggle
 * bref toutes les ~6 s (les 15 premiers % de l'animation), désactivé
 * par prefers-reduced-motion.
 */

function buildMessage(pending: number, bin: number): string {
  const s = (n: number) => (n > 1 ? "s" : "");
  if (pending > 0 && bin > 0) {
    return `Vous avez ${pending} contenu${s(pending)} en attente et ${bin} dans la corbeille`;
  }
  if (pending > 0)
    return `Vous avez ${pending} contenu${s(pending)} en attente`;
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}

export function NotificationBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const [counts, setCounts] = useState<{ pending: number; bin: number } | null>(
    null,
  );

  const canSee = (user?.role?.permissions.length ?? 0) > 0;

  useEffect(() => {
    if (!canSee) return;
    let cancelled = false;
    void trpcClient.storage.getAttentionCounts.query().then((data) => {
      if (!cancelled) setCounts(data);
    });
    return () => {
      cancelled = true;
    };
  }, [canSee]);

  if (!canSee) return null;

  const total = (counts?.pending ?? 0) + (counts?.bin ?? 0);

  return (
    <div className="group relative">
      <style>{`
        @keyframes akfc-bell-shake {
          0%, 15%, 100% { transform: rotate(0deg); }
          2%  { transform: rotate(14deg); }
          5%  { transform: rotate(-12deg); }
          8%  { transform: rotate(9deg); }
          11% { transform: rotate(-6deg); }
          13% { transform: rotate(3deg); }
        }
        .akfc-bell-shaking {
          animation: akfc-bell-shake 6s ease-in-out infinite;
          transform-origin: top center;
        }
        @media (prefers-reduced-motion: reduce) {
          .akfc-bell-shaking { animation: none; }
        }
      `}</style>

      <Link
        href="/dashboard/library"
        aria-label={
          total > 0
            ? buildMessage(counts!.pending, counts!.bin)
            : "Bibliothèque"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        {total > 0 ? (
          <>
            <Bell className="akfc-bell-shaking h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {total}
            </span>
          </>
        ) : (
          <HardDrive className="h-5 w-5" aria-hidden />
        )}
      </Link>

      {total > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden w-max max-w-64 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block"
        >
          {buildMessage(counts!.pending, counts!.bin)}
        </div>
      )}
    </div>
  );
}
