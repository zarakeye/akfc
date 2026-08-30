"use client";

import { type JSX } from "react";
import Link from "next/link";
import { Bell, Users } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Cloche des espaces COLLABORATIFS — réservée aux membres NON-admin.
 *
 * Un manager/admin accède déjà à ses espaces via sa cloche « bibliothèque »
 * (NotificationBell) et le finder admin : pas de cloche redondante pour lui.
 * Pour un membre collaboratif : badge du nombre de documents non lus + menu
 * déroulant listant les nouveaux documents (titre + groupe), chacun ouvrant le
 * finder membre `/mes-espaces`. Absente si le membre n'a aucun espace.
 */
export function CollaborativeBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const { data: spaces } = trpc.storage.myCollaborativeSpaces.useQuery();
  const { data: unread } =
    trpc.memberDocument.collaborativeUnreadForMe.useQuery();

  // Managers/admins : exclus (ils ont la cloche bibliothèque + le finder admin).
  const isManager = user?.isAdmin ?? false;
  if (isManager) return null;
  if (!spaces || spaces.length === 0) return null;

  const items = unread ?? [];
  const total = items.length;
  const plural = total > 1 ? "x" : "";

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
        aria-label={
          total > 0
            ? `${total} nouveau${plural} document${total > 1 ? "s" : ""} — mes espaces`
            : "Mes espaces collaboratifs"
        }
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

      {/* Menu déroulant au survol */}
      <div className="absolute right-0 top-full z-50 hidden pt-1 group-hover:block">
        <div className="w-80 max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {total === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Aucun nouveau document.
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {total} nouveau{plural} document{total > 1 ? "s" : ""}
              </div>
              {items.map((it) => (
                <Link
                  key={it.id}
                  href="/mes-espaces"
                  className="block px-3 py-2 hover:bg-gray-100"
                >
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {it.title}
                  </span>
                  {it.groupName && (
                    <span className="block truncate text-xs text-gray-500">
                      {it.groupName}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                href="/mes-espaces"
                className="block border-t border-gray-100 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-gray-50"
              >
                Ouvrir mes espaces →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
