'use client';

import { JSX } from 'react';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { Permission } from '@prisma/client';

/**
 * A component that displays a list of all permissions from the database.
 * It uses the trpc.permission.getAll hook to fetch the data and the react-ts-tab-lib library to render the table.
 * The component also handles loading and error states for both the permissions data.
 * @returns {JSX.Element} A JSX element representing the PermissionsList component.
 */
export default function PermissionsList(): JSX.Element {
  const { data: permissions, isLoading, isError } = trpc.permission.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading permissions.</div>;

  const columns: Column<Permission>[] = [
    {
      property: 'id',
      displayName: 'ID',
      type: 'number',
    },
    {
      property: 'name',
      displayName: 'Permission',
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
      rows={permissions || []}
    />
  );
}