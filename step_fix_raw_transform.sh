#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FIX — les PDF (et tout asset `raw`) n'étaient jamais servis par le proxy.
#
# Cause : `buildAuthenticatedUrl` applique une transformation (redimensionnement
# du variant) quel que soit le resource_type. Cloudinary NE SUPPORTE PAS les
# transformations sur les ressources `raw` → l'URL signée retourne 404 →
# `fetchAuthenticatedAsset` épuise ses 3 tentatives → le proxy sert son IMAGE
# DE FALLBACK. C'est pour ça qu'un PDF affiche un placeholder d'image partout
# (grid, sidebar, iframe) : la source ne délivre jamais le binaire.
#
# Correctif : pas de transformation quand resourceType === 'raw'.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SVC="packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"
test -f "$SVC" || { echo "✗ $SVC introuvable — lance depuis la racine."; exit 1; }

if grep -q 'resourceType === "raw" ? {}' "$SVC"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("packages/backend/src/modules/cloudinary/services/cloudinary.service.ts")
src = p.read_text(encoding="utf-8")

OLD = "  const transformation = transformations[variant] ?? {};"

NEW = """  // Cloudinary REFUSE les transformations sur les ressources `raw` (pdf, md,
  // zip…) : l'URL signée avec transformation retourne 404, et l'appelant
  // tombe alors sur l'image de fallback. On ne transforme donc que les
  // resource_types qui le supportent (image / video).
  const transformation =
    resourceType === "raw" ? {} : (transformations[variant] ?? {});"""

assert src.count(OLD) == 1, f"ancre buildAuthenticatedUrl trouvée {src.count(OLD)}x"
p.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("  ✓ buildAuthenticatedUrl : pas de transformation sur les raw")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "fix(cloudinary): pas de transformation sur les assets raw (pdf servaient un fallback)"
echo "✓ commité."