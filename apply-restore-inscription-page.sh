#!/usr/bin/env bash
# PAGE « S'INSCRIRE » (/inscription) : le fichier de la page manquait dans le repo → 404 sur
# « Comment s'inscrire » (accueil), « S'inscrire » (pied de page) et l'encart de la page Contacts.
# Recréée à l'identique de sa dernière version (fix-inscription-online, -placement, -editable) :
# « ← Accueil », texte du constructeur (Pages éditoriales → S'inscrire), puis « Liens utiles ».
# Usage (racine du repo) : bash apply-restore-inscription-page.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if grep -q "InscriptionPage" "apps/web/src/app/(public)/inscription/page.tsx" 2>/dev/null; then echo "La page existe déjà dans le repo : la 404 a une autre cause. Envoyer : git status --short apps/web/src/app | head -5"; exit 0; fi
MODIFIED=()
CREATED=("apps/web/src/app/(public)/inscription/page.tsx")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; rmdir -p "apps/web/src/app/(public)/inscription" 2>/dev/null || true; echo "  ↩ fichiers restaurés"; }
trap 'restore' ERR

mkdir -p "apps/web/src/app/(public)/inscription"
base64 -d > "apps/web/src/app/(public)/inscription/page.tsx" <<'B64'
aW1wb3J0IHR5cGUgeyBKU1ggfSBmcm9tICJyZWFjdCI7CmltcG9ydCB0eXBlIHsgTWV0YWRhdGEg
fSBmcm9tICJuZXh0IjsKaW1wb3J0IExpbmsgZnJvbSAibmV4dC9saW5rIjsKaW1wb3J0IHsgQXJy
b3dMZWZ0LCBFeHRlcm5hbExpbmsgfSBmcm9tICJsdWNpZGUtcmVhY3QiOwoKaW1wb3J0IHsgcHJp
c21hIH0gZnJvbSAiQGJhY2tlbmQvcHJpc21hIjsKaW1wb3J0IHsgaXNFZGl0b3JpYWxQYWdlR2F0
ZWQsIFVuZGVyQ29uc3RydWN0aW9uIH0gZnJvbSAiQGZlYXR1cmVzL2VkaXRvcmlhbC9lZGl0b3Jp
YWxHYXRlIjsKaW1wb3J0IHsgcGFyc2VQYWdlQ29udGVudFYxIH0gZnJvbSAiQGNvbnRyYWN0cy9w
YWdlIjsKaW1wb3J0IHsgUGFnZVJlbmRlcmVyIH0gZnJvbSAiQGZlYXR1cmVzL3BhZ2UtYnVpbGRl
ci9QYWdlUmVuZGVyZXIiOwppbXBvcnQgeyBnZXRBY3RpdmVQYXJ0bmVycyB9IGZyb20gIkBmZWF0
dXJlcy9wYXJ0bmVycy9nZXRBY3RpdmVQYXJ0bmVycyI7CmltcG9ydCB7IFBhcnRuZXJMb2dvIH0g
ZnJvbSAiQGZlYXR1cmVzL3BhcnRuZXJzL1BhcnRuZXJMb2dvIjsKaW1wb3J0IHsgUEFSVE5FUl9S
T0xFX0xBQkVMIH0gZnJvbSAiQGZlYXR1cmVzL3BhcnRuZXJzL3BhcnRuZXJVaSI7CgovKioKICog
wqsgUydpbnNjcmlyZSDCuyDigJQgYC9pbnNjcmlwdGlvbmAuCiAqCiAqIFBhZ2Ugw6lkaXRvcmlh
bGUgKFNpdGVQYWdlIMKrIGluc2NyaXB0aW9uIMK7KSA6IHNvbiB0ZXh0ZSBzZSByw6lkaWdlIGRh
bnMgbGUgY29uc3RydWN0ZXVyICh1biB0ZXh0ZQogKiBkZSBkw6lwYXJ0IHkgZXN0IGNyw6nDqSBh
dSBwcmVtaWVyIGTDqW1hcnJhZ2UsIHZvaXIgZW5zdXJlSW5zY3JpcHRpb25QYWdlKS4gRW4gZGVz
c291cywgbGVzIHBhcnRlbmFpcmVzCiAqIGV0IGxldXJzIGxpZW5zIHV0aWxlcyAoUsOpZ2xhZ2Vz
IGR1IHNpdGUpIDogaW5zY3JpcHRpb24gZXQgdGFyaWZzIHN1ciBsZSBzaXRlIGRlIGxhIE1KQywg
ZsOpZMOpcmF0aW9u4oCmCiAqLwpleHBvcnQgY29uc3QgbWV0YWRhdGE6IE1ldGFkYXRhID0geyB0
aXRsZTogIlMnaW5zY3JpcmUiIH07CgpleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBJbnNj
cmlwdGlvblBhZ2UoKTogUHJvbWlzZTxKU1guRWxlbWVudD4gewogIGlmIChhd2FpdCBpc0VkaXRv
cmlhbFBhZ2VHYXRlZCgiaW5zY3JpcHRpb24iKSkgewogICAgcmV0dXJuIDxVbmRlckNvbnN0cnVj
dGlvbiAvPjsKICB9CiAgY29uc3QgW3BhZ2UsIHBhcnRuZXJzXSA9IGF3YWl0IFByb21pc2UuYWxs
KFsKICAgIHByaXNtYS5zaXRlUGFnZS5maW5kVW5pcXVlKHsgd2hlcmU6IHsgc2x1ZzogImluc2Ny
aXB0aW9uIiB9IH0pLAogICAgZ2V0QWN0aXZlUGFydG5lcnMoKSwKICBdKTsKICBjb25zdCBjb250
ZW50ID0gcGFyc2VQYWdlQ29udGVudFYxKHBhZ2U/LmNvbnRlbnQpOwoKICByZXR1cm4gKAogICAg
PGRpdiBjbGFzc05hbWU9ImFrZmMtcGFnZSBweS0xMiI+CiAgICAgIDxMaW5rIGhyZWY9Ii8iIGNs
YXNzTmFtZT0ibWItNCBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgdGV4dC1zbSB0ZXh0
LWdyYXktNTAwIGhvdmVyOnRleHQtZ3JheS04MDAiPgogICAgICAgIDxBcnJvd0xlZnQgY2xhc3NO
YW1lPSJoLTQgdy00IiAvPiBBY2N1ZWlsCiAgICAgIDwvTGluaz4KICAgICAgPGgxIGNsYXNzTmFt
ZT0ibWItOCB0ZXh0LTJ4bCBmb250LWJvbGQiPntwYWdlPy50aXRsZSA/PyAiUydpbnNjcmlyZSJ9
PC9oMT4KCiAgICAgIHsvKiBDZSBxdWkgcydhZmZpY2hlIGVzdCBleGFjdGVtZW50IGxlIGNvbnRl
bnUgZHUgY29uc3RydWN0ZXVyICh0ZXh0ZSBkZSBkw6lwYXJ0IGNyw6nDqSBhdQogICAgICAgICAg
cHJlbWllciBkw6ltYXJyYWdlLCBtb2RpZmlhYmxlIGRhbnMgUGFnZXMgw6lkaXRvcmlhbGVzIOKG
kiBTJ2luc2NyaXJlKS4gKi99CiAgICAgIHtjb250ZW50LmJsb2Nrcy5sZW5ndGggPiAwICYmIDxQ
YWdlUmVuZGVyZXIgY29udGVudD17Y29udGVudH0gLz59CgogICAgICB7cGFydG5lcnMubGVuZ3Ro
ID4gMCAmJiAoCiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPSJtdC0xMiI+CiAgICAgICAgICA8
aDIgY2xhc3NOYW1lPSJtYi02IHRleHQteGwgZm9udC1zZW1pYm9sZCI+TGllbnMgdXRpbGVzPC9o
Mj4KICAgICAgICAgIDx1bCBjbGFzc05hbWU9ImdyaWQgbGlzdC1ub25lIGdhcC02IHAtMCBtZDpn
cmlkLWNvbHMtMiI+CiAgICAgICAgICAgIHtwYXJ0bmVycy5tYXAoKHApID0+ICgKICAgICAgICAg
ICAgICA8bGkga2V5PXtwLmlkfSBjbGFzc05hbWU9ImZsZXggZ2FwLTQgcm91bmRlZC1sZyBib3Jk
ZXIgYm9yZGVyLWJvcmRlciBwLTUiPgogICAgICAgICAgICAgICAgPFBhcnRuZXJMb2dvIG5hbWU9
e3AubmFtZX0gbG9nb1VybD17cC5sb2dvVXJsfSB3ZWJzaXRlVXJsPXtwLndlYnNpdGVVcmx9IHNp
emU9ImxnIiAvPgogICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9Im1pbi13LTAiPgogICAg
ICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9InRleHQteHMgdXBwZXJjYXNlIHRyYWNraW5nLXdp
ZGUgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj57UEFSVE5FUl9ST0xFX0xBQkVMW3Aucm9sZV19PC9w
PgogICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9ImZvbnQtc2VtaWJvbGQiPntwLm5hbWV9
PC9wPgogICAgICAgICAgICAgICAgICB7cC5kZXNjcmlwdGlvbiAmJiA8cCBjbGFzc05hbWU9Im10
LTEgdGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQiPntwLmRlc2NyaXB0aW9ufTwvcD59CiAg
ICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9Im10LTMgZmxleCBsaXN0LW5vbmUgZmxleC1j
b2wgZ2FwLTEuNSBwLTAgdGV4dC1zbSI+CiAgICAgICAgICAgICAgICAgICAge3AubGlua3MubWFw
KChsKSA9PiAoCiAgICAgICAgICAgICAgICAgICAgICA8bGkga2V5PXtsLnVybH0+CiAgICAgICAg
ICAgICAgICAgICAgICAgIDxFeHRlcm5hbEFuY2hvciBocmVmPXtsLnVybH0+e2wubGFiZWx9PC9F
eHRlcm5hbEFuY2hvcj4KICAgICAgICAgICAgICAgICAgICAgIDwvbGk+CiAgICAgICAgICAgICAg
ICAgICAgKSl9CiAgICAgICAgICAgICAgICAgICAge3Aud2Vic2l0ZVVybCAmJiAoCiAgICAgICAg
ICAgICAgICAgICAgICA8bGk+CiAgICAgICAgICAgICAgICAgICAgICAgIDxFeHRlcm5hbEFuY2hv
ciBocmVmPXtwLndlYnNpdGVVcmx9PlNpdGUgZGUge3AubmFtZX08L0V4dGVybmFsQW5jaG9yPgog
ICAgICAgICAgICAgICAgICAgICAgPC9saT4KICAgICAgICAgICAgICAgICAgICApfQogICAgICAg
ICAgICAgICAgICA8L3VsPgogICAgICAgICAgICAgICAgPC9kaXY+CiAgICAgICAgICAgICAgPC9s
aT4KICAgICAgICAgICAgKSl9CiAgICAgICAgICA8L3VsPgogICAgICAgIDwvc2VjdGlvbj4KICAg
ICAgKX0KICAgIDwvZGl2PgogICk7Cn0KCmZ1bmN0aW9uIEV4dGVybmFsQW5jaG9yKHsgaHJlZiwg
Y2hpbGRyZW4gfTogeyBocmVmOiBzdHJpbmc7IGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGUgfSk6
IEpTWC5FbGVtZW50IHsKICByZXR1cm4gKAogICAgPGEgaHJlZj17aHJlZn0gdGFyZ2V0PSJfYmxh
bmsiIHJlbD0ibm9vcGVuZXIgbm9yZWZlcnJlciIgY2xhc3NOYW1lPSJpbmxpbmUtZmxleCBpdGVt
cy1jZW50ZXIgZ2FwLTEgdGV4dC1lbWVyYWxkLTcwMCBob3Zlcjp1bmRlcmxpbmUgZGFyazp0ZXh0
LWVtZXJhbGQtNDAwIj4KICAgICAge2NoaWxkcmVufQogICAgICA8RXh0ZXJuYWxMaW5rIGNsYXNz
TmFtZT0iaC0zLjUgdy0zLjUiIGFyaWEtaGlkZGVuPSJ0cnVlIiAvPgogICAgICA8c3BhbiBjbGFz
c05hbWU9InNyLW9ubHkiPihub3V2ZWwgb25nbGV0KTwvc3Bhbj4KICAgIDwvYT4KICApOwp9Cg==
B64

python3 - <<'PY'
import base64
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
print("  édits ok (0 substitutions, 1 fichiers créés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; restore; exit 1
fi
echo "  ✅ check OK"
git add "${MODIFIED[@]}" "${CREATED[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
fix(public): page « S'inscrire » (/inscription) restaurée

Le fichier de la page manquait dans le repo : les liens « Comment
s'inscrire » (accueil), « S'inscrire » (pied de page) et l'encart de la
page Contacts menaient à une 404. Page recréée à l'identique de sa
dernière version : retour accueil, contenu du constructeur, liens utiles
des partenaires.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Vérifier http://localhost:3000/inscription. « En construction » = page en brouillon : la publier dans Pages éditoriales → S'inscrire."