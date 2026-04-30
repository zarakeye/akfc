import { JSX } from 'react';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { Category } from '@prisma/client';

/**
 * CategoriesTable component
 * 
 * This component is responsible for displaying a list of all categories from the database.
 * It uses the trpc.category.getAll hook to fetch the data and the react-ts-tab-lib library to render the table.
 * 
 * The component also handles loading and error states for both the categories data.
 */
export default function CategoriesTable(): JSX.Element {
  const { data: activityTypes, isLoading, isError } = trpc.category.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading permissions.</div>;

  const columns: Column<Category>[] = [
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