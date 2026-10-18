"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";
import { deleteColumn } from "@features/admin/common/delete";

type GroupRow = {
  id: string;
  name: string;
  type: string;
  members: string;
  supprimer: string;
};

/** Liste des groupes — clic → `/(admin)/dashboard/groups/[id]`. */
export default function GroupsTable(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.memberGroup.delete.useMutation();
  const { data, isLoading, isError } = trpc.memberGroup.list.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des groupes.</div>;

  const rows: GroupRow[] = (data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    type: g.isCollaborative ? "Collaboratif" : "Diffusion",
    members: String(g.memberCount),
    supprimer: g.id,
  }));

  const columns: Column<GroupRow>[] = [
    { property: "name", displayName: "Nom", type: "string" },
    { property: "type", displayName: "Type", type: "string" },
    { property: "members", displayName: "Membres", type: "string" },
    deleteColumn(rows, {
      entityLabel: "le groupe",
      nameOf: (r) => r.name,
      consequence: "Son espace collaboratif et les fichiers qu'il contient sont supprimés avec lui.",
      onDelete: async (r) => {
        await remove.mutateAsync({ id: r.id });
        await utils.memberGroup.list.invalidate();
      },
    }),
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
