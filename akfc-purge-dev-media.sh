#!/usr/bin/env bash
#
# AKFC — PURGE du contenu média de dev (Option B(i)).
#
# Efface TOUT le média (jetable de dev) pour repartir propre : lignes DB +
# binaires Cloudinary/R2 sous les anciennes racines. Le logo AFFICHÉ reste sauf
# (c'est le statique apps/web/public/AKFC_logo.svg, dans git) ; l'asset
# Cloudinary du logo est purgé et SiteSettings.logoAssetId remis à null.
#
# ── PÉRIMÈTRE ──────────────────────────────────────────────────────────────
#   Cloudinary : suppression par préfixe AKFC/{cours,Stages,groups,persos,
#                common_repository}/ (image|video|raw × authenticated|upload|
#                private) + delete_folder. INTACTS : AKFC/avatars, AKFC/bin.
#   R2         : suppression par préfixe des mêmes racines. INTACTS : avatars,
#                bin, ET AKFC/Corbeille/ (corbeille = chantier à part).
#   Base       : SiteSettings.logoAssetId→null ; DELETE PageMediaReference
#                (FK Restrict) ; DELETE MediaAsset (→ cascade GalleryItem +
#                MemberDocument & enfants) ; DELETE FolderLabel des anciennes
#                racines (bin conservé) ; DELETE CloudinaryFolder des anciennes
#                racines. Disciplines/Catégorie/Stages/Events NON touchés.
#
# ── SÉCURITÉ ───────────────────────────────────────────────────────────────
#   DRY-RUN par défaut : n'imprime que ce qui SERAIT supprimé. Pour appliquer :
#     AKFC_PURGE_APPLY=1 bash akfc-purge-dev-media.sh
#   puis taper PURGE à l'invite (ou AKFC_PURGE_YES=1 pour un run non-interactif).
#
# Lancer sur le SERVEUR, env du service akfc chargé (creds Cloudinary + R2) :
#     set -a; source <ton env_file akfc>; set +a
# psql : -U akfc -d akfc_db par défaut (PGUSER/PGDATABASE surchargeables).
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for v in CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET \
         R2_ENDPOINT R2_BUCKET R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY; do
  [ -n "${!v:-}" ] || { echo "ERREUR: variable d'env manquante: $v (charge l'env_file akfc)." >&2; exit 1; }
done

PGUSER_DEF="${PGUSER:-akfc}"
PGDATABASE_DEF="${PGDATABASE:-akfc_db}"
psql_do() { psql -U "$PGUSER_DEF" -d "$PGDATABASE_DEF" "$@"; }

APPLY="${AKFC_PURGE_APPLY:-0}"
MODE="list"; [ "$APPLY" = "1" ] && MODE="delete"

trap 'rm -f ./.akfc-purge.mjs' EXIT

# ── Aperçu base (toujours en lecture) ───────────────────────────────────────
echo "════════ CE QUI SERA SUPPRIMÉ EN BASE ════════"
psql_do -c '
SELECT
 (SELECT count(*) FROM "MediaAsset")                                   AS media_assets,
 (SELECT count(*) FROM "PageMediaReference")                           AS page_refs,
 (SELECT count(*) FROM "GalleryItem")                                  AS gallery_items_cascade,
 (SELECT count(*) FROM "MemberDocument")                               AS member_docs_cascade,
 (SELECT count(*) FROM "FolderLabel"
    WHERE path IN ('"'"'AKFC/cours'"'"','"'"'AKFC/common_repository'"'"','"'"'AKFC/groups'"'"','"'"'AKFC/persos'"'"')) AS folder_labels,
 (SELECT count(*) FROM "CloudinaryFolder"
    WHERE "fullPath" LIKE '"'"'AKFC/cours%'"'"' OR "fullPath" LIKE '"'"'AKFC/Stages%'"'"'
       OR "fullPath" LIKE '"'"'AKFC/groups%'"'"' OR "fullPath" LIKE '"'"'AKFC/persos%'"'"'
       OR "fullPath" = '"'"'AKFC/common_repository'"'"')               AS cloud_folder_rows,
 (SELECT count(*) FROM "SiteSettings" WHERE "logoAssetId" IS NOT NULL) AS logo_ref_to_null;
'

# ── Aperçu / suppression buckets ────────────────────────────────────────────
cat > ./.akfc-purge.mjs <<'NODE'
import { createRequire } from 'node:module';
import path from 'node:path';

function reqFrom(base){ return createRequire(path.resolve(process.cwd(), base)); }
function req(name){
  for (const base of ['packages/backend/_r.cjs','_r.cjs','apps/web/_r.cjs']){
    try { return reqFrom(base)(name); } catch {}
  }
  console.error(`ERREUR: impossible de résoudre '${name}'.`); process.exit(1);
}
const { v2: cloudinary } = req('cloudinary');
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = req('@aws-sdk/client-s3');

const MODE = process.argv[2] === 'delete' ? 'delete' : 'list';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const r2 = new S3Client({
  region: 'auto', endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: process.env.R2_FORCE_PATH_STYLE === 'true',
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const BUCKET = process.env.R2_BUCKET;

// Racines à purger (barre oblique finale = pas de faux positif type AKFC/courses).
const PREFIXES = ['AKFC/cours/','AKFC/Stages/','AKFC/groups/','AKFC/persos/','AKFC/common_repository/'];
const RESOURCE_TYPES = ['image','video','raw'];
const DELIVERY_TYPES = ['authenticated','upload','private'];

async function cloudinaryList() {
  const found = new Set();
  for (const prefix of PREFIXES) {
    for (const resource_type of RESOURCE_TYPES) {
      for (const type of DELIVERY_TYPES) {
        let next;
        do {
          let res;
          try { res = await cloudinary.api.resources({ type, resource_type, prefix, max_results: 500, next_cursor: next }); }
          catch { res = { resources: [], next_cursor: undefined }; }
          for (const r of res.resources ?? []) found.add(`${r.resource_type}|${r.type}|${r.public_id}`);
          next = res.next_cursor;
        } while (next);
      }
    }
  }
  return [...found];
}

async function cloudinaryDelete() {
  let total = 0;
  for (const prefix of PREFIXES) {
    for (const resource_type of RESOURCE_TYPES) {
      for (const type of DELIVERY_TYPES) {
        try {
          const res = await cloudinary.api.delete_resources_by_prefix(prefix, { type, resource_type, invalidate: true });
          const n = Object.keys(res.deleted ?? {}).length;
          if (n) { total += n; console.log(`  Cloudinary supprimé: ${n}  (${resource_type}/${type} ${prefix})`); }
        } catch (e) { console.log(`  (skip ${resource_type}/${type} ${prefix}: ${e?.message ?? e})`); }
      }
    }
  }
  // dossiers vides
  for (const prefix of PREFIXES) {
    const folder = prefix.replace(/\/$/, '');
    try { await cloudinary.api.delete_folder(folder); console.log(`  Cloudinary dossier supprimé: ${folder}`); }
    catch { /* non vide ou inexistant */ }
  }
  return total;
}

async function r2Keys() {
  const keys = [];
  for (const prefix of PREFIXES) {
    let token;
    do {
      const res = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: token }));
      for (const o of res.Contents ?? []) keys.push(o.Key);
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
  }
  return keys;
}

async function r2Delete(keys) {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000).map((Key) => ({ Key }));
    await r2.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: batch, Quiet: true } }));
  }
  return keys.length;
}

if (MODE === 'list') {
  const cld = await cloudinaryList();
  console.log(`\n════════ CLOUDINARY — ${cld.length} ressource(s) à supprimer ════════`);
  cld.sort().forEach((k) => console.log('  ' + k.split('|')[2]));
  const keys = await r2Keys();
  console.log(`\n════════ R2 — ${keys.length} objet(s) à supprimer ════════`);
  keys.sort().forEach((k) => console.log('  ' + k));
  console.log('\n(Corbeille R2 et avatars NON listés — hors périmètre. LECTURE SEULE.)');
} else {
  console.log('\n→ Suppression Cloudinary…');
  const c = await cloudinaryDelete();
  console.log(`  total Cloudinary: ${c}`);
  console.log('→ Suppression R2…');
  const keys = await r2Keys();
  const n = await r2Delete(keys);
  console.log(`  total R2: ${n}`);
}
NODE

echo ""
node ./.akfc-purge.mjs "$MODE"

# ── DRY-RUN : on s'arrête là ────────────────────────────────────────────────
if [ "$APPLY" != "1" ]; then
  echo ""
  echo "════════ DRY-RUN — RIEN N'A ÉTÉ SUPPRIMÉ ════════"
  echo "Pour appliquer : AKFC_PURGE_APPLY=1 bash akfc-purge-dev-media.sh"
  exit 0
fi

# ── Double garde avant destruction ──────────────────────────────────────────
if [ "${AKFC_PURGE_YES:-0}" != "1" ]; then
  echo ""
  echo "⚠️  Ceci va SUPPRIMER DÉFINITIVEMENT le média ci-dessus (DB + Cloudinary + R2)."
  read -r -p "Tape exactement PURGE pour confirmer : " ans
  [ "$ans" = "PURGE" ] || { echo "Annulé."; exit 1; }
fi

echo ""
echo "→ Suppression base (transaction)…"
psql_do -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
UPDATE "SiteSettings" SET "logoAssetId" = NULL WHERE "logoAssetId" IS NOT NULL;
DELETE FROM "PageMediaReference";
DELETE FROM "MediaAsset";
DELETE FROM "FolderLabel"
  WHERE path IN ('AKFC/cours','AKFC/common_repository','AKFC/groups','AKFC/persos');
DELETE FROM "CloudinaryFolder"
  WHERE "fullPath" LIKE 'AKFC/cours%' OR "fullPath" LIKE 'AKFC/Stages%'
     OR "fullPath" LIKE 'AKFC/groups%' OR "fullPath" LIKE 'AKFC/persos%'
     OR "fullPath" = 'AKFC/common_repository';
COMMIT;
SQL
echo "✅ Base purgée."
echo ""
echo "✅ PURGE TERMINÉE. Buckets nettoyés, base nettoyée (logo statique intact)."
echo "   Prochaine étape : le flip code (slugs EN), puis tu reseedes le contenu."