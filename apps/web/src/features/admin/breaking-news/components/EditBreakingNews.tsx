"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "#core/trpc/trpcClient.ts";

import { BreakingNewsForm } from "#features/admin/breaking-news/forms/BreakingNewsForm.tsx";
import { useConfirm } from "#components/ui/useConfirm.tsx";

/**
 * Édition + suppression (pas de fiche de présentation : tout est ici). L'enregistrement passe par
 * la server action du formulaire ; la suppression, un bouton sans formulaire, par tRPC.
 */
export function EditBreakingNews({ id }: { id: number }): JSX.Element {
  const router = useRouter();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.breakingNews.getByIdAdmin.useQuery({
    id,
  });
  const remove = trpc.breakingNews.delete.useMutation();

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !data)
    return <div>Erreur lors du chargement du flash info.</div>;

  const handleDelete = async () => {
    if (!(await confirm({ title: "Supprimer ce flash info ?", description: "La suppression est définitive." }))) return;
    await remove.mutateAsync({ id });
    await utils.breakingNews.getAllAdmin.invalidate(undefined, {
      refetchType: "all",
    });
    router.push("/dashboard/breaking-news");
  };

  return (
    <div className="flex flex-col gap-6">
      {confirmDialog}
      <BreakingNewsForm initial={data} />
      <div>
        <button
          type="button"
          onClick={handleDelete}
          className="text-sm text-destructive transition-colors hover:underline"
        >
          Supprimer ce flash info
        </button>
      </div>
    </div>
  );
}
