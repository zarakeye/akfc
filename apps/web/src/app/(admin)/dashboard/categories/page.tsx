"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@trpc/trpcClient";
import { Table, type Column } from "react-ts-tab-lib";
import type { Category } from "@prisma/client";

/** Liste des catégories — clic → `/(admin)/dashboard/categories/[id]`. */
export default function CategoriesTable(): JSX.Element {
  const router = useRouter();
  const { data: categories, isLoading, isError } = trpc.category.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des catégories.</div>;

  const columns: Column<Category>[] = [
    { property: "id", displayName: "ID", type: "number" },
    { property: "type", displayName: "Type", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={categories ?? []}
      onRowClick={(row: Category | null) => {
        if (row) router.push(`/dashboard/categories/${row.id}`);
      }}
    />
  );
}