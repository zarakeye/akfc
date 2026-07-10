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
