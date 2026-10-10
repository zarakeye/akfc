#!/usr/bin/env bash
# AKFC — Le dépôt GitHub est-il PUBLIC ? + dumps SQL présents dans l'HISTORIQUE Git.
# LECTURE SEULE : interroge GitHub anonymement (comme un inconnu), ne modifie rien.
# Usage (racine du repo) : bash check-repo-visibility.sh
set -uo pipefail
URL=$(git remote get-url origin 2>/dev/null) || { echo "ERREUR: pas de remote « origin »." >&2; exit 1; }
SLUG=$(echo "$URL" | sed -E 's#^(git@github\.com:|https://github\.com/|ssh://git@github\.com/)##; s#\.git$##')
case "$URL" in *github.com*) ;; *) echo "Remote non GitHub ($URL) : vérification à faire sur l'hébergeur."; exit 0;; esac
echo "Dépôt : $SLUG"
CODE=$(curl -s -o /tmp/akfc_repo.json -w '%{http_code}' "https://api.github.com/repos/$SLUG")
case "$CODE" in
  200) if grep -q '"private": false' /tmp/akfc_repo.json; then echo "⚠️  PUBLIC : lisible par n'importe qui, historique compris."; else echo "✅ privé."; fi ;;
  404) echo "✅ invisible anonymement (privé)." ;;
  *)   echo "? réponse GitHub inattendue (HTTP $CODE) : vérifie dans l'onglet Settings du dépôt." ;;
esac
echo; echo "== Dumps SQL présents dans l'historique Git (tous commits, toutes branches) =="
git log --all --pretty=format: --name-only --diff-filter=A -- '*.sql' | sort -u | grep -v '^$' | grep -v '/migrations/' || echo "(aucun)"
echo "(les migrations Prisma sont exclues : elles ne contiennent pas de données)"