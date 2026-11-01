"use client";

import { JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { trpc } from "@trpc/trpcClient";
import { Table, type Column } from "react-ts-tab-lib";
import type { Category } from "@prisma/client";
import { deleteColumn } from "@features/admin/common/delete";

type CategoryRow = Category & { supprimer: number };

/** Liste des catégories — `/(admin)/dashboard/categories`. */
export default function CategoriesPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catégories d&apos;activités</h2>
        <Link
          href="/dashboard/categories/create"
          data-tour="categories.list.create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une catégorie
        </Link>
      </div>
      <CategoriesTable />
    </div>
  );
}

/** Les catégories — clic → `/(admin)/dashboard/categories/[id]`. */
function CategoriesTable(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const remove = trpc.category.delete.useMutation();
  const { data: categories, isLoading, isError } = trpc.category.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des catégories.</div>;

  const rows: CategoryRow[] = (categories ?? []).map((c) => ({ ...c, supprimer: c.id }));

  const columns: Column<CategoryRow>[] = [
    { property: "id", displayName: "ID", type: "number" },
    { property: "type", displayName: "Type", type: "string" },
    deleteColumn(rows, {
      entityLabel: "la catégorie",
      nameOf: (r) => r.type,
      consequence: "Refusée tant que des disciplines y sont rattachées.",
      onDelete: async (r) => {
        await remove.mutateAsync({ id: r.id });
        await utils.category.getAll.invalidate();
      },
    }),
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: CategoryRow | null) => {
        if (row) router.push(`/dashboard/categories/${row.id}`);
      }}
    />
  );
}