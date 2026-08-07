#!/usr/bin/env bash
#
# AKFC — Nom humain dans la recherche et les aperçus (increment 2b/2).
#
# Deux surfaces contournent l'enrichissement de 2a car elles projettent
# depuis MediaAsset, pas depuis le listing storage :
#
#   1. `media.searchRecursive` : ses résultats FICHIERS posaient
#      `name = dernier segment du path` (= le slug depuis l'increment 1). Le
#      MATCHING, lui, était déjà bon (il matche `asset.originalFileName`).
#   2. `media.resolveByIds` : aperçus des items déjà sélectionnés dans un bloc,
#      posait `fileName = fileNameOf(fullPath)` (= le slug).
#
# On aligne les deux sur 2a : `displayName ?? originalFileName ?? <slug>`.
# resolveByIds ne sélectionnait pas ces deux colonnes → on les ajoute.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-search-display-name.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-search-display-name.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/media/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "asset.originalFileName ||" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── A) resolveByIds : sélectionner displayName + originalFileName ────────────
A_OLD = """        select: {
          id: true,
          publicId: true,
          fullPath: true,
          mimeType: true,
          resourceType: true,
          width: true,
          height: true,
          duration: true,
        },"""
A_NEW = """        select: {
          id: true,
          publicId: true,
          fullPath: true,
          displayName: true,
          originalFileName: true,
          mimeType: true,
          resourceType: true,
          width: true,
          height: true,
          duration: true,
        },"""
assert s.count(A_OLD) == 1, "ancre select resolveByIds introuvable/multiple — abandon"
s = s.replace(A_OLD, A_NEW)

# ── B) resolveByIds : fileName humain ───────────────────────────────────────
B_OLD = """          fileName: fileNameOf(asset.fullPath),"""
B_NEW = """          fileName:
            asset.displayName?.trim() ||
            asset.originalFileName ||
            fileNameOf(asset.fullPath),"""
assert s.count(B_OLD) == 1, "ancre fileName resolveByIds introuvable/multiple — abandon"
s = s.replace(B_OLD, B_NEW)

# ── C) searchRecursive : name humain (projection FICHIERS) ──────────────────
C_OLD = """        const name = lastSlash > 0 ? path.slice(lastSlash + 1) : path;"""
C_NEW = """        const name =
          asset.displayName?.trim() ||
          asset.originalFileName ||
          (lastSlash > 0 ? path.slice(lastSlash + 1) : path);"""
assert s.count(C_OLD) == 1, "ancre name searchRecursive introuvable/multiple — abandon"
s = s.replace(C_OLD, C_NEW)

p.write_text(s, encoding="utf-8")
print("patch media/router.ts OK (searchRecursive + resolveByIds → nom humain)")
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
if git commit -m "feat(finder): nom humain dans la recherche et les aperçus de blocs (searchRecursive + resolveByIds)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi