#!/usr/bin/env bash
#
# AKFC — Étape 3 (clôture) : RE-PARENTING d'un groupe existant.
#
# Sur la fiche `[id]`, un select « Groupe parent » permet de (re)définir le
# parent — appel `setParentGroup` (garde anti-cycle backend déjà en place). Clôt
# l'étape 3 (l'arbre est désormais pilotable à la création ET à l'édition).
#
# Front NON testé → valider à l'écran. Prérequis : 1f (fiche [id]) + 3a
# (setParentGroup + list.parentGroupId). Pas de migration.
# Usage : bash apply-collab-3-reparent-fiche.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-3-reparent-fiche.sh   (clone)
#
set -euo pipefail

PAGE="apps/web/src/app/(admin)/dashboard/groups/[id]/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$PAGE" ]; then
  echo "ERREUR: fiche [id] manquante ($PAGE) — 1f appliqué ? (lance depuis la racine)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$PAGE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "setParentGroup" in s:
    print("fiche déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# 1) mutation setParent après setAccess
s = sub(
    "  const setAccess = trpc.memberGroup.setMemberAccess.useMutation({\n"
    "    onSuccess: invalidate,\n"
    "  });",
    "  const setAccess = trpc.memberGroup.setMemberAccess.useMutation({\n"
    "    onSuccess: invalidate,\n"
    "  });\n"
    "  const setParent = trpc.memberGroup.setParentGroup.useMutation({\n"
    "    onSuccess: () => void utils.memberGroup.list.invalidate(),\n"
    "  });",
    "setParent mutation")

# 2) select de parent après la bascule collaboratif
s = sub(
    "        Espace collaboratif (dossier dédié + droits éditeur/lecteur)\n"
    "      </label>",
    "        Espace collaboratif (dossier dédié + droits éditeur/lecteur)\n"
    "      </label>\n"
    "\n"
    "      <div className=\"mb-6 max-w-xs space-y-1\">\n"
    "        <label htmlFor=\"parent\" className=\"text-sm font-medium\">\n"
    "          Groupe parent\n"
    "        </label>\n"
    "        <select\n"
    "          id=\"parent\"\n"
    "          value={group.parentGroupId ?? \"\"}\n"
    "          disabled={setParent.isPending}\n"
    "          onChange={(e) =>\n"
    "            setParent.mutate({\n"
    "              groupId: group.id,\n"
    "              parentGroupId: e.target.value || null,\n"
    "            })\n"
    "          }\n"
    "          className=\"w-full rounded-md border border-gray-300 px-3 py-2 text-sm\"\n"
    "        >\n"
    "          <option value=\"\">(Aucun — groupe racine)</option>\n"
    "          {(groupsQuery.data ?? [])\n"
    "            .filter((g) => g.id !== group.id)\n"
    "            .map((g) => (\n"
    "              <option key={g.id} value={g.id}>\n"
    "                {g.name}\n"
    "              </option>\n"
    "            ))}\n"
    "        </select>\n"
    "        {setParent.error && (\n"
    "          <p className=\"text-xs text-red-600\">{setParent.error.message}</p>\n"
    "        )}\n"
    "      </div>",
    "parent select")

p.write_text(s, encoding="utf-8")
print("fiche [id] patchée (select de parent + setParentGroup)")
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
if git commit -m "feat(groups): étape 3 (clôture) — re-parenting d'un groupe sur sa fiche (setParentGroup)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider : la fiche [id] montre le select « Groupe parent »."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi