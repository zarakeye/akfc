"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  CreateUserForm,
  type CreateUserFormInput,
} from "@features/admin/users/forms/CreateUserForm";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/** Création — `/(admin)/dashboard/users/create`. id User = string (cuid). */
export default function CreateUserPage(): JSX.Element {
  const utils = trpc.useUtils();
  const createMutation = trpc.user.create.useMutation();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const handleSubmit = async (input: CreateUserFormInput): Promise<void> => {
    const res = await createMutation.mutateAsync({
      email: input.email,
      groupId: input.groupId,
    });
    await utils.user.getAll.invalidate();
    setCreatedId(res.user.id);
  };

  return (
    <div>
      <Link
        href="/dashboard/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un utilisateur</h2>

      {createdId != null ? (
        <SuccessRedirect
          target={`/dashboard/users/${createdId}`}
          message="Utilisateur créé."
        />
      ) : (
        <CreateUserForm onSubmit={handleSubmit} submitLabel="Créer" />
      )}
    </div>
  );
}