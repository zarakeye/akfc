import type { JSX } from "react";

/**
 * Helpers d'affichage d'un utilisateur, partagés par les features
 * sociales (réactions, commentaires…). Évite de redéfinir la cascade
 * nom/portrait dans chaque composant.
 *
 * `DisplayUser` est la projection minimale renvoyée par les routers
 * social (même `select` partout) — les types inférés de tRPC y sont
 * structurellement assignables.
 */

export interface DisplayUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pseudo: string | null;
  email: string;
  avatar: string | null;
  image: string | null;
}

/** Nom complet → pseudo → email (cascade habituelle du projet). */
export function formatUserName(u: DisplayUser): string {
  const full = [u.firstName, u.lastName]
    .filter((p): p is string => Boolean(p?.trim()))
    .join(" ")
    .trim();
  return full || u.pseudo || u.email;
}

/** URL de portrait : avatar prioritaire, puis image, sinon null. */
export function portraitUrl(u: DisplayUser): string | null {
  return u.avatar || u.image || null;
}

/** Deux premières lettres du nom, pour le fallback sans portrait. */
export function initials(u: DisplayUser): string {
  return formatUserName(u).slice(0, 2).toUpperCase();
}

/**
 * Pastille ronde : portrait si disponible, sinon initiales sur fond
 * neutre. Deux tailles : `sm` (20px, listes denses) et `md` (32px,
 * en-tête de commentaire).
 */
export function UserPortrait({
  user,
  size = "sm",
}: {
  user: DisplayUser;
  size?: "sm" | "md";
}): JSX.Element {
  const dim = size === "md" ? "h-8 w-8 text-xs" : "h-5 w-5 text-[10px]";
  const url = portraitUrl(user);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
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