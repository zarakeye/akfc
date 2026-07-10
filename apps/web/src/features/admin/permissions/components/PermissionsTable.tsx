"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type PermissionRow = { id: number; name: string };

/** Liste des permissions — clic → `/(admin)/dashboard/permissions/[id]`. */
export default function PermissionsTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.permission.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des permissions.</div>;

  const rows: PermissionRow[] = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const columns: Column<PermissionRow>[] = [
    { property: "id", displayName: "ID", type: "number" },
    { property: "name", displayName: "Nom", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: PermissionRow | null) => {
        if (row) router.push(`/dashboard/permissions/${row.id}`);
      }}
    />
  );
}