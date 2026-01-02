'use client';

import { trpc } from '@/lib/trpcClient';
import { JSX, useState } from 'react';
import { UpdateRoleForm } from '../../forms/UpdateRole.form';
import { Role } from '@prisma/client';

interface RoleCardProps {
  setDisplayRoleCard: (role: null) => void;
  displayRoleCard: Role | null;
  setUpdateRole: (updateRole: RoleWithPermissions | null) => void;
}

export type RoleWithPermissions = {
  id: number;
  name: string;
  description: string | null;
  permissions: {
    permission: {
      id: number;
      name: string;
    };
  }[];
};

export default function RoleCard({ displayRoleCard, setDisplayRoleCard, setUpdateRole }: RoleCardProps): JSX.Element {
  const { data: role, isLoading } = trpc.role.getByIdWithPermissions.useQuery(
    { id: displayRoleCard?.id ?? 0 },
    {
      enabled: !!displayRoleCard,
    }
  );

  if (isLoading) return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Chargement du rôle...</h2>
      </div>
    </div>
  );

  if (!role) return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Role not found</h2>
      </div>
    </div>
  );

  return (
    <>
    {displayRoleCard && (
    <div className="flex flex-col card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Rôle : {role.name}</h2>
        <p className="text-gray-500">Description:</p>
        <p>{role.description ?? "Aucune description disponible"}</p>
        <p className="text-gray-500">Permissions:</p>
        <ul className="list-disc list-inside">
          {role.permissions.map((r) => (
            <li key={r.permission.id}>{r.permission.name}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-2">
        <button
          className="btn btn-primary bg-gray-600 text-white rounded px-2"
          onClick={() => {
            setUpdateRole(role);
            setDisplayRoleCard(null)
          }}
        >
          Modifier
        </button>
        <button className="btn btn-primary bg-gray-600 text-white rounded px-2">Supprimer</button>
        <button className="btn btn-primary bg-gray-600 text-white rounded px-2">Liste des rôles</button>
      </div>
    </div>
    )}
    </>
  );
}