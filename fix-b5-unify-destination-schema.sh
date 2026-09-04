#!/usr/bin/env bash
#
# AKFC — Fix B5 : unifier la destination sur la SOURCE UNIQUE (tuer la copie fantôme).
#
# `registerR2Upload` utilisait `r2UploadDestinationSchema`, une copie inline dans
# le router — périmée (kind `general`+`folder`, sans `stage`/`containerName`).
# D'où le rejet de la cascade B5. On :
#   1. importe `uploadDestinationSchema` (contract, source unique) ;
#   2. remplace `destination: r2UploadDestinationSchema` par le schéma contract ;
#   3. SUPPRIME la définition dupliquée `r2UploadDestinationSchema`.
#
# Ainsi les DEUX schémas de destination fusionnent en un seul → plus de dérive.
#
# Backend seul (router storage). typecheck backend + web.
#
# Usage : bash fix-B5-unify-destination-schema.sh
#         AKFC_APPLY_ONLY=1 bash fix-B5-unify-destination-schema.sh   (clone)
#
set -euo pipefail

F="packages/backend/src/modules/storage/router.ts"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# 1. importer uploadDestinationSchema (à côté de createUploadSignaturesSchema)
if "uploadDestinationSchema" not in s.split("const storageRouter")[0].split("registerR2UploadInputSchema")[0]:
    imp = "  createUploadSignaturesSchema,\n"
    assert imp in s, "ancre import createUploadSignaturesSchema introuvable"
    s = s.replace(imp, imp + "  uploadDestinationSchema,\n", 1)

# 2. remplacer l'usage dans registerR2UploadInputSchema
s = s.replace(
    "  destination: r2UploadDestinationSchema,\n",
    "  destination: uploadDestinationSchema,\n",
)

# 3. supprimer la définition dupliquée r2UploadDestinationSchema (bloc complet)
m = re.search(
    r"const r2UploadDestinationSchema = z\.discriminatedUnion\('kind', \[.*?\n\]\);\n",
    s, re.S,
)
assert m, "définition r2UploadDestinationSchema introuvable"
s = s[:m.start()] + s[m.end():]
# nettoie une éventuelle double ligne vide laissée
s = re.sub(r"\n\n\n+", "\n\n", s)

# garde-fou : plus aucune référence résiduelle
assert "r2UploadDestinationSchema" not in s, "référence résiduelle à r2UploadDestinationSchema"

p.write_text(s, encoding="utf-8")
print("✓ router : destination unifiée sur uploadDestinationSchema (copie fantôme supprimée)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|r2UploadDestination|uploadDestination|destination" /tmp/akfc_tc.log | head -20; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|destination|stage|containerName" /tmp/akfc_tc.log | head -20; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(B5): unifie la destination sur uploadDestinationSchema (supprime la copie fantôme du router)" \
  && echo "commit $(git rev-parse --short HEAD)"