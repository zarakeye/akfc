"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { trpc } from "@trpc/trpcClient";

/** Fiche d'un groupe — `/(admin)/dashboard/groups/[id]`. */
export default function GroupDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const utils = trpc.useUtils();

  const groupsQuery = trpc.memberGroup.list.useQuery();
  const group = (groupsQuery.data ?? []).find((g) => g.id === groupId) ?? null;

  const membersQuery = trpc.memberGroup.members.useQuery({ groupId });
  const allMembersQuery = trpc.memberDocument.listMembers.useQuery();

  const [name, setName] = useState("");

  const invalidate = () => {
    void utils.memberGroup.members.invalidate({ groupId });
    void utils.memberGroup.list.invalidate();
  };
  const update = trpc.memberGroup.update.useMutation({
    onSuccess: () => void utils.memberGroup.list.invalidate(),
  });
  const addMember = trpc.memberGroup.addMember.useMutation({
    onSuccess: invalidate,
  });
  const removeMember = trpc.memberGroup.removeMember.useMutation({
    onSuccess: invalidate,
  });
  const setAccess = trpc.memberGroup.setMemberAccess.useMutation({
    onSuccess: invalidate,
  });
  const setParent = trpc.memberGroup.setParentGroup.useMutation({
    onSuccess: () => void utils.memberGroup.list.invalidate(),
  });

  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const del = trpc.memberGroup.delete.useMutation({
    onSuccess: () => {
      void utils.memberGroup.list.invalidate();
      router.push("/dashboard/groups");
    },
  });

  if (groupsQuery.isLoading) return <div>Chargement…</div>;
  if (!group) return <div>Groupe introuvable.</div>;

  const members = membersQuery.data ?? [];
  const memberIds = new Set(members.map((m) => m.id));
  const candidates = (allMembersQuery.data ?? []).filter(
    (m) => !memberIds.has(m.id),
  );
  const currentName = name || group.name;

  return (
    <div>
      <Link
        href="/dashboard/groups"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <Input
          type="text"
          value={currentName}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
        />
        <Button
          type="button"
          disabled={
            !currentName.trim() ||
            currentName.trim() === group.name ||
            update.isPending
          }
          onClick={() =>
            update.mutate({ id: group.id, name: currentName.trim() })
          }
        >
          Renommer
        </Button>
      </div>

      <label className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={group.isCollaborative}
          disabled={update.isPending}
          onChange={() =>
            update.mutate({
              id: group.id,
              name: group.name,
              isCollaborative: !group.isCollaborative,
            })
          }
        />
        Espace collaboratif (dossier dédié + droits éditeur/lecteur)
      </label>

      <div className="mb-6 max-w-xs space-y-1">
        <label htmlFor="parent" className="text-sm font-medium">
          Groupe parent
        </label>
        <select
          id="parent"
          value={group.parentGroupId ?? ""}
          disabled={setParent.isPending}
          onChange={(e) =>
            setParent.mutate({
              groupId: group.id,
              parentGroupId: e.target.value || null,
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">(Aucun — groupe racine)</option>
          {(groupsQuery.data ?? [])
            .filter((g) => g.id !== group.id)
            .map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
        </select>
        {setParent.error && (
          <p className="text-xs text-red-600">{setParent.error.message}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Membres</p>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun membre.</p>
          ) : (
            <ul className="space-y-1">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-muted/50"
                >
                  <span>{m.name}</span>
                  <span className="flex items-center gap-2">
                    {group.isCollaborative && (
                      <button
                        type="button"
                        onClick={() =>
                          setAccess.mutate({
                            groupId: group.id,
                            userId: m.id,
                            access: m.access === "EDITOR" ? "VIEWER" : "EDITOR",
                          })
                        }
                        className="rounded-full border px-2 py-0.5 text-[11px] font-medium hover:bg-muted"
                        title="Basculer éditeur / lecteur"
                      >
                        {m.access === "EDITOR" ? "éditeur" : "lecteur"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        removeMember.mutate({ groupId: group.id, userId: m.id })
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Ajouter</p>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tous les membres sont dans le groupe.
            </p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-auto">
              {candidates.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-muted/50"
                >
                  <span>{m.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      addMember.mutate({ groupId: group.id, userId: m.id })
                    }
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    Ajouter
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-8 border-t border-red-200 pt-4">
        <p className="mb-2 text-sm font-medium text-red-700">Zone dangereuse</p>
        {group.isAdminGroup ? (
          <p className="text-sm text-muted-foreground">
            Le groupe Administrateurs ne peut pas être supprimé.
          </p>
        ) : !confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Supprimer le groupe
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Supprimer « {group.name} » ? Son espace doit être vide ; les
              groupes inclus passeront sous son parent.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={del.isPending}
                onClick={() => del.mutate({ id: group.id })}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirmer la suppression
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
        {del.error && (
          <p className="mt-2 text-sm text-red-600">{del.error.message}</p>
        )}
      </div>
    </div>
  );
}
