#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 1f (FRONT) : refonte de la page
# groupes dans la CONVENTION MAISON du dashboard (remplace le scaffold + 1d).
#
# Aligne les groupes sur le pattern des autres pages (origins, disciplines…) :
#   - (admin)/dashboard/groups/page.tsx : entête (titre + lien « + Créer un
#     groupe » à droite) puis <GroupsTable/> (react-ts-tab-lib).
#   - features/admin/groups/components/GroupsTable.tsx : la table (colonnes
#     Nom / Type / Membres ; clic → /dashboard/groups/[id]).
#   - (admin)/dashboard/groups/create/page.tsx : route de création + <GroupForm/>.
#   - features/admin/groups/forms/GroupForm.tsx : formulaire (nom + case
#     « collaboratif »). NB : câblé sur la mutation tRPC existante, PAS sur ton
#     stack server-action react-hook-form (à aligner si tu veux la parité totale).
#   - (admin)/dashboard/groups/[id]/page.tsx : fiche du groupe — renommage,
#     bascule collaboratif, membres (ajout/retrait) et droits éditeur/lecteur.
#
# FRONT non exécutable sur le clone → livré NON TESTÉ, à valider à l'écran.
# Remplace en entier l'ancienne page (donc annule/rejoue proprement par-dessus
# le 1d). Prérequis : 1a appliqué. Pas de migration.
#
# Usage : bash apply-collab-1f-groups-ui-rebuild.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-1f-groups-ui-rebuild.sh   (clone)
#
set -euo pipefail

WEB="apps/web/src"
PAGE="$WEB/app/(admin)/dashboard/groups/page.tsx"
TABLE="$WEB/features/admin/groups/components/GroupsTable.tsx"
CREATE="$WEB/app/(admin)/dashboard/groups/create/page.tsx"
FORM="$WEB/features/admin/groups/forms/GroupForm.tsx"
DETAIL="$WEB/app/(admin)/dashboard/groups/[id]/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$PAGE" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($PAGE attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier collaboratif va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

mkdir -p "$WEB/features/admin/groups/components" \
         "$WEB/features/admin/groups/forms" \
         "$WEB/app/(admin)/dashboard/groups/create" \
         "$WEB/app/(admin)/dashboard/groups/[id]"

# ── 1) page liste ────────────────────────────────────────────────────────────
cat > "$PAGE" <<'EOF'
import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import GroupsTable from "@features/admin/groups/components/GroupsTable";

/** Liste des groupes de membres — `/(admin)/dashboard/groups`. */
export default function GroupsPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Groupes de membres</h2>
        <Link
          href="/dashboard/groups/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un groupe
        </Link>
      </div>
      <GroupsTable />
    </div>
  );
}
EOF
echo "écrit : $PAGE"

# ── 2) table ─────────────────────────────────────────────────────────────────
cat > "$TABLE" <<'EOF'
"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type GroupRow = {
  id: string;
  name: string;
  type: string;
  members: string;
};

/** Liste des groupes — clic → `/(admin)/dashboard/groups/[id]`. */
export default function GroupsTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.memberGroup.list.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des groupes.</div>;

  const rows: GroupRow[] = (data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    type: g.isCollaborative ? "Collaboratif" : "Diffusion",
    members: String(g.memberCount),
  }));

  const columns: Column<GroupRow>[] = [
    { property: "name", displayName: "Nom", type: "string" },
    { property: "type", displayName: "Type", type: "string" },
    { property: "members", displayName: "Membres", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: GroupRow | null) => {
        if (row) router.push(`/dashboard/groups/${row.id}`);
      }}
    />
  );
}
EOF
echo "écrit : $TABLE"

# ── 3) route de création ─────────────────────────────────────────────────────
cat > "$CREATE" <<'EOF'
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GroupForm } from "@features/admin/groups/forms/GroupForm";

/** Création — `/(admin)/dashboard/groups/create`. */
export default function CreateGroupPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/groups"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer un groupe</h2>
      <GroupForm />
    </div>
  );
}
EOF
echo "écrit : $CREATE"

# ── 4) formulaire de création ────────────────────────────────────────────────
cat > "$FORM" <<'EOF'
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
EOF
echo "écrit : $FORM"

# ── 5) fiche du groupe (membres + droits) ────────────────────────────────────
cat > "$DETAIL" <<'EOF'
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
EOF
echo "écrit : $DETAIL"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

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
if git commit -m "refactor(groups): page dashboard dans la convention maison (react-ts-tab-lib + route create + fiche [id])" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front livré NON testé — à valider à l'écran (pnpm dev, hard refresh)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi