"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "#core/trpc/trpcClient.ts";

import {
  BreakingNewsForm,
  type BreakingNewsFormInput,
} from "#features/admin/breaking-news/forms/BreakingNewsForm.tsx";

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
