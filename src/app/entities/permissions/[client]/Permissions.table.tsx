import { JSX } from 'react';
import { trpc } from '@lib/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { Permission } from '@prisma/client';

export default function PermissionsTable(): JSX.Element {
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