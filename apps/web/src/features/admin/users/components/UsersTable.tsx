"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type UserRow = { id: string; email: string };

/** Liste des utilisateurs — `user.getAll` (inclut le rôle). Clic → `[id]`. */
export default function UsersTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.user.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des utilisateurs.</div>;

  const rows: UserRow[] = (data ?? []).map((u) => ({
    id: u.id,
    email: u.email,
  }));

  const columns: Column<UserRow>[] = [
    { property: "email", displayName: "Email", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: UserRow | null) => {
        if (row) router.push(`/dashboard/users/${row.id}`);
      }}
    />
  );
}