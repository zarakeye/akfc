#!/usr/bin/env bash
#
# AKFC — fix images Cloudinary en prod (build webpack).
#
# CAUSE : depuis le passage à `next build --webpack`, webpack bundle le SDK
# `cloudinary` dans les chunks .next/server et lui fait perdre son package.json.
# Le SDK ne peut plus lire sa version → `cloudinary.url({sign_url:true})` jette
# « Must supply sdk_semver » → le handler média tombe en catch → 404 sur TOUTES
# les images Cloudinary.
#
# FIX : sortir `cloudinary` du bundle via `serverExternalPackages` (comme
# @prisma/client déjà présent). Next le copie alors dans la sortie standalone
# avec son package.json intact.
#
# Prérequis : aucun. Après application → rebuild image + recreate conteneur.
# Usage : bash fix-cloudinary-external.sh
#         AKFC_APPLY_ONLY=1 bash fix-cloudinary-external.sh   (clone)
#
set -euo pipefail

CFG="apps/web/next.config.ts"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$CFG" ] || { echo "ERREUR: $CFG introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. Ce fix de déploiement peut aller sur main directement."
    echo "      (Ctrl-C pour annuler si tu préfères une branche.)"
    sleep 2
  fi
fi

python3 - "$CFG" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if '"cloudinary"' in s:
    print("déjà présent (cloudinary)"); sys.exit(0)
old = '  serverExternalPackages: ["@prisma/client"],\n'
assert s.count(old) == 1, "ancre serverExternalPackages introuvable/multiple"
new = '  serverExternalPackages: ["@prisma/client", "cloudinary", "cloudinary-core"],\n'
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("next.config.ts patché (cloudinary externalisé)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "build(web): externaliser cloudinary du bundle (fix sdk_semver / images 404 en prod)" && echo "commit $(git rev-parse --short HEAD)"