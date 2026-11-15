#!/bin/bash
# Corrige les messages des commits créés par les premières versions de apply-relecture-6-2.sh
# et apply-relecture-6-3.sh (elles reprenaient le message du 6.1). Aucun fichier ne change :
# les commits sont refaits à l'identique (mêmes contenus, auteur, dates), seul le message change.
# Ne touche jamais un commit déjà poussé. Remplace fix-commit-6-2.sh (inutile de lancer les deux).
# Usage (racine du repo) : bash fix-commits-relecture.sh
set -eu
MSG62="Doc 6.2 « Lire schema.prisma comme une carte » relue : commentaire du modèle User corrigé (aucun groupe d'office, statut par les groupes système), extraits branchés sur le vrai schéma (generator/datasource, Session, User), MediaAsset aligné (uploaderUserId facultatif), tics de mise en forme fondus et conclusions regroupées"
MSG63="Doc 6.3 « Le noyau : membres, sessions, groupes » relue : groupes système (systemKind : Instructeurs, Bureau) ajoutés au texte, à la carte des entités et aux deux diagrammes ; commentaire de User et autres extraits branchés sur le vrai schéma ; une seule introduction, tics de mise en forme fondus et conclusions regroupées"
TRAILER=$'\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF'
D=apps/web/content/docs/dev/donnees

BRANCH=$(git symbolic-ref --short HEAD) || { echo "❌ pas sur une branche : rien fait."; exit 1; }
UP=""; git rev-parse -q --verify '@{u}' >/dev/null 2>&1 && UP=$(git rev-parse '@{u}')

# Les 3 derniers commits au plus, en s'arrêtant au premier déjà poussé.
LIST=()
for c in $(git rev-list --max-count=3 HEAD); do
  if [ -n "$UP" ] && git merge-base --is-ancestor "$c" "$UP"; then break; fi
  LIST=("$c" "${LIST[@]}")
done
[ ${#LIST[@]} -gt 0 ] || { echo "Rien à corriger (commits déjà poussés)."; exit 0; }

want() { # message attendu pour le commit $1, ou rien
  local subj files; subj=$(git log -1 --format=%s "$1"); files=$(git show --name-only --format= "$1")
  case "$subj" in "Doc 6.1 "*) ;; *) return 0 ;; esac
  if grep -qx "$D/le-noyau-du-modele.mdx" <<<"$files"; then echo "$MSG63"
  elif grep -qx "$D/lire-le-schema.mdx" <<<"$files"; then echo "$MSG62"; fi
}

NEED=0; for c in "${LIST[@]}"; do [ -n "$(want "$c")" ] && NEED=1; done
[ $NEED = 1 ] || { echo "Déjà corrigé : rien à faire."; exit 0; }
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "❌ modifications non commitées : commitez ou mettez-les de côté d'abord."; exit 1; }

OLD=$(git rev-parse HEAD)
PARENT=$(git rev-parse "${LIST[0]}^")
for c in "${LIST[@]}"; do
  m=$(want "$c"); if [ -n "$m" ]; then m="$m$TRAILER"; echo "  → $(git log -1 --format=%h "$c") : ${m%% relue*} relue"; else m=$(git log -1 --format=%B "$c"); fi
  PARENT=$(GIT_AUTHOR_NAME="$(git log -1 --format=%an "$c")" GIT_AUTHOR_EMAIL="$(git log -1 --format=%ae "$c")" \
    GIT_AUTHOR_DATE="$(git log -1 --format=%ad --date=raw "$c")" \
    git commit-tree "$(git rev-parse "$c^{tree}")" -p "$PARENT" -F - <<<"$m")
done
[ "$(git rev-parse "$PARENT^{tree}")" = "$(git rev-parse "$OLD^{tree}")" ] || { echo "❌ contenu différent : rien fait."; exit 1; }
git update-ref -m "fix-commits-relecture" "refs/heads/$BRANCH" "$PARENT" "$OLD"
echo "✅ messages corrigés (ancienne tête : ${OLD:0:8}) :"
git log --format='   %h %s' -n ${#LIST[@]} | cut -c1-90