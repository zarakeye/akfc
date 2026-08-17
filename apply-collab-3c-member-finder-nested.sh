#!/usr/bin/env bash
#
# AKFC — Étape 3c : finder membre IMBRIQUÉ.
#
# `/mes-espaces` affichait une liste plate. On rend l'ARBORESCENCE : les groupes
# de plus haut niveau accessibles, avec leurs descendants imbriqués dessous.
#
#   - Backend : `myCollaborativeSpaces` expose `parentGroupId` (helper
#     `collaborativeEntriesForMember` + branche admin), pour que le front
#     reconstruise l'arbre.
#   - Front : `(public)/mes-espaces/page.tsx` réécrit — construit l'arbre à
#     partir de parentGroupId et le rend en indentant les descendants.
#
# Prérequis : 3b-spaces (helper) + passerelle + 3a. Front NON testé. Pas de migration.
# Usage : bash apply-collab-3c-member-finder-nested.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-3c-member-finder-nested.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
HELPER="packages/backend/src/modules/memberGroups/collaborativeEntriesForMember.service.ts"
PAGE="apps/web/src/app/(public)/mes-espaces/page.tsx"

for f in "package.json" "$ROUTER" "$HELPER" "$PAGE"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (prérequis 3b-spaces/2a ?)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── helper : + parentGroupId dans les entrées (réécrit) ─────────────────────
cat > "$HELPER" <<'TS'
import type { PrismaClient } from "@prisma/client";

type Access = "VIEWER" | "EDITOR";

/**
 * Espaces collaboratifs accessibles à un membre, HÉRITAGE compris : ses groupes
 * d'appartenance PLUS tous leurs descendants (parcours vers le bas via la
 * hiérarchie), niveau d'accès propagé (max ; EDITOR > VIEWER). Ne renvoie que
 * les groupes COLLABORATIFS. `parentGroupId` est inclus pour permettre au front
 * de reconstruire l'arborescence.
 */
export async function collaborativeEntriesForMember(
  prisma: PrismaClient,
  userId: string,
): Promise<
  { groupId: string; name: string; access: Access; parentGroupId: string | null }[]
> {
  const [allGroups, memberships] = await Promise.all([
    prisma.memberGroup.findMany({
      select: {
        id: true,
        name: true,
        isCollaborative: true,
        parentGroupId: true,
      },
    }),
    prisma.memberGroupMembership.findMany({
      where: { userId },
      select: { groupId: true, access: true },
    }),
  ]);

  const childrenOf = new Map<string, string[]>();
  for (const g of allGroups) {
    if (g.parentGroupId) {
      const arr = childrenOf.get(g.parentGroupId) ?? [];
      arr.push(g.id);
      childrenOf.set(g.parentGroupId, arr);
    }
  }
  const byId = new Map(allGroups.map((g) => [g.id, g]));

  const effective = new Map<string, Access>();
  const queue: { id: string; access: Access }[] = memberships.map((m) => ({
    id: m.groupId,
    access: m.access,
  }));
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const prev = effective.get(item.id);
    const level: Access =
      item.access === "EDITOR" || prev === "EDITOR" ? "EDITOR" : "VIEWER";
    if (prev === level) continue;
    effective.set(item.id, level);
    for (const childId of childrenOf.get(item.id) ?? []) {
      queue.push({ id: childId, access: level });
    }
  }

  const entries: {
    groupId: string;
    name: string;
    access: Access;
    parentGroupId: string | null;
  }[] = [];
  for (const [id, access] of effective) {
    const g = byId.get(id);
    if (!g || !g.isCollaborative) continue;
    entries.push({
      groupId: id,
      name: g.name,
      access,
      parentGroupId: g.parentGroupId,
    });
  }
  return entries;
}
TS
echo "helper réécrit (+parentGroupId) : $HELPER"

# ── router : entries type + branche admin exposent parentGroupId ─────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if 'access: "VIEWER" | "EDITOR";\n      parentGroupId: string | null;' in s:
    print("router déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# type des entries
s = sub(
    "    const entries: {\n"
    "      groupId: string;\n"
    "      name: string;\n"
    '      access: "VIEWER" | "EDITOR";\n'
    "    }[] = isAdmin",
    "    const entries: {\n"
    "      groupId: string;\n"
    "      name: string;\n"
    '      access: "VIEWER" | "EDITOR";\n'
    "      parentGroupId: string | null;\n"
    "    }[] = isAdmin",
    "entries type")

# branche admin : select + map
s = sub(
    "          await ctx.prisma.memberGroup.findMany({\n"
    "            where: { isCollaborative: true },\n"
    "            select: { id: true, name: true },\n"
    "          })\n"
    '        ).map((g) => ({ groupId: g.id, name: g.name, access: "EDITOR" as const }))',
    "          await ctx.prisma.memberGroup.findMany({\n"
    "            where: { isCollaborative: true },\n"
    "            select: { id: true, name: true, parentGroupId: true },\n"
    "          })\n"
    '        ).map((g) => ({ groupId: g.id, name: g.name, access: "EDITOR" as const, parentGroupId: g.parentGroupId }))',
    "admin branch")

p.write_text(s, encoding="utf-8")
print("myCollaborativeSpaces patché (parentGroupId exposé)")
PY

# ── front : /mes-espaces rendu en arborescence (réécrit) ────────────────────
cat > "$PAGE" <<'EOF'
"use client";

import { JSX } from "react";
import Link from "next/link";

import { trpc } from "@trpc/trpcClient";

/**
 * Mes espaces collaboratifs — page MEMBRE (`(public)/mes-espaces`).
 *
 * Affiche l'ARBORESCENCE des espaces accessibles (héritage compris) : groupes
 * de plus haut niveau, descendants imbriqués dessous (reconstruits à partir de
 * `parentGroupId`). Chaque espace mène à son parcours `/mes-espaces/[groupId]`.
 */
export default function MesEspacesPage(): JSX.Element {
  const { data, isLoading, isError } =
    trpc.storage.myCollaborativeSpaces.useQuery();

  const spaces = data ?? [];
  type Space = (typeof spaces)[number];

  const ids = new Set(spaces.map((s) => s.groupId));
  const childrenOf = new Map<string, Space[]>();
  const roots: Space[] = [];
  for (const s of spaces) {
    if (s.parentGroupId && ids.has(s.parentGroupId)) {
      const arr = childrenOf.get(s.parentGroupId) ?? [];
      arr.push(s);
      childrenOf.set(s.parentGroupId, arr);
    } else {
      roots.push(s);
    }
  }

  const renderNode = (s: Space, depth: number): JSX.Element => {
    const children = childrenOf.get(s.groupId) ?? [];
    return (
      <li key={s.groupId}>
        <Link
          href={`/mes-espaces/${s.groupId}`}
          style={{ marginLeft: `${depth * 1.25}rem` }}
          className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3 hover:bg-gray-50"
        >
          <span className="font-medium">{s.name}</span>
          <span
            className={
              "rounded-full px-2 py-0.5 text-xs font-medium " +
              (s.access === "EDITOR"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600")
            }
          >
            {s.access === "EDITOR" ? "éditeur" : "lecteur"}
          </span>
        </Link>
        {children.length > 0 && (
          <ul className="mt-1 space-y-1">
            {children.map((c) => renderNode(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Mes espaces collaboratifs</h1>

      {isLoading && <p className="text-sm text-gray-500">Chargement…</p>}
      {isError && (
        <p className="text-sm text-red-600">
          Impossible de charger vos espaces pour le moment.
        </p>
      )}
      {data && spaces.length === 0 && (
        <p className="text-sm text-gray-500">
          Vous n'appartenez à aucun espace collaboratif pour le moment.
        </p>
      )}
      {spaces.length > 0 && (
        <ul className="space-y-1">{roots.map((r) => renderNode(r, 0))}</ul>
      )}
    </div>
  );
}
EOF
echo "page réécrite (arborescence) : $PAGE"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(groups): étape 3c — finder membre imbriqué (/mes-espaces en arborescence)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider : /mes-espaces affiche les descendants imbriqués."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi