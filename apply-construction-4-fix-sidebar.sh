#!/usr/bin/env bash
#
# AKFC — fix brique 4 : entrée sidebar « Publication des pages ».
#
# L'ancre initiale (item Groupes SANS « + ») ne matchait pas : sidebar-and-nav a
# ajouté un bouton « + » à Groupes. On ancre plutôt sur le bloc « Disciplines »
# (stable) et on insère l'item juste avant. La page /dashboard/pages est déjà là.
#
# Usage : bash apply-construction-4-fix-sidebar.sh
#         AKFC_APPLY_ONLY=1 bash apply-construction-4-fix-sidebar.sh   (clone)
#
set -euo pipefail

SIDEBAR="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SIDEBAR" ]; then
  echo "ERREUR: lance depuis la racine ($SIDEBAR attendu)." >&2
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

python3 - "$SIDEBAR" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "/dashboard/pages" in s:
    print("sidebar déjà à jour"); sys.exit(0)

ITEM = (
    '            {/* Publication des pages (mode « En construction ») */}\n'
    '            <li>\n'
    '              <div className="flex">\n'
    '                <button\n'
    '                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"\n'
    '                  onClick={() => router.push("/dashboard/pages")}\n'
    '                >\n'
    '                  Publication des pages\n'
    '                </button>\n'
    '              </div>\n'
    '            </li>\n'
    '\n'
)

# Ancre principale : le bloc Disciplines (stable). On insère l'item avant.
anchor = '            {/* Disciplines */}\n'
if s.count(anchor) == 1:
    s = s.replace(anchor, ITEM + anchor)
    p.write_text(s, encoding="utf-8")
    print("sidebar patchée (avant Disciplines)")
    sys.exit(0)

# Repli : insérer avant la fermeture de la 1re liste <ul> ... </ul>.
m = re.search(r'\n(\s*)</ul>', s)
assert m, "aucun </ul> trouvé dans la sidebar"
indent = m.group(1)
li = ITEM.rstrip('\n') + '\n'
s = s[:m.start()] + '\n' + li + s[m.start()+1:]
p.write_text(s, encoding="utf-8")
print("sidebar patchée (repli : avant </ul>)")
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
if git commit -m "feat(pages): entrée sidebar « Publication des pages »" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "✅ Chantier « En construction » complet + accessible depuis la sidebar."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi