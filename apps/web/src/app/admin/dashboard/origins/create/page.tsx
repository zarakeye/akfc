"use client";

import { type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  OriginForm,
  type OriginFormInput,
} from "@features/admin/origins/forms/OriginForm";
import { useOriginStore } from "@lib/stores/useOriginStore";

export default function CreateOriginPage(): JSX.Element {
  const router = useRouter();
  const createOrigin = useOriginStore((s) => s.createOrigin);

  const handleSubmit = async (input: OriginFormInput): Promise<void> => {
    const created = await createOrigin(input);
    // Redirection vers la page d'édition de l'origine créée — l'admin
    // peut vérifier immédiatement que la donnée est bien persistée.
    router.push(`/admin/dashboard/origins/${created.id}`);
  };

  return (
    <div>
      <Link
        href="/admin/dashboard/origins"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une origine</h2>
      <OriginForm onSubmit={handleSubmit} submitLabel="Créer" />
    </div>
  );
}