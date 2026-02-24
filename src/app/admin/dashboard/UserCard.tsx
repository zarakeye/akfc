'use client';

import { JSX } from 'react';
import Image from 'next/image';
import { trpc } from '@/lib/trpcClient';
import type { Role } from '@prisma/client';
import UpdateUserRoleById from './UpdateUserRoleById';

interface UserCardProps {
  userId: string;
}

/**
 * Card pour afficher un utilisateur.
 * @param {string} userId - L'ID de l'utilisateur à afficher.
 * @returns {JSX.Element} La card affichant l'utilisateur.
 */
export default function UserCard({ userId }: UserCardProps): JSX.Element {
  const userQuery = trpc.user.getProfileById.useQuery({ id: userId });
  const { data: user, isLoading } = userQuery;
  const { data: roles = [] as Role[] } = trpc.role.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!user) return <div>User not found</div>;

  return (
    <div className="p-4 rounded shadow-md bg-white">
      <div className='flex gap-5'>
        <div>
        <Image
          src={user?.avatar ?? '/account_circle_size_40.svg'}
          alt="preview"
          className="w-24 h-24 rounded-full object-cover"
          width={500}
          height={500}
          sizes="(max-width: 768px) 100px, 200px"
        />
      </div>
      <h2 className="flex text-center items-center text-xl font-bold mb-2"><span>{user?.firstName} {user?.lastName}</span></h2>
      </div>
      
      <div className="flex text-gray-600 mb-1"><Image src="/email.svg" alt="email" width={20} height={20} />: {user?.email}
      </div>
      {user?.phone && (
        <div className="flex text-gray-600 mb-1">
          <Image src="/mobilePhone.svg" alt="phone" width={20} height={20} /> : <span>{user.phone}</span>
        </div>
      )}
      {user?.birthDate && <p className="text-gray-600">Date de naissance: {new Date(user.birthDate).toLocaleDateString()}</p>}
      <div className="mt-2">
        <p className="text-gray-600 mb-1">Rôle</p>
        <UpdateUserRoleById
          userId={userId}
          currentRoleId={user.role?.id ?? null}
          roles={roles}
          onChanged={() => userQuery.refetch()}
        />

        <p className="text-xs text-slate-500 mt-1">
          L&apos;admin assigne uniquement le rôle. Le reste du profil est complété par l&apos;utilisateur.
        </p>
      </div>
    </div>
  );
}