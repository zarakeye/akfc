"use client";

import { JSX } from "react";
import Image from "next/image";
import { trpc } from "@trpc/trpcClient";

interface UserCardProps {
  userId: string;
}

/**
 * Card pour afficher un utilisateur.
 *
 * Garde : on ne lance `getProfileById` que si `userId` est non vide
 * (`enabled: !!userId`). Sans session, `userId` vaut `""` ⇒ pas d'appel,
 * donc plus de 401 qui faisait remonter une erreur jusqu'à la racine et
 * cassait le rendu du layout/Header en mode public.
 *
 * @param {string} userId - L'ID de l'utilisateur à afficher.
 */
export default function UserCard({
  userId,
}: UserCardProps): JSX.Element | null {
  const { data: user, isLoading } = trpc.user.getProfileById.useQuery(
    { id: userId },
    { enabled: !!userId },
  );

  if (!userId) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-4 rounded shadow-md bg-white">
      <div className="flex gap-5">
        <div>
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- proxy signé (publicId → route interne)
            <img
              src={`/api/media/by-public-id/${user.avatar
                .split("/")
                .map(encodeURIComponent)
                .join("/")}?variant=large`}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <Image
              src="/account_circle_size40.svg"
              alt="preview"
              className="w-24 h-24 rounded-full object-cover"
              width={500}
              height={500}
            />
          )}
        </div>
        <h2 className="flex text-center items-center text-xl font-bold mb-2">
          <span>
            {user?.firstName} {user?.lastName}
          </span>
        </h2>
      </div>

      <div className="flex text-gray-600 mb-1">
        <Image src="/email.svg" alt="email" width={20} height={20} />:{" "}
        {user?.email}
      </div>
      {user?.phone && (
        <div className="flex text-gray-600 mb-1">
          <Image src="/mobilePhone.svg" alt="phone" width={20} height={20} /> :{" "}
          <span>{user.phone}</span>
        </div>
      )}
      {user?.birthDate && (
        <p className="text-gray-600">
          Date de naissance: {new Date(user.birthDate).toLocaleDateString()}
        </p>
      )}
      {user?.role && <p className="text-gray-600">Rôle: {user.role.name}</p>}
    </div>
  );
}
