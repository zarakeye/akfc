'use client';

import { JSX, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import { deleteColumn } from "@features/admin/common/delete";

/**
 * DisciplinesTable
 *
 * Liste les disciplines via `trpc.discipline.getAll.useQuery()`. `getAll`
 * renvoie les disciplines brutes (categoryId/familyId, pas les noms) ; on
 * construit des lignes dérivées : catégorie et famille résolues par leur nom,
 * type en libellé FR. Clic sur une ligne → `/(admin)/dashboard/disciplines/[id]`.
 */

const TYPE_LABELS: Record<string, string> = {
  MARTIAL_ART: 'Art martial',
  CALLIGRAPHY: 'Calligraphie',
};

type DisciplineRow = {
  id: number;
  name: string;
  slug: string;
  type: string;
  categorie: string;
  famille: string;
  supprimer: number;
};

export default function DisciplinesTable(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.discipline.delete.useMutation();
  const { data: disciplines, isLoading, isError } = trpc.discipline.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: families } = trpc.disciplineFamily.getAll.useQuery();

  const categoryById = useMemo(() => {
    const map = new Map<number, string>();
    (categories ?? []).forEach((c) => map.set(c.id, c.type));
    return map;
  }, [categories]);

  const familyById = useMemo(() => {
    const map = new Map<number, string>();
    (families ?? []).forEach((f) => map.set(f.id, f.name));
    return map;
  }, [families]);

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des disciplines.</div>;

  const rows: DisciplineRow[] = (disciplines ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug ?? '—',
    type: TYPE_LABELS[d.type] ?? d.type,
    categorie: categoryById.get(d.categoryId) ?? `#${d.categoryId}`,
    famille:
      d.familyId != null
        ? familyById.get(d.familyId) ?? `#${d.familyId}`
        : '—',
    supprimer: d.id,
  }));

  const columns: Column<DisciplineRow>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'name', displayName: 'Nom', type: 'string' },
    { property: 'slug', displayName: 'Slug', type: 'string' },
    { property: 'type', displayName: 'Type', type: 'string' },
    { property: 'categorie', displayName: 'Catégorie', type: 'string' },
    { property: 'famille', displayName: 'Famille', type: 'string' },
    deleteColumn(rows, {
      entityLabel: 'la discipline',
      nameOf: (r) => r.name,
      consequence: 'Refusée tant que des cours, stages ou événements y sont rattachés.',
      onDelete: async (r) => {
        await remove.mutateAsync({ id: r.id });
        await Promise.all([
          utils.discipline.getAll.invalidate(),
          utils.discipline.getAllPublished.invalidate(),
          utils.discipline.getAllForMenu.invalidate(),
        ]);
      },
    }),
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: DisciplineRow | null) => {
        if (row) router.push(`/dashboard/disciplines/${row.id}`);
      }}
    />
  );
}