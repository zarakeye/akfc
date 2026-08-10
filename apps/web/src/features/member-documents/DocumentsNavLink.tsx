"use client";

import Link from "next/link";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Entrée de navbar « Documents » avec badge de non-lus (généraux + persos) et,
 * sur desktop, un tooltip détaillé au survol (au niveau de la cloche). Le
 * burger passe `withTooltip={false}` : pas de survol sur tactile, juste le badge.
 */
export function DocumentsNavLink({
  href,
  label,
  className,
  withTooltip = true,
}: {
  href: string;
  label: string;
  className?: string;
  withTooltip?: boolean;
}) {
  const user = useSessionStore((s) => s.session?.user);
  const { data } = trpc.memberDocument.unreadBreakdownForMe.useQuery(undefined, {
    enabled: Boolean(user),
  });
  const general = data?.general ?? 0;
  const perso = data?.perso ?? 0;
  const total = general + perso;

  return (
    <span
      className={
        withTooltip
          ? "group relative inline-flex items-center"
          : "relative flex items-center"
      }
    >
      <Link href={href} className={className}>
        {label}
      </Link>
      {total > 0 && (
        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {total}
        </span>
      )}
      {withTooltip && total > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-60 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs text-white shadow-lg group-hover:pointer-events-auto group-hover:block"
        >
          {general > 0 && (
            <Link href="/documents" className="block hover:underline">
              {general} document{general > 1 ? "s" : ""} du club à lire
            </Link>
          )}
          {perso > 0 && (
            <Link
              href="/documents"
              className={
                general > 0
                  ? "mt-1.5 block border-t border-white/15 pt-1.5 hover:underline"
                  : "block hover:underline"
              }
            >
              {perso} document{perso > 1 ? "s" : ""} personnel
              {perso > 1 ? "s" : ""} à lire
            </Link>
          )}
        </div>
      )}
    </span>
  );
}
