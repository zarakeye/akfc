'use client';

import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { DisciplineFamily } from '@prisma/client';

/**
 * DisciplineFamiliesTable
 *
 * Liste les familles de disciplines via `trpc.disciplineFamily.getAll.useQuery()`,
 * rendues avec `react-ts-tab-lib`. Mêmes conventions que CategoriesTable.
 */
export default function DisciplineFamiliesTable(): JSX.Element {
  const router = useRouter();
  const { data: families, isLoading, isError } = trpc.disciplineFamily.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des familles.</div>;

  const columns: Column<DisciplineFamily>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'name', displayName: 'Nom', type: 'string' },
    { property: 'slug', displayName: 'Slug', type: 'string' },
    { property: 'sortOrder', displayName: 'Ordre', type: 'number' },
  ];

  return (
    <Table
      columns={columns}
      rows={families || []}
      onRowClick={(row: DisciplineFamily | null) => {
        if (row) router.push(`/dashboard/discipline-families/${row.id}`);
      }}
    />
  );
}