#!/usr/bin/env bash
# AKFC — Purge des données sensibles de TOUT l'historique Git, avant de rouvrir le dépôt au public.
#
#   bash purge-sensitive-history.sh            → AUDIT seul (lecture seule, ne modifie rien)
#   PURGE=1 bash purge-sensitive-history.sh    → purge
#   Options :
#     ALLOW="f1 f2"      fichiers PRÉSENTS aujourd'hui dont les trouvailles sont validées comme
#                        faux positifs (valeurs d'exemple) après vérification
#     NEW_REMOTE=<url>   pousse l'historique nettoyé vers un NOUVEAU dépôt vide (recommandé s'il
#                        existe des pull requests : elles gardent les anciens commits) ; l'ancien
#                        dépôt n'est pas touché
# Purgé de tout l'historique : dumps, .env, clés, node_modules/, .next/ et .prisma/, les fichiers disparus
# qui contenaient une trouvaille.
#
# Audit : chaque version de chaque fichier (tous commits, branches, tags) : dumps SQL, .env, clés,
#   empreintes bcrypt, URL de connexion avec mot de passe, secrets R2/Cloudinary/JWT/SMTP ; + e-mails.
# Purge : .gitignore (commit + push) → sauvegardes (miroir intégral + copie des dumps locaux) →
#   réécriture dans une COPIE à part (git filter-repo) → RE-AUDIT de la copie (push refusé s'il reste
#   une trace) → push forcé des branches et tags → réalignement de ce clone.
# ⚠ Un secret trouvé DANS un fichier de code n'est pas purgé automatiquement : arrêt, à traiter à part
#   (changer le secret d'abord). Prérequis de la purge : git-filter-repo (brew install git-filter-repo).
set -euo pipefail
[ -d .git ] || { echo "ERREUR: lance-moi à la racine du clone Git." >&2; exit 1; }
if git remote | grep -qx ancien-depot; then
  echo "ERREUR: ce clone porte encore l'état d'une tentative interrompue (remote « ancien-depot »)." >&2
  echo "  Répare-le d'abord :  git remote set-url origin \"\$(git remote get-url ancien-depot)\" && git remote remove ancien-depot" >&2
  exit 1
fi
URL=$(git remote get-url origin)
export AUDIT_ALLOW="${ALLOW:-}"
DEST="${NEW_REMOTE:-$URL}"
W=/tmp/akfc_purge; rm -rf "$W"; mkdir -p "$W"
echo 'IyEvdXNyL2Jpbi9lbnYgcHl0aG9uMwoiIiJBdWRpdCBkZSBUT1VUIGwnaGlzdG9yaXF1ZSBHaXQgOiBjaGFxdWUgdmVyc2lvbiBkZSBjaGFxdWUgZmljaGllciAodG91cyBjb21taXRzLCB0b3V0ZXMgYnJhbmNoZXMsIHRhZ3MpLgpTb3J0aWUgOiBjaGVtaW5zIHNlbnNpYmxlcyDDoCBwdXJnZXIgKGZpY2hpZXIpLCB0cm91dmFpbGxlcyBkZSBjb250ZW51LCBlLW1haWxzLiBDb2RlIHJldG91ciAwID0gcHJvcHJlLCAxID0gdHJvdXZhaWxsZXMuIiIiCmltcG9ydCByZSwgc3VicHJvY2Vzcywgc3lzLCBqc29uLCBvcwoKcmVwbyA9IHN5cy5hcmd2WzFdOyBvdXRfcGF0aHMgPSBzeXMuYXJndlsyXSBpZiBsZW4oc3lzLmFyZ3YpID4gMiBlbHNlIE5vbmU7IG91dF9jb250ZW50ID0gc3lzLmFyZ3ZbM10gaWYgbGVuKHN5cy5hcmd2KSA+IDMgZWxzZSBOb25lCmRlZiBnaXQoKmEsIGlucD1Ob25lKToKICAgIHJldHVybiBzdWJwcm9jZXNzLnJ1bihbImdpdCIsICItQyIsIHJlcG8sICphXSwgaW5wdXQ9aW5wLCBjYXB0dXJlX291dHB1dD1UcnVlLCBjaGVjaz1UcnVlKS5zdGRvdXQKCiMgMSkgdG91cyBsZXMgYmxvYnMgZGUgbCdoaXN0b3JpcXVlLCBhdmVjIGxldXJzIGNoZW1pbnMKb2JqcyA9IGdpdCgicmV2LWxpc3QiLCAiLS1vYmplY3RzIiwgIi0tYWxsIikuZGVjb2RlKCJ1dGYtOCIsICJyZXBsYWNlIikuc3BsaXRsaW5lcygpCmJsb2JfcGF0aHMgPSB7fQpmb3IgbGluZSBpbiBvYmpzOgogICAgcGFydHMgPSBsaW5lLnNwbGl0KCIgIiwgMSkKICAgIGlmIGxlbihwYXJ0cykgPT0gMjogYmxvYl9wYXRocy5zZXRkZWZhdWx0KHBhcnRzWzBdLCBzZXQoKSkuYWRkKHBhcnRzWzFdKQp0eXBlcyA9IGdpdCgiY2F0LWZpbGUiLCAiLS1iYXRjaC1jaGVjaz0lKG9iamVjdG5hbWUpICUob2JqZWN0dHlwZSkgJShvYmplY3RzaXplKSIsIGlucD0iXG4iLmpvaW4oYmxvYl9wYXRocykuZW5jb2RlKCkpLmRlY29kZSgpLnNwbGl0bGluZXMoKQpibG9icyA9IFt0LnNwbGl0KClbMF0gZm9yIHQgaW4gdHlwZXMgaWYgdC5zcGxpdCgpWzFdID09ICJibG9iIl0KCkFSVElGQUNUID0gcmUuY29tcGlsZShyJyhefC8pKG5vZGVfbW9kdWxlc3xcLm5leHR8XC5wcmlzbWEpLycpClNFTlNJVElWRV9QQVRIID0gWwogICAgKHJlLmNvbXBpbGUocicoXnwvKVwuZW52KFwuW14vXSopPyQnKSwgIi5lbnYiKSwKICAgIChyZS5jb21waWxlKHInKF58LykoPyEuKm1pZ3JhdGlvbnMvKVteL10qXC4oc3FsfGR1bXB8c3FsXC5nenxiYWNrdXApJCcsIHJlLkkpLCAiZHVtcCBTUUwiKSwKICAgIChyZS5jb21waWxlKHInXC4ocGVtfGtleXxwMTJ8cGZ4KSQnLCByZS5JKSwgImNsw6kvY2VydGlmaWNhdCIpLAogICAgKHJlLmNvbXBpbGUocicoXnwvKWlkXyhyc2F8ZWQyNTUxOXxlY2RzYSkkJyksICJjbMOpIFNTSCIpLAogICAgKHJlLmNvbXBpbGUocicoXnwvKVteL10qKGNyZWRlbnRpYWx8c2VjcmV0fHBhc3N3b3JkfHBhc3N3ZClbXi9dKlwuKHR4dHxqc29ufHlhP21sfGVudnxpbml8Y2ZnKSQnLCByZS5JKSwgImZpY2hpZXIgZCdpZGVudGlmaWFudHMiKSwKXQpBTExPV19QQVRIID0gW3JlLmNvbXBpbGUocicoXnwvKVwuZW52XC4oZXhhbXBsZXxzYW1wbGV8dGVtcGxhdGUpJCcpLCByZS5jb21waWxlKHInKF58LylwcmlzbWEvbWlncmF0aW9ucy8nKV0KQ09OVEVOVCA9IFsKICAgIChyZS5jb21waWxlKHJiJ1wkMlthYnldXCRcZFxkXCRbLi9BLVphLXowLTldezUzfScpLCAiZW1wcmVpbnRlIGJjcnlwdCIpLAogICAgKHJlLmNvbXBpbGUocmInLS0tLS1CRUdJTiBbQS1aIF0qUFJJVkFURSBLRVktLS0tLScpLCAiY2zDqSBwcml2w6llIiksCiAgICAocmUuY29tcGlsZShyYicocG9zdGdyZXMoPzpxbCk/fG15c3FsfG1vbmdvZGIoPzpcK3Nydik/fHJlZGlzKTovL1teOlxzLyJcJ2BdKzooPyFwYXNzd29yZEB8XCorQHxcJFx7KVteQFxzIlwnYF17Myx9QCcpLCAiVVJMIGRlIGNvbm5leGlvbiBhdmVjIG1vdCBkZSBwYXNzZSIpLAogICAgKHJlLmNvbXBpbGUocmInY2xvdWRpbmFyeTovL1xkKzpbQS1aYS16MC05Xy1dezEwLH1AJyksICJVUkwgQ2xvdWRpbmFyeSBhdmVjIHNlY3JldCIpLAogICAgKHJlLmNvbXBpbGUocmInKD9tKV5ccyooSldUX1NFQ1JFVHxSMl9TRUNSRVRfQUNDRVNTX0tFWXxSMl9BQ0NFU1NfS0VZX0lEfENMT1VESU5BUllfQVBJX1NFQ1JFVHxDTE9VRElOQVJZX0FQSV9LRVl8U01UUF9QQVNTXHcqfEFVVEhfU0VDUkVUfE5FWFRBVVRIX1NFQ1JFVClccyo9XHMqWyJcJ10/W15ccyJcJyRdezgsfScpLCAic2VjcmV0IGVuIGNsYWlyICh2YXJpYWJsZSkiKSwKICAgIChyZS5jb21waWxlKHJiJ0FLSUFbMC05QS1aXXsxNn0nKSwgImNsw6kgZCdhY2PDqHMgQVdTIiksCgpdCiMgUsOoZ2xlIHLDqXNlcnbDqWUgYXV4IGZpY2hpZXJzIFRFWFRFIDogZGFucyBkdSBjb2RlLCDCqyBwYXNzd29yZDogaGFzaGVkUGFzc3dvcmQsIMK7IGVzdCBub3JtYWwuClBBU1NXT1JEX0xJTkUgPSByZS5jb21waWxlKHJiJyg/bWkpXlxzKihwYXNzd29yZHxtb3QgZGUgcGFzc2V8cHdkKVxzKls6PV1ccypcU3s2LH1ccyokJykKVEVYVF9GSUxFID0gcmUuY29tcGlsZShyJyhcLih0eHR8ZW52fHlhP21sfGluaXxjZmd8Y29uZnxwcm9wZXJ0aWVzfGxvZykkfChefC8pW14vLl0rJHwoXnwvKVwuZW52W14vXSokKScsIHJlLkkpCkVNQUlMID0gcmUuY29tcGlsZShyYidbQS1aYS16MC05Ll8lKy1dK0BbQS1aYS16MC05Li1dK1wuW2Etel17Mix9JykKRU1BSUxfSUdOT1JFID0gcmUuY29tcGlsZShyYicoZXhhbXBsZVwuKGNvbXxvcmd8ZnIpfG5vcmVwbHl8bm8tcmVwbHl8QHVzZXJzXC5ub3JlcGx5XC5naXRodWJcLmNvbXxAYWtmY1wuaW50ZXJuYWx8QFxkfFwuKHBuZ3xqcGU/Z3xzdmd8d2VicCkkKScsIHJlLkkpCgpwYXRoX2hpdHMsIGNvbnRlbnRfaGl0cywgZW1haWxzID0ge30sIHt9LCB7fQphcnRpZmFjdHMgPSBzZXQoKQpmb3IgcCBpbiB7cCBmb3IgYiBpbiBibG9icyBmb3IgcCBpbiBibG9iX3BhdGhzW2JdfToKICAgIGlmIEFSVElGQUNULnNlYXJjaChwKTogYXJ0aWZhY3RzLmFkZChwKTsgcGF0aF9oaXRzW3BdID0gImFydGVmYWN0IGRlIGJ1aWxkIjsgY29udGludWUKICAgIGlmIGFueShhLnNlYXJjaChwKSBmb3IgYSBpbiBBTExPV19QQVRIKTogY29udGludWUKICAgIGZvciByeCwgd2h5IGluIFNFTlNJVElWRV9QQVRIOgogICAgICAgIGlmIHJ4LnNlYXJjaChwKTogcGF0aF9oaXRzW3BdID0gd2h5OyBicmVhawoKcHJvYyA9IHN1YnByb2Nlc3MuUG9wZW4oWyJnaXQiLCAiLUMiLCByZXBvLCAiY2F0LWZpbGUiLCAiLS1iYXRjaCJdLCBzdGRpbj1zdWJwcm9jZXNzLlBJUEUsIHN0ZG91dD1zdWJwcm9jZXNzLlBJUEUpCmZvciBiIGluIGJsb2JzOgogICAgcHJvYy5zdGRpbi53cml0ZSgoYiArICJcbiIpLmVuY29kZSgpKTsgcHJvYy5zdGRpbi5mbHVzaCgpCiAgICBoZWFkZXIgPSBwcm9jLnN0ZG91dC5yZWFkbGluZSgpLnNwbGl0KCkKICAgIGRhdGEgPSBwcm9jLnN0ZG91dC5yZWFkKGludChoZWFkZXJbMl0pKTsgcHJvYy5zdGRvdXQucmVhZCgxKQogICAgcGF0aHMgPSBibG9iX3BhdGhzW2JdCiAgICBpZiBhbGwocCBpbiBwYXRoX2hpdHMgZm9yIHAgaW4gcGF0aHMpOiBjb250aW51ZSAgICAgICAgICAjIGTDqWrDoCBwdXJnw6kgcGFyIGNoZW1pbgogICAgaWYgYiJcMCIgaW4gZGF0YVs6ODAwMF06IGNvbnRpbnVlICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBiaW5haXJlCiAgICBmb3IgcngsIHdoeSBpbiBDT05URU5UOgogICAgICAgIGlmIHJ4LnNlYXJjaChkYXRhKToKICAgICAgICAgICAgZm9yIHAgaW4gcGF0aHM6CiAgICAgICAgICAgICAgICBpZiBwIG5vdCBpbiBwYXRoX2hpdHM6IGNvbnRlbnRfaGl0cy5zZXRkZWZhdWx0KHAsIHNldCgpKS5hZGQod2h5KQogICAgaWYgUEFTU1dPUkRfTElORS5zZWFyY2goZGF0YSk6CiAgICAgICAgZm9yIHAgaW4gcGF0aHM6CiAgICAgICAgICAgIGlmIHAgbm90IGluIHBhdGhfaGl0cyBhbmQgVEVYVF9GSUxFLnNlYXJjaChwKTogY29udGVudF9oaXRzLnNldGRlZmF1bHQocCwgc2V0KCkpLmFkZCgibW90IGRlIHBhc3NlIGVuIGNsYWlyIChsaWduZSDCqyBwYXNzd29yZDogwrspIikKICAgIGZvciBtIGluIEVNQUlMLmZpbmRhbGwoZGF0YSk6CiAgICAgICAgaWYgbm90IEVNQUlMX0lHTk9SRS5zZWFyY2gobSk6CiAgICAgICAgICAgIGZvciBwIGluIHBhdGhzOiBlbWFpbHMuc2V0ZGVmYXVsdChtLmRlY29kZSgidXRmLTgiLCAicmVwbGFjZSIpLmxvd2VyKCksIHNldCgpKS5hZGQocCkKcHJvYy5zdGRpbi5jbG9zZSgpOyBwcm9jLndhaXQoKQoKdHJ5OgogICAgaGVhZF9maWxlcyA9IHNldChnaXQoImxzLXRyZWUiLCAiLXIiLCAiLS1uYW1lLW9ubHkiLCAiSEVBRCIpLmRlY29kZSgidXRmLTgiLCAicmVwbGFjZSIpLnNwbGl0bGluZXMoKSkKZXhjZXB0IHN1YnByb2Nlc3MuQ2FsbGVkUHJvY2Vzc0Vycm9yOgogICAgaGVhZF9maWxlcyA9IHNldCgpCmFsbG93ID0gc2V0KGZpbHRlcihOb25lLCBvcy5lbnZpcm9uLmdldCgiQVVESVRfQUxMT1ciLCAiIikuc3BsaXQoKSkpCmNvbnRlbnRfaGVhZCA9IHtwOiB3IGZvciBwLCB3IGluIGNvbnRlbnRfaGl0cy5pdGVtcygpIGlmIHAgaW4gaGVhZF9maWxlc30KY29udGVudF9oaXN0ID0ge3A6IHcgZm9yIHAsIHcgaW4gY29udGVudF9oaXRzLml0ZW1zKCkgaWYgcCBub3QgaW4gaGVhZF9maWxlc30KZm9yIHAgaW4gY29udGVudF9oaXN0OiBwYXRoX2hpdHNbcF0gPSAiZmljaGllciBkaXNwYXJ1IGNvbnRlbmFudCA6ICIgKyAiLCAiLmpvaW4oc29ydGVkKGNvbnRlbnRfaGlzdFtwXSkpCnByaW50KGYiICB7bGVuKGJsb2JzKX0gdmVyc2lvbnMgZGUgZmljaGllcnMgZXhhbWluw6llcyIpCm90aGVycyA9IHtwOiB3IGZvciBwLCB3IGluIHBhdGhfaGl0cy5pdGVtcygpIGlmIHAgbm90IGluIGFydGlmYWN0c30KcHJpbnQoZiIgIMOAIFBVUkdFUiBkZSB0b3V0IGwnaGlzdG9yaXF1ZSA6IHtsZW4ob3RoZXJzKX0gZmljaGllcihzKSArIGFydGVmYWN0cyBkZSBidWlsZCAoe2xlbihhcnRpZmFjdHMpfSBmaWNoaWVycyBzb3VzIG5vZGVfbW9kdWxlcy8sIC5uZXh0LyBvdSAucHJpc21hLykiKQpmb3IgcCwgdyBpbiBzb3J0ZWQob3RoZXJzLml0ZW1zKCkpOiBwcmludChmIiAgICAtIHtwfSAgW3t3fV0iKQpwcmludChmIiAgQ09OVEVOVSBTRU5TSUJMRSBkYW5zIGRlcyBmaWNoaWVycyBQUsOJU0VOVFMgQVVKT1VSRCdIVUkgOiB7bGVuKGNvbnRlbnRfaGVhZCl9IikKZm9yIHAsIHcgaW4gc29ydGVkKGNvbnRlbnRfaGVhZC5pdGVtcygpKToKICAgIHByaW50KGYiICAgIC0ge3B9ICBbeycsICcuam9pbihzb3J0ZWQodykpfV0iICsgKCIgIOKckyB2YWxpZMOpIChmYXV4IHBvc2l0aWYpIiBpZiBwIGluIGFsbG93IGVsc2UgIiAg4oaSIMOgIHZhbGlkZXIiKSkKcHJpbnQoZiIgIGUtbWFpbHMgcHLDqXNlbnRzIChpbmZvcm1hdGlvbikgOiB7bGVuKGVtYWlscyl9IikKZm9yIGUsIHBzIGluIHNvcnRlZChlbWFpbHMuaXRlbXMoKSk6IHByaW50KGYiICAgIC0ge2V9ICAoe2xlbihwcyl9IGZpY2hpZXIocyksIGV4LiB7c29ydGVkKHBzKVswXX0pIikKaWYgb3V0X3BhdGhzOgogICAgbGluZXMgPSBbInJlZ2V4OihefC8pbm9kZV9tb2R1bGVzLyIsICJyZWdleDooXnwvKVxcLm5leHQvIiwgInJlZ2V4OihefC8pXFwucHJpc21hLyJdIGlmIGFydGlmYWN0cyBlbHNlIFtdCiAgICBsaW5lcyArPSBzb3J0ZWQob3RoZXJzKQogICAgb3BlbihvdXRfcGF0aHMsICJ3Iikud3JpdGUoIiIuam9pbihsICsgIlxuIiBmb3IgbCBpbiBsaW5lcykpCnVucmV2aWV3ZWQgPSBzb3J0ZWQocCBmb3IgcCBpbiBjb250ZW50X2hlYWQgaWYgcCBub3QgaW4gYWxsb3cpCmlmIG91dF9jb250ZW50OgogICAgb3BlbihvdXRfY29udGVudCwgInciKS53cml0ZSgiIi5qb2luKHAgKyAiXG4iIGZvciBwIGluIHVucmV2aWV3ZWQpKQpzeXMuZXhpdCgxIGlmIChwYXRoX2hpdHMgb3IgdW5yZXZpZXdlZCkgZWxzZSAwKQo=' | base64 -d > "$W/audit.py"

git fetch -q --force origin --prune '+refs/tags/*:refs/tags/*'
echo "== AUDIT de tout l'historique =="
set +e; python3 "$W/audit.py" . "$W/paths.txt" "$W/content.txt"; set -e
NPR=$(git ls-remote origin 'refs/pull/*' | wc -l | tr -d ' ')
echo "  références de pull requests sur GitHub : $NPR"

if [ "${PURGE:-0}" != "1" ]; then
  echo; echo "Audit terminé, rien n'a été modifié. Pour purger : PURGE=1 bash purge-sensitive-history.sh"; exit 0
fi

echo; echo "== PURGE : vérifications préalables =="
fail(){ echo "  ❌ $1"; echo "ARRÊT — rien n'a été poussé."; exit 1; }
command -v git-filter-repo >/dev/null || fail "git-filter-repo introuvable (brew install git-filter-repo, ou pip install git-filter-repo)"
git diff --quiet && git diff --cached --quiet || fail "modifications non commitées : committe ou remise-les d'abord"
[ "$(git branch --show-current)" = "main" ] || fail "place-toi sur main"
[ "$(git rev-parse main)" = "$(git rev-parse origin/main)" ] || fail "main diffère de origin/main : pousse (ou tire) d'abord"
[ -s "$W/content.txt" ] && fail "fichier(s) présent(s) aujourd'hui avec une trouvaille à valider : $(tr '\n' ' ' < "$W/content.txt")
     → si ce sont des valeurs d'exemple : relance avec ALLOW=\"$(tr '\n' ' ' < "$W/content.txt" | sed 's/ $//')\"
     → si c'est un vrai secret : change-le d'abord, puis retire-le du fichier"
if [ -n "${NEW_REMOTE:-}" ]; then
  git ls-remote "$NEW_REMOTE" > "$W/newremote.txt" 2>"$W/newremote.err" \
    || fail "accès impossible au nouveau dépôt ($NEW_REMOTE) : $(tail -1 "$W/newremote.err")
     → vérifie l'URL ; en HTTPS : https://github.com/<compte>/<dépôt>.git"
  [ -s "$W/newremote.txt" ] && fail "NEW_REMOTE n'est pas vide : crée un dépôt NEUF, sans README ni licence"
  echo "  destination : NOUVEAU dépôt $NEW_REMOTE (l'ancien n'est pas modifié)"
else
  echo "  destination : dépôt actuel (historique écrasé)"
fi
[ -s "$W/paths.txt" ] || { echo "  ✅ aucun fichier sensible dans l'historique : rien à purger."; exit 0; }
echo "  ✅ prêt : $(wc -l < "$W/paths.txt" | tr -d ' ') règle(s) de purge"

echo "== 1. .gitignore =="
RULES=$'\n# Dumps de base et secrets : jamais versionnés\n*.sql\n!prisma/migrations/**/*.sql\n*.dump\n.env\n.env.*\n!.env.example\n'
if ! grep -q "Dumps de base et secrets : jamais versionnés" .gitignore 2>/dev/null; then
  printf '%s' "$RULES" >> .gitignore; git add .gitignore
  git commit -qm "chore: dumps SQL et secrets ignorés par Git"; git push -q origin main; echo "  ok  règles ajoutées et poussées"
else echo "  — déjà en place"; fi
if ! grep -qx '.seed-credentials.txt' .gitignore; then
  printf '%s' $'\n# Fichiers d\'identifiants : jamais versionnés\n.seed-credentials.txt\n*credential*.txt\n*secret*.txt\n' >> .gitignore; git add .gitignore
  git commit -qm "chore: fichiers d'identifiants ignorés par Git"; git push -q origin main; echo "  ok  règles « identifiants » ajoutées et poussées"
fi

TS=$(date +%Y%m%d-%H%M%S); BK="$(cd .. && pwd)/akfc-sauvegarde-$TS"; mkdir -p "$BK/fichiers-locaux"
echo "== 2. sauvegardes → $BK =="
git clone -q --mirror "$URL" "$BK/depot-avant-purge.git" && echo "  ok  miroir intégral de l'historique actuel"
while read -r p; do [ -f "$p" ] && { mkdir -p "$BK/fichiers-locaux/$(dirname "$p")"; cp "$p" "$BK/fichiers-locaux/$p"; echo "  ok  copie locale : $p"; }; done < "$W/paths.txt"

echo "== 3. réécriture dans une copie à part =="
RW="$W/reecriture.git"; git clone -q --mirror "$URL" "$RW"
git -C "$RW" filter-repo --force --invert-paths --paths-from-file "$W/paths.txt" > "$W/filter.log" 2>&1 || { tail -5 "$W/filter.log"; fail "git filter-repo a échoué"; }
echo "  ok  historique réécrit"

echo "== 4. RE-AUDIT de la copie réécrite (le push n'a lieu que si elle est propre) =="
if ! python3 "$W/audit.py" "$RW" "$W/paths2.txt" "$W/content2.txt"; then fail "il reste des traces dans la copie réécrite"; fi
echo "  ✅ copie réécrite propre"

echo "== 5. push forcé (branches et tags) =="
git -C "$RW" remote add origin "$DEST" 2>/dev/null || git -C "$RW" remote set-url origin "$DEST"
git -C "$RW" push -q --force origin 'refs/heads/*:refs/heads/*' || fail "push des branches refusé (ce clone n'a pas été modifié)"
echo "  ok  branches"
if [ -n "$(git -C "$RW" tag | head -1)" ]; then
  git -C "$RW" push -q --force origin 'refs/tags/*:refs/tags/*' || fail "push des tags refusé (ce clone n'a pas été modifié)"
  echo "  ok  tags"
else echo "  —  pas de tag"; fi
[ "$(git ls-remote "$DEST" refs/heads/main | cut -f1)" = "$(git -C "$RW" rev-parse main)" ] \
  || fail "après le push, main distant ≠ main réécrit (ce clone n'a pas été modifié)"
echo "  ok  vérifié : le dépôt distant contient exactement l'historique réécrit"

echo "== 6. réalignement de ce clone =="
if [ -n "${NEW_REMOTE:-}" ]; then git remote set-url origin "$NEW_REMOTE"; echo "  ok  origin → nouveau dépôt (l'ancien est intact sur GitHub, et dans la sauvegarde)"; fi
# --force : les tags ont été réécrits ; sans lui, fetch refuse de les écraser et échoue.
git fetch -q --force origin --prune '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*' \
  || fail "fetch du nouvel historique impossible : NE PAS pousser depuis ce clone ; reclone le dépôt"
git reset -q --hard origin/main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || fail "ce clone n'est pas aligné : NE PAS pousser depuis ce clone ; reclone le dépôt"
echo "  ok  main = nouvel historique (vérifié)"
OTHER=$(git for-each-ref --format='%(refname:short)' refs/heads | grep -vx main || true)
[ -n "$OTHER" ] && echo "  ⚠ autres branches locales (anciennes versions) à supprimer ou recréer : $OTHER"

echo; echo "✅ PURGE TERMINÉE. Sauvegarde intégrale : $BK"
echo "Reste à faire :"
echo "  • serveur : git fetch --force origin '+refs/tags/*:refs/tags/*' && git fetch origin && git reset --hard origin/main"
echo "    (les fichiers non suivis ne bougent pas ; ne jamais pousser depuis un clone non réaligné)"
if [ -n "${NEW_REMOTE:-}" ]; then
  echo "  • serveur : git remote set-url origin $NEW_REMOTE (puis la commande ci-dessus)"
  echo "  • SUPPRIMER l'ancien dépôt sur GitHub (Settings → Delete) : ses pull requests et caches disparaissent avec lui ;"
  echo "    puis renommer le nouveau en « akfc » si tu veux garder le nom"
elif [ "$NPR" != "0" ]; then
  echo "  • $NPR référence(s) de pull request gardent les anciens commits : demander leur purge au support GitHub AVANT de rouvrir"
fi
echo "  • changer les mots de passe exposés ; puis rouvrir le dépôt (Settings → Change visibility → Public)"