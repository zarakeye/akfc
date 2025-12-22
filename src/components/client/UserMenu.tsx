'use client';

import { JSX, use, useEffect, useState } from 'react';
import { trpc } from '@lib/trpcClient';
// import { Button } from '@/components/ui/Button';
import type { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserStore } from '@/lib/stores/useUserStore';
import { clientSessionLogout } from '@/lib/session/session.client';
import { SessionUser } from '@/lib/stores/useUserStore';

interface UserMenuProps {
  user: SessionUser;
  // logout: () => Promise<void>;
}

/**
 * Component UserMenu
 * 
 * @param {user} User object with role field
 * @param {logout} logout function
 * @returns JSX element
 */
export default function UserMenu({ user }: UserMenuProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  // const logoutMutation = trpc.auth.logout.useMutation();
  const [logoutSubmited, setLogoutSubmited] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (logoutSubmited) {
      const performLogout = async () => {
        const logoutResult = await useUserStore.getState().logout();
        if (logoutResult) setLogoutSuccess(true);
      }
      performLogout();
    }
  }, [logoutSubmited, router]);

  useEffect(() => {
    if (logoutSuccess) {
      router.push('/');
      router.refresh();
    }
  }, [router, logoutSuccess]);


  return (
    <div className="relative inline-block p-10" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="flex items-center gap-2 cursor-pointer">
        <Image
          src="/account_circle_size40.svg"
          alt="User Icon"
          width={40}
          height={40}
          className="rounded-full cursor-pointer"
        />
        <span className='text-white'>{user.firstName ?? 'Utilisateur'}</span>
      </div>
      
      {open && (
        <div className="absolute right-1/2 translate-x-1/2 top-5 mt-2 w-60 bg-white border rounded shadow-md z-50">
          <p className="px-4 py-2 text-sm text-gray-700">{user.email}</p>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            onClick={() => {
              if (!logoutSubmited) {
                setLogoutSubmited(true);
                // useClientSessionLogout();
                //   router.push('/');
                //   router.refresh();
                // });
              }
            }}
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}