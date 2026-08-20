#!/usr/bin/env bash
#
# AKFC — correctif ciblé cloche : user = session?.user (et non s.user).
#
# Le store expose `session` ; l'utilisateur est à `session.user`. Corrige la
# ligne fautive dans CollaborativeBell.tsx, quel que soit ce qui est sur disque.
#
# Usage : bash apply-collab-notif3-fix-user.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-notif3-fix-user.sh   (clone)
#
set -euo pipefail

BELL="apps/web/src/features/app-shell/CollaborativeBell.tsx"

if [ ! -f "package.json" ] || [ ! -f "$BELL" ]; then
  echo "ERREUR: lance depuis la racine ($BELL attendu)." >&2
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

python3 - "$BELL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "s.session?.user" in s:
    print("déjà corrigé"); sys.exit(0)
old = "useSessionStore((s) => s.user)"
assert s.count(old) == 1, "ancre s.user introuvable (déjà corrigé ?)"
s = s.replace(old, "useSessionStore((s) => s.session?.user)")
p.write_text(s, encoding="utf-8")
print("CollaborativeBell corrigé (session?.user)")
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
if git commit -m "fix(notif): CollaborativeBell lit user via session?.user" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi