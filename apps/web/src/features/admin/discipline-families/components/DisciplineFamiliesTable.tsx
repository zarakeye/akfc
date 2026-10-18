'use client';

import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { DisciplineFamily } from '@prisma/client';
import { deleteColumn } from "@features/admin/common/delete";

type FamilyRow = DisciplineFamily & { supprimer: number };

/**
 * DisciplineFamiliesTable
 *
 * Liste les familles de disciplines via `trpc.disciplineFamily.getAll.useQuery()`,
 * rendues avec `react-ts-tab-lib`. Mêmes conventions que CategoriesTable.
 */
export default function DisciplineFamiliesTable(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.disciplineFamily.delete.useMutation();
  const { data: families, isLoading, isError } = trpc.disciplineFamily.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des familles.</div>;

  const rows: FamilyRow[] = (families ?? []).map((f) => ({ ...f, supprimer: f.id }));

  const columns: Column<FamilyRow>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'name', displayName: 'Nom', type: 'string' },
    { property: 'slug', displayName: 'Slug', type: 'string' },
    { property: 'sortOrder', displayName: 'Ordre', type: 'number' },
    deleteColumn(rows, {
      entityLabel: 'la famille',
      nameOf: (r) => r.name,
      consequence: 'Refusée tant que des disciplines y sont rattachées.',
      onDelete: async (r) => {
        await remove.mutateAsync({ id: r.id });
        await utils.disciplineFamily.getAll.invalidate();
      },
    }),
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: FamilyRow | null) => {
        if (row) router.push(`/dashboard/discipline-families/${row.id}`);
      }}
    />
  );
}