#!/usr/bin/env bash
# Copie le scénario Killercoda du monorepo (infra/killercoda/akfc-demo, la source) dans le clone
# local du dépôt publié (zarakeye/akfc-killercoda), puis y commite. Ne pousse pas : `git push`
# reste à faire, depuis ce clone, avec vos identifiants.
#
# usage : bash scripts/publier-scenario-killercoda.sh ~/akfc-killercoda
set -euo pipefail
src="$(cd "$(dirname "$0")/.." && pwd)/infra/killercoda/akfc-demo"
dest="${1:?usage : $0 <clone de akfc-killercoda>}"
[ -d "$src" ] || { echo "❌ $src introuvable"; exit 1; }
git -C "$dest" rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "❌ $dest n'est pas un clone git"; exit 1; }
mkdir -p "$dest/akfc-demo"
cp "$src"/* "$dest/akfc-demo/"
# Un fichier présent seulement dans la copie publiée : signalé, jamais supprimé ici.
for f in "$dest"/akfc-demo/*; do
  [ -e "$src/$(basename "$f")" ] || echo "⚠️  akfc-demo/$(basename "$f") n'existe que dans $dest : à retirer à la main si besoin"
done
cd "$dest"
if git diff --quiet -- akfc-demo && [ -z "$(git ls-files -o --exclude-standard akfc-demo)" ]; then
  echo "✅ Déjà à jour, rien à publier."; exit 0
fi
git add akfc-demo
git commit -qm "Scénario : copie de infra/killercoda/akfc-demo du monorepo ($(git -C "$src" rev-parse --short HEAD))"
echo "✅ Commité dans $dest. Reste : cd $dest && git push"
