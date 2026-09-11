"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  SeminarForm,
  type SeminarFormInput,
} from "@features/admin/seminars/forms/SeminarForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/** Création d'un stage — `/(admin)/dashboard/seminars/create`. */
export default function CreateStagePage(): JSX.Element {
  const utils = trpc.useUtils();
  const createMutation = trpc.seminar.create.useMutation();
  const [createdId, setCreatedId] = useState<number | null>(null);

  const handleSubmit = async (input: SeminarFormInput): Promise<void> => {
    const created = await createMutation.mutateAsync(input);
    await utils.seminar.getAllAdmin.invalidate();
    setCreatedId(created.id);
  };

  return (
    <div>
      <Link
        href="/dashboard/seminars"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un stage</h2>

      {createdId != null ? (
        <SuccessRedirect
          target={`/dashboard/seminars/${createdId}`}
          message="Stage créé."
        />
      ) : (
        <SeminarForm onSubmit={handleSubmit} submitLabel="Créer" />
      )}
    </div>
  );
}