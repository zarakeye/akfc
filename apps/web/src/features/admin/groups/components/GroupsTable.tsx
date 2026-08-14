"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type GroupRow = {
  id: string;
  name: string;
  type: string;
  members: string;
};

/** Liste des groupes — clic → `/(admin)/dashboard/groups/[id]`. */
export default function GroupsTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.memberGroup.list.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des groupes.</div>;

  const rows: GroupRow[] = (data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    type: g.isCollaborative ? "Collaboratif" : "Diffusion",
    members: String(g.memberCount),
  }));

  const columns: Column<GroupRow>[] = [
    { property: "name", displayName: "Nom", type: "string" },
    { property: "type", displayName: "Type", type: "string" },
    { property: "members", displayName: "Membres", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: GroupRow | null) => {
        if (row) router.push(`/dashboard/groups/${row.id}`);
      }}
    />
  );
}
