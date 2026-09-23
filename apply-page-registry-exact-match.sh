#!/usr/bin/env bash
# AKFC — pageKeyForPath : correspondance EXACTE par défaut (fin de l'héritage par préfixe).
# Bug : /about/instructeurs héritait de la clé "association" (préfixe /about/) →
# badge « Page non publiée » affiché selon l'état de L'association. Les sous-routes
# ne sont désormais rattachées que si l'entrée déclare includeSubroutes: true.
# Usage : bash apply-page-registry-exact-match.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/config/pageRegistry.ts"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
grep -q 'includeSubroutes' "$F" && { echo "— déjà appliqué"; exit 0; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
def one(old, new, label):
    global s
    assert s.count(old) == 1, f"{label}: ancre ×{s.count(old)}"
    s = s.replace(old, new)

one(" * `key` = clé stockée dans `PageVisibility` ; `path` = route PUBLIQUE (préfixe\n * couvrant les sous-routes). Source unique partagée middleware + centre de\n * contrôle « Pages éditoriales ».",
    " * `key` = clé stockée dans `PageVisibility` ; `path` = route PUBLIQUE, en\n * correspondance EXACTE. Les sous-routes ne sont rattachées que si l'entrée\n * déclare `includeSubroutes: true` — sinon une page consommatrice imbriquée\n * (ex. /about/instructeurs) hériterait à tort de l'état de sa page parente.\n * Source unique partagée avec le centre de contrôle « Pages éditoriales ».",
    "doc registre")

one("  label: string;\n  path: string;\n};",
    "  label: string;\n  path: string;\n  /** Rattacher aussi les sous-routes (path + \"/...\"). Défaut : false. */\n  includeSubroutes?: boolean;\n};",
    "type")

one("    if (pathname === entry.path || pathname.startsWith(entry.path + \"/\")) {",
    "    if (\n      pathname === entry.path ||\n      (entry.includeSubroutes === true &&\n        pathname.startsWith(entry.path + \"/\"))\n    ) {",
    "logique")

p.write_text(s, encoding="utf-8")
print("  ok  pageKeyForPath : correspondance exacte par défaut")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "fix(pages): registre en correspondance exacte — /about/instructeurs n'hérite plus de l'état de L'association" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }