#!/usr/bin/env bash
# Documentation : l'intégration continue.
# Prérequis : apply-fix-ci.sh. Aucune migration.
# Usage (racine du repo) : bash apply-docs-ci.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx" 2>/dev/null | grep -qF "Chapitre suivant : l’intégration continue."; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "name: Vérifications (pnpm check)" ".github/workflows/ci.yml" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-ci.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx")
EXPECT=("39f3b1f511e2:apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=("apps/web/content/docs/dev/qualite/l-integration-continue.mdx")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Chapitre suivant : l’intégration continue." "apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR

mkdir -p "apps/web/content/docs/dev/qualite"
base64 -d > "apps/web/content/docs/dev/qualite/l-integration-continue.mdx" <<'B64'
LS0tCnRpdGxlOiAiTOKAmWludMOpZ3JhdGlvbiBjb250aW51ZSIKZGVzY3JpcHRpb246ICLDgCBj
aGFxdWUgcHVzaCwgR2l0SHViIHJlZmFpdCBjZSBxdWUgZmFpdCBsZSBNYWMgYXZhbnQgdW4gY29t
bWl0IOKAlCBwbnBtIGNoZWNrIOKAlCBwdWlzIGxhbmNlIGxlcyB0ZXN0cyBkZSBib3V0IGVuIGJv
dXQgc3VyIHVuZSBtYWNoaW5lIG5ldXZlLCBzYW5zIGF1Y3VuIHNlY3JldC4gQ29tbWVudCBsZSB3
b3JrZmxvdyBlc3QgY29uc3RydWl0LCBwb3VycXVvaSBpbCBuZSBkw6lwbG9pZSByaWVuLCBldCBs
ZSByw6lmbGV4ZSDDoCBwcmVuZHJlIGF2YW50IHVuIGTDqXBsb2llbWVudC4iCnNlY3Rpb246ICJR
dWFsaXTDqSIKb3JkZXI6IDUKLS0tCgppbXBvcnQgeyBDYWxsb3V0IH0gZnJvbSAiQC9mZWF0dXJl
cy9kb2NzL3VpL0NhbGxvdXQiCmltcG9ydCBEb2NzVGFibGUgZnJvbSAiQC9mZWF0dXJlcy9kb2Nz
L3VpL0RvY3NUYWJsZSIKCj4gKipQcsOpY8OpZGVtbWVudC4qKiBgcG5wbSBjaGVja2AgdG91cm5l
IGF2YW50IGNoYXF1ZSBjb21taXQgOyBsZXMgdGVzdHMgZGUgYm91dCBlbiBib3V0LCBldXgsIGRl
bWFuZGVudCBEb2NrZXIgZXQgdW4gcXVhcnQgZOKAmWhldXJlLCBldCBzZSBsYW5jZW50IHF1YW5k
IG9uIHkgcGVuc2UuCgpM4oCZaW50w6lncmF0aW9uIGNvbnRpbnVlIGZhaXQgdG91cm5lciBsZXMg
ZGV1eCAqKsOgIGNoYXF1ZSBwdXNoKiosIHN1ciB1bmUgbWFjaGluZSBkZSBHaXRIdWIsIHNhbnMg
cXXigJlvbiB5IHBlbnNlLiBVbiBwdXNoIHF1aSBjYXNzZSBxdWVscXVlIGNob3NlIHNlIHZvaXQg
YXZhbnQgbGUgZMOpcGxvaWVtZW50IDogdW5lIGNyb2l4IHJvdWdlIHN1ciBsZSBjb21taXQsIGV0
IHVuIGUtbWFpbCBkZSBHaXRIdWIuCgojIyBMZSB3b3JrZmxvdwoKVW4gc2V1bCBmaWNoaWVyLCBg
LmdpdGh1Yi93b3JrZmxvd3MvY2kueW1sYC4gSWwgc2UgZMOpY2xlbmNoZSDDoCBjaGFxdWUgcHVz
aCwgc3VyIHVuZSBwdWxsIHJlcXVlc3QsIGV0IMOgIGxhIG1haW4gZGVwdWlzIGzigJlvbmdsZXQg
KipBY3Rpb25zKiogZHUgZMOpcMO0dC4KCjxDb2RlRXhhbXBsZQogIGxhbmd1YWdlPSJ5YW1sIgog
IGZpbGVwYXRoPSIuZ2l0aHViL3dvcmtmbG93cy9jaS55bWwiCiAgZmlsZW5hbWU9ImNpLnltbCIK
ICBzbmlwcGV0UmFuZ2U9IjE4LTI5IgogIHNuaXBwZXRUaXRsZT0iUXVhbmQgaWwgdG91cm5lLCBj
ZSBxdeKAmWlsIGEgbGUgZHJvaXQgZGUgZmFpcmUiCiAgZnVsbEZpbGVUaXRsZT0iVm9pciBsZSBm
aWNoaWVyIGNvbXBsZXQiCi8+CgpgcGVybWlzc2lvbnM6IGNvbnRlbnRzOiByZWFkYCA6IGxlIHdv
cmtmbG93IGxpdCBsZSBjb2RlLCByaWVuIGTigJlhdXRyZSDigJQgaWwgbmUgcGV1dCBuaSBwb3Vz
c2VyLCBuaSBjb21tZW50ZXIsIG5pIHB1YmxpZXIuIGBjb25jdXJyZW5jeWAgYW5udWxlIHVuZSBl
eMOpY3V0aW9uIGRldmVudWUgaW51dGlsZSA6IGRldXggcHVzaGVzIHJhcHByb2Now6lzLCBzZXVs
IGxlIGRlcm5pZXIgdmEgYXUgYm91dC4KCklsIGNvbXB0ZSBkZXV4IMOpdGFwZXMsIGxhIHNlY29u
ZGUgbmUgcGFydGFudCBxdWUgc2kgbGEgcHJlbWnDqHJlIHBhc3NlIDoKCjxEb2NzVGFibGUgY29s
dW1uc0pzb249J1siw4l0YXBlIiwgIkNlIHF14oCZZWxsZSBmYWl0IiwgIkR1csOpZSJdJyByb3dz
SnNvbj0nW1siVsOpcmlmaWNhdGlvbnMiLCAicG5wbSBpbnN0YWxsIC0tZnJvemVuLWxvY2tmaWxl
IChleGFjdGVtZW50IGxlIGxvY2tmaWxlKSwgcHVpcyBwbnBtIGNoZWNrIDogZ2FyZGVzIG1haXNv
biwgdHlwZWNoZWNrLCBsaW50LiIsICLiiYggNSBtaW4iXSwgWyJUZXN0cyBkZSBib3V0IGVuIGJv
dXQiLCAiUG9zdGdyZXMsIE1pbklPIGV0IE1haWxwaXQgZMOpbWFycsOpcyBkZXB1aXMgZG9ja2Vy
LWNvbXBvc2UuZGV2LnltbCwgbGUgbmF2aWdhdGV1ciBDaHJvbWl1bSBpbnN0YWxsw6ksIHB1aXMg
cG5wbSBlMmUuIiwgIuKJiCAxMOKAkzE1IG1pbiJdXScgLz4KCiMjIyBMZXMgbcOqbWVzIHNlcnZp
Y2VzIHF1ZSBzdXIgbGUgTWFjCgpMZXMgdGVzdHMgZGUgYm91dCBlbiBib3V0IHBhcmxlbnQgw6Ag
ZGVzIGFkcmVzc2VzIGZpeGVzIChgZTJlL2Vudi5tanNgKSA6IFBvc3RncmVzIHN1ciBsZSBwb3J0
IDU0MzUsIE1pbklPIHN1ciA5MjAwLCBNYWlscGl0IHN1ciAxMDI2LiBMZSB3b3JrZmxvdyBuZSBs
ZXMgcmVkw6lmaW5pdCBwYXMgOiBpbCBkw6ltYXJyZSAqKmxlIG3Dqm1lKiogYGRvY2tlci1jb21w
b3NlLmRldi55bWxgIHF1ZSBsZSBNYWMuCgo8Q29kZUV4YW1wbGUKICBsYW5ndWFnZT0ieWFtbCIK
ICBmaWxlcGF0aD0iLmdpdGh1Yi93b3JrZmxvd3MvY2kueW1sIgogIGZpbGVuYW1lPSJjaS55bWwi
CiAgc25pcHBldFJhbmdlPSI2Ny03NSIKICBzbmlwcGV0VGl0bGU9IkxlcyBzZXJ2aWNlcyBkZSB0
ZXN0LCBkZXB1aXMgbGUgY29tcG9zZSBkZSBkw6l2ZWxvcHBlbWVudCIKICBmdWxsRmlsZVRpdGxl
PSJWb2lyIGxlIGZpY2hpZXIgY29tcGxldCIKLz4KCmAtLXdhaXRgIGF0dGVuZCBxdWUgY2hhcXVl
IHNlcnZpY2Ugc29pdCBwcsOqdCA7IE1pbklPIG7igJlheWFudCBwYXMgZGUgaGVhbHRoY2hlY2sg
ZGFucyBsZSBjb21wb3NlLCB1bmUgYm91Y2xlIGF0dGVuZCBxdeKAmWlsIHLDqXBvbmRlLiBVbiBj
aGFuZ2VtZW50IGRlIHBvcnQgb3UgZOKAmWltYWdlIGRhbnMgbGUgY29tcG9zZSB2YXV0IGRvbmMg
YXVzc2kgcG91ciBsYSBDSSA6IGlsIG7igJl5IGEgcmllbiDDoCBtYWludGVuaXIgZW4gZG91Ymxl
LgoKIyMjIFF1YW5kIHVuIHRlc3Qgw6ljaG91ZQoKTGUgcmFwcG9ydCBkZSBQbGF5d3JpZ2h0IOKA
lCBjYXB0dXJlcywgdHJhY2VzIHBhcyDDoCBwYXMg4oCUIGV0IGxlcyBqb3VybmF1eCBkZXMgc2Vy
dmljZXMgc29udCBqb2ludHMgw6AgbOKAmWV4w6ljdXRpb24sIHTDqWzDqWNoYXJnZWFibGVzIHNl
cHQgam91cnMgZGVwdWlzIHNhIHBhZ2UuCgo8Q29kZUV4YW1wbGUKICBsYW5ndWFnZT0ieWFtbCIK
ICBmaWxlcGF0aD0iLmdpdGh1Yi93b3JrZmxvd3MvY2kueW1sIgogIGZpbGVuYW1lPSJjaS55bWwi
CiAgc25pcHBldFJhbmdlPSI4MC05MiIKICBzbmlwcGV0VGl0bGU9IlNldWxlbWVudCBlbiBjYXMg
ZOKAmcOpY2hlYyA6IGxlIHJhcHBvcnQgZXQgbGVzIGpvdXJuYXV4IgogIGZ1bGxGaWxlVGl0bGU9
IlZvaXIgbGUgZmljaGllciBjb21wbGV0IgovPgoKIyMgQ2UgcXVlIGxhIENJIG5lIGZhaXQgcGFz
Cgo8Q2FsbG91dCB0eXBlPSJ3YXJuaW5nIj4KKipBdWN1biBzZWNyZXQsIGF1Y3VuIGTDqXBsb2ll
bWVudC4qKiBUb3V0IGzigJllbnZpcm9ubmVtZW50IGRlcyB0ZXN0cyBlc3QgZmFjdGljZSBldCBs
b2NhbCDDoCBsYSBtYWNoaW5lIGRlIEdpdEh1YiA7IGBlMmUvZW52Lm1qc2AgcmVmdXNlIGTigJlh
aWxsZXVycyB1bmUgYWRyZXNzZSBxdWkgbmUgc2VyYWl0IHBhcyBsb2NhbGUuIFJpZW4gZGFucyBs
ZSB3b3JrZmxvdyBuZSBjb25uYcOudCBsYSBwcm9kdWN0aW9uIDogZWxsZSBuZSBzZSB0b3VjaGUg
cXVlIGRlcHVpcyBsZSBzZXJ2ZXVyLCBtaWdyYXRpb24gZOKAmWFib3JkLgo8L0NhbGxvdXQ+CgpM
ZSBkw6lww7R0IGVzdCBkZXN0aW7DqSDDoCDDqnRyZSBwdWJsaWMgKGPigJllc3QgYXVzc2kgdW4g
cG9ydGZvbGlvKSA6IG7igJlpbXBvcnRlIHF1aSBwb3VycmEgbGlyZSBsZSB3b3JrZmxvdyBldCB2
b2lyIHNlcyBleMOpY3V0aW9ucy4gSWwgbmUgY29udGllbnQgcmllbiDDoCBwcm90w6lnZXIsIGV0
IGPigJllc3Qgdm91bHUg4oCUIHVuIHdvcmtmbG93IHNhbnMgc2VjcmV0IG5lIHBldXQgcGFzIGVu
IGxhaXNzZXIgZnVpci4KCkxlcyBhY3Rpb25zIGV4dGVybmVzIChgYWN0aW9ucy9jaGVja291dGAs
IGBwbnBtL2FjdGlvbi1zZXR1cGDigKYpIHNvbnQgKipmaWfDqWVzIMOgIHVuIGNvbW1pdCBwcsOp
Y2lzKiosIGxlIG51bcOpcm8gZGUgdmVyc2lvbiBlbiBjb21tZW50YWlyZS4gVW5lIMOpdGlxdWV0
dGUgY29tbWUgYHY3YCBwZXV0IMOqdHJlIGTDqXBsYWPDqWUgcGFyIHNvbiBhdXRldXIsIG91IHBh
ciBxdWVscXXigJl1biBxdWkgYXVyYWl0IHByaXMgc29uIGNvbXB0ZSA6IGxhIENJIGV4w6ljdXRl
cmFpdCBhbG9ycyB1biBhdXRyZSBjb2RlIHF1ZSBjZWx1aSBxdeKAmW9uIGEgbHUuIFVuIGNvbW1p
dCwgbHVpLCBuZSBib3VnZSBwYXMuIE1vbnRlciBkZSB2ZXJzaW9uIGRldmllbnQgdW4gZ2VzdGUg
Y2hvaXNpIDogY2hhbmdlciBsZSBjb21taXQgZXQgc29uIGNvbW1lbnRhaXJlLgoKIyMgTGUgcsOp
ZmxleGUgYXZhbnQgdW4gZMOpcGxvaWVtZW50CgpBdmFudCBsZSBgZ2l0IHB1bGxgIHN1ciBsZSBz
ZXJ2ZXVyLCB1biBjb3VwIGTigJnFk2lsIMOgIGzigJlvbmdsZXQgKipBY3Rpb25zKiogOiB1bmUg
Y29jaGUgdmVydGUgc3VyIGxlIGRlcm5pZXIgY29tbWl0LCBvbiBkw6lwbG9pZSA7IHVuZSBjcm9p
eCByb3VnZSwgb24gbGl0IGzigJnDqXRhcGUgZW4gw6ljaGVjIGV0IG9uIGNvcnJpZ2UgZOKAmWFi
b3JkLgoKPENhbGxvdXQgdHlwZT0iaW5mbyI+ClBvdXIgbOKAmWluc3RhbnQsIG9uIHBvdXNzZSBk
aXJlY3RlbWVudCBzdXIgbGEgYnJhbmNoZSBwcmluY2lwYWxlIDogbGEgQ0kgcHLDqXZpZW50ICoq
YXByw6hzKiogbGUgcHVzaC4gU2kgZOKAmWF1dHJlcyBjb250cmlidWVudCB1biBqb3VyLCBvbiBw
YXNzZXJhIHBhciBkZXMgcHVsbCByZXF1ZXN0cywgZXQgR2l0SHViIHBvdXJyYSBleGlnZXIgcXVl
IGxhIENJIHBhc3NlIGF2YW50IGRlIGZ1c2lvbm5lciDigJQgdW4gcsOpZ2xhZ2UgZHUgZMOpcMO0
dCAowqsgYnJhbmNoIHByb3RlY3Rpb24gwrspLCBsZSB3b3JrZmxvdyByZXN0YW50IGxlIG3Dqm1l
Lgo8L0NhbGxvdXQ+CgojIyDDgCBzdWl2cmUKCkxhIHF1YWxpdMOpIHNlIHbDqXJpZmllIGTDqXNv
cm1haXMgc3VyIGxhIG1hY2hpbmUgZHUgZMOpdmVsb3BwZXVyIGV0IMOgIGNoYXF1ZSBwdXNoLiBS
ZXN0ZSDDoCBtZXR0cmUgbGUgc2l0ZSBlbiBsaWduZSwgZXQgw6AgbOKAmXkgZ2FyZGVyIDogbOKA
mWltYWdlIERvY2tlciwgbGUgc2VydmV1ciwgbGVzIHZhcmlhYmxlcyBkZSBwcm9kdWN0aW9uLCBs
ZXMgc2F1dmVnYXJkZXMuCgo8Q2FsbG91dCB0eXBlPSJ0aXAiPgoqKlBhcnRpZSBzdWl2YW50ZSA6
IGluZnJhc3RydWN0dXJlIGV0IGTDqXBsb2llbWVudC4qKiBM4oCZaW1hZ2UgRG9ja2VyLCBsYSBt
aXNlIGVuIHByb2R1Y3Rpb24gZXQgbGEgc2FuZGJveC4KPC9DYWxsb3V0Pgo=
B64

python3 - <<'PY'
import base64
spec_skip_done = False
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    if s.count(old) == 0 and s.count(new) == 1 and spec_skip_done: return  # déjà fait par un script précédent
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
sub('apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx', 'IyMgw4Agc3VpdnJlCgpMYSBxdWFsaXTDqSBzZSB2w6lyaWZpZSBzdXIgbGEgbWFjaGluZSBkdSBkw6l2ZWxvcHBldXIuIFJlc3RlIMOgIG1ldHRyZSBsZSBzaXRlIGVuIGxpZ25lLCBldCDDoCBs4oCZeSBnYXJkZXIgOiBs4oCZaW1hZ2UgRG9ja2VyLCBsZSBzZXJ2ZXVyLCBsZXMgdmFyaWFibGVzIGRlIHByb2R1Y3Rpb24sIGxlcyBzYXV2ZWdhcmRlcy4KCjxDYWxsb3V0IHR5cGU9InRpcCI+CioqUGFydGllIHN1aXZhbnRlIDogaW5mcmFzdHJ1Y3R1cmUgZXQgZMOpcGxvaWVtZW50LioqIEzigJlpbWFnZSBEb2NrZXIsIGxhIG1pc2UgZW4gcHJvZHVjdGlvbiBldCBsYSBzYW5kYm94Lgo8L0NhbGxvdXQ+Cg==',
    'IyMgw4Agc3VpdnJlCgpDZXMgdGVzdHMgZGVtYW5kZW50IERvY2tlciBldCB1biBxdWFydCBk4oCZaGV1cmUgOiBzdXIgbGUgTWFjLCBvbiBsZXMgbGFuY2UgcXVhbmQgb24geSBwZW5zZS4gTGUgY2hhcGl0cmUgc3VpdmFudCBsZXMgZmFpdCB0b3VybmVyIMOgIGNoYXF1ZSBwdXNoLgoKPENhbGxvdXQgdHlwZT0idGlwIj4KKipDaGFwaXRyZSBzdWl2YW50IDogbOKAmWludMOpZ3JhdGlvbiBjb250aW51ZS4qKiBHaXRIdWIgcmVmYWl0IHBucG0gY2hlY2sgZXQgbGVzIHRlc3RzIGRlIGJvdXQgZW4gYm91dCDDoCBjaGFxdWUgcHVzaCwgc2FucyBhdWN1biBzZWNyZXQuCjwvQ2FsbG91dD4K')
print("  édits ok (1 substitutions, 1 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm typecheck && pnpm lint"
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
git add -- "${MODIFIED[@]}" "${CREATED[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs : l'intégration continue

Nouveau chapitre (Qualité, 5) : le workflow, les mêmes services que sur le
Mac, le rapport en cas d'échec, ce que la CI ne fait pas (ni secret, ni
déploiement), les actions figées à un commit, le réflexe avant un
déploiement. « Tester de bout en bout » y mène.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG