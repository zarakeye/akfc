#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif : BACKFILL des espaces de groupe au boot.
#
# Les groupes collaboratifs créés AVANT le hook create/update n'ont pas de
# ligne `Folder` → leur dossier n'apparaît pas dans le finder. On matérialise
# tous les espaces manquants au démarrage de l'app (là où `ensureRootFolders`
# est déjà appelé). Un redémarrage (`pnpm dev` relancé) suffit ensuite.
#
# Fichiers :
#   - NOUVEAU ensureAllGroupSpaces.service.ts (boucle les groupes collaboratifs
#     → ensureGroupSpaceFolder ; idempotent)
#   - apps/web/instrumentation.ts : appel après ensureRootFolders (non bloquant)
#
# Prérequis : `apply-collab-empty-group-spaces.sh` appliqué (ensureGroupSpaceFolder).
# Pas de migration.
# Usage : bash apply-collab-backfill-group-spaces-boot.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-backfill-group-spaces-boot.sh   (clone)
#
set -euo pipefail

INSTR="apps/web/instrumentation.ts"
SVC="packages/backend/src/modules/memberGroups/ensureAllGroupSpaces.service.ts"

if [ ! -f "package.json" ] || [ ! -f "$INSTR" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($INSTR attendu)." >&2
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

# ── Service backfill ────────────────────────────────────────────────────────
if [ ! -f "$SVC" ]; then
  cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";

import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";

/**
 * Backfill : garantit la ligne `Folder` de l'espace de CHAQUE groupe
 * collaboratif (idempotent). Appelé au boot pour matérialiser les espaces des
 * groupes créés avant l'introduction du hook create/update.
 */
export async function ensureAllGroupSpaces(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ ensured: number }> {
  const groups = await prisma.memberGroup.findMany({
    where: { isCollaborative: true },
    select: { id: true },
  });

  for (const group of groups) {
    await ensureGroupSpaceFolder({ prisma, appRoot, groupId: group.id });
  }

  return { ensured: groups.length };
}
TS
  echo "service écrit : $SVC"
else
  echo "service déjà présent"
fi

# ── instrumentation.ts : import + appel après ensureRootFolders ─────────────
python3 - "$INSTR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "ensureAllGroupSpaces" in s:
    print("instrumentation déjà à jour")
    sys.exit(0)

IMP_OLD = ('  const { ensureRootFolders } = await import(\n'
           '    "@backend/modules/cloudinary/services/ensureRootFolders.service"\n'
           '  );')
IMP_NEW = (IMP_OLD + "\n"
           '  const { ensureAllGroupSpaces } = await import(\n'
           '    "@backend/modules/memberGroups/ensureAllGroupSpaces.service"\n'
           '  );')
assert s.count(IMP_OLD) == 1, "ancre import ensureRootFolders introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

CALL_OLD = ('    console.error(\n'
            '      "[instrumentation] ensureRootFolders failed — app will still start",\n'
            '      err\n'
            '    );\n'
            '  }\n'
            '}')
CALL_NEW = ('    console.error(\n'
            '      "[instrumentation] ensureRootFolders failed — app will still start",\n'
            '      err\n'
            '    );\n'
            '  }\n'
            '\n'
            '  try {\n'
            '    const { ensured } = await ensureAllGroupSpaces(prisma, APP_ROOT);\n'
            '    console.log(\n'
            '      `[instrumentation] ensureAllGroupSpaces: ${ensured} espace(s) de groupe collaboratif garanti(s) pour appRoot="${APP_ROOT}"`\n'
            '    );\n'
            '  } catch (err) {\n'
            '    console.error(\n'
            '      "[instrumentation] ensureAllGroupSpaces failed — app will still start",\n'
            '      err\n'
            '    );\n'
            '  }\n'
            '}')
assert s.count(CALL_OLD) == 1, "ancre fin de register() introuvable"
s = s.replace(CALL_OLD, CALL_NEW)

p.write_text(s, encoding="utf-8")
print("instrumentation.ts câblé (backfill au boot)")
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
if git commit -m "feat(groups): backfill au boot des espaces de groupes collaboratifs existants" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "➡️  Redémarre pnpm dev : le log '[instrumentation] ensureAllGroupSpaces: N …' matérialise les espaces. Puis recharge le finder."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi