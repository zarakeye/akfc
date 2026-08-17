"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { trpc } from "@trpc/trpcClient";

/**
 * Création d'un groupe : nom + case « collaboratif » + SELECT du groupe parent.
 * Sans parent choisi, le backend rattache au groupe « Administrateurs »
 * (Administrateurs = ancêtre de tout groupe). Câblé sur la mutation tRPC.
 */
export function GroupForm(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const groupsQuery = trpc.memberGroup.list.useQuery();

  const [name, setName] = useState("");
  const [collaborative, setCollaborative] = useState(false);
  const [parentGroupId, setParentGroupId] = useState("");

  const create = trpc.memberGroup.create.useMutation({
    onSuccess: () => {
      void utils.memberGroup.list.invalidate();
      router.push("/dashboard/groups");
    },
  });

  const groups = groupsQuery.data ?? [];

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        create.mutate({
          name: name.trim(),
          isCollaborative: collaborative,
          parentGroupId: parentGroupId || undefined,
        });
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

      <div className="space-y-1">
        <label htmlFor="parent" className="text-sm font-medium">
          Groupe parent
        </label>
        <select
          id="parent"
          value={parentGroupId}
          onChange={(e) => setParentGroupId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Administrateurs (par défaut)</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Sans choix, le groupe est rattaché à « Administrateurs ».
        </p>
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
