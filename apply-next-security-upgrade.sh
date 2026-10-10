#!/usr/bin/env bash
# AKFC — Mise à jour de sécurité Next.js / React.
#   16.0.1 est touché par CVE-2025-66478 / CVE-2025-55182 (« React2Shell », RCE sans authentification,
#   CVSS 10) et par les failles corrigées depuis (déc. 2025 → sept. 2026). Seule la mineure 16.3 est
#   encore maintenue.
#   Par défaut : next + eslint-config-next + @next/mdx → 16.3.7 ; react + react-dom → 19.2.8.
#   Réutilisable : NEXT_VERSION=16.3.8 bash apply-next-security-upgrade.sh
# Étapes : édition des package.json (ancres vérifiées) → pnpm install (lockfile) → pnpm check → build
#   complet (AKFC_SKIP_BUILD=1 pour le sauter) → commit. Tout échec restaure package.json et lockfile.
set -euo pipefail
[ -f package.json ] && [ -f apps/web/package.json ] && [ -f pnpm-lock.yaml ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
NEXT_V="${NEXT_VERSION:-16.3.7}"; REACT_V="${REACT_VERSION:-19.2.8}"
CUR=$(node -p "require('./package.json').dependencies.next" 2>/dev/null || echo "?")
[ "$CUR" = "$NEXT_V" ] && { echo "— next est déjà en $NEXT_V"; exit 0; }
echo "next : $CUR → $NEXT_V ; react/react-dom → $REACT_V"

BK=/tmp/akfc_next_backup; rm -rf "$BK"; mkdir -p "$BK/apps/web"
cp package.json pnpm-lock.yaml "$BK/"; cp apps/web/package.json "$BK/apps/web/"
restore(){ cp "$BK/package.json" "$BK/pnpm-lock.yaml" .; cp "$BK/apps/web/package.json" apps/web/; echo "↩ package.json et lockfile restaurés (aucun commit). Relance « pnpm install » pour réaligner node_modules."; }

python3 - "$NEXT_V" "$REACT_V" <<'PY' || { restore; exit 1; }
import re, sys, json
nv, rv = sys.argv[1], sys.argv[2]
def edit(path, rules):
    s = open(path, encoding="utf-8").read()
    for key, new in rules:
        rx = re.compile(r'("' + re.escape(key) + r'"\s*:\s*)"[^"]*"')
        n = len(rx.findall(s)); assert n == 1, f"{path} : « {key} » trouvé {n} fois"
        s = rx.sub(lambda m: m.group(1) + f'"{new}"', s)
    json.loads(s)
    open(path, "w", encoding="utf-8").write(s)
    print(f"  ok  {path} : " + ", ".join(f"{k}={v}" for k, v in rules))
edit("package.json", [("next", nv), ("eslint-config-next", nv), ("react", rv), ("react-dom", rv)])
edit("apps/web/package.json", [("@next/mdx", nv), ("eslint-config-next", nv)])
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi

echo "== pnpm install (mise à jour du lockfile) =="
pnpm install > /tmp/akfc_install.log 2>&1 || { tail -15 /tmp/akfc_install.log; restore; exit 1; }
GOT=$(node -p "require('next/package.json').version"); GOTR=$(node -p "require('react/package.json').version")
[ "$GOT" = "$NEXT_V" ] && [ "$GOTR" = "$REACT_V" ] || { echo "❌ installé : next $GOT, react $GOTR (attendu $NEXT_V / $REACT_V)"; restore; exit 1; }
echo "  ✅ installé : next $GOT, react $GOTR"

echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; restore; exit 1; fi
echo "  ✅ check OK"

if [ "${AKFC_SKIP_BUILD:-0}" != "1" ]; then
  echo "== build complet (quelques minutes) =="
  if ! pnpm --filter web build > /tmp/akfc_build.log 2>&1; then
    echo "❌ build ÉCHOUÉ (15 premières lignes d'erreur) :"; grep -nE "Error|error|Failed|failed" /tmp/akfc_build.log | head -15; restore; exit 1
  fi
  echo "  ✅ build OK"
fi

git add package.json apps/web/package.json pnpm-lock.yaml
git commit -qm "fix(security): Next.js $CUR → $NEXT_V, React → $REACT_V (CVE-2025-66478/55182 React2Shell et correctifs 2026)" \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; exit 1; }