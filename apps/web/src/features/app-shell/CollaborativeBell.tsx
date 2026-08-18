"use client";

import { type JSX } from "react";
import Link from "next/link";
import { Bell, Users } from "lucide-react";

import { trpc } from "@trpc/trpcClient";

/**
 * Cloche des espaces COLLABORATIFS — côté membre, à gauche de l'avatar.
 *
 * Compte les documents non lus déposés dans ses espaces de groupe (héritage
 * compris) et mène au finder membre (`/mes-espaces`). Muette (icône « groupe »)
 * quand il n'y a rien de neuf ; cloche + badge + tooltip dès qu'un document non
 * lu apparaît. Absente si le membre n'a aucun espace collaboratif.
 *
 * Distincte de la cloche « bibliothèque » (NotificationBell, réservée aux
 * gestionnaires) : ici c'est le collaboratif, pas le perso/diffusion.
 */
export function CollaborativeBell(): JSX.Element | null {
  const { data: spaces } = trpc.storage.myCollaborativeSpaces.useQuery();
  const { data: unread } =
    trpc.memberDocument.collaborativeUnreadCountForMe.useQuery();

  if (!spaces || spaces.length === 0) return null;

  const total = unread ?? 0;
  const s = total > 1 ? "s" : "";
  const message = `${total} nouveau${s === "s" ? "x" : ""} document${s} dans vos espaces collaboratifs`;

  return (
    <div className="group relative">
      <style>{`
        @keyframes akfc-collab-bell-shake {
          0%, 15%, 100% { transform: rotate(0deg); }
          2%  { transform: rotate(14deg); }
          5%  { transform: rotate(-12deg); }
          8%  { transform: rotate(9deg); }
          11% { transform: rotate(-6deg); }
          13% { transform: rotate(3deg); }
        }
        .akfc-collab-bell-shaking {
          animation: akfc-collab-bell-shake 6s ease-in-out infinite;
          transform-origin: top center;
        }
        @media (prefers-reduced-motion: reduce) {
          .akfc-collab-bell-shaking { animation: none; }
        }
      `}</style>

      <Link
        href="/mes-espaces"
        aria-label={total > 0 ? message : "Mes espaces collaboratifs"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        {total > 0 ? (
          <>
            <Bell className="akfc-collab-bell-shaking h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {total}
            </span>
          </>
        ) : (
          <Users className="h-5 w-5" aria-hidden />
        )}
      </Link>

      {total > 0 && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-50 hidden pt-1 group-hover:block"
        >
          <div className="w-max max-w-80 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
