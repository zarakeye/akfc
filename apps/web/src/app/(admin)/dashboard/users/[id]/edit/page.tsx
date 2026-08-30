"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Édition d'un utilisateur — `/(admin)/dashboard/users/[id]/edit`.
 *
 * Les accès sont désormais gérés par l'appartenance aux GROUPES (le groupe
 * Administrateurs confère l'admin) — voir la gestion des groupes de membres.
 * Cette page ne conserve que la SUPPRESSION, bloquée sur soi-même.
 */
export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const utils = trpc.useUtils();
  const sessionUserId = useSessionStore((s) => s.session?.user?.id);

  const deleteMutation = trpc.user.delete.useMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: user, isLoading, isError } = trpc.user.getById.useQuery({ id });

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !user) {
    return <div className="text-red-600">Utilisateur introuvable.</div>;
  }

  const isSelf = sessionUserId === user.id;
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.pseudo ||
    user.email;

  const handleDelete = async () => {
    if (
      !window.confirm("Supprimer cet utilisateur ? Cette action est définitive.")
    ) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync({ id: user.id });
      await utils.user.getAll.invalidate();
      router.push("/dashboard/users");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/dashboard/users/${user.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la fiche
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSelf || deleteMutation.isPending}
          className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Éditer {displayName}</h2>

      <section className="max-w-md space-y-2 text-sm text-muted-foreground">
        <p>
          Les accès sont gérés via les{" "}
          <Link
            href="/dashboard/groups"
            className="underline hover:text-foreground"
          >
            groupes de membres
          </Link>{" "}
          (le groupe Administrateurs confère l'accès admin).
        </p>
        {isSelf && <p className="text-xs">Tu ne peux pas te supprimer.</p>}
        {actionError && (
          <pre className="mt-3 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {actionError}
          </pre>
        )}
      </section>
    </div>
  );
}
