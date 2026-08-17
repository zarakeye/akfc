#!/usr/bin/env bash
#
# AKFC — Option B, étape 1 (backend) : hiérarchie des espaces pour le finder.
#
# `storage.groupSpaceHierarchy` : pour chaque groupe COLLABORATIF, son chemin
# d'espace RÉEL (resolveGroupBaseFolder) + son `parentGroupId`. Permet au finder
# admin (B-2) d'imbriquer VISUELLEMENT les espaces (racines sous groups/,
# enfants sous leur parent) tout en gardant les chemins physiques intacts.
# Gate admin en ligne (adminProcedure non importé ici).
#
# Prérequis : passerelle (myCollaborativeSpaces) + 3a (parentGroupId). Backend
# seul, testable. Pas de migration.
# Usage : bash apply-collab-optB1-space-hierarchy.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-optB1-space-hierarchy.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine ($ROUTER attendu)." >&2
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

python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "groupSpaceHierarchy" in s:
    print("router déjà à jour"); sys.exit(0)

OLD = ("  /**\n"
       "   * Espaces des groupes collaboratifs accessibles à l'utilisateur courant")
NEW = ("  /**\n"
       "   * Hiérarchie des espaces collaboratifs : chemin d'espace RÉEL + parent,\n"
       "   * pour l'imbrication visuelle du finder admin (les chemins physiques\n"
       "   * restent inchangés). Réservé aux admins.\n"
       "   */\n"
       "  groupSpaceHierarchy: protectedProcedure.query(async ({ ctx }) => {\n"
       "    const me = await ctx.prisma.user.findUnique({\n"
       "      where: { id: ctx.user.id },\n"
       "      select: { role: { select: { name: true } } },\n"
       "    });\n"
       '    if (me?.role?.name !== "ADMIN") return [];\n'
       "\n"
       "    const groups = await ctx.prisma.memberGroup.findMany({\n"
       "      where: { isCollaborative: true },\n"
       "      select: { id: true, name: true, parentGroupId: true },\n"
       "    });\n"
       "    return Promise.all(\n"
       "      groups.map(async (g) => ({\n"
       "        groupId: g.id,\n"
       "        name: g.name,\n"
       "        parentGroupId: g.parentGroupId,\n"
       "        path: await resolveGroupBaseFolder({\n"
       "          prisma: ctx.prisma,\n"
       "          appRoot: ctx.appRoot,\n"
       "          groupId: g.id,\n"
       "        }),\n"
       "      })),\n"
       "    );\n"
       "  }),\n"
       "\n"
       "  /**\n"
       "   * Espaces des groupes collaboratifs accessibles à l'utilisateur courant")
assert s.count(OLD) == 1, "ancre (comment myCollaborativeSpaces) introuvable"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8")
print("router patché (groupSpaceHierarchy)")
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
if git commit -m "feat(finder): storage.groupSpaceHierarchy (socle de l'imbrication finder admin)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi