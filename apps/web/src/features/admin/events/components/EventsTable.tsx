'use client';

import { JSX, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';

/**
 * EventsTable — `trpc.event.getAllAdmin` (inclut les brouillons, contrairement
 * à `getAll` qui ne renvoie que le publié). Statut dérivé de `publicationDate`.
 * Clic → `/(admin)/dashboard/events/[id]`.
 */

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: 'Enfants',
  TEENAGERS: 'Ados',
  ADULTS: 'Adultes',
  ALL_AGES: 'Tous publics',
};

function statutLabel(publicationDate: Date | string | null): string {
  if (!publicationDate) return 'Brouillon';
  return new Date(publicationDate) > new Date() ? 'Programmé' : 'Publié';
}

type EventRow = {
  id: number;
  label: string;
  slug: string;
  public: string;
  statut: string;
  rattachement: string;
};

export default function EventsTable(): JSX.Element {
  const router = useRouter();
  const { data: events, isLoading, isError } = trpc.event.getAllAdmin.useQuery();
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
  if (isError) return <div>Erreur lors du chargement des évènements.</div>;

  const rows: EventRow[] = (events ?? []).map((e) => ({
    id: e.id,
    label: e.label,
    slug: e.slug ?? '—',
    public: AUDIENCE_LABELS[e.audience] ?? e.audience,
    statut: statutLabel(e.publicationDate),
    rattachement:
      (e.disciplineId != null ? disciplineById.get(e.disciplineId) : undefined) ??
      e.externalDisciplineLabel ??
      (e.originId != null ? originById.get(e.originId) : undefined) ??
      '—',
  }));

  const columns: Column<EventRow>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'label', displayName: 'Intitulé', type: 'string' },
    { property: 'slug', displayName: 'Slug', type: 'string' },
    { property: 'public', displayName: 'Public', type: 'string' },
    { property: 'statut', displayName: 'Statut', type: 'string' },
    { property: 'rattachement', displayName: 'Rattachement', type: 'string' },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: EventRow | null) => {
        if (row) router.push(`/dashboard/events/${row.id}`);
      }}
    />
  );
}