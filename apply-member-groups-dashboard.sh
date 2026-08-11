#!/usr/bin/env bash
#
# AKFC — Groupes, increment 3/N : page de gestion dans le dashboard.
#
# Page `(admin)/dashboard/groups` : liste des groupes + création à gauche ;
# pour le groupe sélectionné, renommer/supprimer + gérer les membres (liste,
# ajouter depuis l'annuaire des membres, retirer) à droite. Utilise le router
# `memberGroup` (2a) + `memberDocument.listMembers` pour l'annuaire.
# Lien ajouté dans `ControlPanelSidebar`.
#
# Nécessite l'increment 2a groupes appliqué (router memberGroup).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-dashboard.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-dashboard.sh
#
set -euo pipefail

PAGE="apps/web/src/app/(admin)/dashboard/groups/page.tsx"
SIDEBAR="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SIDEBAR" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SIDEBAR attendu)." >&2
  exit 1
fi

if [ -f "$PAGE" ]; then
  echo "page déjà présente"
else
  mkdir -p "$(dirname "$PAGE")"
  cat > "$PAGE" <<'PAGE_EOF'
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

  const create = trpc.memberGroup.create.useMutation({
    onSuccess: () => {
      setNewName("");
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
        <div className="mb-4 flex gap-2">
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
            onClick={() => create.mutate({ name: newName.trim() })}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            Créer
          </button>
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
                  <span>{g.name}</span>
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
  group: { id: string; name: string; description: string | null };
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
                  <button
                    type="button"
                    onClick={() =>
                      removeMember.mutate({ groupId: group.id, userId: m.id })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Retirer
                  </button>
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
PAGE_EOF
  echo "page /dashboard/groups créée"
fi

python3 - "$SIDEBAR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "/dashboard/groups" in s:
    print("sidebar déjà à jour"); sys.exit(0)
OLD = '''            </li>

            {/* Disciplines */}'''
NEW = '''            </li>

            {/* Groupes de membres */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => router.push("/dashboard/groups")}
                >
                  Groupes de membres
                </button>
              </div>
            </li>

            {/* Disciplines */}'''
assert s.count(OLD) == 1, "ancre sidebar (Disciplines) introuvable"
p.write_text(s.replace(OLD, NEW, 1), encoding="utf-8")
print("lien sidebar ajouté")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(groups): page dashboard de gestion des groupes + lien sidebar" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi