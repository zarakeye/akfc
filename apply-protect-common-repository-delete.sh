#!/usr/bin/env bash
#
# AKFC — Interdire la suppression de common_repository (front + backend).
#
# groups/persos (+ avatars) sont DÉJÀ non-supprimables via isProtectedEntityFolder
# (front) et isProtectedEntityFolderPath (backend). Il ne manque que la racine
# `common_repository` : on l'ajoute aux DEUX gardes (défense en profondeur — l'UI
# masque « Supprimer », le backend refuse un appel forgé).
#
# Front + backend, typecheck backend + web.
#
# Usage : bash apply-protect-common-repository-delete.sh
#         AKFC_APPLY_ONLY=1 bash apply-protect-common-repository-delete.sh   (clone)
#
set -euo pipefail

FRONT="apps/web/src/features/finder-core/utils/spaceFolderKind.ts"
BACK="packages/backend/src/modules/storage/protectedEntityFolder.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$FRONT" "$BACK"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

patch_file() {
  local file="$1"
  python3 - "$file" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "COMMON_REPOSITORY_CONTAINER" in s:
    print(f"— {p.name} déjà patché"); sys.exit(0)

# 1. déclarer le regex du conteneur racine, après PERSOS_CONTAINER
anchor_re = "const PERSOS_CONTAINER = /^[^/]+\\/persos$/;\n"
assert anchor_re in s, f"ancre PERSOS_CONTAINER introuvable dans {p.name}"
s = s.replace(
    anchor_re,
    anchor_re
    + "const COMMON_REPOSITORY_CONTAINER = /^[^/]+\\/common_repository$/;\n",
)

# 2. l'ajouter à la disjonction (après la ligne PERSOS_CONTAINER.test(path) ||)
anchor_or = "    PERSOS_CONTAINER.test(path) ||\n"
assert s.count(anchor_or) == 1, f"ancre PERSOS_CONTAINER.test introuvable/multiple dans {p.name}"
s = s.replace(
    anchor_or,
    anchor_or + "    COMMON_REPOSITORY_CONTAINER.test(path) ||\n",
)

p.write_text(s, encoding="utf-8")
print(f"✓ {p.name} : common_repository protégé")
PY
}

patch_file "$FRONT"
patch_file "$BACK"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|COMMON_REPOSITORY|isProtected" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|COMMON_REPOSITORY" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(finder): common_repository non-supprimable (gardes front + backend)" \
  && echo "commit $(git rev-parse --short HEAD)"