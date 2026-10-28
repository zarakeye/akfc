#!/usr/bin/env bash
# Menu « Nos disciplines » : seules les disciplines publiées, pour tout le monde (les brouillons y
# apparaissaient aux admins sous « Autres », avec des liens en 404). Doc tRPC mise à jour.
# Usage (racine du repo) : bash apply-menu-disciplines-publiees.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"packages/backend/src/modules/disciplines/router.ts" 2>/dev/null | grep -qF "les seules PUBLIÉES, pour TOUT LE MONDE"; then echo "Déjà appliqué (commité)."; exit 0; fi
MODIFIED=("packages/backend/src/modules/disciplines/router.ts" "apps/web/content/docs/dev/api/trpc.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "les seules PUBLIÉES, pour TOUT LE MONDE" "packages/backend/src/modules/disciplines/router.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('packages/backend/src/modules/disciplines/router.ts', 'CiAgLyoqCiAgICogRGlzY2lwbGluZXMgZHUgbWVudSDCqyBOb3MgYWN0aXZpdMOpcyDCuyA6IFBVQkxJw4lFUyBwb3VyIHRvdXMsIFBMVVMgbGVzCiAgICogYnJvdWlsbG9ucyBzaSBsYSBzZXNzaW9uIGVzdCBBRE1JTi4gR2F0aW5nIFNFUlZFVVIg4oCUIHVuIHZpc2l0ZXVyCiAgICogbm9uLWFkbWluIG5lIHBldXQgcGFzIHLDqWN1cMOpcmVyIGxlcyBicm91aWxsb25zIHZpYSBjZXR0ZSBxdWVyeS4KICAgKi8KICBnZXRBbGxGb3JNZW51OiBwdWJsaWNQcm9jZWR1cmUucXVlcnkoYXN5bmMgKHsgY3R4IH0pID0+IHsKICAgIHJldHVybiBjdHgucHJpc21hLmRpc2NpcGxpbmUuZmluZE1hbnkoewogICAgICB3aGVyZTogdmlzaWJsZVRvKGN0eCksCiAgICAgIG9yZGVyQnk6IFt7IGNhdGVnb3J5SWQ6ICJhc2MiIH0sIHsgbmFtZTogImFzYyIgfV0sCiAgICB9KTsK',
    'CiAgLyoqCiAgICogRGlzY2lwbGluZXMgZHUgbWVudSDCqyBOb3MgZGlzY2lwbGluZXMgwrsgOiBsZXMgc2V1bGVzIFBVQkxJw4lFUywgcG91ciBUT1VUIExFIE1PTkRFLCBhZG1pbmlzdHJhdGV1cnMKICAgKiBjb21wcmlzLiBMZSBtZW51IGVzdCBsYSBuYXZpZ2F0aW9uIHB1YmxpcXVlLCBldCBsYSBwYWdlIGQndW4gYnJvdWlsbG9uIHLDqXBvbmQgNDA0IMOgIHRvdXMgOiB1bgogICAqIGJyb3VpbGxvbiBkYW5zIGxlIG1lbnUgc2VyYWl0IHVuIGxpZW4gbW9ydC4gTGVzIGJyb3VpbGxvbnMgc2UgZ8OocmVudCBkZXB1aXMgbGUgdGFibGVhdSBkZSBib3JkLgogICAqLwogIGdldEFsbEZvck1lbnU6IHB1YmxpY1Byb2NlZHVyZS5xdWVyeShhc3luYyAoeyBjdHggfSkgPT4gewogICAgcmV0dXJuIGN0eC5wcmlzbWEuZGlzY2lwbGluZS5maW5kTWFueSh7CiAgICAgIHdoZXJlOiB7IHB1YmxpY2F0aW9uRGF0ZTogeyBub3Q6IG51bGwsIGx0ZTogbmV3IERhdGUoKSB9IH0sCiAgICAgIG9yZGVyQnk6IFt7IGNhdGVnb3J5SWQ6ICJhc2MiIH0sIHsgbmFtZTogImFzYyIgfV0sCiAgICB9KTsK')
sub('apps/web/content/docs/dev/api/trpc.mdx', 'ClRvdXRlcyBsZXMgbGVjdHVyZXMgZHUgcm91dGV1ciAoYGdldEFsbGAsIGBnZXRBbGxCeUNhdGVnb3J5YCwgYGdldEFsbEZvck1lbnVgLCBgZ2V0QnlJZGAsIGBnZXRCeVNsdWdgKSBhcHBsaXF1ZW50IGNlIGZpbHRyZS4gVW4gYWRtaW5pc3RyYXRldXIgdm9pdCB0b3V0IDsgdW4gbWVtYnJlIG91IHVuIHZpc2l0ZXVyIG5lIHZvaXQgcXVlIGNlIHF1aSBlc3QgcHVibGnDqSwgZXQgdW4gYnJvdWlsbG9uIGRlbWFuZMOpIHBhciBzb24gaWRlbnRpZmlhbnQgcsOpcG9uZCDCqyBpbnRyb3V2YWJsZSDCuywgZXhhY3RlbWVudCBjb21tZSBsYSBwYWdlIHB1YmxpcXVlLgoKTGVzIHN0YWdlcyBldCBsZXMgw6l2w6luZW1lbnRzIHLDqXNvbHZlbnQgbGUgbcOqbWUgcHJvYmzDqG1lIGF1dHJlbWVudCA6IHVuZSBsZWN0dXJlIHB1YmxpcXVlIGZpbHRyw6llIChgc2VtaW5hci5nZXRBbGxgKSBldCB1bmUgbGVjdHVyZSBzw6lwYXLDqWUgcsOpc2VydsOpZSBhdXggYWRtaW5pc3RyYXRldXJzIChgc2VtaW5hci5nZXRBbGxBZG1pbmApLiBQb3VyIGxlcyBkaXNjaXBsaW5lcywgbGUgZmlsdHJlIHNlbG9uIGwnYXBwZWxhbnQgYSDDqXTDqSBwcsOpZsOpcsOpIHBhcmNlIHF1ZSBsYSBtw6ptZSBsaXN0ZSBzZXJ0IGF1c3NpIGF1eCBmb3JtdWxhaXJlcyBkZXMgbWVtYnJlcyAobGUgZMOpcMO0dCBkZSBmaWNoaWVycyBwcm9wb3NlIGxlcyBkaXNjaXBsaW5lcykgOiBpbHMgcmXDp29pdmVudCBkw6lzb3JtYWlzIGxlcyBzZXVsZXMgZGlzY2lwbGluZXMgcHVibGnDqWVzLCBzYW5zIHF1J2F1Y3VuIMOpY3JhbiBhaXQgZXUgw6AgY2hhbmdlci4K',
    'ClRvdXRlcyBsZXMgbGVjdHVyZXMgZHUgcm91dGV1ciAoYGdldEFsbGAsIGBnZXRBbGxCeUNhdGVnb3J5YCwgYGdldEFsbEZvck1lbnVgLCBgZ2V0QnlJZGAsIGBnZXRCeVNsdWdgKSBhcHBsaXF1ZW50IGNlIGZpbHRyZS4gVW4gYWRtaW5pc3RyYXRldXIgdm9pdCB0b3V0IDsgdW4gbWVtYnJlIG91IHVuIHZpc2l0ZXVyIG5lIHZvaXQgcXVlIGNlIHF1aSBlc3QgcHVibGnDqSwgZXQgdW4gYnJvdWlsbG9uIGRlbWFuZMOpIHBhciBzb24gaWRlbnRpZmlhbnQgcsOpcG9uZCDCqyBpbnRyb3V2YWJsZSDCuywgZXhhY3RlbWVudCBjb21tZSBsYSBwYWdlIHB1YmxpcXVlLgoKVW5lIHNldWxlIGxlY3R1cmUgZmFpdCBleGNlcHRpb24gOiBgZ2V0QWxsRm9yTWVudWAsIHF1aSBhbGltZW50ZSBsZSBtZW51IMKrIE5vcyBkaXNjaXBsaW5lcyDCuywgbmUgcmVudm9pZSBxdWUgbGVzIGRpc2NpcGxpbmVzIHB1Ymxpw6llcywgKiptw6ptZSDDoCB1biBhZG1pbmlzdHJhdGV1cioqLiBFbGxlIHN1aXZhaXQgZCdhYm9yZCBsYSByw6hnbGUgY29tbXVuZSwgZXQgdW4gYWRtaW5pc3RyYXRldXIgdm95YWl0IHNlcyBicm91aWxsb25zIGRhbnMgbGUgbWVudSA7IG1haXMgbGEgcGFnZSBkJ3VuIGJyb3VpbGxvbiByw6lwb25kIDQwNCDDoCB0b3V0IGxlIG1vbmRlLCBldCBjZXMgZW50csOpZXMgbWVuYWllbnQgw6AgZGVzIGxpZW5zIG1vcnRzLiBMZSBtZW51IGVzdCBsYSBuYXZpZ2F0aW9uIHB1YmxpcXVlIDogaWwgbW9udHJlIGNlIHF1ZSB2b2l0IGxlIHB1YmxpYy4KCkxlcyBzdGFnZXMgZXQgbGVzIMOpdsOpbmVtZW50cyByw6lzb2x2ZW50IGxlIG3Dqm1lIHByb2Jsw6htZSBhdXRyZW1lbnQgOiB1bmUgbGVjdHVyZSBwdWJsaXF1ZSBmaWx0csOpZSAoYHNlbWluYXIuZ2V0QWxsYCkgZXQgdW5lIGxlY3R1cmUgc8OpcGFyw6llIHLDqXNlcnbDqWUgYXV4IGFkbWluaXN0cmF0ZXVycyAoYHNlbWluYXIuZ2V0QWxsQWRtaW5gKS4gUG91ciBsZXMgZGlzY2lwbGluZXMsIGxlIGZpbHRyZSBzZWxvbiBsJ2FwcGVsYW50IGEgw6l0w6kgcHLDqWbDqXLDqSBwYXJjZSBxdWUgbGEgbcOqbWUgbGlzdGUgc2VydCBhdXNzaSBhdXggZm9ybXVsYWlyZXMgZGVzIG1lbWJyZXMgKGxlIGTDqXDDtHQgZGUgZmljaGllcnMgcHJvcG9zZSBsZXMgZGlzY2lwbGluZXMpIDogaWxzIHJlw6dvaXZlbnQgZMOpc29ybWFpcyBsZXMgc2V1bGVzIGRpc2NpcGxpbmVzIHB1Ymxpw6llcywgc2FucyBxdSdhdWN1biDDqWNyYW4gYWl0IGV1IMOgIGNoYW5nZXIuCg==')
print("  édits ok (2 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm --filter backend typecheck && pnpm typecheck && pnpm lint"
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
fix(menu): « Nos disciplines » ne liste que les disciplines publiées, admins compris

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG