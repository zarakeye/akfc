#!/usr/bin/env bash
# AKFC — recopie, UNE fois, les photos de dev du conteneur MinIO « akfc-storage-local » vers le
# SeaweedFS de docker-compose.dev.yml. Mêmes buckets, mêmes clés : la base locale (akfc-db-local)
# retrouve chaque fichier, rien à renvoyer. Puis compte ce que contient l'ancien volume MinIO du compose
# (pour décider en connaissance de cause de le supprimer).
#
# Sur le MAC uniquement. Tout reste sur le Mac (127.0.0.1) ; la production n'est pas concernée.
# Aucun secret affiché. Ne modifie pas le repo, ne commite rien, ne supprime rien.
# Relançable : un fichier déjà copié (même taille) est sauté.
# Prérequis : apply-fix-seaweedfs.sh, apply-docs-seaweedfs.sh, apply-fix-base-locale-seaweedfs.sh,
#             puis pnpm dev:infra (SeaweedFS sur 127.0.0.1:9200).
# Ensuite : bash revenir-base-locale.sh (pnpm dev arrêté) branche le site de dev sur SeaweedFS.
# Usage (racine du repo) : bash akfc-recopier-stockage-dev.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
[ "$(uname)" = "Darwin" ] || { echo "❌ ce script est pour le Mac (poste de dev), pas pour le serveur. Rien n'a été touché."; exit 1; }
docker info >/dev/null 2>&1 || { echo "❌ Docker ne répond pas (Docker Desktop est-il lancé ?)"; exit 1; }
grep -qF "photos : SeaweedFS" revenir-base-locale.sh || { echo "❌ lancer d'abord apply-fix-base-locale-seaweedfs.sh"; exit 1; }

ST=akfc-storage-local
OLD_VOL=akfc-dev_akfc-dev-storage
TMP_NAME=akfc-minio-ancien
TMP_PORT=9210

# 1. SeaweedFS (destination) tourne ?
curl -fsS -o /dev/null http://127.0.0.1:9200/healthz 2>/dev/null || {
  echo "❌ SeaweedFS ne répond pas sur 127.0.0.1:9200 → lancer d'abord : pnpm dev:infra"; exit 1; }

# 2. La source : le conteneur des photos de dev
docker container inspect "$ST" >/dev/null 2>&1 || { echo "❌ pas de conteneur $ST sur ce Mac : rien à recopier."; exit 1; }
docker start "$ST" >/dev/null
envof() { docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$1" | sed -n "s/^$2=//p"; }
SRC_PORT=$(docker inspect -f '{{(index (index .HostConfig.PortBindings "9000/tcp") 0).HostPort}}' "$ST")
for i in $(seq 1 30); do
  curl -fsS -o /dev/null "http://127.0.0.1:$SRC_PORT/minio/health/live" 2>/dev/null && break; sleep 1
done
curl -fsS -o /dev/null "http://127.0.0.1:$SRC_PORT/minio/health/live" 2>/dev/null || {
  echo "❌ $ST ne répond pas. Dernières lignes :"; docker logs "$ST" 2>&1 | tail -6; exit 1; }
echo "  source : $ST (127.0.0.1:$SRC_PORT)"

# 3. La copie (Node + @aws-sdk/client-s3 du repo). Identifiants passés par l'environnement, jamais affichés.
SRC="http://127.0.0.1:$SRC_PORT" SRC_KEY="$(envof "$ST" MINIO_ROOT_USER)" SRC_SECRET="$(envof "$ST" MINIO_ROOT_PASSWORD)" \
DST="http://127.0.0.1:9200" DST_KEY=akfc-dev DST_SECRET=akfc-dev-secret \
node --input-type=module - <<'JS'
import { S3Client, ListBucketsCommand, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
const E = process.env;
for (const u of [E.SRC, E.DST]) if (new URL(u).hostname !== "127.0.0.1") { console.log("❌ adresse non locale refusée :", u); process.exit(1); }
const client = (endpoint, k, s) => new S3Client({ region: "auto", endpoint, forcePathStyle: true,
  credentials: { accessKeyId: k, secretAccessKey: s },
  requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED" });
const src = client(E.SRC, E.SRC_KEY, E.SRC_SECRET), dst = client(E.DST, E.DST_KEY, E.DST_SECRET);
async function list(c, Bucket) {
  const all = []; let ContinuationToken;
  do {
    const r = await c.send(new ListObjectsV2Command({ Bucket, ContinuationToken }));
    for (const o of r.Contents ?? []) all.push({ Key: o.Key, Size: o.Size ?? 0 });
    ContinuationToken = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return all;
}
const mo = (xs) => (xs.reduce((n, o) => n + o.Size, 0) / 1e6).toFixed(1);
const buckets = ((await src.send(new ListBucketsCommand({}))).Buckets ?? []).map((b) => b.Name);
console.log(`  buckets de la source : ${buckets.join(", ") || "(aucun)"}`);
let bad = 0;
for (const Bucket of buckets) {
  try { await dst.send(new HeadBucketCommand({ Bucket })); } catch { await dst.send(new CreateBucketCommand({ Bucket })); }
  const objects = await list(src, Bucket);
  let copied = 0, skipped = 0, failed = 0;
  for (const o of objects) {
    try {
      const h = await dst.send(new HeadObjectCommand({ Bucket, Key: o.Key })).catch(() => null);
      if (h && h.ContentLength === o.Size) { skipped++; continue; }
      const g = await src.send(new GetObjectCommand({ Bucket, Key: o.Key }));
      const Body = Buffer.from(await g.Body.transformToByteArray());
      await dst.send(new PutObjectCommand({ Bucket, Key: o.Key, Body, ContentLength: Body.length,
        ContentType: g.ContentType, CacheControl: g.CacheControl, ContentDisposition: g.ContentDisposition, Metadata: g.Metadata }));
      copied++;
      if (copied % 50 === 0) console.log(`    … ${copied} copié(s)`);
    } catch (e) { failed++; if (failed <= 5) console.log(`  ⚠ ${Bucket}/${o.Key} : ${e.name ?? e}`); }
  }
  const after = new Map((await list(dst, Bucket)).map((o) => [o.Key, o.Size]));
  const missing = objects.filter((o) => after.get(o.Key) !== o.Size);
  bad += missing.length;
  console.log(`  ${Bucket} : copiés ${copied} · déjà présents ${skipped} · échecs ${failed} → contrôle ${objects.length - missing.length}/${objects.length} identiques en taille (${mo(objects)} Mo)`);
  if (missing.length) console.log("  ❌ manquants, par exemple :", missing.slice(0, 3).map((o) => o.Key).join(", "));
}
process.exit(bad ? 1 : 0);
JS
echo "✅ photos de dev recopiées dans SeaweedFS"

# 4. Preuve avant ménage : que contient l'ancien volume MinIO du compose ? (lecture, puis conteneur supprimé)
if docker volume inspect "$OLD_VOL" >/dev/null 2>&1; then
  IMG=$(docker inspect -f '{{.Config.Image}}' "$ST")
  cleanup(){ docker rm -f "$TMP_NAME" >/dev/null 2>&1 || true; }
  trap cleanup EXIT
  docker rm -f "$TMP_NAME" >/dev/null 2>&1 || true
  docker run -d --name "$TMP_NAME" -p "127.0.0.1:$TMP_PORT:9000" -v "$OLD_VOL:/data" \
    -e MINIO_ROOT_USER=akfc-dev -e MINIO_ROOT_PASSWORD=akfc-dev-secret "$IMG" server /data >/dev/null
  for i in $(seq 1 30); do curl -fsS -o /dev/null "http://127.0.0.1:$TMP_PORT/minio/health/live" 2>/dev/null && break; sleep 1; done
  SRC="http://127.0.0.1:$TMP_PORT" node --input-type=module - <<'JS' || echo "  (l'ancien volume n'a pas pu être lu : on le garde, sans décider)"
import { S3Client, ListBucketsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
const c = new S3Client({ region: "auto", endpoint: process.env.SRC, forcePathStyle: true,
  credentials: { accessKeyId: "akfc-dev", secretAccessKey: "akfc-dev-secret" } });
const buckets = ((await c.send(new ListBucketsCommand({}))).Buckets ?? []).map((b) => b.Name);
const parts = [];
for (const Bucket of buckets) {
  let n = 0, size = 0, ContinuationToken;
  do { const r = await c.send(new ListObjectsV2Command({ Bucket, ContinuationToken }));
       for (const o of r.Contents ?? []) { n++; size += o.Size ?? 0; }
       ContinuationToken = r.IsTruncated ? r.NextContinuationToken : undefined; } while (ContinuationToken);
  parts.push(`${Bucket} : ${n} fichier(s), ${(size / 1e6).toFixed(1)} Mo`);
}
console.log(`  ancien volume du compose (${buckets.length} bucket(s)) : ${parts.join(" · ") || "vide"}`);
JS
fi

echo "Ensuite :"
echo "  1. pnpm dev arrêté → bash revenir-base-locale.sh   (le site de dev passe sur SeaweedFS)"
echo "  2. pnpm dev → vérifier bibliothèque, galeries, avatars ; puis http://localhost:9201"
echo "  3. Copie-moi les lignes de ce script qui commencent par le nom d'un bucket et par « ancien volume » :"
echo "     on décidera ensemble du ménage (rien n'est supprimé d'ici là)."