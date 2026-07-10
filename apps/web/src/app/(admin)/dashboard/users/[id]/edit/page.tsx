"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

/**
 * Édition d'un utilisateur — `/(admin)/dashboard/users/[id]/edit`.
 *
 * Côté admin, seul le **rôle** est modifiable (`updateUserRoleById`), plus la
 * **suppression** (`delete`). Les deux sont bloquées sur SOI-MÊME : le router
 * refuse déjà le changement de son propre rôle (FORBIDDEN), on l'empêche aussi
 * côté UI et on bloque l'auto-suppression par prudence.
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

  const updateRoleMutation = trpc.user.updateUserRoleById.useMutation();
  const deleteMutation = trpc.user.delete.useMutation();

  const [roleId, setRoleId] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: user, isLoading, isError } = trpc.user.getById.useQuery({ id });
  const { data: roles } = trpc.role.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !user) {
    return <div className="text-red-600">Utilisateur introuvable.</div>;
  }

  const isSelf = sessionUserId === user.id;
  const selectedRoleId = roleId ?? user.role?.id ?? 0;
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.pseudo ||
    user.email;

  const handleRoleChange = async () => {
    setActionError(null);
    try {
      await updateRoleMutation.mutateAsync({
        userId: user.id,
        roleId: selectedRoleId,
      });
      await utils.user.getAll.invalidate();
      await utils.user.getById.invalidate({ id: user.id });
      setDone(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

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

      {done ? (
        <SuccessRedirect
          target={`/dashboard/users/${user.id}`}
          message="Rôle mis à jour."
        />
      ) : (
        <section className="max-w-md">
          <h3 className="mb-2 text-sm font-medium">Rôle</h3>
          <div className="flex items-end gap-2">
            <select
              value={selectedRoleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              disabled={isSelf}
              className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
            >
              {(roles ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRoleChange}
              disabled={
                isSelf ||
                updateRoleMutation.isPending ||
                selectedRoleId === (user.role?.id ?? 0)
              }
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {updateRoleMutation.isPending ? "…" : "Appliquer"}
            </button>
          </div>
          {isSelf && (
            <p className="mt-1 text-xs text-muted-foreground">
              Tu ne peux pas modifier ton propre rôle ni te supprimer.
            </p>
          )}
          {actionError && (
            <pre className="mt-3 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {actionError}
            </pre>
          )}
        </section>
      )}
    </div>
  );
}