#!/usr/bin/env bash
#
# AKFC — R1 SÉCURITÉ : dossiers-entité non renommables ni déplaçables (backend).
#
# (Ancre du `move` refaite en 100 % ASCII — l'emoji ⚠️ de la version précédente
# ne matchait pas au bit près selon l'encodage. On ancre désormais sur la
# séquence `logical … .mutation … const deps`, unique au move.)
#
# FAILLE : `isProtectedEntityFolderPath` n'était appliqué qu'à la SUPPRESSION.
# RENAME et MOVE d'un dossier n'étaient pas gardés → renommer un dossier-entité
# changeait son chemin, qui ne matchait plus la regex → il redevenait supprimable
# ET déplaçable. FIX : `rename` et `move` refusent un dossier-entité par son
# chemin SOURCE. Rename de FICHIER (simple UPDATE displayName) non concerné.
#
# Backend seul, typecheck backend.
#
# Usage : bash apply-r1-entity-folder-guard.sh
#         AKFC_APPLY_ONLY=1 bash apply-r1-entity-folder-guard.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isProtectedEntityFolderPath" in s:
    print("router déjà gardé (rename/move)"); sys.exit(0)

# 1. import
imp_anchor = 'import { VirtualStorage } from "@backend/modules/storage/virtualStorage";\n'
assert s.count(imp_anchor) == 1, "ancre import VirtualStorage introuvable/multiple"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import { isProtectedEntityFolderPath } from "@backend/modules/storage/protectedEntityFolder";\n',
)

# 2. garde RENAME (après le check racine, avant la branche fichier)
rename_anchor = (
    "      if (!parent) {\n"
    "        throw new TRPCError({\n"
    "          code: \"BAD_REQUEST\",\n"
    "          message: \"Impossible de renommer un élément racine.\",\n"
    "        });\n"
    "      }\n"
)
assert s.count(rename_anchor) == 1, "ancre check racine (rename) introuvable/multiple"
rename_guard = (
    rename_anchor
    + "\n"
    + "      // Dossier-entité : nom PHYSIQUE immuable. Sa garde de suppression\n"
    + "      // repose sur son chemin ; le renommer (déplacement du binaire)\n"
    + "      // casserait cette protection. Refusé (un libellé d'affichage passera\n"
    + "      // par un mécanisme séparé).\n"
    + "      if (input.type === \"folder\" && isProtectedEntityFolderPath(input.path)) {\n"
    + "        throw new TRPCError({\n"
    + "          code: \"FORBIDDEN\",\n"
    + "          message: \"Ce dossier système ne peut pas être renommé.\",\n"
    + "        });\n"
    + "      }\n"
)
s = s.replace(rename_anchor, rename_guard)

# 3. garde MOVE — ancre ASCII pure (unique : logical + .mutation + const deps)
move_anchor = (
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };\n"
)
assert s.count(move_anchor) == 1, "ancre tête de move (ASCII) introuvable/multiple"
move_guard = (
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      // Dossier-entité : chemin immuable, pas de déplacement du binaire.\n"
    "      // Même raison qu'au rename ; couvre aussi les sélections multiples.\n"
    "      {\n"
    "        const movedPaths =\n"
    "          input.intent.source.type === \"folder\"\n"
    "            ? [input.intent.source.path]\n"
    "            : input.intent.source.type === \"selection\"\n"
    "              ? input.intent.source.roots\n"
    "              : [];\n"
    "        if (movedPaths.some((pth) => isProtectedEntityFolderPath(pth))) {\n"
    "          throw new TRPCError({\n"
    "            code: \"FORBIDDEN\",\n"
    "            message: \"Ce dossier système ne peut pas être déplacé.\",\n"
    "          });\n"
    "        }\n"
    "      }\n"
    "\n"
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };\n"
)
s = s.replace(move_anchor, move_guard)

p.write_text(s, encoding="utf-8")
print("router gardé (rename + move des dossiers-entité refusés)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(storage): dossiers-entité non renommables ni déplaçables (garde serveur rename+move) — ferme le contournement de suppression" \
  && echo "commit $(git rev-parse --short HEAD)"