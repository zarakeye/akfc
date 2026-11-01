"use client";

import { JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { trpc } from "@trpc/trpcClient";
import { Table, type Column } from "react-ts-tab-lib";
import { CATEGORY_KEYS, CATEGORY_KEY_LABELS } from "@contracts/categories/categoryKey";
import { deleteColumn } from "@features/admin/common/delete";

type CategoryRow = { id: number; libelle: string; categorie: string; supprimer: number };

/**
 * Liste des catégories — `/(admin)/dashboard/categories`.
 *
 * La liste est fixe (Cours, Stage, Évènement) : on ne crée que celles qui manquent, et le
 * bouton disparaît quand les trois existent. Une ligne sans clé (antérieure à la liste, que la
 * migration n'a pas su attribuer) est signalée « hors liste » : son édition propose de la rattacher.
 */
export default function CategoriesPage(): JSX.Element {
  const { data: categories } = trpc.category.getAll.useQuery();
  const taken = new Set((categories ?? []).map((c) => c.key));
  const missing = categories ? CATEGORY_KEYS.filter((k) => !taken.has(k)) : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Catégories d&apos;activités</h2>
        {missing.length > 0 && (
          <Link
            href="/dashboard/categories/create"
            data-tour="categories.list.create"
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Créer une catégorie
          </Link>
        )}
      </div>
      {missing.length > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          Manquante{missing.length > 1 ? "s" : ""} : {missing.map((k) => CATEGORY_KEY_LABELS[k]).join(", ")}.
        </p>
      )}
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

  const rows: CategoryRow[] = (categories ?? []).map((c) => ({
    id: c.id,
    libelle: c.type,
    categorie: c.key ? CATEGORY_KEY_LABELS[c.key] : "Hors liste — à rattacher",
    supprimer: c.id,
  }));

  const columns: Column<CategoryRow>[] = [
    { property: "id", displayName: "ID", type: "number" },
    { property: "categorie", displayName: "Catégorie", type: "string" },
    { property: "libelle", displayName: "Libellé", type: "string" },
    deleteColumn(rows, {
      entityLabel: "la catégorie",
      nameOf: (r) => r.libelle,
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