#!/usr/bin/env bash
# AKFC — Garde : fichiers de convention Next placés au mauvais endroit = ÉCHEC du pnpm check.
# Next ne lit middleware/proxy/instrumentation QUE dans le dossier parent de `app/` (ici apps/web/src/).
# Placés ailleurs, ils sont IGNORÉS en silence (cas vécus : instrumentation.ts, middleware.ts).
# La garde échoue aussi si middleware ET proxy coexistent ; elle avertit si `middleware` est utilisé
# (déprécié en Next 16 → `proxy`).
# Usage : bash apply-guard-next-conventions.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
GUARD="scripts/check-next-conventions.mjs"
[ -f "$GUARD" ] && grep -q 'check-next-conventions' package.json && { echo "— déjà appliqué"; exit 0; }
mkdir -p scripts

cat > "$GUARD" <<'JS'
#!/usr/bin/env node
// Garde des fichiers de convention Next (lancée par `pnpm check`).
// Next ne les lit que dans le dossier parent de `app/` : apps/web/src/ si l'app vit dans src/,
// sinon apps/web/. Ailleurs, ils sont ignorés SANS avertissement — d'où cette garde.
import { existsSync } from "node:fs";
import { join } from "node:path";

const WEB = "apps/web";
const NAMES = ["middleware", "proxy", "instrumentation", "instrumentation-client"];
const EXTS = ["ts", "tsx", "js", "mjs", "mts"];
const find = (dir, name) => EXTS.map((e) => join(dir, `${name}.${e}`)).filter(existsSync);

const srcLayout = existsSync(join(WEB, "src", "app"));
const active = srcLayout ? join(WEB, "src") : WEB;
const inactive = srcLayout ? WEB : join(WEB, "src");

const errors = [];
const warnings = [];

for (const name of NAMES) {
  for (const f of find(inactive, name)) {
    errors.push(`${f} est IGNORÉ par Next (l'app vit dans ${active}/app) → déplace-le dans ${active}/ ou supprime-le.`);
  }
}
const mw = find(active, "middleware");
const px = find(active, "proxy");
if (mw.length && px.length) errors.push(`middleware ET proxy coexistent dans ${active}/ : n'en garder qu'un (proxy en Next 16).`);
else if (mw.length) warnings.push(`${mw[0]} : 'middleware' est déprécié en Next 16 → renommer en proxy (fonction exportée 'proxy').`);

for (const w of warnings) console.warn(`⚠ conventions Next : ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`❌ conventions Next : ${e}`);
  process.exit(1);
}
console.log(`✓ conventions Next : fichiers au bon endroit (${active}/)`);
JS
echo "  ok  $GUARD"

python3 - <<'PY'
import pathlib
p = pathlib.Path("package.json"); s = p.read_text(encoding="utf-8")
old = '"check": "pnpm clean && '
assert s.count(old) == 1, f"ancre script check ×{s.count(old)}"
p.write_text(s.replace(old, '"check": "node scripts/check-next-conventions.mjs && pnpm clean && '), encoding="utf-8")
print("  ok  package.json : garde insérée en tête de « check »")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
echo "typecheck via: pnpm check (garde incluse)"
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ ÉCHEC — pas de commit :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
grep -m1 'conventions Next' /tmp/akfc_tc.log || true
echo "✅ check OK"; git add -A
git commit -m "chore: garde pnpm check — fichiers de convention Next au mauvais endroit (ignorés en silence)" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }