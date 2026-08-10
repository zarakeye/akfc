#!/usr/bin/env bash
#
# AKFC — Fix : miniature vidéo (poster) qui retombe sur l'image de secours.
#
# `buildVideoPosterUrl` recevait le public_id AVEC son extension (.mp4) et lui
# accolait le format `jpg` → `REC-….mp4.jpg`, que Cloudinary renvoie en 404
# (poster remplacé par le générique). `buildAuthenticatedUrl` gérait déjà ce
# cas (d'où la vidéo qui joue), pas le poster. On retire l'extension du
# public_id : chemin nu + format `jpg`.
#
# Diagnostiqué via les logs `[poster] url=…mp4.jpg  status= 404`.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-fix-video-poster.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-fix-video-poster.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "cleanPublicId" in s:
    print("déjà appliqué — rien à faire"); sys.exit(0)

OLD = r'''  const sizing = transformations[variant] ?? {};
  return cloudinary.url(publicId, {
    resource_type: "video",'''
NEW = r'''  const sizing = transformations[variant] ?? {};
  // Le public_id d'une vidéo arrive souvent avec son extension (.mp4) dans le
  // chemin ; Cloudinary lui accolerait le format `jpg` → `…mp4.jpg`, qui
  // renvoie 404 (poster remplacé par l'image de secours). On retire
  // l'extension : le public_id de livraison est le chemin nu, le format `jpg`.
  const cleanPublicId = publicId.replace(/\.[^./]+$/, "");
  return cloudinary.url(cleanPublicId, {
    resource_type: "video",'''
assert s.count(OLD) == 1, "ancre buildVideoPosterUrl introuvable — abandon"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8")
print("buildVideoPosterUrl : extension retirée du public_id")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "fix(media): poster vidéo 404 — retirer l'extension du public_id (buildVideoPosterUrl)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi