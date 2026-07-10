"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type NewsRow = {
  id: number;
  title: string;
  statut: string;
  expiration: string;
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR");
}

/** Statut lisible — l'expiration prime sur la publication. */
function statut(publicationDate: Date | null, expiresAt: Date | null): string {
  const now = new Date();
  if (expiresAt && new Date(expiresAt) <= now) return "Expirée";
  if (!publicationDate) return "Brouillon";
  return new Date(publicationDate) > now
    ? `Programmée le ${formatDate(publicationDate)}`
    : `Publiée le ${formatDate(publicationDate)}`;
}

/** Liste des actualités — clic → édition directe (pas de fiche dédiée). */
export default function BreakingNewsTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.breakingNews.getAllAdmin.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des actualités.</div>;

  const rows: NewsRow[] = (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    statut: statut(n.publicationDate, n.expiresAt),
    expiration: n.expiresAt ? formatDate(n.expiresAt) : "—",
  }));

  const columns: Column<NewsRow>[] = [
    { property: "title", displayName: "Titre", type: "string" },
    { property: "statut", displayName: "Statut", type: "string" },
    { property: "expiration", displayName: "Expire le", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: NewsRow | null) => {
        if (row) router.push(`/dashboard/breaking-news/${row.id}/edit`);
      }}
    />
  );
}
