#!/bin/bash
# Corrige le message du commit créé par apply-relecture-6-2.sh (il avait repris celui du 6.1).
# Ne touche à aucun fichier : seul le message du dernier commit change.
# Usage (racine du repo) : bash fix-commit-6-2.sh
set -eu
SUBJ=$(git log -1 --format=%s)
case "$SUBJ" in
  "Doc 6.1 "*) ;;
  "Doc 6.2 "*) echo "Déjà corrigé : rien à faire."; exit 0 ;;
  *) echo "❌ le dernier commit n'est pas celui du 6.2 ($SUBJ) : rien fait."; exit 1 ;;
esac
git show --name-only --format= HEAD | grep -qx "apps/web/content/docs/dev/donnees/lire-le-schema.mdx" \
  || { echo "❌ le dernier commit ne touche pas lire-le-schema.mdx : rien fait."; exit 1; }
if git rev-parse -q --verify '@{u}' >/dev/null 2>&1 && git merge-base --is-ancestor HEAD '@{u}'; then
  echo "❌ ce commit est déjà poussé : rien fait (on le laisse tel quel)."; exit 1
fi
git commit -q --amend -F - <<'MSG'
Doc 6.2 « Lire schema.prisma comme une carte » relue : commentaire du modèle User corrigé (aucun groupe d'office, statut par les groupes système), extraits branchés sur le vrai schéma (generator/datasource, Session, User), MediaAsset aligné (uploaderUserId facultatif), tics de mise en forme fondus et conclusions regroupées

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "✅ message corrigé : $(git log -1 --format='%h %s' | cut -c1-70)…"