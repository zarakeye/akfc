#!/usr/bin/env bash
#
# AKFC — INVENTAIRE CLOUDINARY (lecture seule).
#
# N'ÉCRIT RIEN. Liste ce que Cloudinary détient RÉELLEMENT sous AKFC/ :
# public_id, asset_folder, resource_type, type (delivery), format. Sert à
# confronter la base (publicId stockés) à la réalité — pour comprendre les 20
# « MANQUANT » du dry-run (espaces/accents dans les ids ? assets cassés ?).
#
# Deux voies, dans l'ordre :
#   1. Search API (`cloudinary.search`) — la plus fiable, tous types confondus ;
#   2. si indisponible (compte sans Search) → repli `api.resources` en bouclant
#      resource_type (image|video|raw) × type (authenticated|upload|private),
#      par préfixe public_id ET par asset_folder (dynamic folders).
#
# Lance-le là où vivent les creds Cloudinary de PROD (le serveur), env chargé :
#     set -a; source <ton env_file akfc>; set +a
#     bash akfc-cloudinary-inventory.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for v in CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET; do
  [ -n "${!v:-}" ] || { echo "ERREUR: variable d'env manquante: $v (charge l'env_file akfc)." >&2; exit 1; }
done

trap 'rm -f ./.akfc-cld-inv.mjs' EXIT

cat > ./.akfc-cld-inv.mjs <<'NODE'
import { createRequire } from 'node:module';
import path from 'node:path';

function reqFrom(base) { return createRequire(path.resolve(process.cwd(), base)); }
function req(name) {
  for (const base of ['packages/backend/_r.cjs', '_r.cjs', 'apps/web/_r.cjs']) {
    try { return reqFrom(base)(name); } catch { /* base suivante */ }
  }
  console.error(`ERREUR: impossible de résoudre '${name}'. Lance-moi depuis la racine du repo.`);
  process.exit(1);
}
const { v2: cloudinary } = req('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const pad = (s, n) => (String(s ?? '') + ' '.repeat(n)).slice(0, n);
function printRow(r) {
  console.log(
    `${pad(r.resource_type, 6)} ${pad(r.type, 13)} ${pad(r.format, 5)} ` +
    `af=${pad(r.asset_folder, 40)} ${r.public_id}`,
  );
}

async function viaSearch() {
  const rows = [];
  let cursor;
  do {
    let q = cloudinary.search
      .expression('public_id:AKFC/* OR asset_folder:AKFC/*')
      .with_field('asset_folder')
      .max_results(200);
    if (cursor) q = q.next_cursor(cursor);
    const res = await q.execute();
    for (const r of res.resources ?? []) rows.push(r);
    cursor = res.next_cursor;
  } while (cursor);
  return rows;
}

async function viaResources() {
  const rows = [];
  const seen = new Set();
  for (const resource_type of ['image', 'video', 'raw']) {
    for (const type of ['authenticated', 'upload', 'private']) {
      // (a) par préfixe de public_id (fixed folders)
      let next;
      do {
        let res;
        try {
          res = await cloudinary.api.resources({
            type, resource_type, prefix: 'AKFC/', max_results: 500, next_cursor: next,
          });
        } catch { res = { resources: [], next_cursor: undefined }; }
        for (const r of res.resources ?? []) {
          const k = `${r.resource_type}|${r.type}|${r.public_id}`;
          if (!seen.has(k)) { seen.add(k); rows.push(r); }
        }
        next = res.next_cursor;
      } while (next);
      // (b) par asset_folder (dynamic folders) — best-effort
      try {
        let c;
        do {
          const res = await cloudinary.api.resources_by_asset_folder('AKFC', {
            resource_type, type, max_results: 500, next_cursor: c,
          });
          for (const r of res.resources ?? []) {
            const k = `${r.resource_type}|${r.type}|${r.public_id}`;
            if (!seen.has(k)) { seen.add(k); rows.push(r); }
          }
          c = res.next_cursor;
        } while (c);
      } catch { /* méthode indispo selon compte — on ignore */ }
    }
  }
  return rows;
}

let rows;
try {
  rows = await viaSearch();
  console.log(`# Source : Search API — ${rows.length} ressources sous AKFC/\n`);
} catch (e) {
  console.log(`# Search API indisponible (${e?.message ?? e}) → repli api.resources\n`);
  rows = await viaResources();
  console.log(`# Source : api.resources — ${rows.length} ressources sous AKFC/\n`);
}

rows.sort((a, b) => String(a.public_id).localeCompare(String(b.public_id)));
console.log(`${pad('rtype', 6)} ${pad('type', 13)} ${pad('fmt', 5)} ${pad('asset_folder', 43)} public_id`);
console.log('─'.repeat(110));
for (const r of rows) printRow(r);
console.log(`\n# Total : ${rows.length} ressources. (lecture seule — rien modifié)`);
NODE

echo "→ Inventaire Cloudinary (lecture seule)…"
node ./.akfc-cld-inv.mjs