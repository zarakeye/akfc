#!/usr/bin/env bash
# AKFC — Remplace le logo embarqué (repli) par la version blanche nettoyée.
# Sauvegarde l'ancien en AKFC_logo.original.svg. Le repli devient léger (34 Ko)
# et joli, ce qui masque la micro-latence du logo R2 au chargement.
# ⚠️ Ce script attend AKFC_logo_white.svg à la RACINE du repo (dépose-le-y avant).
# Usage : bash apply-swap-embedded-logo.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
NEW="AKFC_logo_white.svg"
DEST="apps/web/public/AKFC_logo.svg"
[ -f "$NEW" ] || { echo "ERREUR: dépose d'abord $NEW à la racine du repo." >&2; exit 1; }
[ -f "$DEST" ] || { echo "ERREUR: $DEST introuvable." >&2; exit 1; }

# sauvegarde de l'ancien (une seule fois)
if [ ! -f "apps/web/public/AKFC_logo.original.svg" ]; then
  cp "$DEST" "apps/web/public/AKFC_logo.original.svg"
  echo "  ok  ancien logo sauvegardé → apps/web/public/AKFC_logo.original.svg"
fi
cp "$NEW" "$DEST"
echo "  ok  $DEST remplacé ($(wc -c < "$DEST") octets)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
# pas de typecheck nécessaire (asset statique) ; on committe l'asset
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
git commit -m "chore(logo): repli embarqué = logo redessiné blanc (léger, propre) + sauvegarde ancien" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }