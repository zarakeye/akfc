"use client";

import { useState } from "react";

import { trpc } from "@trpc/trpcClient";

export default function GroupsPage() {
  return (
    <div className="m-10 rounded-lg border p-10 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Groupes de membres</h2>
      <GroupsManager />
    </div>
  );
}

function GroupsManager() {
  const utils = trpc.useUtils();
  const groupsQuery = trpc.memberGroup.list.useQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCollab, setNewCollab] = useState(false);

  const create = trpc.memberGroup.create.useMutation({
    onSuccess: () => {
      setNewName("");
      setNewCollab(false);
      void utils.memberGroup.list.invalidate();
    },
  });
  const remove = trpc.memberGroup.delete.useMutation({
    onSuccess: () => {
      setSelectedId(null);
      void utils.memberGroup.list.invalidate();
    },
  });

  const groups = groupsQuery.data ?? [];
  const selected = selectedId
    ? (groups.find((g) => g.id === selectedId) ?? null)
    : null;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="md:w-72">
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nouveau groupe"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={!newName.trim() || create.isPending}
              onClick={() =>
                create.mutate({
                  name: newName.trim(),
                  isCollaborative: newCollab,
                })
              }
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              Créer
            </button>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={newCollab}
              onChange={(e) => setNewCollab(e.target.checked)}
            />
            Espace collaboratif (dossier dédié + droits éditeur/lecteur)
          </label>
        </div>

        {groupsQuery.isLoading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun groupe.</p>
        ) : (
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200">
            {groups.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(g.id)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                    selectedId === g.id ? "bg-emerald-50 font-medium" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {g.name}
                    {g.isCollaborative ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        collab
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-gray-400">{g.memberCount}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1">
        {selected ? (
          <GroupDetail
            key={selected.id}
            group={selected}
            onDeleted={() => remove.mutate({ id: selected.id })}
          />
        ) : (
          <p className="text-sm text-gray-500">
            Sélectionnez un groupe pour gérer ses membres.
          </p>
        )}
      </div>
    </div>
  );
}

function GroupDetail({
  group,
  onDeleted,
}: {
  group: {
    id: string;
    name: string;
    description: string | null;
    isCollaborative: boolean;
  };
  onDeleted: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(group.name);

  const membersQuery = trpc.memberGroup.members.useQuery({ groupId: group.id });
  const allMembersQuery = trpc.memberDocument.listMembers.useQuery();

  const invalidate = () => {
    void utils.memberGroup.members.invalidate({ groupId: group.id });
    void utils.memberGroup.list.invalidate();
  };
  const rename = trpc.memberGroup.update.useMutation({
    onSuccess: () => void utils.memberGroup.list.invalidate(),
  });
  const setCollab = trpc.memberGroup.update.useMutation({
    onSuccess: () => void utils.memberGroup.list.invalidate(),
  });
  const setAccess = trpc.memberGroup.setMemberAccess.useMutation({
    onSuccess: invalidate,
  });
  const addMember = trpc.memberGroup.addMember.useMutation({
    onSuccess: invalidate,
  });
  const removeMember = trpc.memberGroup.removeMember.useMutation({
    onSuccess: invalidate,
  });

  const members = membersQuery.data ?? [];
  const memberIds = new Set(members.map((m) => m.id));
  const candidates = (allMembersQuery.data ?? []).filter(
    (m) => !memberIds.has(m.id),
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="button"
          disabled={
            !name.trim() || name.trim() === group.name || rename.isPending
          }
          onClick={() => rename.mutate({ id: group.id, name: name.trim() })}
          className="rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          Renommer
        </button>
        <button
          type="button"
          onClick={onDeleted}
          className="rounded-full bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Supprimer
        </button>
      </div>

      <label className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={group.isCollaborative}
          disabled={setCollab.isPending}
          onChange={() =>
            setCollab.mutate({
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
          <p className="mb-2 text-sm font-medium text-gray-700">Membres</p>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun membre.</p>
          ) : (
            <ul className="space-y-1">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-gray-50"
                >
                  <span>{m.name}</span>
                  <span className="flex items-center gap-2">
                    {group.isCollaborative ? (
                      <button
                        type="button"
                        onClick={() =>
                          setAccess.mutate({
                            groupId: group.id,
                            userId: m.id,
                            access: m.access === "EDITOR" ? "VIEWER" : "EDITOR",
                          })
                        }
                        className="rounded-full border border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100"
                        title="Basculer éditeur / lecteur"
                      >
                        {m.access === "EDITOR" ? "éditeur" : "lecteur"}
                      </button>
                    ) : null}
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
          <p className="mb-2 text-sm font-medium text-gray-700">Ajouter</p>
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-500">
              Tous les membres sont dans le groupe.
            </p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-auto">
              {candidates.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-gray-50"
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
