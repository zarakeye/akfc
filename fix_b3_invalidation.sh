#!/bin/bash
# Fix B.3 : invalidation avec refetch force (refetchType "all") apres
# create/update/delete — la liste est fraiche avant la navigation.
# À lancer depuis la RACINE du monorepo : bash fix_b3_invalidation.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> apps/web/src/features/admin/breaking-news/components/CreateBreakingNews.tsx"
cat > 'apps/web/src/features/admin/breaking-news/components/CreateBreakingNews.tsx' << 'FILE_EOF'
"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@trpc/trpcClient";

import {
  BreakingNewsForm,
  type BreakingNewsFormInput,
} from "@features/admin/breaking-news/forms/BreakingNewsForm";

export function CreateBreakingNews(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.breakingNews.create.useMutation();

  const handleSubmit = async (input: BreakingNewsFormInput) => {
    await create.mutateAsync(input);
    // refetchType "all" : refetch aussi les requêtes INACTIVES (la liste
    // n'est pas montée pendant qu'on est sur /create) — le cache est frais
    // AVANT la navigation, pas simplement marqué périmé.
    await utils.breakingNews.getAllAdmin.invalidate(undefined, {
      refetchType: "all",
    });
    router.push("/dashboard/breaking-news");
  };

  return <BreakingNewsForm onSubmit={handleSubmit} submitLabel="Créer" />;
}
FILE_EOF

echo "-> apps/web/src/features/admin/breaking-news/components/EditBreakingNews.tsx"
cat > 'apps/web/src/features/admin/breaking-news/components/EditBreakingNews.tsx' << 'FILE_EOF'
"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@trpc/trpcClient";

import {
  BreakingNewsForm,
  type BreakingNewsFormInput,
} from "@features/admin/breaking-news/forms/BreakingNewsForm";

/** Édition + suppression (pas de fiche de présentation : tout est ici). */
export function EditBreakingNews({ id }: { id: number }): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.breakingNews.getByIdAdmin.useQuery({
    id,
  });
  const update = trpc.breakingNews.update.useMutation();
  const remove = trpc.breakingNews.delete.useMutation();

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !data)
    return <div>Erreur lors du chargement de l&apos;actualité.</div>;

  const handleSubmit = async (input: BreakingNewsFormInput) => {
    await update.mutateAsync({ id, ...input });
    await utils.breakingNews.invalidate(undefined, { refetchType: "all" });
    router.push("/dashboard/breaking-news");
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cette actualité ?")) return;
    await remove.mutateAsync({ id });
    await utils.breakingNews.getAllAdmin.invalidate(undefined, {
      refetchType: "all",
    });
    router.push("/dashboard/breaking-news");
  };

  return (
    <div className="flex flex-col gap-6">
      <BreakingNewsForm initial={data} onSubmit={handleSubmit} />
      <div>
        <button
          type="button"
          onClick={handleDelete}
          className="text-sm text-destructive transition-colors hover:underline"
        >
          Supprimer cette actualité
        </button>
      </div>
    </div>
  );
}
FILE_EOF

echo
pnpm --filter web typecheck