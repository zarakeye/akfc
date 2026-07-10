"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type RoleRow = { id: number; name: string };

/** Liste des rôles — clic → `/(admin)/dashboard/roles/[id]`. */
export default function RolesTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.role.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des rôles.</div>;

  const rows: RoleRow[] = (data ?? []).map((r) => ({ id: r.id, name: r.name }));

  const columns: Column<RoleRow>[] = [
    { property: "id", displayName: "ID", type: "number" },
    { property: "name", displayName: "Nom", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: RoleRow | null) => {
        if (row) router.push(`/dashboard/roles/${row.id}`);
      }}
    />
  );
}