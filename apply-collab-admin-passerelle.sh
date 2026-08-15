#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif : PASSERELLE admin.
#
# Un administrateur est d'emblée ÉDITEUR de TOUS les espaces collaboratifs
# (il est au-dessus du système de groupes), SANS appartenance manuelle. Les
# gardes backend (assertCanWriteGroupSpace / assertCanTrashPaths /
# assertCanReadPath) court-circuitent déjà pour l'admin ; il ne manquait que
# l'UI : `storage.myCollaborativeSpaces` ne listait que les groupes dont on est
# membre. On l'élargit : si admin → tous les groupes collaboratifs, access EDITOR.
#
# Fichier : storage/router.ts (myCollaborativeSpaces).
# Prérequis : 1e appliqué (la query existe). Pas de migration.
# Usage : bash apply-collab-admin-passerelle.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-admin-passerelle.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($ROUTER attendu)." >&2
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
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")

if "Passerelle admin" in s:
    print("passerelle déjà en place")
    sys.exit(0)

OLD = (
    "  /**\n"
    "   * Espaces des groupes collaboratifs accessibles à l'utilisateur courant\n"
    "   * (racines du finder côté membre) : chemin + droit par groupe.\n"
    "   */\n"
    "  myCollaborativeSpaces: protectedProcedure.query(async ({ ctx }) => {\n"
    "    const memberships = await ctx.prisma.memberGroupMembership.findMany({\n"
    "      where: { userId: ctx.user.id, group: { isCollaborative: true } },\n"
    "      select: { access: true, group: { select: { id: true, name: true } } },\n"
    "    });\n"
    "    return Promise.all(\n"
    "      memberships.map(async (m) => ({\n"
    "        groupId: m.group.id,\n"
    "        name: m.group.name,\n"
    "        access: m.access,\n"
    "        path: await resolveGroupBaseFolder({\n"
    "          prisma: ctx.prisma,\n"
    "          appRoot: ctx.appRoot,\n"
    "          groupId: m.group.id,\n"
    "        }),\n"
    "      })),\n"
    "    );\n"
    "  }),"
)

NEW = (
    "  /**\n"
    "   * Espaces des groupes collaboratifs accessibles à l'utilisateur courant\n"
    "   * (racines du finder côté membre) : chemin + droit par groupe.\n"
    "   *\n"
    "   * Passerelle admin : un administrateur est d'emblée ÉDITEUR de TOUS les\n"
    "   * espaces collaboratifs (au-dessus du système de groupes), sans\n"
    "   * appartenance manuelle.\n"
    "   */\n"
    "  myCollaborativeSpaces: protectedProcedure.query(async ({ ctx }) => {\n"
    "    const user = await ctx.prisma.user.findUnique({\n"
    "      where: { id: ctx.user.id },\n"
    "      select: { role: { select: { name: true } } },\n"
    "    });\n"
    "    const isAdmin = user?.role?.name === \"ADMIN\";\n"
    "\n"
    "    const entries: {\n"
    "      groupId: string;\n"
    "      name: string;\n"
    "      access: \"VIEWER\" | \"EDITOR\";\n"
    "    }[] = isAdmin\n"
    "      ? (\n"
    "          await ctx.prisma.memberGroup.findMany({\n"
    "            where: { isCollaborative: true },\n"
    "            select: { id: true, name: true },\n"
    "          })\n"
    "        ).map((g) => ({ groupId: g.id, name: g.name, access: \"EDITOR\" as const }))\n"
    "      : (\n"
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
    "        }));\n"
    "\n"
    "    return Promise.all(\n"
    "      entries.map(async (e) => ({\n"
    "        ...e,\n"
    "        path: await resolveGroupBaseFolder({\n"
    "          prisma: ctx.prisma,\n"
    "          appRoot: ctx.appRoot,\n"
    "          groupId: e.groupId,\n"
    "        }),\n"
    "      })),\n"
    "    );\n"
    "  }),"
)

assert s.count(OLD) == 1, "ancre myCollaborativeSpaces (post-1e) introuvable"
s = s.replace(OLD, NEW)
rp.write_text(s, encoding="utf-8")
print("myCollaborativeSpaces élargi (passerelle admin)")
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
if git commit -m "feat(groups): passerelle admin — éditeur d'emblée de tous les espaces collaboratifs" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi