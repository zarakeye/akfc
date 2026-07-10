#!/bin/bash
# Avatar TRANCHE 3 (affichage) : portraitUrl route desormais le publicId
# `avatar` via le proxy by-public-id (delivrance publique). Le fix propage
# GRATUITEMENT a tous les consommateurs de UserPortrait (PostCard,
# CommentsSection, ReactionsBar). Le header (UserMenu) affiche l'avatar reel
# au lieu du SVG statique.
# Fiches cours/stage/contact : pas de responsable-avec-avatar dans le code
# actuel -> branchement a faire quand ces fiches exposeront un user.
# À lancer depuis la RACINE du monorepo : bash apply_avatar_display.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/social/userDisplay.tsx"
cat > 'apps/web/src/features/social/userDisplay.tsx' << 'FILE_EOF'
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

/**
 * URL du proxy pour un publicId Cloudinary (délivrance publique,
 * authenticated signé côté serveur — marche pour les anonymes).
 */
function publicIdToUrl(publicId: string): string {
  const enc = publicId.split("/").map(encodeURIComponent).join("/");
  return `/api/media/by-public-id/${enc}?variant=large`;
}

/**
 * URL de portrait. `avatar` est un publicId Cloudinary (uploadé via la
 * fiche profil) → passe par le proxy. `image` est déjà une URL absolue
 * (fournisseur OAuth) → utilisée telle quelle. Sinon null (→ initiales).
 */
export function portraitUrl(u: DisplayUser): string | null {
  if (u.avatar) return publicIdToUrl(u.avatar);
  if (u.image) return u.image;
  return null;
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
FILE_EOF

echo "-> apps/web/src/features/app-shell/UserMenu.tsx"
cat > 'apps/web/src/features/app-shell/UserMenu.tsx' << 'FILE_EOF'
"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { UserPortrait } from "@features/social/userDisplay";

/**
 * UserMenu is a React component that displays a user menu when the user is connected.
 * It shows the user's first name, email and a logout button.
 * When the user clicks on the logout button, it clears the session and redirects the user to the homepage.
 * The menu is only visible when the user is connected.
 * @returns {React.ReactElement | null} - The user menu React element or null if the user is not connected.
 */
export default function UserMenu(): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const logout = useSessionStore((s) => s.logout);
  const user = useSessionStore((s) => s.session?.user);

  /**
   * Logs out the user by clearing the session and redirecting to the homepage.
   * @returns {Promise<void>} - The promise resolves when the logout mutation has been completed and the user has been redirected.
   */
  const handleLogout = async (): Promise<void> => {
    await logout(); // met à jour le store
    router.push("/"); // redirige vers la page d'accueil
  };

  // Si pas connecté, ne pas afficher le menu
  if (!user) return null;

  return (
    <div
      className="relative inline-block p-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-2 cursor-pointer">
        <UserPortrait
          user={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            pseudo: user.pseudo,
            email: user.email,
            avatar: user.avatar,
            image: null,
          }}
          size="md"
        />
        <span className="text-white">{user.firstName ?? "Utilisateur"}</span>
      </div>

      {open && (
        <div className="absolute right-0 top-10 w-60 bg-white border rounded shadow-md z-50">
          <p className="px-4 py-2 text-sm text-gray-700">{user.email}</p>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck