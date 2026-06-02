"use client";

import { type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  StageForm,
  type StageFormInput,
} from "@features/admin/stages/forms/StageForm";
import { useStageStore } from "@lib/stores/useStageStore";

export default function CreateStagePage(): JSX.Element {
  const router = useRouter();
  const createStage = useStageStore((s) => s.createStage);

  const handleSubmit = async (input: StageFormInput): Promise<void> => {
    // Types alignés : description et program en PageContentV1 strict
    // partout (cf. fix discipline). Pas de cast.
    const created = await createStage({
      label: input.label,
      audience: input.audience,
      disciplineId: input.disciplineId,
      externalDisciplineLabel: input.externalDisciplineLabel,
      originId: input.originId,
      description: input.description,
      program: input.program,
      preRegistered: input.preRegistered,
      primaryAnimatorId: input.primaryAnimatorId,
      coAnimatorIds: input.coAnimatorIds,
    });

    router.push(`/admin/dashboard/stages/${created.id}`);
  };

  return (
    <div>
      <Link
        href="/admin/dashboard/stages"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un stage</h2>
      <StageForm onSubmit={handleSubmit} submitLabel="Créer" />
    </div>
  );
}