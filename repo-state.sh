#!/usr/bin/env bash
# AKFC — État du clone Git (LECTURE SEULE) : à quel dépôt il est relié, aligné ou non, traces sensibles.
# À lancer sur le Mac ET sur le serveur, à la racine du clone. Ne modifie rien.
# Usage : bash repo-state.sh
set -uo pipefail
[ -d .git ] || { echo "ERREUR: pas à la racine d'un clone Git." >&2; exit 1; }
URL=$(git remote get-url origin 2>/dev/null || echo "?")
echo "dossier        : $(pwd)"
echo "relié à        : $URL"
echo "remotes        : $(git remote | tr '\n' ' ')"
git fetch -q --force origin '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*' 2>/dev/null \
  || echo "⚠ fetch impossible (dépôt injoignable ou accès refusé)"
B=$(git branch --show-current)
echo "branche        : $B ($(git rev-parse --short HEAD 2>/dev/null))"
if git rev-parse -q --verify "origin/$B" >/dev/null; then
  A=$(git rev-list --count "origin/$B..HEAD"); R=$(git rev-list --count "HEAD..origin/$B")
  if [ "$A" = 0 ] && [ "$R" = 0 ]; then echo "alignement     : ✅ identique à origin/$B"
  elif git merge-base --is-ancestor HEAD "origin/$B" 2>/dev/null || git merge-base --is-ancestor "origin/$B" HEAD 2>/dev/null; then
       echo "alignement     : même historique ; $A commit(s) local(aux) non poussé(s), $R en retard"
  else echo "alignement     : ⚠ HISTORIQUES DIFFÉRENTS ($A local / $R distant) : ce clone n'est pas sur le même historique que son dépôt"
  fi
else echo "alignement     : ⚠ pas de branche origin/$B"; fi
echo "modifs suivies : $(git status --porcelain --untracked-files=no | wc -l | tr -d ' ') fichier(s) modifié(s) non commité(s)"
echo "branches locales : $(git for-each-ref --format='%(refname:short)' refs/heads | tr '\n' ' ')"
T=$(git log --all --format= --name-only 2>/dev/null | grep -E '(^|/)\.seed-credentials\.txt$|(^|/)(node_modules|\.next|\.prisma)/|^[^/]*\.sql$' | sort -u)
echo "traces sensibles joignables depuis ce clone : $(printf '%s' "$T" | grep -c .)"
printf '%s\n' "$T" | grep -E 'seed-credentials|\.sql$' | head -6 | sed 's/^/   - /'
printf '%s' "$T" | grep -qE '(node_modules|\.next|\.prisma)/' && echo "   - (+ fichiers sous node_modules/, .next/ ou .prisma/)"
exit 0