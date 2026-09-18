#!/usr/bin/env bash
# AKFC — Optimise le logo SVG (vectorisé potrace, lourd) via SVGO.
# Produit 2 variantes SANS écraser l'original : à comparer visuellement avant d'adopter.
#   - AKFC_logo.opt.svg        : optimisé, couleurs conservées (noir/blanc)
#   - AKFC_logo.currentcolor.svg : la couleur noire devient `currentColor` (pilotable en CSS)
# NE committe RIEN et NE remplace PAS l'original : décision visuelle d'abord.
# Usage : bash optimize-logo.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
SRC="apps/web/public/AKFC_logo.svg"
[ -f "$SRC" ] || { echo "ERREUR: $SRC introuvable." >&2; exit 1; }
OPT="apps/web/public/AKFC_logo.opt.svg"
CC="apps/web/public/AKFC_logo.currentcolor.svg"

echo "== taille source =="; wc -c < "$SRC" | awk '{printf "  %d octets (%.0f Ko)\n", $1, $1/1024}'

# config SVGO : arrondi agressif des coordonnées + nettoyage, SANS fusionner les
# couleurs (on garde noir/blanc distincts pour préserver le dessin).
cat > /tmp/svgo.config.mjs <<'JS'
export default {
  multipass: true,
  floatPrecision: 1,            // 6 décimales → 1 : gain massif, invisible à l'œil
  plugins: [
    { name: "preset-default", params: { overrides: {
      removeViewBox: false,     // on garde le viewBox (indispensable au responsive)
      cleanupIds: false,
    } } },
    "removeDimensions",         // enlève width/height fixes → le SVG suit son conteneur
    "removeDoctype",
    "removeXMLProcInst",
    "removeComments",
    "removeMetadata",
  ],
};
JS

echo "== optimisation (SVGO via npx) =="
npx --yes svgo@3 --config /tmp/svgo.config.mjs -i "$SRC" -o "$OPT" 2>/dev/null || {
  echo "⚠ npx svgo a échoué (réseau ?). Installe-le puis relance :"
  echo "   pnpm add -D -w svgo@3   # ou: npm i -g svgo"
  exit 1
}
echo "== taille optimisée =="; wc -c < "$OPT" | awk '{printf "  %d octets (%.0f Ko)\n", $1, $1/1024}'

# Variante couleurs pilotables : #000000 → currentColor (le blanc reste blanc).
sed 's/fill="#000000"/fill="currentColor"/g' "$OPT" > "$CC"
echo "== variante currentColor écrite ($CC) =="

echo
echo "→ Fichiers produits (originaux INTACTS) :"
echo "   $OPT"
echo "   $CC"
echo "→ Compare-les visuellement (ouvre-les dans un navigateur) AVANT d'adopter."
echo "→ Rien n'est committé ni remplacé : décision à toi."