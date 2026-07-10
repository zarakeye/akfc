import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { Category } from '@prisma/client';

/**
 * CategoriesTable
 *
 * Liste toutes les catégories (« types d'activités ») depuis la base via
 * `trpc.category.getAll.useQuery()`, rendues avec `react-ts-tab-lib`.
 *
 * Gère les états de chargement et d'erreur. Mêmes conventions que les autres
 * tables admin (PermissionsTable, etc.).
 */
export default function CategoriesTable(): JSX.Element {
  const router = useRouter();
  const { data: categories, isLoading, isError } = trpc.category.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des catégories.</div>;

  const columns: Column<Category>[] = [
    {
      property: 'id',
      displayName: 'ID',
      type: 'number',
    },
    {
      property: 'type',
      displayName: 'Libellé',
      type: 'string',
    },
  ];

  return (
    <Table
      columns={columns}
      rows={categories || []}
      onRowClick={(row: Category | null) => {
        if (row) router.push(`/dashboard/categories/${row.id}`);
      }}
    />
  );
}