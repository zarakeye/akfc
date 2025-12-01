'use client';

import { JSX } from 'react';
import { trpc } from '@lib/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { Role } from '@prisma/client';

export default function RolesList(): JSX.Element {
  const { data: roles, isLoading, isError } = trpc.role.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading roles.</div>;

  const columns: Column<Role>[] = [
    {
      property: 'id',
      displayName: 'ID',
      type: 'number',
    },
    {
      property: 'name',
      displayName: 'Rôle',
      type: 'string',
    },
    {
      property: 'description',
      displayName: 'Description',
      type: 'string',
    },
  ];

  return (
    <Table
      columns={columns}
      rows={roles || []}
    />
  );
}