"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import { useCurrentUser } from "#features/auth/InitialSession.tsx";
import { trpc } from "#core/trpc/trpcClient.ts";
import { UserPortrait } from "#features/social/UserPortrait.tsx";
import { DocumentsNavLink } from "#features/member-documents/DocumentsNavLink.tsx";
import { useDisclosure } from "#features/app-shell/useDisclosure.ts";

/**
 * UserMenu is a React component that displays a user menu when the user is connected.
 * It shows the user's first name, email and a logout button.
 * When the user clicks on the logout button, it clears the session and redirects the user to the homepage.
 * The menu is only visible when the user is connected.
 * @returns {React.ReactElement | null} - The user menu React element or null if the user is not connected.
 */
export default function UserMenu({ variant = "bar" }: { variant?: "bar" | "panel" }): JSX.Element | null {
  // Survol et clavier : l'avatar et le prénom forment un bouton (useDisclosure). Dans le panneau
  // des petits écrans, à l'appui seulement.
  const menu = useDisclosure({ hover: variant === "bar" });
  const { open } = menu;
  const router = useRouter();
  const logout = useSessionStore((s) => s.logout);
  const user = useCurrentUser();
  const ticketAccess = trpc.ticket.access.useQuery(undefined, { enabled: Boolean(user) });

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

  const isAdmin = user.isAdmin;

  return (
    <div
      {...menu.rootProps}
      className="relative inline-block xl:pb-4 xl:pr-10 cursor-pointer"
    >
      <button
        {...menu.buttonProps}
        data-tour="header.user-menu"
        className="flex items-center gap-2 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
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
      </button>

      {open && (
        <div {...menu.menuProps} className="absolute left-0 top-10 w-60 max-w-[calc(100vw-1rem)] origin-top-left xl:left-auto xl:right-0 xl:origin-top-right bg-card border rounded shadow-md z-50">
          <p className="px-4 py-2 text-sm text-foreground">{user.email}</p>
          <Link
            href="/profil"
            className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
            onClick={menu.close}
          >
            Mon profil
          </Link>
          <Link
            href="/profil/droit-a-l-image"
            className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
            onClick={menu.close}
          >
            Mon droit à l&apos;image
          </Link>
          {!isAdmin && (
            <Link
              href="/deposer"
              className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
              onClick={menu.close}
            >
              Déposer un ou plusieurs fichiers
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
              onClick={menu.close}
            >
              Dashboard
            </Link>
          )}
          {ticketAccess.data?.canHandle && (
            <Link
              href="/dashboard/tickets"
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
              onClick={menu.close}
            >
              Demandes reçues
              {ticketAccess.data.open > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {ticketAccess.data.open}
                </span>
              )}
            </Link>
          )}
          <div className="px-4 py-2 hover:bg-muted">
            <DocumentsNavLink
              href="/documents"
              label="Mes documents"
              withTooltip={false}
              className="text-sm text-foreground"
            />
          </div>
          <Link
            href="/profil/ou-j-apparais"
            className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
            onClick={menu.close}
          >
            Où j&apos;apparais
          </Link>
          <button
            data-tour="header.logout"
            className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
