"use client";

import { type JSX } from "react";
import { usePathname } from "next/navigation";

import { useSessionStore } from "@lib/stores/useSessionStore";
import { trpc } from "@trpc/trpcClient";
import { pageKeyForPath } from "@/config/pageRegistry";

/**
 * Badge flottant « Page non publiée » — visible uniquement d'un ADMIN sur une
 * page éditoriale en brouillon (le middleware laisse l'admin voir la vraie page ;
 * ce badge lui rappelle qu'elle n'est pas encore publique).
 */
export function DraftPageBadge(): JSX.Element | null {
  const isAdmin = useSessionStore(
    (s) => (s.session?.user?.isAdmin ?? false),
  );
  const pathname = usePathname();
  const key = pageKeyForPath(pathname);
  const { data: states } = trpc.pageVisibility.all.useQuery(undefined, {
    enabled: isAdmin && key !== null,
  });

  if (!isAdmin || !key) return null;
  const published =
    (states ?? []).find((s) => s.key === key)?.published ?? false;
  if (published) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
      Page non publiée
    </div>
  );
}
