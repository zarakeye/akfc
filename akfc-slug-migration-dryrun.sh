#!/usr/bin/env bash
#
# AKFC — Migration slug EN, PHASE 1 : DIAGNOSTIC EN LECTURE SEULE.
#
# N'ÉCRIT RIEN. Ni sur Cloudinary, ni sur R2, ni en base. Il :
#   1. lit les MediaAsset via psql (source de vérité) ;
#   2. calcule le chemin cible avec TA fonction slugify (parité upload) :
#        - racines : cours→courses, Stages/stages→seminars,
#          persos→personal-spaces, groups→collaborative-group-spaces,
#          common_repository→common-repository (events/avatars/bin inchangés) ;
#        - segments intermédiaires : slugify(strict) (idempotent sur les slugs
#          déjà propres et les segments -cuid) ;
#        - nom de fichier : buildUploadFileName (base slugifiée + extension) ;
#        - Cloudinary : SOURCE = publicId réel, CIBLE = transform(fullPath)
#          (réconcilie le cas Taïchi Chuan↔dabakwondo, défaut #2) en
#          PRÉSERVANT la forme avec/sans extension de la source ;
#   3. VÉRIFIE l'existence de chaque binaire source sur son backend
#      (Cloudinary api.resource image|video|raw × avec/sans ext ; R2 HeadObject).
#
# Défauts appliqués : l'asset R2 sans binaire (commande-besson) sera SIGNALÉ
# MISSING → l'APPLY le sautera (#1) ; la corbeille R2 (Corbeille/.trash) est
# hors périmètre (#3, non listée ici).
#
# ─── OÙ LE LANCER ─────────────────────────────────────────────────────────
# Les vrais assets sont sur le Cloudinary + R2 de PROD. Lance-le donc là où ces
# creds existent — typiquement le SERVEUR, avec l'env du service akfc chargé :
#     set -a; source /chemin/vers/env_file_akfc; set +a
#     bash akfc-slug-migration-dryrun.sh
# (le même env_file que `env_file:` du service akfc dans le compose.)
#
# Variables requises : CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET,
# R2_ENDPOINT/BUCKET/ACCESS_KEY_ID/SECRET_ACCESS_KEY.
# psql : par défaut `-U akfc -d akfc_db` (surchargeable : PGUSER / PGDATABASE,
# ou exporte DATABASE_URL et le script l'utilisera).
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

MISSING_ENV=0
for v in CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET \
         R2_ENDPOINT R2_BUCKET R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY; do
  if [ -z "${!v:-}" ]; then echo "ERREUR: variable d'env manquante: $v" >&2; MISSING_ENV=1; fi
done
if [ "$MISSING_ENV" = "1" ]; then
  echo "→ Charge l'env du service akfc : set -a; source <env_file>; set +a" >&2
  exit 1
fi

# La résolution des deps (slugify / cloudinary / @aws-sdk/client-s3) est faite
# dans le script node via createRequire : elle REMONTE la hiérarchie de
# node_modules (symlinks + store .pnpm inclus), ce qu'un simple test `-d` ne
# voit pas. Un message clair est émis là-bas si l'une manque vraiment.

PGUSER_DEF="${PGUSER:-akfc}"
PGDATABASE_DEF="${PGDATABASE:-akfc_db}"
ASSETS_TSV="$(mktemp -t akfc_assets.XXXXXX)"
trap 'rm -f "$ASSETS_TSV" ./.akfc-slug-dryrun.mjs' EXIT

echo "→ Lecture des MediaAsset (lecture seule)…"
SQL='SELECT "fullPath", COALESCE("publicId", '"'"''"'"'), COALESCE(format, '"'"''"'"'), status FROM "MediaAsset" ORDER BY "fullPath";'
# On N'utilise PAS DATABASE_URL : au format Prisma il porte `?schema=public`
# (rejeté par psql/libpq) et son hôte est souvent un nom de service compose
# injoignable depuis le shell. On passe par -U/-d (la voie déjà validée).
# Pour forcer une URL psql-compatible : exporte AKFC_PSQL_URL.
if [ -n "${AKFC_PSQL_URL:-}" ]; then
  psql "$AKFC_PSQL_URL" -t -A -F $'\t' -c "$SQL" > "$ASSETS_TSV"
else
  psql -U "$PGUSER_DEF" -d "$PGDATABASE_DEF" -t -A -F $'\t' -c "$SQL" > "$ASSETS_TSV"
fi
echo "  $(grep -c . "$ASSETS_TSV") lignes lues."

cat > ./.akfc-slug-dryrun.mjs <<'NODE'
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

// Résolution robuste : on tente plusieurs bases (backend, racine, web) car pnpm
// peut symlinker/hoister les deps différemment selon l'install.
function reqFrom(base) { return createRequire(path.resolve(process.cwd(), base)); }
function req(name) {
  for (const base of ['packages/backend/_r.cjs', '_r.cjs', 'apps/web/_r.cjs']) {
    try { return reqFrom(base)(name); } catch { /* base suivante */ }
  }
  console.error(`ERREUR: impossible de résoudre '${name}'. Lance-moi depuis la racine du repo, sur une install complète (pnpm install).`);
  process.exit(1);
}
const slugifyMod = req('slugify');
const slugify = slugifyMod.default ?? slugifyMod;
const { v2: cloudinary } = req('cloudinary');
const { S3Client, HeadObjectCommand } = req('@aws-sdk/client-s3');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: process.env.R2_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const R2_BUCKET = process.env.R2_BUCKET;

const ROOT_MAP = {
  cours: 'courses',
  Stages: 'seminars',
  stages: 'seminars',
  persos: 'personal-spaces',
  groups: 'collaborative-group-spaces',
  common_repository: 'common-repository',
  // inchangés (mais explicités) :
  events: 'events', avatars: 'avatars', bin: 'bin',
};

const SLUG = { lower: true, strict: true };
const slugSeg = (s) => slugify(s, SLUG);

// Réplique EXACTE de buildUploadFileName (base slugifiée + ext minuscule).
function buildUploadFileName(name) {
  const dot = name.lastIndexOf('.');
  const hasExt = dot > 0 && dot < name.length - 1;
  const base = hasExt ? name.slice(0, dot) : name;
  const ext = hasExt ? name.slice(dot).toLowerCase() : '';
  const safe = slugSeg(base) || 'fichier';
  return `${safe}${ext}`;
}

function lastHasExt(p) {
  const last = p.slice(p.lastIndexOf('/') + 1);
  const dot = last.lastIndexOf('.');
  return dot > 0 && dot < last.length - 1;
}
function stripExtLast(p) {
  const i = p.lastIndexOf('/');
  const dir = p.slice(0, i + 1);
  const last = p.slice(i + 1);
  const dot = last.lastIndexOf('.');
  return dot > 0 ? dir + last.slice(0, dot) : p;
}

// Transforme un chemin LOGIQUE (fullPath) : AKFC / root / mids… / fichier.
function transformFullPath(fp) {
  const parts = fp.split('/');
  if (parts.length < 2) return fp;
  const appRoot = parts[0];                 // AKFC — identité fixe, inchangée
  const root = ROOT_MAP[parts[1]] ?? parts[1];
  const mids = parts.slice(2, -1).map(slugSeg);
  const file = buildUploadFileName(parts[parts.length - 1]);
  return [appRoot, root, ...mids, file].join('/');
}

async function cloudinaryExists(publicId) {
  const forms = [publicId, stripExtLast(publicId)].filter((v, i, a) => a.indexOf(v) === i);
  for (const form of forms) {
    for (const rt of ['image', 'video', 'raw']) {
      try {
        await cloudinary.api.resource(form, { type: 'authenticated', resource_type: rt });
        return { found: true, rt, form };
      } catch { /* 404 sur cette combinaison → on continue */ }
    }
  }
  return { found: false };
}

async function r2Exists(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch { return false; }
}

const rows = fs.readFileSync(process.argv[2], 'utf8')
  .split('\n').map((l) => l.replace(/\r$/, '')).filter(Boolean)
  .map((l) => { const [fullPath, publicId, format, status] = l.split('\t'); return { fullPath, publicId, format, status }; });

let cloudCount = 0, r2Count = 0, missing = 0, mismatch = 0, changedName = 0;
const lines = [];

for (const a of rows) {
  const backend = a.publicId ? 'cloudinary' : 'r2';
  const tgtFull = transformFullPath(a.fullPath);
  let src, tgt, exists;

  if (backend === 'cloudinary') {
    cloudCount++;
    src = a.publicId;
    // cible = transform(fullPath), forme d'extension alignée sur la source
    tgt = lastHasExt(a.publicId) ? tgtFull : stripExtLast(tgtFull);
    const e = await cloudinaryExists(a.publicId);
    exists = e.found ? `OK (${e.rt})` : 'MANQUANT';
    if (!e.found) missing++;
    // mismatch fullPath↔publicId (ex. Taïchi Chuan / dabakwondo)
    const pubFolder = a.publicId.slice(0, a.publicId.lastIndexOf('/'));
    const fullFolder = a.fullPath.slice(0, a.fullPath.lastIndexOf('/'));
    if (transformFullPath(pubFolder + '/x') !== transformFullPath(fullFolder + '/x')) mismatch++;
  } else {
    r2Count++;
    src = a.fullPath;
    tgt = tgtFull;
    const ok = await r2Exists(a.fullPath);
    exists = ok ? 'OK' : 'MANQUANT';
    if (!ok) missing++;
  }

  if (src !== tgt) changedName++;
  lines.push({ backend, status: a.status, exists, src, tgt, changed: src !== tgt });
}

const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
console.log('');
console.log('════════ PLAN DE MIGRATION (LECTURE SEULE — AUCUNE ÉCRITURE) ════════');
for (const l of lines) {
  const flag = l.exists.startsWith('MANQUANT') ? ' ⚠️' : (l.changed ? '' : '  (inchangé)');
  console.log(`\n[${pad(l.backend, 10)}] ${pad(l.status, 9)} ${l.exists}${flag}`);
  console.log(`   src: ${l.src}`);
  console.log(`   →    ${l.tgt}`);
}
console.log('\n──────── RÉSUMÉ ────────');
console.log(`  total assets        : ${rows.length}`);
console.log(`  Cloudinary          : ${cloudCount}`);
console.log(`  R2                  : ${r2Count}`);
console.log(`  binaires MANQUANTS  : ${missing}   (seront SAUTÉS par l'APPLY)`);
console.log(`  mismatch fullPath↔publicId : ${mismatch}   (réconciliés sur transform(fullPath))`);
console.log(`  chemins qui changent: ${changedName}`);
console.log('\nRien n\'a été modifié. Colle cette sortie pour valider avant l\'APPLY.');
NODE

echo "→ Diagnostic (Cloudinary + R2, lecture seule)…"
node ./.akfc-slug-dryrun.mjs "$ASSETS_TSV"