#!/usr/bin/env bash
# Doc développeur : « Les tags de personnes », le rapport et les images de carte.
# Prérequis : apply-fix-tags-rapport.sh.
# Usage (racine du repo) : bash apply-docs-tags-rapport.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/legal/tags-de-personnes.mdx" 2>/dev/null | grep -qF "### Le rapport « Droit à l’image »"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "publicReport: adminProcedure" "packages/backend/src/modules/mediaPeople/router.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-tags-rapport.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/legal/tags-de-personnes.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "### Le rapport « Droit à l’image »" "apps/web/content/docs/dev/legal/tags-de-personnes.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
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
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'ICAgICAgICBjYWxsOiBwb3N0LnVwZGF0ZQogICAgICAgIHNlY3Rpb246IExlcyBjb250ZW51cyBkZXMgcGFnZXMKICAgICAgLSBsYWJlbDogVW5lIHBlcnNvbm5lIG7igJlhIHBhcyByw6lwb25kdSA7IGlsIGxhIHJlbGFuY2UsIHVuZSBmb2lzIGF1IHBsdXMgdG91cyBsZXMgc2VwdCBqb3VycwogICAgICAgIGNhbGw6IG1lZGlhUGVvcGxlLnJlbWluZAo=',
    'ICAgICAgICBjYWxsOiBwb3N0LnVwZGF0ZQogICAgICAgIHNlY3Rpb246IExlcyBjb250ZW51cyBkZXMgcGFnZXMKICAgICAgLSBsYWJlbDogSWwgb3V2cmUgbGUgcmFwcG9ydCBkZXMgbcOpZGlhcyBlbiBsaWduZSA7IGxlcyBtYXNxdcOpcyBk4oCZYWJvcmQsIGF2ZWMgbOKAmWVuZHJvaXQgb8O5IGlscyBzb250IG1vbnRyw6lzCiAgICAgICAgY2FsbDogbWVkaWFQZW9wbGUucHVibGljUmVwb3J0CiAgICAgICAgc2VjdGlvbjogTGUgcmFwcG9ydCDCqyBEcm9pdCDDoCBs4oCZaW1hZ2UgwrsKICAgICAgLSBsYWJlbDogVW5lIHBlcnNvbm5lIG7igJlhIHBhcyByw6lwb25kdSA7IGlsIGxhIHJlbGFuY2UsIHVuZSBmb2lzIGF1IHBsdXMgdG91cyBsZXMgc2VwdCBqb3VycwogICAgICAgIGNhbGw6IG1lZGlhUGVvcGxlLnJlbWluZAo=')
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'ICBmaWxlcGF0aD0icGFja2FnZXMvYmFja2VuZC9zcmMvbW9kdWxlcy9tZWRpYVBlb3BsZS9wdWJsaWNDb250ZW50UmlnaHRzLnNlcnZpY2UudHMiCiAgZmlsZW5hbWU9InB1YmxpY0NvbnRlbnRSaWdodHMuc2VydmljZS50cyIKICBzbmlwcGV0UmFuZ2U9IjE3LTM1IgogIHNuaXBwZXRIaWdobGlnaHQ9IjUsNiIKICBzbmlwcGV0VGl0bGU9IlRvdXRlcyBsZXMgaW1hZ2VzIGRlIHRvdXMgbGVzIGNvbnRlbnVzIHJlw6d1cywgcHVpcyBsZXMgcmVmdXMiCiAgZnVsbEZpbGVUaXRsZT0iVm9pciBsZSBmaWNoaWVyIGNvbXBsZXQiCg==',
    'ICBmaWxlcGF0aD0icGFja2FnZXMvYmFja2VuZC9zcmMvbW9kdWxlcy9tZWRpYVBlb3BsZS9wdWJsaWNDb250ZW50UmlnaHRzLnNlcnZpY2UudHMiCiAgZmlsZW5hbWU9InB1YmxpY0NvbnRlbnRSaWdodHMuc2VydmljZS50cyIKICBzbmlwcGV0UmFuZ2U9IjE3LTQ2IgogIHNuaXBwZXRIaWdobGlnaHQ9IjUsMTcsMTgiCiAgc25pcHBldFRpdGxlPSJUb3V0ZXMgbGVzIGltYWdlcyBkZSB0b3VzIGxlcyBjb250ZW51cyByZcOndXMsIHB1aXMgbGVzIHJlZnVzIgogIGZ1bGxGaWxlVGl0bGU9IlZvaXIgbGUgZmljaGllciBjb21wbGV0Igo=')
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'Lz4KCjxDYWxsb3V0IHR5cGU9ImluZm8iPgpSZXN0ZSB1biBjYXMgOiBs4oCZaW1hZ2UgZGUgcsOpc3Vtw6kgZOKAmXVuZSBkaXNjaXBsaW5lLCBk4oCZdW4gc3RhZ2Ugb3UgZOKAmXVuIMOpdsOobmVtZW50IChgc3VtbWFyeU1lZGlhSWRgKSwgYWZmaWNow6llIHN1ciBsZXMgY2FydGVzIGRlIGzigJlhY2N1ZWlsIGV0IGRlIGzigJlhZ2VuZGEgc2FucyBwYXNzZXIgcGFyIGBQYWdlUmVuZGVyZXJgLiBFbGxlIG7igJllc3QgcGFzIGVuY29yZSB2w6lyaWZpw6llLgo8L0NhbGxvdXQ+CgojIyBSZWxhbmNlcgo=',
    'Lz4KCkzigJlpbWFnZSBkZSByw6lzdW3DqSBk4oCZdW5lIGRpc2NpcGxpbmUsIGTigJl1biBzdGFnZSBvdSBk4oCZdW4gw6l2w6huZW1lbnQgKGBzdW1tYXJ5TWVkaWFJZGApIHZpdCBob3JzIGR1IGNvbnRlbnUsIGV0IHPigJlhZmZpY2hlIHN1ciBsZXMgY2FydGVzIGRlIGzigJlhY2N1ZWlsIGV0IGRlIGzigJlhZ2VuZGEgc2FucyBwYXNzZXIgcGFyIGBQYWdlUmVuZGVyZXJgLiBFbGxlIHN1aXQgbGEgbcOqbWUgcsOoZ2xlIHBhciBsYSBwb3J0ZSBk4oCZw6AgY8O0dMOpIDogYGFzc2VydFB1YmxpY01lZGlhUmlnaHRzYCDDoCBs4oCZZW5yZWdpc3RyZW1lbnQsIGV0IGxlcyBkZXV4IHBhZ2VzIHF1aSBjb25zdHJ1aXNlbnQgbGVzIGNhcnRlcyBzYXV0ZW50IGzigJlpbWFnZSByZWZ1c8OpZSAobGEgY2FydGUgc+KAmWFmZmljaGUgc2FucyBpbWFnZSkuCgojIyMgTGUgcmFwcG9ydCDCqyBEcm9pdCDDoCBs4oCZaW1hZ2UgwrsKCk1hc3F1ZXIgYXV0b21hdGlxdWVtZW50IG5lIHN1ZmZpdCBwYXMgOiBs4oCZYWRtaW5pc3RyYXRldXIgZG9pdCBzYXZvaXIgKipxdW9pKiogYSDDqXTDqSBtYXNxdcOpLCBldCBvw7kuIExhIHBhZ2UgwqsgRHJvaXQgw6AgbOKAmWltYWdlIMK7IGR1IGNlbnRyZSBkZSBjb250csO0bGUgKHNlY3Rpb24gTcOpZGlhdGjDqHF1ZSkgbGlzdGUgbGVzIG3DqWRpYXMgbW9udHLDqXMgc3VyIGxlIHNpdGUgcHVibGljIHF1aSBkZW1hbmRlbnQgdW5lIGFjdGlvbiwgZW4gdHJvaXMgbGlzdGVzIDogbWFzcXXDqXMgKMOgIHJldGlyZXIpLCBlbiBhdHRlbnRlIGTigJlhdXRvcmlzYXRpb24sIMOgIHRhZ3Vlci4gTGVzIG3DqWRpYXMgZW4gcsOoZ2xlIG7igJl5IGZpZ3VyZW50IHBhcy4gQ2hhcXVlIGxpZ25lIGRpdCBvw7kgbGUgbcOpZGlhIGVzdCBtb250csOpLCBhdmVjIHVuIGxpZW4gdmVycyBsYSBmaWNoZSA7IHVuIGNsaWMgc3VyIGxhIHZpZ25ldHRlIG91dnJlIGxhIGZlbsOqdHJlIGRlcyB0YWdzLgoKU2F2b2lyIG/DuSB1biBtw6lkaWEgZXN0IG1vbnRyw6kgbmUgZGVtYW5kZSByaWVuIGRlIG5vdXZlYXUgOiBkZXV4IHJlZ2lzdHJlcyBleGlzdGVudCBkw6lqw6AuIGBQYWdlTWVkaWFSZWZlcmVuY2VgIHJlY2Vuc2UgbGVzIG3DqWRpYXMgZGUgY2hhcXVlIGNvbnRlbnUgw6AgY2hhcXVlIGVucmVnaXN0cmVtZW50IChpbWFnZXMgZGUgcsOpc3Vtw6kgY29tcHJpc2VzIDogY+KAmWVzdCBjZSBxdWkgbGVzIHByb3TDqGdlIGRlIGxhIGNvcmJlaWxsZSksIGV0IGBHYWxsZXJ5SXRlbWAgY2V1eCBkZXMgZ2FsZXJpZXMuCgo8Q29kZUV4YW1wbGUKICBsYW5ndWFnZT0idHMiCiAgZmlsZXBhdGg9InBhY2thZ2VzL2JhY2tlbmQvc3JjL21vZHVsZXMvbWVkaWFQZW9wbGUvcHVibGljUmlnaHRzUmVwb3J0LnNlcnZpY2UudHMiCiAgZmlsZW5hbWU9InB1YmxpY1JpZ2h0c1JlcG9ydC5zZXJ2aWNlLnRzIgogIHNuaXBwZXRSYW5nZT0iMjctNDIiCiAgc25pcHBldEhpZ2hsaWdodD0iMTEsMTMiCiAgc25pcHBldFRpdGxlPSJM4oCZdXNhZ2UgcHVibGljLCBsdSBkYW5zIGxlcyByZWdpc3RyZXMgZXhpc3RhbnRzIgogIGZ1bGxGaWxlVGl0bGU9IlZvaXIgbGUgZmljaGllciBjb21wbGV0IgovPgoKIyMgUmVsYW5jZXIK')
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'IyMgUsOpY2FwaXR1bGF0aWYKCjxEb2NzVGFibGUgY29sdW1uc0pzb249J1siUXVlc3Rpb24iLCAiUsOpcG9uc2UgZHUgcHJvamV0Il0nIHJvd3NKc29uPSdbWyJRdWkgdGFndWUgPyIsICJVbiBhZG1pbmlzdHJhdGV1ciwgw6AgbGEgbWFpbiA7IGphbWFpcyBk4oCZYWxnb3JpdGhtZSBkZSByZWNvbm5haXNzYW5jZS4iXSwgWyJPw7kgPyIsICJEYW5zIGxhIG1vZGFsZSwgb3V2ZXJ0ZSBk4oCZdW4gY2xpYyBzdXIgdW4gbcOpZGlhIGR1IHRhYmxlYXUgZOKAmXVuZSBnYWxlcmllIG91IGTigJl1biBibG9jIMKrIEdhbGVyaWUgZOKAmWltYWdlcyDCuy4iXSwgWyJRdWUgc3RvY2tlLXQtb24gPyIsICJMZSBsaWVuIHBlcnNvbm5lLW3DqWRpYSwgcXVpIGzigJlhIHBvc8OpIGV0IHF1YW5kIDsgamFtYWlzIGxlIHZlcmRpY3QuIl0sIFsiUXVpIHZvaXQgbGVzIHRhZ3MgPyIsICJMZXMgYWRtaW5pc3RyYXRldXJzIDsgbGEgcGVyc29ubmUsIGRhbnMgc29uIGV4cG9ydCBkZSBkb25uw6llcy4iXSwgWyJVbiByZWZ1cyBldCB1biBvdWJsaSBzdXIgbGEgbcOqbWUgcGhvdG8gPyIsICJMZSByZWZ1cyBs4oCZZW1wb3J0ZSA6IHJvdWdlLiJdLCBbIkV0IGxlcyBwaG90b3Mgc2FucyBwZXJzb25uZSA/IiwgIkxhIGNhc2UgwqsgYXVjdW5lIHBlcnNvbm5lIHJlY29ubmFpc3NhYmxlIMK7IDogdmVydCBwYXJ0b3V0LiJdLCBbIlF14oCZZXN0LWNlIHF1aSBibG9xdWUgPyIsICJTZXVsIHVuIHJlZnVzIGTigJl1bmUgcGVyc29ubmUgdGFndcOpZSwgcG91ciB1bmUgZGVzdGluYXRpb24gcHVibGlxdWUgOyB1bmUgYWJzZW5jZSBkZSByw6lwb25zZSBhdmVydGl0LCB1biBtw6lkaWEgbm9uIHRhZ3XDqSBwYXNzZS4iXSwgWyJFdCBsZXMgcGFnZXMgPyIsICJUb3V0ZXMgcHVibGlxdWVzIDogbcOqbWUgcsOoZ2xlLCB2w6lyaWZpw6llIMOgIGPDtHTDqSBk4oCZYXNzZXJ0T3duQXZhdGFycywgbWFzcXVhZ2UgZGFucyBQYWdlUmVuZGVyZXIuIl0sIFsiTGEgcmVsYW5jZSA/IiwgIkF1IG1lbWJyZSBtYWpldXIsIGF1IG1pbmV1ciBzYW5zIGRlbWFuZGUsIG91IHVuIG5vdXZlYXUgbGllbiBhdSBwYXJlbnQgOyB1bmUgZm9pcyB0b3VzIGxlcyBzZXB0IGpvdXJzLiJdXScgLz4KCiMjIMOAIHN1aXZyZQo=',
    'IyMgUsOpY2FwaXR1bGF0aWYKCjxEb2NzVGFibGUgY29sdW1uc0pzb249J1siUXVlc3Rpb24iLCAiUsOpcG9uc2UgZHUgcHJvamV0Il0nIHJvd3NKc29uPSdbWyJRdWkgdGFndWUgPyIsICJVbiBhZG1pbmlzdHJhdGV1ciwgw6AgbGEgbWFpbiA7IGphbWFpcyBk4oCZYWxnb3JpdGhtZSBkZSByZWNvbm5haXNzYW5jZS4iXSwgWyJPw7kgPyIsICJEYW5zIGxhIG1vZGFsZSwgb3V2ZXJ0ZSBk4oCZdW4gY2xpYyBzdXIgdW4gbcOpZGlhIGR1IHRhYmxlYXUgZOKAmXVuZSBnYWxlcmllIG91IGTigJl1biBibG9jIMKrIEdhbGVyaWUgZOKAmWltYWdlcyDCuy4iXSwgWyJRdWUgc3RvY2tlLXQtb24gPyIsICJMZSBsaWVuIHBlcnNvbm5lLW3DqWRpYSwgcXVpIGzigJlhIHBvc8OpIGV0IHF1YW5kIDsgamFtYWlzIGxlIHZlcmRpY3QuIl0sIFsiUXVpIHZvaXQgbGVzIHRhZ3MgPyIsICJMZXMgYWRtaW5pc3RyYXRldXJzIDsgbGEgcGVyc29ubmUsIGRhbnMgc29uIGV4cG9ydCBkZSBkb25uw6llcy4iXSwgWyJVbiByZWZ1cyBldCB1biBvdWJsaSBzdXIgbGEgbcOqbWUgcGhvdG8gPyIsICJMZSByZWZ1cyBs4oCZZW1wb3J0ZSA6IHJvdWdlLiJdLCBbIkV0IGxlcyBwaG90b3Mgc2FucyBwZXJzb25uZSA/IiwgIkxhIGNhc2UgwqsgYXVjdW5lIHBlcnNvbm5lIHJlY29ubmFpc3NhYmxlIMK7IDogdmVydCBwYXJ0b3V0LiJdLCBbIlF14oCZZXN0LWNlIHF1aSBibG9xdWUgPyIsICJTZXVsIHVuIHJlZnVzIGTigJl1bmUgcGVyc29ubmUgdGFndcOpZSwgcG91ciB1bmUgZGVzdGluYXRpb24gcHVibGlxdWUgOyB1bmUgYWJzZW5jZSBkZSByw6lwb25zZSBhdmVydGl0LCB1biBtw6lkaWEgbm9uIHRhZ3XDqSBwYXNzZS4iXSwgWyJFdCBsZXMgcGFnZXMgPyIsICJUb3V0ZXMgcHVibGlxdWVzIDogbcOqbWUgcsOoZ2xlLCB2w6lyaWZpw6llIMOgIGPDtHTDqSBk4oCZYXNzZXJ0T3duQXZhdGFycywgbWFzcXVhZ2UgZGFucyBQYWdlUmVuZGVyZXIgOyBsZXMgaW1hZ2VzIGRlIGNhcnRlIGF1c3NpLiJdLCBbIk/DuSB2b2lyIGNlIHF1aSBlc3QgbWFzcXXDqSA/IiwgIkxlIHJhcHBvcnQgwqsgRHJvaXQgw6AgbOKAmWltYWdlIMK7IGR1IGNlbnRyZSBkZSBjb250csO0bGUuIl0sIFsiTGEgcmVsYW5jZSA/IiwgIkF1IG1lbWJyZSBtYWpldXIsIGF1IG1pbmV1ciBzYW5zIGRlbWFuZGUsIG91IHVuIG5vdXZlYXUgbGllbiBhdSBwYXJlbnQgOyB1bmUgZm9pcyB0b3VzIGxlcyBzZXB0IGpvdXJzLiJdXScgLz4KCiMjIMOAIHN1aXZyZQo=')
print("  édits ok (4 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && pnpm typecheck && pnpm lint"
else
  CHECK="pnpm check"
fi
if ! bash -c "$CHECK" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|✗ |ERR_|Error:|EACCES|Permission denied" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -15
  restore; exit 1
fi
echo "  ✅ check OK"
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs : « Les tags de personnes », le rapport et les images de carte

L'image de résumé par la porte d'à côté (assertPublicMediaRights, cartes
de l'accueil et de l'agenda) ; le rapport « Droit à l'image » et les deux
registres qui disent où un média est montré ; parcours : publicReport.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : git push, puis sur le serveur : git pull → docker compose up -d --build akfc."