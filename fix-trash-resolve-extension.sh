#!/usr/bin/env bash
#
# AKFC — fix corbeille (trash.trashToBin 500 « Aucun emplacement connu »).
#
# CAUSE (observée) : resolvePhysicalLocations fait un match EXACT
# `mediaAsset.fullPath IN candidats`. Or le finder envoie le node.path SANS
# extension (public_id Cloudinary), alors que MediaAsset.fullPath PORTE
# l'extension (.jpg) → aucun candidat n'égale le fullPath → throw, avant même
# que le service trashToBin (qui, lui, gère l'extension via getAssetInfo
# Cloudinary) ne tourne.
#
# FIX : test d'existence TOLÉRANT (double-clé projet : fullPath === candidat
# OU fullPath commence par candidat + "."). Le candidat extensionless reste
# enregistré comme localisation (le service aval le consomme via Cloudinary).
# NE touche PAS la couche move/rename (déjà fonctionnelle).
#
# Backend-only. Usage :
#   bash fix-trash-resolve-extension.sh
#   AKFC_APPLY_ONLY=1 bash fix-trash-resolve-extension.sh   (clone)
#
set -euo pipefail
F="packages/backend/src/modules/storage/resolvePhysicalLocations.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "candidateExists" in s:
    print("déjà à jour"); sys.exit(0)

old = (
'  const [folders, assets] = await Promise.all([\n'
'    prisma.folder.findMany({\n'
'      where: { appRoot, fullPath: { in: allCandidates } },\n'
'      select: { fullPath: true },\n'
'    }),\n'
'    prisma.mediaAsset.findMany({\n'
'      where: { appRoot, fullPath: { in: allCandidates } },\n'
'      select: { fullPath: true },\n'
'    }),\n'
'  ]);\n'
'\n'
'  const existing = new Set<string>([\n'
'    ...folders.map((row) => row.fullPath),\n'
'    ...assets.map((row) => row.fullPath),\n'
'  ]);\n'
'\n'
'  for (const [path, candidates] of candidatesByPath) {\n'
'    const found = candidates.filter((candidate) => existing.has(candidate));\n'
)

new = (
'  const [folders, assets] = await Promise.all([\n'
'    prisma.folder.findMany({\n'
'      where: { appRoot, fullPath: { in: allCandidates } },\n'
'      select: { fullPath: true },\n'
'    }),\n'
'    prisma.mediaAsset.findMany({\n'
'      where: {\n'
'        appRoot,\n'
'        OR: [\n'
'          { fullPath: { in: allCandidates } },\n'
'          ...allCandidates.map((candidate) => ({\n'
'            fullPath: { startsWith: `${candidate}.` },\n'
'          })),\n'
'        ],\n'
'      },\n'
'      select: { fullPath: true },\n'
'    }),\n'
'  ]);\n'
'\n'
'  const folderPaths = new Set<string>(folders.map((row) => row.fullPath));\n'
'  const assetPaths = assets.map((row) => row.fullPath);\n'
'\n'
'  // Un candidat "existe" si un dossier a exactement ce fullPath, ou si un\n'
'  // MediaAsset a ce fullPath exact, ou ce chemin SUIVI d\'une extension.\n'
'  // INVARIANT projet : le node.path d\'une image Cloudinary = public_id SANS\n'
'  // extension, alors que MediaAsset.fullPath la porte (double-clé).\n'
'  function candidateExists(candidate: string): boolean {\n'
'    if (folderPaths.has(candidate)) return true;\n'
'    return assetPaths.some(\n'
'      (fp) => fp === candidate || fp.startsWith(`${candidate}.`),\n'
'    );\n'
'  }\n'
'\n'
'  for (const [path, candidates] of candidatesByPath) {\n'
'    const found = candidates.filter(candidateExists);\n'
)

assert s.count(old) == 1, "ancre introuvable (le fichier a peut-être changé)"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("resolvePhysicalLocations : matching tolérant à l'extension appliqué")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -4 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "fix(trash): resolvePhysicalLocations tolère l'extension (images Cloudinary sans ext dans node.path)" && echo "commit $(git rev-parse --short HEAD)"