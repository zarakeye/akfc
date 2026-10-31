#!/usr/bin/env bash
# Lecture seule : quels scripts de tutos sont appliqués dans ce repo, et combien de tutos existent.
# Usage (racine du repo) : bash etat-tutos.sh
set -uo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
LOG=$(git log --format=%s)
n=0
while IFS='|' read -r script subject; do
  n=$((n+1))
  if grep -qF "$subject" <<<"$LOG"; then echo "✅ $n. $script"; else echo "❌ $n. $script"; fi
done <<'L'
apply-fix-tutos-membres.sh|Tutos parcours : visiteurs et membres
apply-docs-tutos-membres.sh|docs : tutos partout
apply-fix-tutos-admin.sh|Tutos d'administration
apply-docs-tutos-admin.sh|docs : tutos d'administration
apply-fix-flash-info.sh|Flash info : les messages du ruban
apply-docs-flash-info.sh|docs : flash info
apply-fix-parcours.sh|Tutos par parcours, séances retrouvées
apply-docs-parcours.sh|docs : parcours numérotés
L
echo "Tutos dans le code : $(ls apps/web/src/features/tours/definitions/*.ts 2>/dev/null | wc -l | tr -d ' ') (17 attendus)"
echo "Non commité : $(git status --porcelain --untracked-files=no -- apps e2e scripts | wc -l | tr -d ' ') fichier(s)"