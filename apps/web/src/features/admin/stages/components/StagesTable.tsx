'use client';

import { JSX, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';

/**
 * StagesTable — `trpc.stage.getAll`. Rattachement résolu : discipline du club,
 * sinon label externe, sinon origine culturelle. Clic → `/(admin)/dashboard/stages/[id]`.
 */

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: 'Enfants',
  TEENAGERS: 'Ados',
  ADULTS: 'Adultes',
  ALL_AGES: 'Tous publics',
};

type StageRow = {
  id: number;
  label: string;
  slug: string;
  public: string;
  rattachement: string;
};

export default function StagesTable(): JSX.Element {
  const router = useRouter();
  const { data: stages, isLoading, isError } = trpc.stage.getAllAdmin.useQuery();
  const { data: disciplines } = trpc.discipline.getAll.useQuery();
  const { data: origins } = trpc.origin.getAll.useQuery();

  const disciplineById = useMemo(() => {
    const map = new Map<number, string>();
    (disciplines ?? []).forEach((d) => map.set(d.id, d.name));
    return map;
  }, [disciplines]);

  const originById = useMemo(() => {
    const map = new Map<number, string>();
    (origins ?? []).forEach((o) => map.set(o.id, o.name));
    return map;
  }, [origins]);

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des stages.</div>;

  const rows: StageRow[] = (stages ?? []).map((s) => ({
    id: s.id,
    label: s.label,
    slug: s.slug ?? '—',
    public: AUDIENCE_LABELS[s.audience] ?? s.audience,
    rattachement:
      (s.disciplineId != null ? disciplineById.get(s.disciplineId) : undefined) ??
      s.externalDisciplineLabel ??
      (s.originId != null ? originById.get(s.originId) : undefined) ??
      '—',
  }));

  const columns: Column<StageRow>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'label', displayName: 'Intitulé', type: 'string' },
    { property: 'slug', displayName: 'Slug', type: 'string' },
    { property: 'public', displayName: 'Public', type: 'string' },
    { property: 'rattachement', displayName: 'Rattachement', type: 'string' },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: StageRow | null) => {
        if (row) router.push(`/dashboard/stages/${row.id}`);
      }}
    />
  );
}