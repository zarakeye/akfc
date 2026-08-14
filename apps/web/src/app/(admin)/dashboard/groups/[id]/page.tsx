"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
    </div>
  );
}
