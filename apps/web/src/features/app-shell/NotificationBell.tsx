"use client";

import { type JSX } from "react";
import Link from "next/link";
import { Bell, HardDrive } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
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

function buildMessage(
  pending: number,
  bin: number,
  persoPending: number,
  generalPending: number,
): string {
  const s = (n: number) => (n > 1 ? "s" : "");

  // Types de contenus en attente : personnels / dossier « général » /
  // disciplines (le reste).
  const rest = Math.max(0, pending - persoPending - generalPending);
  const typesCount =
    (persoPending > 0 ? 1 : 0) +
    (generalPending > 0 ? 1 : 0) +
    (rest > 0 ? 1 : 0);

  // Partie « en attente » (sans « Vous avez » ni corbeille).
  let attente = "";
  if (pending > 0) {
    if (typesCount >= 2) {
      // ≥ 2 types : total + ventilation « dont … » (le reste non nommé).
      const breakdown: string[] = [];
      if (persoPending > 0) {
        breakdown.push(`${persoPending} personnel${s(persoPending)}`);
      }
      if (generalPending > 0) {
        breakdown.push(`${generalPending} dans le dossier « général »`);
      }
      const dont =
        breakdown.length > 0 ? ` dont ${breakdown.join(" et ")}` : "";
      attente = `${pending} contenu${s(pending)} en attente${dont}`;
    } else if (persoPending > 0) {
      // Uniquement du perso → libellé dédié.
      attente = `${persoPending} contenu${s(persoPending)} personnel${s(persoPending)} en attente`;
    } else if (generalPending > 0) {
      // Uniquement du général → libellé dédié.
      attente = `${generalPending} contenu${s(generalPending)} en attente dans le dossier « général »`;
    } else {
      // Uniquement des disciplines (non nommées).
      attente = `${pending} contenu${s(pending)} en attente`;
    }
  }

  if (attente && bin > 0) {
    return `Vous avez ${attente} et ${bin} dans la corbeille`;
  }
  if (attente) {
    return `Vous avez ${attente}`;
  }
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}

export function NotificationBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const canSee = (user?.role?.permissions.length ?? 0) > 0;

  // ─── Pourquoi useQuery et pas useEffect + useState ──────────────────────
  //
  // Ce composant faisait UN fetch au montage, dans un `useEffect([canSee])`,
  // et stockait le résultat dans un `useState`. Il ne se rafraîchissait donc
  // jamais : ni après un upload, ni après une publication. Il fallait
  // recharger la page pour voir un compteur juste.
  //
  // Et surtout, il était HORS du cache react-query. Un `invalidate()` posé
  // au bon endroit n'aurait rien fait — il n'avait rien à invalider. Les
  // deux moitiés du mécanisme manquaient, chacune rendant l'autre inutile.
  //
  // Avec `useQuery`, le cache devient la source unique : les quatre endroits
  // qui font bouger les compteurs (les deux uploaders, `useStatusChange`,
  // `useNodeActions`) invalident, et la cloche suit — sans rien savoir d'eux.
  //
  // Le type vient de la procédure, il n'y a plus rien à écrire à la main.
  // L'annotation précédente disait `{ pending, bin }` alors que le backend
  // en renvoyait quatre depuis un moment.
  const { data: counts } = trpc.storage.getAttentionCounts.useQuery(undefined, {
    enabled: canSee,
  });

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
            ? buildMessage(
                counts!.pending,
                counts!.bin,
                counts!.persoPending,
                counts!.generalPending,
              )
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
          {buildMessage(
            counts!.pending,
            counts!.bin,
            counts!.persoPending,
            counts!.generalPending,
          )}
        </div>
      )}
    </div>
  );
}
