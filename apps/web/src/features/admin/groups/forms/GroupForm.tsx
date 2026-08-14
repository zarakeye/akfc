"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { trpc } from "@trpc/trpcClient";

/**
 * Formulaire de création d'un groupe. Câblé sur la mutation tRPC existante
 * (`memberGroup.create`) — pas encore migré vers le stack server-action
 * react-hook-form des autres formulaires ; à aligner si parité souhaitée.
 */
export function GroupForm(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [collaborative, setCollaborative] = useState(false);

  const create = trpc.memberGroup.create.useMutation({
    onSuccess: () => {
      void utils.memberGroup.list.invalidate();
      router.push("/dashboard/groups");
    },
  });

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        create.mutate({ name: name.trim(), isCollaborative: collaborative });
      }}
    >
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nom
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bureau, Compétition…"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={collaborative}
          onChange={(e) => setCollaborative(e.target.checked)}
        />
        Espace collaboratif (dossier dédié + droits éditeur/lecteur)
      </label>

      {create.error && <p className="text-red-500">{create.error.message}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={!name.trim() || create.isPending}>
          {create.isPending ? "Création…" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
