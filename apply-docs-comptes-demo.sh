#!/usr/bin/env bash
# Doc développeur : les comptes de démo du droit à l'image.
# Prérequis : apply-fix-comptes-demo.sh.
# Usage (racine du repo) : bash apply-docs-comptes-demo.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/demarrer/mise-en-route.mdx" 2>/dev/null | grep -qF "mineur@akfc.demo"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "mineur@akfc.demo" "prisma/seed.sandbox.mjs" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-comptes-demo.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/demarrer/mise-en-route.mdx" "apps/web/content/docs/dev/infrastructure/la-sandbox.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "mineur@akfc.demo" "apps/web/content/docs/dev/demarrer/mise-en-route.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/demarrer/mise-en-route.mdx', 'TGUgc2NyaXB0IG4naW1wb3J0ZSBwYXMgYGRvdGVudmAgOiBjJ2VzdCBOb2RlIGx1aS1tw6ptZSBxdWkgY2hhcmdlIGxlIGAuZW52YCBkZSBsYSByYWNpbmUsIGdyw6JjZSDDoCBsJ29wdGlvbiBgLS1lbnYtZmlsZWAuCgo8RG9jc1RhYmxlIGNvbHVtbnNKc29uPSdbIkNvbXB0ZSIsIk1vdCBkZSBwYXNzZSIsIlLDtGxlIl0nIHJvd3NKc29uPSdbWyJhZG1pbkBha2ZjLmRlbW8iLCJzYW5kYm94LWRlbW8iLCJhZG1pbmlzdHJhdGV1ciAobWVtYnJlIGR1IGdyb3VwZSBBZG1pbmlzdHJhdGV1cnMpIl0sWyJtZW1icmVAYWtmYy5kZW1vIiwic2FuZGJveC1kZW1vIiwic2ltcGxlIG1lbWJyZSJdXScgLz4KCkMnZXN0IGxlIHNjcmlwdCBkZSBsYSBzYW5kYm94IHJlY3J1dGV1cnMsIGBwcmlzbWEvc2VlZC5zYW5kYm94Lm1qc2AuIElsIGVzdCAqKmlkZW1wb3RlbnQqKiA6IGxlIHJlbGFuY2VyIG5lIGNyw6llIHBhcyBkZSBkb3VibG9ucyBldCByZW1ldCBsZXMgbW90cyBkZSBwYXNzZSDDoCBsZXVyIHZhbGV1ciBkZSBkw6ltb25zdHJhdGlvbi4gTm91cyBwb3V2b25zIGRvbmMgbGUgcmVsYW5jZXIgw6AgdG91dCBtb21lbnQgcG91ciByZXRyb3V2ZXIgdW4gw6l0YXQgY29ubnUuIEMnZXN0IGxhIHPDqXBhcmF0aW9uIGRlcyBiYXNlcyBxdWkgcmVuZCBjZSBnZXN0ZSBzYW5zIGRhbmdlci4K',
    'TGUgc2NyaXB0IG4naW1wb3J0ZSBwYXMgYGRvdGVudmAgOiBjJ2VzdCBOb2RlIGx1aS1tw6ptZSBxdWkgY2hhcmdlIGxlIGAuZW52YCBkZSBsYSByYWNpbmUsIGdyw6JjZSDDoCBsJ29wdGlvbiBgLS1lbnYtZmlsZWAuCgo8RG9jc1RhYmxlIGNvbHVtbnNKc29uPSdbIkNvbXB0ZSIsIk1vdCBkZSBwYXNzZSIsIlLDtGxlIl0nIHJvd3NKc29uPSdbWyJhZG1pbkBha2ZjLmRlbW8iLCJzYW5kYm94LWRlbW8iLCJhZG1pbmlzdHJhdGV1ciAobWVtYnJlIGR1IGdyb3VwZSBBZG1pbmlzdHJhdGV1cnMpIl0sWyJtZW1icmVAYWtmYy5kZW1vIiwic2FuZGJveC1kZW1vIiwic2ltcGxlIG1lbWJyZSwgbWFqZXVyIDogaWwgZG9ubmUgc29uIGRyb2l0IMOgIGzigJlpbWFnZSBlbiBsaWduZSJdLFsibWluZXVyQGFrZmMuZGVtbyIsInNhbmRib3gtZGVtbyIsInNpbXBsZSBtZW1icmUsIG1pbmV1ciwgZmljaGUgY29tcGzDqHRlIDogc29uIHBhcmVudCByw6lmw6lyZW50IGVzdCBwYXJlbnRAYWtmYy5kZW1vIl1dJyAvPgoKTGUgcGFyZW50IGTigJl1biBtaW5ldXIgbuKAmWEgcGFzIGRlIGNvbXB0ZSA6IGPigJllc3Qgdm91bHUsIGlsIHZhbGlkZSBwYXIgdW4gbGllbiByZcOndSBwYXIgZS1tYWlsLiBTZXMgbWVzc2FnZXMsIGFkcmVzc8OpcyDDoCBgcGFyZW50QGFrZmMuZGVtb2AsIGFycml2ZW50IGRhbnMgTWFpbHBpdCBjb21tZSBsZXMgYXV0cmVzLiBQb3VyIHN1aXZyZSB0b3V0IGxlIGNpcmN1aXQgOiBzZSBjb25uZWN0ZXIgZW4gYG1pbmV1ckBha2ZjLmRlbW9gLCDCqyBJbmRpcXVlciBtZXMgc291aGFpdHMgwrssIHB1aXMgb3V2cmlyIGRhbnMgTWFpbHBpdCBs4oCZZS1tYWlsIGR1IHBhcmVudCBldCBzb24gbGllbiwgZGFucyB1bmUgZmVuw6p0cmUgZGUgbmF2aWdhdGlvbiBwcml2w6llLgoKQydlc3QgbGUgc2NyaXB0IGRlIGxhIHNhbmRib3ggcmVjcnV0ZXVycywgYHByaXNtYS9zZWVkLnNhbmRib3gubWpzYC4gSWwgZXN0ICoqaWRlbXBvdGVudCoqIDogbGUgcmVsYW5jZXIgbmUgY3LDqWUgcGFzIGRlIGRvdWJsb25zIGV0IHJlbWV0IGxlcyBtb3RzIGRlIHBhc3NlIMOgIGxldXIgdmFsZXVyIGRlIGTDqW1vbnN0cmF0aW9uLiBOb3VzIHBvdXZvbnMgZG9uYyBsZSByZWxhbmNlciDDoCB0b3V0IG1vbWVudCBwb3VyIHJldHJvdXZlciB1biDDqXRhdCBjb25udS4gQydlc3QgbGEgc8OpcGFyYXRpb24gZGVzIGJhc2VzIHF1aSByZW5kIGNlIGdlc3RlIHNhbnMgZGFuZ2VyLgo=')
sub('apps/web/content/docs/dev/infrastructure/la-sandbox.mdx', 'ICBmaWxlcGF0aD0icHJpc21hL3NlZWQuc2FuZGJveC5tanMiCiAgZmlsZW5hbWU9InNlZWQuc2FuZGJveC5tanMiCiAgc25pcHBldFJhbmdlPSIxMS0xMDkiCiAgdGl0bGU9InByaXNtYS9zZWVkLnNhbmRib3gubWpzIgogIHN0ZXBzSnNvbj0nW3sidGl0bGUiOiAiTGUgZ3JvdXBlIGRlcyBhZG1pbmlzdHJhdGV1cnMiLCAiYm9keSI6ICJUcm91dsOpIHPigJlpbCBleGlzdGUsIGNyw6nDqSBzaW5vbi4gQ+KAmWVzdCBs4oCZYXBwYXJ0ZW5hbmNlIMOgIGNlIGdyb3VwZSBxdWkgZmFpdCB1biBhZG1pbmlzdHJhdGV1ciAocGFydGllIMKrIEF1dGhlbnRpZmljYXRpb24gZXQgZHJvaXRzIMK7KS4iLCAic2NvcGUiOiAiMS0xMyIsICJmb2N1cyI6ICIzLTMifSwgeyJ0aXRsZSI6ICJVbiBjb21wdGUsIGNyw6nDqSBvdSByZW1pcyDDoCBuZXVmIiwgImJvZHkiOiAiYHVwc2VydGAgcGFyIGFkcmVzc2UgOiDDoCBjaGFxdWUgZMOpbWFycmFnZSwgbGUgbW90IGRlIHBhc3NlIGRlIGTDqW1vbnN0cmF0aW9uIGVzdCByw6l0YWJsaSwgZXQgbGUgcHJlbWllciBjaGFuZ2VtZW50IGRlIG1vdCBkZSBwYXNzZSBu4oCZZXN0IHBhcyBleGlnw6kgKGBpc0ZpcnN0TG9naW46IGZhbHNlYCkuIFVuIHZpc2l0ZXVyIHF1aSBhIGNoYW5nw6kgbGUgbW90IGRlIHBhc3NlIG5lIGJsb3F1ZSBwYXMgbGUgc3VpdmFudC4iLCAic2NvcGUiOiAiMTUtMzYiLCAiZm9jdXMiOiAiMTgtMTgifSwgeyJ0aXRsZSI6ICJEZXV4IHLDtGxlcyIsICJib2R5IjogIlVuIGFkbWluaXN0cmF0ZXVyIGV0IHVuIG1lbWJyZSwgYXZlYyBsZSBtw6ptZSBtb3QgZGUgcGFzc2UsIGFmZmljaMOpIMOgIGxhIGZpbiBkdSBzZWVkLiIsICJzY29wZSI6ICIzOC01OCIsICJmb2N1cyI6ICI0NS00NSJ9LCB7InRpdGxlIjogIlF1YXRyZSBkaXNjaXBsaW5lcyIsICJib2R5IjogIkxhIGNhdMOpZ29yaWUgZGVzIGNvdXJzLCByZXRyb3V2w6llIHBhciBzYSBjbMOpIChgY291cnNlYCwgcGFzIHBhciBzb24gbGliZWxsw6kpLCBldCBsZXMgZGlzY2lwbGluZXMgZHUgY2x1Yiwgc2FucyBjb250ZW51IGV0IG5vbiBwdWJsacOpZXMgOiBs4oCZYWRtaW5pc3RyYXRldXIgbGVzIHJldHJvdXZlIGRhbnMgbGUgdGFibGVhdSBkZSBib3JkLCBldCBwZXV0IGxlcyByw6lkaWdlciwgcHVpcyBsZXMgcHVibGllci4iLCAic2NvcGUiOiAiNjAtOTMiLCAiZm9jdXMiOiAiNzMtNzMifV0nCi8+Cgo=',
    'ICBmaWxlcGF0aD0icHJpc21hL3NlZWQuc2FuZGJveC5tanMiCiAgZmlsZW5hbWU9InNlZWQuc2FuZGJveC5tanMiCiAgc25pcHBldFJhbmdlPSIxMS0xMzQiCiAgdGl0bGU9InByaXNtYS9zZWVkLnNhbmRib3gubWpzIgogIHN0ZXBzSnNvbj0nW3sidGl0bGUiOiAiTGUgZ3JvdXBlIGRlcyBhZG1pbmlzdHJhdGV1cnMiLCAiYm9keSI6ICJUcm91dsOpIHPigJlpbCBleGlzdGUsIGNyw6nDqSBzaW5vbi4gQ+KAmWVzdCBs4oCZYXBwYXJ0ZW5hbmNlIMOgIGNlIGdyb3VwZSBxdWkgZmFpdCB1biBhZG1pbmlzdHJhdGV1ciAocGFydGllIMKrIEF1dGhlbnRpZmljYXRpb24gZXQgZHJvaXRzIMK7KS4iLCAic2NvcGUiOiAiMS0xMyIsICJmb2N1cyI6ICIzLTMifSwgeyJ0aXRsZSI6ICJVbiBjb21wdGUsIGNyw6nDqSBvdSByZW1pcyDDoCBuZXVmIiwgImJvZHkiOiAiYHVwc2VydGAgcGFyIGFkcmVzc2UgOiDDoCBjaGFxdWUgZMOpbWFycmFnZSwgbGUgbW90IGRlIHBhc3NlIGRlIGTDqW1vbnN0cmF0aW9uIGVzdCByw6l0YWJsaSwgZXQgbGUgcHJlbWllciBjaGFuZ2VtZW50IGRlIG1vdCBkZSBwYXNzZSBu4oCZZXN0IHBhcyBleGlnw6kgKGBpc0ZpcnN0TG9naW46IGZhbHNlYCkuIFVuIHZpc2l0ZXVyIHF1aSBhIGNoYW5nw6kgbGUgbW90IGRlIHBhc3NlIG5lIGJsb3F1ZSBwYXMgbGUgc3VpdmFudC4gTGUgcGFyYW3DqHRyZSBgbGVnYWxgIHBvcnRlIGxlIG5vbSwgbGEgbWFqb3JpdMOpIGV0LCBwb3VyIHVuIG1pbmV1ciwgc29uIHBhcmVudCByw6lmw6lyZW50IDogZXV4IGF1c3NpIHJldmllbm5lbnQgw6AgbGV1ciB2YWxldXIgZGUgZMOpbW9uc3RyYXRpb24uIiwgInNjb3BlIjogIjE1LTQxIiwgImZvY3VzIjogIjIyLTIyIn0sIHsidGl0bGUiOiAiVHJvaXMgcHJvZmlscyIsICJib2R5IjogIlVuIGFkbWluaXN0cmF0ZXVyIDsgdW4gbWVtYnJlIG1hamV1ciwgcXVpIGRvbm5lIGx1aS1tw6ptZSBzb24gZHJvaXQgw6AgbOKAmWltYWdlIGVuIGxpZ25lIDsgdW4gbWVtYnJlIG1pbmV1ciBkb250IGxhIGZpY2hlIGVzdCBjb21wbMOodGUsIHBvdXIgc3VpdnJlIGxlIGNpcmN1aXQgZHUgcGFyZW50LiBMZSBwYXJlbnQgbuKAmWEgcGFzIGRlIGNvbXB0ZSA6IHNlcyBlLW1haWxzIChwYXJlbnRAYWtmYy5kZW1vKSBhcnJpdmVudCBkYW5zIE1haWxwaXQuIE3Dqm1lIG1vdCBkZSBwYXNzZSBwb3VyIHRvdXMsIGFmZmljaMOpIMOgIGxhIGZpbiBkdSBzZWVkLiIsICJzY29wZSI6ICI0My04MiIsICJmb2N1cyI6ICI2Ni02NiJ9LCB7InRpdGxlIjogIlF1YXRyZSBkaXNjaXBsaW5lcyIsICJib2R5IjogIkxhIGNhdMOpZ29yaWUgZGVzIGNvdXJzLCByZXRyb3V2w6llIHBhciBzYSBjbMOpIChgY291cnNlYCwgcGFzIHBhciBzb24gbGliZWxsw6kpLCBldCBsZXMgZGlzY2lwbGluZXMgZHUgY2x1Yiwgc2FucyBjb250ZW51IGV0IG5vbiBwdWJsacOpZXMgOiBs4oCZYWRtaW5pc3RyYXRldXIgbGVzIHJldHJvdXZlIGRhbnMgbGUgdGFibGVhdSBkZSBib3JkLCBldCBwZXV0IGxlcyByw6lkaWdlciwgcHVpcyBsZXMgcHVibGllci4iLCAic2NvcGUiOiAiODQtMTE3IiwgImZvY3VzIjogIjk3LTk3In1dJwovPgoK')
print("  édits ok (2 substitutions, 0 fichiers créés, 0 remplacés)")
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
git add -- "${MODIFIED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs : les comptes de démo du droit à l'image

- Mise en route : majeur, mineur, et le parent sans compte (Mailpit) ;
  comment suivre le circuit d'un bout à l'autre
- La sandbox : « Trois profils », parcours du seed recalé

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : git push (la migration est portée par apply-fix-circuit-parent.sh)."