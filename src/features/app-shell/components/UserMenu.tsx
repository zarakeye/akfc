'use client';

import { JSX, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/stores/useSessionStore';

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
  const logout = useSessionStore(s => s.logout);
  const user = useSessionStore(s => s.session?.user);

  /**
   * Logs out the user by clearing the session and redirecting to the homepage.
   * @returns {Promise<void>} - The promise resolves when the logout mutation has been completed and the user has been redirected.
   */
  const handleLogout = async (): Promise<void> => {
    await logout(); // met à jour le store
    router.push('/'); // redirige vers la page d'accueil
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
        <Image
          src="/account_circle_size40.svg"
          alt="User Icon"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-white">{user.firstName ?? 'Utilisateur'}</span>
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
