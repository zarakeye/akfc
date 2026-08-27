#!/usr/bin/env bash
#
# AKFC — Fix affichage SVG (finder/builder/logo → placeholder à la place du SVG).
#
# CAUSE : le proxy image demande la variante `large` (w_1200,c_scale). Sur un
# SVG (vecteur) stocké en resource_type `image`, Cloudinary refuse/rate cette
# transformation sur un asset `authenticated` → l'URL signée renvoie non-ok.
# `fetchAuthenticatedAsset` boucle alors sur video/raw (mauvais resource_type,
# 404) → retourne null → 404 → l'UI affiche son placeholder. Systématique sur
# tout SVG.
#
# FIX (ciblé SVG, robuste quels que soient les réglages Cloudinary) : ne pas
# transformer un SVG — le livrer NATIF, exactement comme `raw`. Un vecteur se
# met à l'échelle tout seul, le resize n'a aucun sens. Deux volets :
#   1. cloudinary.service.ts / buildAuthenticatedUrl : `isSvg` (format autoritaire
#      OU public_id en .svg) rejoint `raw` dans la clause « pas de transfo ».
#   2. media-url.ts / buildMediaProxyUrl : transmet `&format=svg` quand le
#      fullPath est un .svg, pour que la détection soit fiable même si le
#      public_id ne porte pas l'extension.
# Les URLs des autres formats sont INCHANGÉES (au bit près).
#
# Bénéficie aussi au logo des réglages (souvent un SVG). Backend seul, typecheck
# backend. Testable en dev.
#
# Usage : bash fix-svg-display.sh
#         AKFC_APPLY_ONLY=1 bash fix-svg-display.sh   (clone)
#
set -euo pipefail

SVC="packages/backend/src/modules/cloudinary/services/cloudinary.service.ts"
URL="packages/backend/src/modules/media/helpers/media-url.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SVC" ]         || { echo "ERREUR: $SVC introuvable." >&2; exit 1; }
[ -f "$URL" ]         || { echo "ERREUR: $URL introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. buildAuthenticatedUrl : pas de transformation sur SVG ─────────────────
python3 - "$SVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isSvg" in s:
    print("service déjà patché (SVG)"); sys.exit(0)

old = (
    "  const transformation =\n"
    '    resourceType === "raw" ? {} : (transformations[variant] ?? {});\n'
)
assert s.count(old) == 1, "ancre transformation introuvable/multiple"
new = (
    "  // SVG : vecteur. Le transformer (resize/raster) est inutile et Cloudinary\n"
    "  // le refuse souvent sur un asset `authenticated` → 404 puis placeholder.\n"
    "  // On le livre natif, comme `raw`. Détecté via le format autoritaire OU\n"
    "  // l'extension du public_id.\n"
    "  const isSvg =\n"
    '    format?.toLowerCase() === "svg" || publicId.toLowerCase().endsWith(".svg");\n'
    "  const transformation =\n"
    '    resourceType === "raw" || isSvg ? {} : (transformations[variant] ?? {});\n'
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("buildAuthenticatedUrl patché (SVG livré natif)")
PY

# ── 2. buildMediaProxyUrl : transmet format=svg ─────────────────────────────
python3 - "$URL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "format=svg" in s:
    print("media-url déjà patché (SVG)"); sys.exit(0)

old = "    return `${cldPrefix}/${encodeSegments(asset.publicId)}?variant=large`;\n"
assert s.count(old) == 1, "ancre return by-public-id introuvable/multiple"
new = (
    "    // SVG : on transmet le format pour que le proxy livre le vecteur natif\n"
    "    // (sans transformation raster qui échouerait). Cf. buildAuthenticatedUrl.\n"
    "    const isSvg = asset.fullPath.toLowerCase().endsWith('.svg');\n"
    "    return `${cldPrefix}/${encodeSegments(asset.publicId)}?variant=large${\n"
    "      isSvg ? '&format=svg' : ''\n"
    "    }`;\n"
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("buildMediaProxyUrl patché (format=svg transmis)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(media): livre les SVG en natif (pas de transformation Cloudinary) — corrige le placeholder" \
  && echo "commit $(git rev-parse --short HEAD)"