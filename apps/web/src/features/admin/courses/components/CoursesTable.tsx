'use client';

import { JSX, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';

/**
 * CoursesTable
 *
 * Liste les cours via `trpc.course.getAll.useQuery()`. Comme `getAll` renvoie
 * les cours bruts (disciplineId, horaires en HHMM), on construit des lignes
 * dérivées prêtes à l'affichage : discipline résolue par son nom (via
 * `discipline.getAll`), jour/public en libellés FR, horaires formatés.
 * Clic sur une ligne → page d'édition `/(admin)/dashboard/courses/[id]`.
 */

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
};

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: 'Enfants',
  TEENAGERS: 'Ados',
  ADULTS: 'Adultes',
  ALL_AGES: 'Tous âges',
};

/** HHMM (1830) → "18h30", (905) → "9h05". */
const fmtHHMM = (t: number): string =>
  `${Math.floor(t / 100)}h${String(t % 100).padStart(2, '0')}`;

type CourseRow = {
  id: number;
  discipline: string;
  jour: string;
  horaires: string;
  public: string;
};

export default function CoursesTable(): JSX.Element {
  const router = useRouter();
  const { data: courses, isLoading, isError } = trpc.course.getAll.useQuery();
  const { data: disciplines } = trpc.discipline.getAll.useQuery();

  const disciplineNameById = useMemo(() => {
    const map = new Map<number, string>();
    (disciplines ?? []).forEach((d) => map.set(d.id, d.name));
    return map;
  }, [disciplines]);

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des cours.</div>;

  const rows: CourseRow[] = (courses ?? []).map((c) => ({
    id: c.id,
    discipline: disciplineNameById.get(c.disciplineId) ?? `#${c.disciplineId}`,
    jour: DAY_LABELS[c.day] ?? c.day,
    horaires: `${fmtHHMM(c.beginTime)} – ${fmtHHMM(c.endTime)}`,
    public: AUDIENCE_LABELS[c.audience] ?? c.audience,
  }));

  const columns: Column<CourseRow>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'discipline', displayName: 'Discipline', type: 'string' },
    { property: 'jour', displayName: 'Jour', type: 'string' },
    { property: 'horaires', displayName: 'Horaires', type: 'string' },
    { property: 'public', displayName: 'Public', type: 'string' },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: CourseRow | null) => {
        if (row) router.push(`/dashboard/courses/${row.id}`);
      }}
    />
  );
}