'use client';

import React, { JSX } from 'react';
import { trpc } from '@/lib/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import Image from 'next/image';
import type { User, Role } from '@prisma/client';

export default function UsersList(): JSX.Element {
  const { data: users = [] } = trpc.user.getAll.useQuery();
  const { data: roles = [] as Role[]} = trpc.role.getAll.useQuery();

  const getRoleName = (roleId: number | null | undefined): string => {
    if (!roles || roles.length === 0 || roleId == null) return '';
    const role = roles.find((r: Role) => r.id === roleId);
    return role?.name ?? '';
  };

  const columns: Column<User>[] = [
    { property: 'id', displayName: 'ID', type: 'string' },
    { property: 'firstName', displayName: 'Prénom', type: 'string' },
    { property: 'lastName', displayName: 'Nom', type: 'string' },
    { property: 'email', displayName: 'Email', type: 'string' },
    { property: 'roleId', displayName: 'Rôle', type: 'string', render: (roleId) => <span>{getRoleName(roleId as number | null | undefined)}</span> },
    { property: 'createdAt', displayName: 'Date de création', type: 'string', render: (v) => formatDate(v) },
    { property: 'updatedAt', displayName: 'Date de mise à jour', type: 'string', render: (v) => formatDate(v) },
    { property: 'pseudo', displayName: 'Pseudo', type: 'string' },
    { property: 'phone', displayName: 'Numéro de téléphone', type: 'string' },
    { property: 'birthDate', displayName: 'Date de naissance', type: 'string', render: (v) => formatDate(v) },
    { property: 'memberSince', displayName: 'Membre depuis', type: 'string', render: (v) => formatDate(v) },
    { property: 'aboutMe', displayName: 'À propos de moi', type: 'string' },
    { property: 'avatar', displayName: 'Avatar', type: 'string', render: (avatar) => (typeof avatar === 'string' && avatar)
      ? <Image src={avatar} alt="avatar" width={50} height={50} className="rounded-full" />
      : <span className="text-slate-500">No Avatar</span> },
  ];

  const formatDate = (value: string | number | boolean | Date | null): React.ReactNode => {
    if (!value) return <span className="text-slate-500">Non renseigné</span>;
    if (typeof value === 'boolean') return <span className="text-slate-500">-</span>;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return <span className="text-slate-500">-</span>;
    return <span>{d.toLocaleDateString()}</span>;
  };

  // Remove nested role relation for Table<User>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sanitizedUsers = users.map(({ role, ...rest }) => rest);
  console.log('Sanitized Users:', sanitizedUsers);

  return (
    <div className="w-full">
      <Table columns={columns} rows={sanitizedUsers} />
    </div>
  );
}
