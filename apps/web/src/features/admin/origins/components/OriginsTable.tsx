"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type OriginRow = { id: number; name: string; slug: string; country: string };

/** Liste des origines — clic → `/(admin)/dashboard/origins/[id]`. */
export default function OriginsTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.origin.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des origines.</div>;

  const rows: OriginRow[] = (data ?? []).map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    country: o.country ?? "—",
  }));

  const columns: Column<OriginRow>[] = [
    { property: "name", displayName: "Nom", type: "string" },
    { property: "slug", displayName: "Slug", type: "string" },
    { property: "country", displayName: "Pays", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: OriginRow | null) => {
        if (row) router.push(`/dashboard/origins/${row.id}`);
      }}
    />
  );
}