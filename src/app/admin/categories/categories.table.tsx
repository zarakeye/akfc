import { JSX } from 'react';
import { trpc } from '@lib/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { ActivityType } from '@prisma/client';

export default function CategoriesTable(): JSX.Element {
  const { data: activityTypes, isLoading, isError } = trpc.category.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading permissions.</div>;

  const columns: Column<ActivityType>[] = [
    {
      property: 'id',
      displayName: 'ID',
      type: 'number',
    },
    {
      property: 'type',
      displayName: 'Permission',
      type: 'string',
    },
  ];

  return (
    <Table
      columns={columns}
      rows={activityTypes || []}
    />
  );
}