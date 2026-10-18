'use client';

import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import { deleteColumn } from "@features/admin/common/delete";

/**
 * Liste des galeries via `trpc.gallery.getAll.useQuery()`. Clic sur une ligne
 * → page `[id]`. On dérive les lignes (plutôt qu'un cast) pour exposer le
 * nombre d'images (`_count.items`), la date et les RATTACHEMENTS CUMULÉS
 * (discipline, catégorie, stage, event, origine — joints par virgule).
 */

/** Slug réservé du carousel d'accueil (aligné sur le backend). */
const CAROUSEL_SLUG = 'accueil';

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  MEMBERS: 'Membres',
};

type GalleryRow = {
  id: number;
  titre: string;
  slug: string;
  date: string;
  rattachements: string;
  images: number;
  visibilite: string;
  ordre: number;
  supprimer: number;
};

export default function GalleriesTable(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.gallery.delete.useMutation();
  const { data: galleries, isLoading, isError } = trpc.gallery.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des galeries.</div>;

  const rows: GalleryRow[] = (galleries ?? []).map((g) => {
    const facettes = [
      g.discipline?.name,
      g.category?.type,
      g.seminar?.label,
      g.event?.label,
      g.origin?.name,
    ].filter((v): v is string => Boolean(v));

    return {
      id: g.id,
      titre: g.title,
      slug: g.slug,
      date: g.date ? new Date(g.date).toLocaleDateString('fr-FR') : '—',
      rattachements:
        facettes.length > 0
          ? facettes.join(', ')
          : g.slug === CAROUSEL_SLUG
            ? "Carousel d'accueil"
            : '—',
      images: g._count.items,
      visibilite: VISIBILITY_LABELS[g.visibility] ?? g.visibility,
      ordre: g.sortOrder,
      supprimer: g.id,
    };
  });

  const columns: Column<GalleryRow>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'titre', displayName: 'Titre', type: 'string' },
    { property: 'date', displayName: 'Date', type: 'string' },
    { property: 'rattachements', displayName: 'Rattachements', type: 'string' },
    { property: 'images', displayName: 'Images', type: 'number' },
    { property: 'visibilite', displayName: 'Visibilité', type: 'string' },
    { property: 'ordre', displayName: 'Ordre', type: 'number' },
    deleteColumn(rows, {
      entityLabel: 'la galerie',
      nameOf: (r) => r.titre,
      consequence: 'Les images restent dans la bibliothèque ; seule la galerie disparaît.',
      disabledReason: (r) =>
        r.slug === CAROUSEL_SLUG ? "Galerie du carrousel d'accueil : elle ne peut pas être supprimée." : null,
      onDelete: async (r) => {
        await remove.mutateAsync({ id: r.id });
        await Promise.all([utils.gallery.getAll.invalidate(), utils.gallery.getPublicIndex.invalidate()]);
      },
    }),
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: GalleryRow | null) => {
        if (row) router.push(`/dashboard/galleries/${row.id}`);
      }}
    />
  );
}
