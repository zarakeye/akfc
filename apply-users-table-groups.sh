#!/usr/bin/env bash
# AKFC — Table des utilisateurs : colonne « Groupes ».
#  - user.getAll renvoie les groupes de chaque membre (Administrateurs d'abord, puis alphabétique)
#  - UsersTable : pastilles par groupe (Administrateurs en ambre), « aucun » sinon ; la colonne
#    se trie et se filtre par le texte des noms de groupes.
#  Aucune migration. Preuve avant commit : pnpm check (sinon TOUT est restauré).
# Usage : bash apply-users-table-groups.sh   (AKFC_APPLY_ONLY=1 : applique sans vérifier ni committer)
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
FILES=(packages/backend/src/modules/users/router.ts apps/web/src/features/admin/users/components/UsersTable.tsx)
grep -q 'displayName: "Groupes"' apps/web/src/features/admin/users/components/UsersTable.tsx && { echo "— déjà appliqué"; exit 0; }
BK=/tmp/akfc_ug_backup; rm -rf "$BK"; mkdir -p "$BK"
for f in "${FILES[@]}"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; mkdir -p "$BK/$(dirname "$f")"; cp "$f" "$BK/$f"; done
restore(){ for f in "${FILES[@]}"; do cp "$BK/$f" "$f"; done; echo "↩ fichiers restaurés à l'identique (aucun commit)."; }
W=/tmp/akfc_ug; rm -rf "$W"; mkdir -p "$W"
echo 'aW1wb3J0IHN5cwpyb290ID0gc3lzLmFyZ3ZbMV0KZGVmIGVkaXQocmVsLCBwYWlycyk6CiAgICBwID0gZiJ7cm9vdH0ve3JlbH0iOyBzID0gb3BlbihwLCBlbmNvZGluZz0idXRmLTgiKS5yZWFkKCkKICAgIGZvciBvLCBuLCBsIGluIHBhaXJzOgogICAgICAgIGFzc2VydCBzLmNvdW50KG8pID09IDEsIGYie3JlbH0ge2x9IDogYW5jcmUgw5d7cy5jb3VudChvKX0iCiAgICAgICAgcyA9IHMucmVwbGFjZShvLCBuKQogICAgb3BlbihwLCAidyIsIGVuY29kaW5nPSJ1dGYtOCIpLndyaXRlKHMpCgplZGl0KCJwYWNrYWdlcy9iYWNrZW5kL3NyYy9tb2R1bGVzL3VzZXJzL3JvdXRlci50cyIsIFsKKCcnJyAgICAgIGNvbnN0IHVzZXJzID0gYXdhaXQgY3R4LnByaXNtYS51c2VyLmZpbmRNYW55KHsKICAgICAgICBvcmRlckJ5OiB7IGlkOiAiYXNjIiB9LAogICAgICAgIG9taXQ6IHsgcGFzc3dvcmQ6IHRydWUgfSwKICAgICAgfSk7CiAgICAgIHJldHVybiB1c2Vycy5tYXAoKHUpID0+ICh7IC4uLnUsIGlzRGVtbzogaXNEZW1vRW1haWwodS5lbWFpbCkgfSkpOycnJywnJycgICAgICBjb25zdCB1c2VycyA9IGF3YWl0IGN0eC5wcmlzbWEudXNlci5maW5kTWFueSh7CiAgICAgICAgb3JkZXJCeTogeyBpZDogImFzYyIgfSwKICAgICAgICBvbWl0OiB7IHBhc3N3b3JkOiB0cnVlIH0sCiAgICAgICAgaW5jbHVkZTogewogICAgICAgICAgbWVtYmVyR3JvdXBNZW1iZXJzaGlwczogewogICAgICAgICAgICBzZWxlY3Q6IHsgZ3JvdXA6IHsgc2VsZWN0OiB7IGlkOiB0cnVlLCBuYW1lOiB0cnVlLCBpc0FkbWluR3JvdXA6IHRydWUgfSB9IH0sCiAgICAgICAgICB9LAogICAgICAgIH0sCiAgICAgIH0pOwogICAgICByZXR1cm4gdXNlcnMubWFwKCh7IG1lbWJlckdyb3VwTWVtYmVyc2hpcHMsIC4uLnUgfSkgPT4gKHsKICAgICAgICAuLi51LAogICAgICAgIGlzRGVtbzogaXNEZW1vRW1haWwodS5lbWFpbCksCiAgICAgICAgLy8gR3JvdXBlcyBkdSBtZW1icmUgOiBBZG1pbmlzdHJhdGV1cnMgZCdhYm9yZCwgcHVpcyBvcmRyZSBhbHBoYWLDqXRpcXVlLgogICAgICAgIGdyb3VwczogbWVtYmVyR3JvdXBNZW1iZXJzaGlwcwogICAgICAgICAgLm1hcCgobSkgPT4gbS5ncm91cCkKICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYi5pc0FkbWluR3JvdXApIC0gTnVtYmVyKGEuaXNBZG1pbkdyb3VwKSB8fCBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUsICJmciIpKSwKICAgICAgfSkpOycnJywiZ2V0QWxsIiksCl0pCgplZGl0KCJhcHBzL3dlYi9zcmMvZmVhdHVyZXMvYWRtaW4vdXNlcnMvY29tcG9uZW50cy9Vc2Vyc1RhYmxlLnRzeCIsIFsKKCcnJ3R5cGUgVXNlclJvdyA9IHsgaWQ6IHN0cmluZzsgZW1haWw6IHN0cmluZzsgbmFtZTogc3RyaW5nOyBraW5kOiBzdHJpbmcgfTsnJycsJycndHlwZSBVc2VyUm93ID0geyBpZDogc3RyaW5nOyBlbWFpbDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IGdyb3Vwczogc3RyaW5nOyBraW5kOiBzdHJpbmcgfTsKCi8qKiBTw6lwYXJhdGV1ciBkZXMgbm9tcyBkZSBncm91cGVzIGRhbnMgbGEgY2VsbHVsZSAodGV4dGUgOiBsYSByZWNoZXJjaGUgZXQgbGUgdHJpIGwndXRpbGlzZW50KS4gKi8KY29uc3QgR1JPVVBfU0VQID0gIiDCtyAiOycnJywidHlwZSIpLAooJycnICAgICAgbmFtZTogW3UuZmlyc3ROYW1lLCB1Lmxhc3ROYW1lXS5maWx0ZXIoQm9vbGVhbikuam9pbigiICIpLnRyaW0oKSwKICAgICAga2luZDogdS5pc0RlbW8gPyAiRMOpbW8iIDogIk1lbWJyZSIsCiAgICB9KSk7JycnLCcnJyAgICAgIG5hbWU6IFt1LmZpcnN0TmFtZSwgdS5sYXN0TmFtZV0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oIiAiKS50cmltKCksCiAgICAgIGdyb3VwczogdS5ncm91cHMubWFwKChnKSA9PiBnLm5hbWUpLmpvaW4oR1JPVVBfU0VQKSwKICAgICAga2luZDogdS5pc0RlbW8gPyAiRMOpbW8iIDogIk1lbWJyZSIsCiAgICB9KSk7CiAgY29uc3QgYWRtaW5Hcm91cE5hbWVzID0gbmV3IFNldChhbGwuZmxhdE1hcCgodSkgPT4gdS5ncm91cHMuZmlsdGVyKChnKSA9PiBnLmlzQWRtaW5Hcm91cCkubWFwKChnKSA9PiBnLm5hbWUpKSk7JycnLCJyb3dzIiksCignJycgICAgeyBwcm9wZXJ0eTogIm5hbWUiLCBkaXNwbGF5TmFtZTogIk5vbSIsIHR5cGU6ICJzdHJpbmciIH0sJycnLCcnJyAgICB7IHByb3BlcnR5OiAibmFtZSIsIGRpc3BsYXlOYW1lOiAiTm9tIiwgdHlwZTogInN0cmluZyIgfSwKICAgIHsKICAgICAgcHJvcGVydHk6ICJncm91cHMiLAogICAgICBkaXNwbGF5TmFtZTogIkdyb3VwZXMiLAogICAgICB0eXBlOiAic3RyaW5nIiwKICAgICAgcmVuZGVyOiAodmFsdWUpID0+IHsKICAgICAgICBjb25zdCBuYW1lcyA9IFN0cmluZyh2YWx1ZSA/PyAiIikuc3BsaXQoR1JPVVBfU0VQKS5maWx0ZXIoQm9vbGVhbik7CiAgICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT0idGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQiPmF1Y3VuPC9zcGFuPjsKICAgICAgICByZXR1cm4gKAogICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJmbGV4IGZsZXgtd3JhcCBnYXAtMSI+CiAgICAgICAgICAgIHtuYW1lcy5tYXAoKG4pID0+ICgKICAgICAgICAgICAgICA8c3BhbgogICAgICAgICAgICAgICAga2V5PXtufQogICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgcm91bmRlZC1mdWxsIHB4LTIgcHktMC41IHRleHQteHMgJHsKICAgICAgICAgICAgICAgICAgYWRtaW5Hcm91cE5hbWVzLmhhcyhuKQogICAgICAgICAgICAgICAgICAgID8gImJnLWFtYmVyLTEwMCBmb250LXNlbWlib2xkIHRleHQtYW1iZXItOTAwIgogICAgICAgICAgICAgICAgICAgIDogImJnLW11dGVkIHRleHQtZm9yZWdyb3VuZCIKICAgICAgICAgICAgICAgIH1gfQogICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgIHtufQogICAgICAgICAgICAgIDwvc3Bhbj4KICAgICAgICAgICAgKSl9CiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgKTsKICAgICAgfSwKICAgIH0sJycnLCJjb2x1bW4iKSwKXSkKcHJpbnQoIiAgb2sgIHRhYmxlIGRlcyB1dGlsaXNhdGV1cnMgOiBjb2xvbm5lIMKrIEdyb3VwZXMgwrsiKQo=' | base64 -d > "$W/edit.py"

echo "== application =="
python3 "$W/edit.py" . || { restore; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi

echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; restore; exit 1
fi
echo "  ✅ check OK"
git add "${FILES[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
feat(users): groupes de chaque membre dans la table des utilisateurs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01QwiRBHC9Woay42Lx5GUVBU
MSG