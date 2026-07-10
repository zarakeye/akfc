"use client";

import type { JSX } from "react";

import { useAvatarVersionStore } from "@lib/stores/useAvatarVersionStore";
import {
  type DisplayUser,
  portraitUrl,
  initials,
} from "@features/social/userDisplay";

/**
 * Pastille ronde : portrait si disponible, sinon initiales sur fond neutre.
 * Deux tailles : `sm` (20px, listes denses) et `md` (32px, en-tête de
 * commentaire).
 *
 * Composant CLIENT (lit le store de version d'avatar pour se rafraîchir
 * quand l'avatar change). Les helpers purs (formatUserName, portraitUrl…)
 * vivent dans `userDisplay.ts`, importable côté serveur.
 */
export function UserPortrait({
  user,
  size = "sm",
}: {
  user: DisplayUser;
  size?: "sm" | "md";
}): JSX.Element {
  const dim = size === "md" ? "h-8 w-8 text-xs" : "h-5 w-5 text-[10px]";
  // Version d'avatar de CE user (partagée) : tout changement la bumpe et
  // recharge l'image ici comme partout ailleurs.
  const version = useAvatarVersionStore((s) => s.versions[user.id] ?? 0);
  const url = portraitUrl(user, version);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={url}
        src={url}
        alt=""
        className={`shrink-0 rounded-full object-cover ${dim}`}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-muted font-medium ${dim}`}
    >
      {initials(user)}
    </span>
  );
}
