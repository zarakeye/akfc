#!/usr/bin/env bash
#
# AKFC — Étape 3b-spaces : le membre VOIT ses espaces HÉRITÉS.
#
# `myCollaborativeSpaces` ne listait que les groupes d'appartenance DIRECTE.
# On la fait remonter aux DESCENDANTS : les groupes du membre PLUS tous leurs
# descendants (parcours vers le bas via la hiérarchie), niveau d'accès propagé
# (max si plusieurs chemins). Symétrique de l'héritage des gardes (3b).
#
#   - NOUVEAU `collaborativeEntriesForMember.service.ts` (BFS down).
#   - storage/router : branche non-admin de myCollaborativeSpaces → le helper.
#
# Prérequis : 1a-1e + passerelle + 3a. Pas de migration.
# Usage : bash apply-collab-3b-spaces-descendants.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-3b-spaces-descendants.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
HELPER="packages/backend/src/modules/memberGroups/collaborativeEntriesForMember.service.ts"

for f in "package.json" "$ROUTER"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── helper ──────────────────────────────────────────────────────────────────
if [ ! -f "$HELPER" ]; then
  cat > "$HELPER" <<'TS'
import type { PrismaClient } from "@prisma/client";

type Access = "VIEWER" | "EDITOR";

/**
 * Espaces collaboratifs accessibles à un membre, HÉRITAGE compris : ses groupes
 * d'appartenance PLUS tous leurs descendants (parcours vers le bas via la
 * hiérarchie), avec le niveau d'accès propagé (max si plusieurs chemins ;
 * EDITOR > VIEWER). Ne renvoie que les groupes COLLABORATIFS.
 *
 * Symétrique de `resolveGroupAccessForUser` (qui remonte les ancêtres pour les
 * gardes) : ici on descend, pour LISTER ce que le membre peut voir.
 */
export async function collaborativeEntriesForMember(
  prisma: PrismaClient,
  userId: string,
): Promise<{ groupId: string; name: string; access: Access }[]> {
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

  // Parcours vers le bas depuis les groupes d'appartenance ; niveau propagé
  // (max). L'arbre garantit la terminaison ; on ne re-propage qu'à la hausse.
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

  const entries: { groupId: string; name: string; access: Access }[] = [];
  for (const [id, access] of effective) {
    const g = byId.get(id);
    if (!g || !g.isCollaborative) continue;
    entries.push({ groupId: id, name: g.name, access });
  }
  return entries;
}
TS
  echo "helper écrit : $HELPER"
else
  echo "helper déjà présent"
fi

# ── storage router : branche non-admin → helper ─────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "collaborativeEntriesForMember" in s:
    print("router déjà à jour"); sys.exit(0)

IMP_OLD = 'import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";'
IMP_NEW = (IMP_OLD + "\n"
           'import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";')
assert s.count(IMP_OLD) == 1, "ancre import introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

OLD = ("      : (\n"
       "          await ctx.prisma.memberGroupMembership.findMany({\n"
       "            where: { userId: ctx.user.id, group: { isCollaborative: true } },\n"
       "            select: {\n"
       "              access: true,\n"
       "              group: { select: { id: true, name: true } },\n"
       "            },\n"
       "          })\n"
       "        ).map((m) => ({\n"
       "          groupId: m.group.id,\n"
       "          name: m.group.name,\n"
       "          access: m.access,\n"
       "        }));")
NEW = "      : await collaborativeEntriesForMember(ctx.prisma, ctx.user.id);"
assert s.count(OLD) == 1, "ancre branche non-admin introuvable"
s = s.replace(OLD, NEW)

p.write_text(s, encoding="utf-8")
print("myCollaborativeSpaces patché (descendants via helper)")
PY

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
if git commit -m "feat(groups): étape 3b-spaces — myCollaborativeSpaces remonte les descendants (héritage visible)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi