#!/usr/bin/env bash
#
# AKFC — retirer l'item de navigation « Mes espaces » du header/footer.
#
# La cloche collaborative (membre) donne désormais l'accès au finder membre ;
# les admins passent par le finder admin. L'item navbar « Mes espaces » fait
# donc doublon → on le retire de `navEntries.ts` (source unique lue par Header
# ET Footer). La PAGE /mes-espaces reste (la cloche y mène), tout comme l'item
# admin « Groupes » de la sidebar (gestion des groupes).
#
# Idempotent. Pas de migration.
# Usage : bash apply-collab-remove-mes-espaces-nav.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-remove-mes-espaces-nav.sh   (clone)
#
set -euo pipefail

NAV="apps/web/src/features/app-shell/navEntries.ts"

if [ ! -f "package.json" ] || [ ! -f "$NAV" ]; then
  echo "ERREUR: lance depuis la racine ($NAV attendu)." >&2
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

python3 - "$NAV" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); n = p.read_text(encoding="utf-8")
if "/mes-espaces" not in n:
    print("déjà retiré (aucune entrée /mes-espaces)"); sys.exit(0)

OLD = '\n  { kind: "link", href: "/mes-espaces", label: "Mes espaces", requiresUser: true },'
if n.count(OLD) != 1:
    # repli : retrait tolérant aux variations d'espaces autour de l'entrée
    import re
    pattern = re.compile(r'\n[ \t]*\{ kind: "link", href: "/mes-espaces"[^\n]*\},')
    matches = pattern.findall(n)
    assert len(matches) == 1, f"entrée /mes-espaces introuvable/multiple ({len(matches)})"
    n = pattern.sub("", n, count=1)
else:
    n = n.replace(OLD, "")

p.write_text(n, encoding="utf-8")
print("navEntries patché (item « Mes espaces » retiré)")
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
if git commit -m "chore(nav): retirer l'item « Mes espaces » (remplacé par la cloche collaborative)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  La page /mes-espaces et l'item admin « Groupes » sont conservés."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi