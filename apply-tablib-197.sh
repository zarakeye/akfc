#!/usr/bin/env bash
# AKFC passe à react-ts-tab-lib 1.9.7 : la version où vitest et ses outils ne sont plus des
# dépendances de la librairie. Les 3 alertes critiques restantes de pnpm audit disparaissent.
# Vérifie d'abord que la 1.9.7 est bien publiée sur npm, et sans vitest. Relance pnpm install
# (réseau), puis pnpm check, puis commit. Pas de migration. ARRÊTE pnpm dev avant.
# Prérequis : apply-securite-dependances.sh.
# Usage (racine du repo AKFC) : bash apply-tablib-197.sh
set -euo pipefail

V="${AKFC_TABLIB_VERSION:-1.9.7}"
PKG=apps/web/package.json

[ -f "$PKG" ] && [ -f pnpm-lock.yaml ] || { echo "❌ Lance le script à la racine du repo AKFC."; exit 1; }
[ -f scripts/check-next-unique.mjs ] || { echo "❌ Lance d'abord apply-securite-dependances.sh."; exit 1; }

# Garde anti-double-application.
if grep -q "\"react-ts-tab-lib\": \"^$V\"" "$PKG"; then echo "Déjà fait : react-ts-tab-lib ^$V."; exit 0; fi

[ -z "$(git status --porcelain -- "$PKG" pnpm-lock.yaml)" ] || {
  echo "❌ $PKG ou pnpm-lock.yaml ont des modifications non commitées."; exit 1; }

echo "== react-ts-tab-lib@$V sur npm =="
if ! DEPS=$(npm view "react-ts-tab-lib@$V" dependencies --json 2>/dev/null); then
  echo "❌ La version $V n'est pas (encore) publiée sur npm. Publie-la, puis relance ce script."; exit 1
fi
if echo "$DEPS" | grep -q '"vitest\|"@vitest/'; then
  echo "❌ La $V déclare encore vitest dans ses dependencies : rien ne serait corrigé."; exit 1
fi
echo "  ✅ publiée, sans vitest"

cp "$PKG" /tmp/akfc_web_package.json.bak
cp pnpm-lock.yaml /tmp/akfc_pnpm-lock.yaml.bak
restore() { cp /tmp/akfc_web_package.json.bak "$PKG"; cp /tmp/akfc_pnpm-lock.yaml.bak pnpm-lock.yaml; }
PNPM_I="pnpm install --config.confirmModulesPurge=false"
reinstall_old() { $PNPM_I --frozen-lockfile > /dev/null 2>&1 || true; }

python3 - "$PKG" "$V" <<'PY'
import re, sys
path, v = sys.argv[1], sys.argv[2]
s = open(path).read()
pattern = r'"react-ts-tab-lib": "\^\d+\.\d+\.\d+"'
assert len(re.findall(pattern, s)) == 1, "ancre react-ts-tab-lib introuvable ou multiple"
s = re.sub(pattern, f'"react-ts-tab-lib": "^{v}"', s)
open(path, "w").write(s)
print(f"  {path} : react-ts-tab-lib ^{v}")
PY

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans installation, vérification ni commit)."; exit 0; }

echo "== pnpm install =="
if ! $PNPM_I > /tmp/akfc_install.log 2>&1; then
  echo "❌ pnpm install :"; tail -12 /tmp/akfc_install.log; restore; reinstall_old; exit 1
fi
INSTALLED=$(grep -oE "^  react-ts-tab-lib@[0-9.]+" pnpm-lock.yaml | head -1 | cut -d@ -f2)
echo "  ✅ react-ts-tab-lib $INSTALLED installée"

echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && node scripts/check-doc-snippets.mjs && node scripts/check-doc-components.mjs && node scripts/check-doc-installs.mjs && node scripts/check-next-unique.mjs && pnpm typecheck && pnpm lint"
else
  CHECK="pnpm check"
fi
if ! bash -c "$CHECK" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|✗ |ERR_|Error:" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -15
  restore; reinstall_old; exit 1
fi
echo "  ✅ check OK"

git add -- "$PKG" pnpm-lock.yaml
git commit -q -F - <<MSG
react-ts-tab-lib $INSTALLED : la librairie n'installe plus vitest chez AKFC

Ses outils de test (vitest, @vitest/ui, @vitest/coverage-v8) sont passés en devDependencies
dans la librairie : les alertes critiques qu'ils apportaient à AKFC disparaissent.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "✅ commit $(git rev-parse --short HEAD)"
echo "== pnpm audit =="
pnpm audit 2>/dev/null | tail -2 || true
echo "Ensuite : redémarrer pnpm dev, puis git push."