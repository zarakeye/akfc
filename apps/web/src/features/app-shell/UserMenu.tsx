"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { UserPortrait } from "@features/social/UserPortrait";
import { DocumentsNavLink } from "@features/member-documents/DocumentsNavLink";

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

  const isAdmin = user.role?.name === "ADMIN";

  return (
    <div
      className="relative inline-block xl:pb-4 xl:pr-10 cursor-pointer"
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
        <div className="absolute right-0 top-10 w-60 max-w-[calc(100vw-1rem)] origin-top-right bg-white border rounded shadow-md z-50">
          <p className="px-4 py-2 text-sm text-gray-700">{user.email}</p>
          <Link
            href="/profil"
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Mon profil
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <div className="px-4 py-2 hover:bg-gray-100">
            <DocumentsNavLink
              href="/documents"
              label="Mes documents"
              withTooltip={false}
              className="text-sm text-gray-700"
            />
          </div>
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
