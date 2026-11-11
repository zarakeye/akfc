#!/usr/bin/env bash
# Doc développeur : « Les tags de personnes », les contenus des pages.
# Prérequis : apply-fix-tags-pages.sh.
# Usage (racine du repo) : bash apply-docs-tags-pages.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/legal/tags-de-personnes.mdx" 2>/dev/null | grep -qF "### Les contenus des pages"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "export async function assertPublicContentRights" "packages/backend/src/modules/mediaPeople/publicContentRights.service.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-tags-pages.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/legal/tags-de-personnes.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "### Les contenus des pages" "apps/web/content/docs/dev/legal/tags-de-personnes.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'ICAgICAgICBjYWxsOiBnYWxsZXJ5LmdldFB1YmxpY0luZGV4CiAgICAgICAgc2VjdGlvbjogRGVzdGluYXRpb25zLCBibG9jYWdlcyBldCBtYXNxdWFnZQogICAgICAtIGxhYmVsOiBVbmUgcGVyc29ubmUgbuKAmWEgcGFzIHLDqXBvbmR1IDsgaWwgbGEgcmVsYW5jZSwgdW5lIGZvaXMgYXUgcGx1cyB0b3VzIGxlcyBzZXB0IGpvdXJzCiAgICAgICAgY2FsbDogbWVkaWFQZW9wbGUucmVtaW5kCg==',
    'ICAgICAgICBjYWxsOiBnYWxsZXJ5LmdldFB1YmxpY0luZGV4CiAgICAgICAgc2VjdGlvbjogRGVzdGluYXRpb25zLCBibG9jYWdlcyBldCBtYXNxdWFnZQogICAgICAtIGxhYmVsOiBJbCBlbnJlZ2lzdHJlIHVuZSBhY3R1YWxpdMOpIGRvbnQgdW5lIGltYWdlIGEgdW4gcmVmdXMgcG91ciBsZSBzaXRlIHB1YmxpYyA7IHJlZnVzw6kKICAgICAgICBjYWxsOiBwb3N0LnVwZGF0ZQogICAgICAgIHNlY3Rpb246IExlcyBjb250ZW51cyBkZXMgcGFnZXMKICAgICAgLSBsYWJlbDogVW5lIHBlcnNvbm5lIG7igJlhIHBhcyByw6lwb25kdSA7IGlsIGxhIHJlbGFuY2UsIHVuZSBmb2lzIGF1IHBsdXMgdG91cyBsZXMgc2VwdCBqb3VycwogICAgICAgIGNhbGw6IG1lZGlhUGVvcGxlLnJlbWluZAo=')
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'PC9DYWxsb3V0PgoKTGVzIGJsb2NzIMKrIEdhbGVyaWUgZOKAmWltYWdlcyDCuyBkZXMgcGFnZXMgc3VpdnJvbnQgOiBsZXVyIGRlc3RpbmF0aW9uIHNlIGTDqWR1aXJhIGRlIGxhIHBhZ2UgcXVpIGxlcyBhY2N1ZWlsbGUuCgojIyBSZWxhbmNlcgo=',
    'PC9DYWxsb3V0PgoKIyMjIExlcyBjb250ZW51cyBkZXMgcGFnZXMKCkxlcyBjb250ZW51cyBkdSBjb25zdHJ1Y3RldXIgKGRpc2NpcGxpbmVzLCBjb3Vycywgc3RhZ2VzLCDDqXbDqG5lbWVudHMsIGFjdHVhbGl0w6lzLCBwYWdlcyBkdSBzaXRlLCBwcsOpc2VudGF0aW9uIGTigJl1biBpbnN0cnVjdGV1cikgbuKAmW9udCBwYXMgZGUgdmlzaWJpbGl0w6kgOiBpbHMgc+KAmWFmZmljaGVudCAqKnRvdXMgc3VyIGxlIHNpdGUgcHVibGljKiosIGxlcyBhY3R1YWxpdMOpcyBjb21wcmlzZXMgKGxlIG11ciBkZSBsYSBwYWdlIGTigJlhY2N1ZWlsKS4gTGV1ciBkZXN0aW5hdGlvbiBlc3QgZG9uYyBmaXhlLCBzYW5zIHJpZW4gw6AgZMOpZHVpcmUuCgpJbHMgc29udCBlbnJlZ2lzdHLDqXMgcGFyIHVuZSBkb3V6YWluZSBkZSBwcm9jw6lkdXJlcywgbWFpcyBlbGxlcyBvbnQgZMOpasOgIHVuIHBvaW50IGNvbW11biA6IGNoYWN1bmUgYXBwZWxsZSBgYXNzZXJ0T3duQXZhdGFyc2Agc3VyIGxlcyBjb250ZW51cyByZcOndXMuIExhIHbDqXJpZmljYXRpb24gZHUgZHJvaXQgw6AgbOKAmWltYWdlIHNlIHBvc2UganVzdGUgw6AgY8O0dMOpLCBhdmVjIGxhIG3Dqm1lIHNpZ25hdHVyZSA6Cgo8Q29kZUV4YW1wbGUKICBsYW5ndWFnZT0idHMiCiAgZmlsZXBhdGg9InBhY2thZ2VzL2JhY2tlbmQvc3JjL21vZHVsZXMvbWVkaWFQZW9wbGUvcHVibGljQ29udGVudFJpZ2h0cy5zZXJ2aWNlLnRzIgogIGZpbGVuYW1lPSJwdWJsaWNDb250ZW50UmlnaHRzLnNlcnZpY2UudHMiCiAgc25pcHBldFJhbmdlPSIxNy0zNSIKICBzbmlwcGV0SGlnaGxpZ2h0PSI1LDYiCiAgc25pcHBldFRpdGxlPSJUb3V0ZXMgbGVzIGltYWdlcyBkZSB0b3VzIGxlcyBjb250ZW51cyByZcOndXMsIHB1aXMgbGVzIHJlZnVzIgogIGZ1bGxGaWxlVGl0bGU9IlZvaXIgbGUgZmljaGllciBjb21wbGV0IgovPgoKTGUgbWVzc2FnZSBub21tZSBsZXMgZmljaGllcnMgKMKrIEzigJlpbWFnZSDCqyBzdGFnZS0yMDI2LmpwZyDCuyA6IOKApiDCuykgOiB1bmUgcGFnZSBu4oCZYSBwYXMgZGUgbnVtw6lyb3MgZGUgbcOpZGlhcywgc2VzIGltYWdlcyBzb250IHLDqXBhcnRpZXMgZW50cmUgcGx1c2lldXJzIGJsb2NzLiBQb3VyIGxhIG3Dqm1lIHJhaXNvbiwgbGUgYmFuZGVhdSBkdSBjb25zdHJ1Y3RldXIgbGVzIGNvbXB0ZSAowqsgMSBpbWFnZSBkZSBjZSBjb250ZW51IMK7KSBhdSBsaWV1IGRlIGxlcyBudW3DqXJvdGVyLgoKUG91ciBs4oCZYWZmaWNoYWdlLCB1biBzZXVsIGVuZHJvaXQgcmVuZCB0b3VzIGNlcyBjb250ZW51cyA6IGBQYWdlUmVuZGVyZXJgLiBD4oCZZXN0IGzDoCBxdeKAmXVuIG3DqWRpYSByZWZ1c8OpIGVzdCBzYXV0w6ksIGNvbW1lIHVuIG3DqWRpYSBpbnRyb3V2YWJsZS4gTOKAmWFwZXLDp3UgZOKAmXVuIGFkbWluaXN0cmF0ZXVyIChgYXVkaWVuY2U9ImFkbWluImApIGxlIG1vbnRyZSBlbmNvcmUsIHBvdXIgcXXigJlpbCB2b2llIGNlIHF14oCZaWwgZG9pdCByZXRpcmVyLgoKPENvZGVFeGFtcGxlCiAgbGFuZ3VhZ2U9InRzeCIKICBmaWxlcGF0aD0iYXBwcy93ZWIvc3JjL2ZlYXR1cmVzL3BhZ2UtYnVpbGRlci9QYWdlUmVuZGVyZXIudHN4IgogIGZpbGVuYW1lPSJQYWdlUmVuZGVyZXIudHN4IgogIHNuaXBwZXRSYW5nZT0iODYtOTUiCiAgc25pcHBldEhpZ2hsaWdodD0iNiwxMCIKICBzbmlwcGV0VGl0bGU9IlVuIHNldWwgcmVuZHUsIHVuIHNldWwgbWFzcXVhZ2UiCiAgZnVsbEZpbGVUaXRsZT0iVm9pciBsZSBmaWNoaWVyIGNvbXBsZXQiCi8+Cgo8Q2FsbG91dCB0eXBlPSJpbmZvIj4KUmVzdGUgdW4gY2FzIDogbOKAmWltYWdlIGRlIHLDqXN1bcOpIGTigJl1bmUgZGlzY2lwbGluZSwgZOKAmXVuIHN0YWdlIG91IGTigJl1biDDqXbDqG5lbWVudCAoYHN1bW1hcnlNZWRpYUlkYCksIGFmZmljaMOpZSBzdXIgbGVzIGNhcnRlcyBkZSBs4oCZYWNjdWVpbCBldCBkZSBs4oCZYWdlbmRhIHNhbnMgcGFzc2VyIHBhciBgUGFnZVJlbmRlcmVyYC4gRWxsZSBu4oCZZXN0IHBhcyBlbmNvcmUgdsOpcmlmacOpZS4KPC9DYWxsb3V0PgoKIyMgUmVsYW5jZXIK')
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'IyMgUsOpY2FwaXR1bGF0aWYKCjxEb2NzVGFibGUgY29sdW1uc0pzb249J1siUXVlc3Rpb24iLCAiUsOpcG9uc2UgZHUgcHJvamV0Il0nIHJvd3NKc29uPSdbWyJRdWkgdGFndWUgPyIsICJVbiBhZG1pbmlzdHJhdGV1ciwgw6AgbGEgbWFpbiA7IGphbWFpcyBk4oCZYWxnb3JpdGhtZSBkZSByZWNvbm5haXNzYW5jZS4iXSwgWyJPw7kgPyIsICJEYW5zIGxhIG1vZGFsZSwgb3V2ZXJ0ZSBk4oCZdW4gY2xpYyBzdXIgdW4gbcOpZGlhIGR1IHRhYmxlYXUgZOKAmXVuZSBnYWxlcmllIG91IGTigJl1biBibG9jIMKrIEdhbGVyaWUgZOKAmWltYWdlcyDCuy4iXSwgWyJRdWUgc3RvY2tlLXQtb24gPyIsICJMZSBsaWVuIHBlcnNvbm5lLW3DqWRpYSwgcXVpIGzigJlhIHBvc8OpIGV0IHF1YW5kIDsgamFtYWlzIGxlIHZlcmRpY3QuIl0sIFsiUXVpIHZvaXQgbGVzIHRhZ3MgPyIsICJMZXMgYWRtaW5pc3RyYXRldXJzIDsgbGEgcGVyc29ubmUsIGRhbnMgc29uIGV4cG9ydCBkZSBkb25uw6llcy4iXSwgWyJVbiByZWZ1cyBldCB1biBvdWJsaSBzdXIgbGEgbcOqbWUgcGhvdG8gPyIsICJMZSByZWZ1cyBs4oCZZW1wb3J0ZSA6IHJvdWdlLiJdLCBbIkV0IGxlcyBwaG90b3Mgc2FucyBwZXJzb25uZSA/IiwgIkxhIGNhc2UgwqsgYXVjdW5lIHBlcnNvbm5lIHJlY29ubmFpc3NhYmxlIMK7IDogdmVydCBwYXJ0b3V0LiJdLCBbIlF14oCZZXN0LWNlIHF1aSBibG9xdWUgPyIsICJTZXVsIHVuIHJlZnVzIGTigJl1bmUgcGVyc29ubmUgdGFndcOpZSwgcG91ciB1bmUgZGVzdGluYXRpb24gcHVibGlxdWUgOyB1bmUgYWJzZW5jZSBkZSByw6lwb25zZSBhdmVydGl0LCB1biBtw6lkaWEgbm9uIHRhZ3XDqSBwYXNzZS4iXSwgWyJMYSByZWxhbmNlID8iLCAiQXUgbWVtYnJlIG1hamV1ciwgYXUgbWluZXVyIHNhbnMgZGVtYW5kZSwgb3UgdW4gbm91dmVhdSBsaWVuIGF1IHBhcmVudCA7IHVuZSBmb2lzIHRvdXMgbGVzIHNlcHQgam91cnMuIl1dJyAvPgoKIyMgw4Agc3VpdnJlCg==',
    'IyMgUsOpY2FwaXR1bGF0aWYKCjxEb2NzVGFibGUgY29sdW1uc0pzb249J1siUXVlc3Rpb24iLCAiUsOpcG9uc2UgZHUgcHJvamV0Il0nIHJvd3NKc29uPSdbWyJRdWkgdGFndWUgPyIsICJVbiBhZG1pbmlzdHJhdGV1ciwgw6AgbGEgbWFpbiA7IGphbWFpcyBk4oCZYWxnb3JpdGhtZSBkZSByZWNvbm5haXNzYW5jZS4iXSwgWyJPw7kgPyIsICJEYW5zIGxhIG1vZGFsZSwgb3V2ZXJ0ZSBk4oCZdW4gY2xpYyBzdXIgdW4gbcOpZGlhIGR1IHRhYmxlYXUgZOKAmXVuZSBnYWxlcmllIG91IGTigJl1biBibG9jIMKrIEdhbGVyaWUgZOKAmWltYWdlcyDCuy4iXSwgWyJRdWUgc3RvY2tlLXQtb24gPyIsICJMZSBsaWVuIHBlcnNvbm5lLW3DqWRpYSwgcXVpIGzigJlhIHBvc8OpIGV0IHF1YW5kIDsgamFtYWlzIGxlIHZlcmRpY3QuIl0sIFsiUXVpIHZvaXQgbGVzIHRhZ3MgPyIsICJMZXMgYWRtaW5pc3RyYXRldXJzIDsgbGEgcGVyc29ubmUsIGRhbnMgc29uIGV4cG9ydCBkZSBkb25uw6llcy4iXSwgWyJVbiByZWZ1cyBldCB1biBvdWJsaSBzdXIgbGEgbcOqbWUgcGhvdG8gPyIsICJMZSByZWZ1cyBs4oCZZW1wb3J0ZSA6IHJvdWdlLiJdLCBbIkV0IGxlcyBwaG90b3Mgc2FucyBwZXJzb25uZSA/IiwgIkxhIGNhc2UgwqsgYXVjdW5lIHBlcnNvbm5lIHJlY29ubmFpc3NhYmxlIMK7IDogdmVydCBwYXJ0b3V0LiJdLCBbIlF14oCZZXN0LWNlIHF1aSBibG9xdWUgPyIsICJTZXVsIHVuIHJlZnVzIGTigJl1bmUgcGVyc29ubmUgdGFndcOpZSwgcG91ciB1bmUgZGVzdGluYXRpb24gcHVibGlxdWUgOyB1bmUgYWJzZW5jZSBkZSByw6lwb25zZSBhdmVydGl0LCB1biBtw6lkaWEgbm9uIHRhZ3XDqSBwYXNzZS4iXSwgWyJFdCBsZXMgcGFnZXMgPyIsICJUb3V0ZXMgcHVibGlxdWVzIDogbcOqbWUgcsOoZ2xlLCB2w6lyaWZpw6llIMOgIGPDtHTDqSBk4oCZYXNzZXJ0T3duQXZhdGFycywgbWFzcXVhZ2UgZGFucyBQYWdlUmVuZGVyZXIuIl0sIFsiTGEgcmVsYW5jZSA/IiwgIkF1IG1lbWJyZSBtYWpldXIsIGF1IG1pbmV1ciBzYW5zIGRlbWFuZGUsIG91IHVuIG5vdXZlYXUgbGllbiBhdSBwYXJlbnQgOyB1bmUgZm9pcyB0b3VzIGxlcyBzZXB0IGpvdXJzLiJdXScgLz4KCiMjIMOAIHN1aXZyZQo=')
print("  édits ok (3 substitutions, 0 fichiers créés, 0 remplacés)")
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
docs : « Les tags de personnes », les contenus des pages

Pourquoi tous publics, la vérification posée à côté d'assertOwnAvatars,
le masquage unique dans PageRenderer ; ce qui reste (images de résumé).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : git push, puis sur le serveur : git pull → docker compose up -d --build akfc."