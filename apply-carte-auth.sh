#!/usr/bin/env bash
# Partie « Authentification et droits » : carte des entités et parcours.
# Prérequis : apply-carte-stockage.sh.
# Usage (racine du repo) : bash apply-carte-auth.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/auth/authentification.mdx" 2>/dev/null | grep -qF "Un membre se connecte, puis navigue"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Envoyer une photo dans la bibliothèque" "apps/web/content/docs/dev/stockage/envoyer-et-servir-un-fichier.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-carte-stockage.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/auth/authentification.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Un membre se connecte, puis navigue" "apps/web/content/docs/dev/auth/authentification.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
trap 'restore' ERR


python3 - <<'PY'
import base64
spec_skip_done = False
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    if s.count(old) == 0 and s.count(new) == 1 and spec_skip_done: return  # déjà fait par un script précédent
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
sub('apps/web/content/docs/dev/auth/authentification.mdx', 'c2VjdGlvbjogIkF1dGhlbnRpZmljYXRpb24gZXQgZHJvaXRzIgpvcmRlcjogMQotLS0KCg==',
    'c2VjdGlvbjogIkF1dGhlbnRpZmljYXRpb24gZXQgZHJvaXRzIgpvcmRlcjogMQplbnRpdGllczoKICBVc2VyOiBbZW1haWwsIHBhc3N3b3JkLCBsYXN0TG9naW5BdF0KICBTZXNzaW9uOiBbdXNlcklkLCBleHBpcmVzQXRdCiAgUGFzc3dvcmRSZXNldFRva2VuOiBbdG9rZW5IYXNoLCBleHBpcmVzQXQsIHVzZWRBdCwgcmVxdWVzdElwLCB1c2VyQWdlbnRdCiAgTWVtYmVyR3JvdXA6IFtuYW1lLCBpc0FkbWluR3JvdXAsIHBhcmVudEdyb3VwSWRdCiAgTWVtYmVyR3JvdXBNZW1iZXJzaGlwOiBbZ3JvdXBJZCwgdXNlcklkLCBhY2Nlc3NdCiAgUGFnZVZpc2liaWxpdHk6IFtrZXksIHB1Ymxpc2hlZF0Kc3RvcmllczoKICAtIHRpdGxlOiBVbiBtZW1icmUgc2UgY29ubmVjdGUsIHB1aXMgbmF2aWd1ZQogICAgYWN0b3I6IE1lbWJyZQogICAgc3RlcHM6CiAgICAgIC0gbGFiZWw6IElsIHNlIGNvbm5lY3RlIDsgdW5lIHNlc3Npb24gZXN0IGNyw6nDqWUgZW4gYmFzZSwgdW4gamV0b24gc2lnbsOpIGxhIGTDqXNpZ25lIGRhbnMgdW4gY29va2llCiAgICAgICAgY2FsbDogYXV0aC5sb2dpbgogICAgICAgIHNlY3Rpb246IFNlIGNvbm5lY3RlcgogICAgICAtIGxhYmVsOiDDgCBjaGFxdWUgcmVxdcOqdGUsIGxlIHNlcnZldXIgcmVsaXQgbGEgc2Vzc2lvbiAoZXQgc3VwcHJpbWUgY2VsbGUgcXVpIGEgZXhwaXLDqSksIHB1aXMgY2FsY3VsZSBzaSBsZSBtZW1icmUgZXN0IGFkbWluaXN0cmF0ZXVyCiAgICAgICAgY2FsbDogZ2V0U2Vzc2lvbkZyb21SZXF1ZXN0CiAgICAgICAgc2VjdGlvbjogTGlyZSBsYSBzZXNzaW9uIMOgIGNoYXF1ZSByZXF1w6p0ZQogICAgICAtIGxhYmVsOiBDaGFxdWUgYXBwZWwgdFJQQyByZcOnb2l0IGNldHRlIHNlc3Npb24gZGFucyBzb24gY29udGV4dGUKICAgICAgICBjYWxsOiBjcmVhdGVUUlBDQ29udGV4dAogICAgICAgIHNlY3Rpb246IExlIGNvbnRleHRlIHRSUEMgZXQgbGVzIHByb2PDqWR1cmVzCiAgLSB0aXRsZTogTGUgbWVtYnJlIGEgb3VibGnDqSBzb24gbW90IGRlIHBhc3NlCiAgICBhY3RvcjogVmlzaXRldXIKICAgIHN0ZXBzOgogICAgICAtIGxhYmVsOiBJbCBkZW1hbmRlIHVuIGxpZW4gOyBzZXVsZSBsJ2VtcHJlaW50ZSBkdSBqZXRvbiBlc3QgZ2FyZMOpZSBlbiBiYXNlCiAgICAgICAgY2FsbDogYXV0aC5yZXF1ZXN0UGFzc3dvcmRSZXNldAogICAgICAgIHNlY3Rpb246IExlIG1vdCBkZSBwYXNzZSBvdWJsacOpCiAgICAgIC0gbGFiZWw6IElsIGNob2lzaXQgdW4gbm91dmVhdSBtb3QgZGUgcGFzc2UgOyBsZSBsaWVuIGVzdCBjb25zb21tw6kgZXQgc2VzIHNlc3Npb25zIGZlcm3DqWVzCiAgICAgICAgY2FsbDogYXV0aC5yZXNldFBhc3N3b3JkCiAgICAgICAgc2VjdGlvbjogTGUgbW90IGRlIHBhc3NlIG91Ymxpw6kKICAtIHRpdGxlOiBMZSBtZW1icmUgY2hhbmdlIGRlIG1vdCBkZSBwYXNzZSwgcHVpcyBzZSBkw6ljb25uZWN0ZQogICAgYWN0b3I6IE1lbWJyZSBjb25uZWN0w6kKICAgIHN0ZXBzOgogICAgICAtIGxhYmVsOiBJbCBjaGFuZ2Ugc29uIG1vdCBkZSBwYXNzZSA7IHNlcyBhdXRyZXMgc2Vzc2lvbnMgc29udCBmZXJtw6llcwogICAgICAgIGNhbGw6IGF1dGguY2hhbmdlUGFzc3dvcmQKICAgICAgICBzZWN0aW9uOiBTZSBkw6ljb25uZWN0ZXIgZXQgY2hhbmdlciBkZSBtb3QgZGUgcGFzc2UKICAgICAgLSBsYWJlbDogSWwgc2UgZMOpY29ubmVjdGUgOyBzYSBzZXNzaW9uIGVzdCBzdXBwcmltw6llCiAgICAgICAgY2FsbDogYXV0aC5sb2dvdXQKICAgICAgICBzZWN0aW9uOiBTZSBkw6ljb25uZWN0ZXIgZXQgY2hhbmdlciBkZSBtb3QgZGUgcGFzc2UKICAtIHRpdGxlOiBVbiBhZG1pbmlzdHJhdGV1ciBvdXZyZSBsZSB0YWJsZWF1IGRlIGJvcmQKICAgIGFjdG9yOiBBZG1pbmlzdHJhdGV1cgogICAgc3RlcHM6CiAgICAgIC0gbGFiZWw6IExlIGdhYmFyaXQgZHUgdGFibGVhdSBkZSBib3JkIHbDqXJpZmllIGwnYXBwYXJ0ZW5hbmNlIGF1IGdyb3VwZSBBZG1pbmlzdHJhdGV1cnMKICAgICAgICBjYWxsOiBsYXlvdXQgLyhhZG1pbikKICAgICAgICBzZWN0aW9uOiAiTGVzIGRyb2l0cyA6IGRlcyBncm91cGVzIgogICAgICAtIGxhYmVsOiBJbCBwdWJsaWUgdW5lIHBhZ2UgcmVzdMOpZSBlbiBjb25zdHJ1Y3Rpb24KICAgICAgICBjYWxsOiBwYWdlVmlzaWJpbGl0eS5zZXRQdWJsaXNoZWQKICAgICAgICBzZWN0aW9uOiBMZXMgcGFnZXMgZW4gY29uc3RydWN0aW9uCi0tLQoK')
sub('apps/web/content/docs/dev/auth/authentification.mdx', 'Cj4gKipQcsOpY8OpZGVtbWVudC4qKiBDaGFxdWUgcHJvY8OpZHVyZSB0UlBDIHJlw6dvaXQgdW4gY29udGV4dGUsIGV0IGxlcyBwcm9jw6lkdXJlcyBkJ2FkbWluaXN0cmF0aW9uIGV4aWdlbnQgdW4gYWRtaW5pc3RyYXRldXIuIExlIGNoYXBpdHJlIHN1ciBsZSByb3V0YWdlIGEgbW9udHLDqSB0cm9pcyBuaXZlYXV4IGRlIGNvbnRyw7RsZSBhdXRvdXIgZHUgdGFibGVhdSBkZSBib3JkLiBJbCByZXN0ZSDDoCB2b2lyIGQnb8O5IHZpZW50IGNlIHF1ZSB0b3VzIGNlcyBjb250csO0bGVzIGNvbnN1bHRlbnQgOiBsYSBzZXNzaW9uLgoKIyMgRGV1eCBxdWVzdGlvbnMK',
    'Cj4gKipQcsOpY8OpZGVtbWVudC4qKiBDaGFxdWUgcHJvY8OpZHVyZSB0UlBDIHJlw6dvaXQgdW4gY29udGV4dGUsIGV0IGxlcyBwcm9jw6lkdXJlcyBkJ2FkbWluaXN0cmF0aW9uIGV4aWdlbnQgdW4gYWRtaW5pc3RyYXRldXIuIExlIGNoYXBpdHJlIHN1ciBsZSByb3V0YWdlIGEgbW9udHLDqSB0cm9pcyBuaXZlYXV4IGRlIGNvbnRyw7RsZSBhdXRvdXIgZHUgdGFibGVhdSBkZSBib3JkLiBJbCByZXN0ZSDDoCB2b2lyIGQnb8O5IHZpZW50IGNlIHF1ZSB0b3VzIGNlcyBjb250csO0bGVzIGNvbnN1bHRlbnQgOiBsYSBzZXNzaW9uLgoKIyMgTGVzIHBhcmNvdXJzIGR1IGNoYXBpdHJlCgpRdWF0cmUgY2FzIGQndXRpbGlzYXRpb24gdHJhdmVyc2VudCBjZSBjaGFwaXRyZSA6IHNlIGNvbm5lY3RlciBldCBuYXZpZ3VlciwgcmV0cm91dmVyIHVuIG1vdCBkZSBwYXNzZSBvdWJsacOpLCBlbiBjaGFuZ2VyIGV0IHNlIGTDqWNvbm5lY3RlciwgZXQgb3V2cmlyIGxlIHRhYmxlYXUgZGUgYm9yZCBlbiBhZG1pbmlzdHJhdGV1ci4gQ2hhcXVlIG9uZ2xldCBlbiBkw6lyb3VsZSBsZXMgw6l0YXBlcyBldCBjZSBxdSdlbGxlcyBsaXNlbnQgb3Ugw6ljcml2ZW50IGVuIGJhc2UsIHJlbGV2w6kgZGFucyBsZSBjb2RlIDsgY2hhcXVlIMOpdGFwZSBtw6huZSDDoCBzb24gZXhwbGljYXRpb24gcGx1cyBiYXMsIG91IMOgIGxhIGNhcnRlIGRlcyBlbnRpdMOpcywgcmVqb3XDqWUgw6AgY2V0dGUgw6l0YXBlLgoKPFBhcmNvdXJzIC8+CgojIyBEZXV4IHF1ZXN0aW9ucwo=')
print("  édits ok (2 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== carte des procédures =="
# Régénérée sur CE repo : elle doit refléter ton backend tel qu'il est (y compris ce que d'autres
# sessions y ont ajouté), pas le mien.
if ! node scripts/build-procedure-map.mjs --write > /tmp/akfc_pm.log 2>&1; then
  echo "❌ analyse du backend ÉCHOUÉE :"; tail -8 /tmp/akfc_pm.log; restore; exit 1
fi
echo "  ✅ $(tail -1 /tmp/akfc_pm.log)"
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm --filter backend typecheck && pnpm typecheck"
else
  CHECK="pnpm check"
fi
if ! bash -c "$CHECK" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|✗ tutos|ERR_|Error:|EACCES|Permission denied" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -15
  restore; exit 1
fi
echo "  ✅ check OK"
git add "${MODIFIED[@]}" "${CREATED[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
feat(docs): entités et parcours de l'authentification et des droits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG