"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  StageForm,
  type StageFormInput,
} from "@features/admin/stages/forms/StageForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Édition d'un stage — `/(admin)/dashboard/stages/[id]/edit`.
 * `getById` (inclut `animators`) → `StageForm initial` → `stage.update` →
 * invalidation → `SuccessRedirect` vers la fiche.
 */
export default function EditStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const { id } = use(params);
  const stageId = Number(id);
  const utils = trpc.useUtils();
  const updateMutation = trpc.stage.update.useMutation();
  const [done, setDone] = useState(false);

  const {
    data: stage,
    isLoading,
    isError,
  } = trpc.stage.getByIdAdmin.useQuery(
    { id: stageId },
    { enabled: Number.isFinite(stageId) && stageId > 0 },
  );

  if (isLoading) return <div>Chargement du stage…</div>;
  if (isError || !stage) {
    return <div className="text-red-600">Stage introuvable.</div>;
  }

  const handleSubmit = async (input: StageFormInput): Promise<void> => {
    await updateMutation.mutateAsync({ id: stageId, ...input });
    await utils.stage.getAllAdmin.invalidate();
    await utils.stage.getByIdAdmin.invalidate({ id: stageId });
    setDone(true);
  };

  return (
    <div>
      <Link
        href={`/dashboard/stages/${stageId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer le stage</h2>

      {done ? (
        <SuccessRedirect
          target={`/dashboard/stages/${stageId}`}
          message="Stage mis à jour."
        />
      ) : (
        <StageForm
          initial={stage}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      )}
    </div>
  );
}