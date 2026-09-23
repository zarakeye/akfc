#!/usr/bin/env bash
# AKFC — PREUVE LOCALE (v2) que apps/web/middleware.ts est du code mort. Ne modifie aucun fichier source.
# v2 : les empreintes discriminantes ne portent plus que sur ce que Next ENREGISTRE comme middleware
# (entrée /_middleware des manifestes + middleware.js). Les routes compilées contiennent leur propre
# chemin : ces auto-références sont listées à part comme « attendues » (faux positifs de la v1).
# AKFC_SKIP_BUILD=1 : réutilise le build existant (OK si tu viens de builder le code actuel).
# Usage : bash verify-dead-middleware-local.sh
set -uo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }

echo "== 1. STATIQUE (repo) =="
ls apps/web/middleware.ts apps/web/src/proxy.ts apps/web/src/middleware.ts apps/web/proxy.ts 2>/dev/null | sed 's/^/  présent : /'
echo "  imports d'un module nommé 'middleware' (hors trpc/middleware) :"
grep -rnE "from ['\"][^'\"]*/middleware['\"]" apps packages --include=*.ts --include=*.tsx 2>/dev/null | grep -v node_modules | grep -v 'trpc/middleware' | sed 's/^/    /' || echo "    (aucun)"
echo "  → cible de chaque import (le fichier importé existe-t-il, est-ce apps/web/middleware.ts ?) :"
grep -rnE "from ['\"][^'\"]*/middleware['\"]" apps packages --include=*.ts --include=*.tsx 2>/dev/null | grep -v node_modules | grep -v 'trpc/middleware' | while IFS=: read -r file line rest; do
  spec=$(echo "$rest" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/")
  echo "    $file importe '$spec'"
done
echo "  références à page-access (hors middleware.ts et la route) :"
grep -rln 'page-access' apps packages --include=*.ts --include=*.tsx 2>/dev/null | grep -v node_modules | grep -vE 'apps/web/middleware.ts|api/page-access/route.ts' | sed 's/^/    /' || true
echo "  références à en-construction (hors middleware.ts, la page, la route) :"
grep -rln 'en-construction' apps packages --include=*.ts --include=*.tsx 2>/dev/null | grep -v node_modules | grep -vE 'apps/web/middleware.ts|en-construction/page.tsx|api/page-access/route.ts' | sed 's/^/    /' || true

echo
if [ "${AKFC_SKIP_BUILD:-0}" = "1" ]; then
  echo "== 2. BUILD : réutilisé (AKFC_SKIP_BUILD=1) =="
else
  echo "== 2. BUILD DE PRODUCTION (quelques minutes)… =="
  if ! pnpm --filter web build > /tmp/akfc_verify_build.log 2>&1; then
    echo "  ❌ build ÉCHOUÉ :"; tail -15 /tmp/akfc_verify_build.log
    echo "VERDICT: INCONCLUSIF — pas de build, pas de preuve"; exit 1
  fi
  echo "  ✅ build OK"
fi

echo
echo "== 3. SCAN DU BUILD =="
node - <<'JS'
const fs = require("fs"), path = require("path");
const base = "apps/web/.next/server";
if (!fs.existsSync(base)) { console.log("  " + base + " introuvable"); console.log("VERDICT: INCONCLUSIF"); process.exit(0); }
const rd = p => fs.readFileSync(p, "utf8");
try {

// Empreintes. DEAD_MATCHER est unique au fichier mort (aucune route/page ne le contient).
const DEAD_MATCHER = /\(\?!api\|_next\/static/;
const DEAD_STR = [/["'`]\/api\/page-access["'`]/, /["'`]\/en-construction["'`]/];
const LIVE = /\/profil\/:path\*/;

// a) entrées middleware enregistrées dans les manifestes
let liveReg = false, deadReg = false;
const fc = path.join(base, "functions-config-manifest.json");
if (fs.existsSync(fc)) {
  let j; try { j = JSON.parse(rd(fc)); } catch { j = null; }
  if (!j) { const t = rd(fc); const l = LIVE.test(t), d = DEAD_MATCHER.test(t); liveReg ||= l; deadReg ||= d; console.log(`  functions-config ILLISIBLE en JSON → scan texte : témoin=${l} matcher-mort=${d}`); }
  const fns = j ? (j.functions || j) : {};
  const keys = Object.keys(fns);
  console.log(`  functions-config : ${keys.length} entrées`);
  const routeHits = keys.filter(k => /page-access|en-construction/.test(k));
  if (routeHits.length) console.log(`    clés de ROUTE correspondantes (attendu, auto-référence) : ${routeHits.join(", ")}`);
  for (const k of keys.filter(k => /middleware|proxy/i.test(k))) {
    const t = JSON.stringify(fns[k]);
    const l = LIVE.test(t), d = DEAD_MATCHER.test(t) || DEAD_STR.some(r => r.test(t));
    liveReg ||= l; deadReg ||= d;
    console.log(`    entrée middleware "${k}" : témoin=${l} empreinte-morte=${d}`);
    console.log(`      ${t.slice(0, 300)}`);
  }
}
const mm = path.join(base, "middleware-manifest.json");
if (fs.existsSync(mm)) {
  const t = JSON.stringify(JSON.parse(rd(mm)).middleware || {});
  const l = LIVE.test(t), d = DEAD_MATCHER.test(t);
  liveReg ||= l; deadReg ||= d;
  console.log(`  middleware-manifest (edge) : témoin=${l} empreinte-morte=${d}`);
}

// b) le bundle middleware compilé + fichiers qu'il charge directement
const mw = ["middleware.js", "proxy.js"].map(f => path.join(base, f)).filter(fs.existsSync);
const mwFiles = new Set(mw);
for (const f of mw) for (const m of rd(f).matchAll(/require\(["'](\.{1,2}\/[^"']+)["']\)/g)) {
  const p = path.resolve(path.dirname(f), m[1]);
  for (const c of [p, p + ".js"]) if (fs.existsSync(c) && fs.statSync(c).isFile()) mwFiles.add(c);
}
let liveBundle = false, deadBundle = [];
for (const f of mwFiles) {
  const t = rd(f);
  if (LIVE.test(t)) liveBundle = true;
  const hits = [DEAD_MATCHER, ...DEAD_STR].filter(r => r.test(t)).map(r => r.source);
  if (hits.length) deadBundle.push(`${f} [${hits.join(" | ")}]`);
}
console.log(`  bundle middleware : ${[...mwFiles].map(f => path.relative(base, f)).join(", ") || "(aucun)"}`);
console.log(`    témoin=${liveBundle}  empreinte-morte=${deadBundle.length ? "\n      " + deadBundle.join("\n      ") : "aucune"}`);

// c) matcher unique du mort n'importe où dans .next/server (filet large)
let anywhere = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.(js|json)$/.test(p) && DEAD_MATCHER.test(rd(p))) anywhere.push(path.relative(base, p));
}})(base);
console.log(`  matcher unique du fichier mort, partout : ${anywhere.length ? anywhere.join(", ") : "absent"}`);

const live = liveReg || liveBundle;
const dead = deadReg || deadBundle.length > 0 || anywhere.length > 0;
console.log("");
if (dead) console.log("VERDICT: VIVANT — code du middleware.ts présent dans le middleware enregistré : NE PAS supprimer");
else if (!live) console.log("VERDICT: INCONCLUSIF — témoin absent du middleware enregistré : NE PAS supprimer");
else console.log("VERDICT: MORT CONFIRMÉ — le middleware enregistré est src/proxy.ts ; apps/web/middleware.ts n'est pas compilé");
} catch (e) {
  console.log("  erreur inattendue : " + (e && e.message));
  console.log("VERDICT: INCONCLUSIF — erreur pendant le scan : NE PAS supprimer");
}
JS