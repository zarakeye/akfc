'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/stores/useSessionStore';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const logout = useSessionStore(s => s.logout);
  const user = useSessionStore(s => s.session?.user);

  const handleLogout = async () => {
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
