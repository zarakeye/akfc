#!/usr/bin/env bash
# Doc développeur : « Un clic qui se perd ».
# Prérequis : apply-fix-clics-e2e.sh.
# Usage (racine du repo) : bash apply-docs-clics-e2e.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx" 2>/dev/null | grep -qF "### Un clic qui se perd"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "export async function clickUntilUrl" "e2e/helpers.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-clics-e2e.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "### Un clic qui se perd" "apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx', 'YGV4cGVjdC5wb2xsYCByZWxhbmNlIGxhIGZvbmN0aW9uIGp1c3F14oCZw6AgY2UgcXXigJllbGxlIHJlbmRlIGF1dHJlIGNob3NlIHF1ZSBgbnVsbGAuIEPigJllc3QgbGEgYm9ubmUgZmHDp29uIGTigJlhdHRlbmRyZSBlbiBQbGF5d3JpZ2h0IDogKipqYW1haXMqKiB1bmUgcGF1c2UgZml4ZSAoYHdhaXRGb3JUaW1lb3V0KDMwMDApYCksIHRyb3AgbG9uZ3VlIHF1YW5kIHRvdXQgdmEgYmllbiwgdHJvcCBjb3VydGUgdW4gam91ciBvw7kgbGEgbWFjaGluZSBlc3QgY2hhcmfDqWUuIExlIGZpbHRyZSBgc2luY2VgIMOpY2FydGUgbGVzIGUtbWFpbHMgZOKAmXVuIGxhbmNlbWVudCBwcsOpY8OpZGVudC4KCiMjIFVuIHRlc3QgZG9pdCBwb3V2b2lyIMOpY2hvdWVyCgo=',
    'YGV4cGVjdC5wb2xsYCByZWxhbmNlIGxhIGZvbmN0aW9uIGp1c3F14oCZw6AgY2UgcXXigJllbGxlIHJlbmRlIGF1dHJlIGNob3NlIHF1ZSBgbnVsbGAuIEPigJllc3QgbGEgYm9ubmUgZmHDp29uIGTigJlhdHRlbmRyZSBlbiBQbGF5d3JpZ2h0IDogKipqYW1haXMqKiB1bmUgcGF1c2UgZml4ZSAoYHdhaXRGb3JUaW1lb3V0KDMwMDApYCksIHRyb3AgbG9uZ3VlIHF1YW5kIHRvdXQgdmEgYmllbiwgdHJvcCBjb3VydGUgdW4gam91ciBvw7kgbGEgbWFjaGluZSBlc3QgY2hhcmfDqWUuIExlIGZpbHRyZSBgc2luY2VgIMOpY2FydGUgbGVzIGUtbWFpbHMgZOKAmXVuIGxhbmNlbWVudCBwcsOpY8OpZGVudC4KCiMjIyBVbiBjbGljIHF1aSBzZSBwZXJkCgpVbmUgbGlnbmUgZGUgdGFibGVhdSBwZXV0IMOqdHJlICoqdmlzaWJsZSoqIGF2YW50IHF1ZSBSZWFjdCB5IGFpdCBicmFuY2jDqSBzb24gY2xpYyA6IGxhIHBhZ2UgZXN0IGFycml2w6llIGR1IHNlcnZldXIsIG1haXMgbGUgbmF2aWdhdGV1ciBuJ2EgcGFzIGZpbmkgZGUgbCfCqyBoeWRyYXRlciDCuy4gTGUgY2xpYyBwYXJ0LCByaWVuIG5lIHNlIHBhc3NlLCBhdWN1bmUgZXJyZXVyLiBTdXIgdW5lIG1hY2hpbmUgZMOpasOgIGNoYXVkZSwgw6dhIG4nYXJyaXZlIHByZXNxdWUgamFtYWlzIDsgZGFucyB1biBuYXZpZ2F0ZXVyIHRvdXQgbmV1ZiAoUGxheXdyaWdodCBlbiByZWxhbmNlIHVuIGFwcsOocyB1biB0ZXN0IHJhdMOpKSwgc2kuIExlIHRlc3QgwqsgQWpvdXRlciBkZXMgc8OpYW5jZXMgwrsgYSDDqWNob3XDqSBhaW5zaSBqdXN0ZSBhcHLDqHMgdW4gdGVzdCByYXTDqSwgYWxvcnMgcXVlIGxlIHNpdGUgZm9uY3Rpb25uYWl0LgoKPENvZGVFeGFtcGxlCiAgbGFuZ3VhZ2U9InRzIgogIGZpbGVwYXRoPSJlMmUvaGVscGVycy50cyIKICBmaWxlbmFtZT0iaGVscGVycy50cyIKICBzbmlwcGV0UmFuZ2U9IjcyLTgyIgogIHNuaXBwZXRIaWdobGlnaHQ9IjgtOSIKICBzbmlwcGV0VGl0bGU9ImUyZS9oZWxwZXJzLnRzIOKAlCBjbGlja1VudGlsVXJsIgogIGZ1bGxGaWxlVGl0bGU9IlZvaXIgbGUgZmljaGllciBjb21wbGV0IgovPgoKTGUgcmVtw6hkZSBuZSBjb25zaXN0ZSBwYXMgw6AgYXR0ZW5kcmUgcGx1cyBsb25ndGVtcHMgYXUgaGFzYXJkLCBtYWlzIMOgIHbDqXJpZmllciBjZSBxdWUgbGUgY2xpYyBkZXZhaXQgcHJvZHVpcmUgKGxhIG5vdXZlbGxlIGFkcmVzc2UpIGV0IMOgIHJlY29tbWVuY2VyIHMnaWwgcydlc3QgcGVyZHUsIGRhbnMgdW5lIGxpbWl0ZSBkZSB0ZW1wcy4gVW4gdGVzdCBxdWkgbmUgcGFzc2UgcXUnZW4gYXR0ZW5kYW50IMKrIGFzc2V6IMK7IGZpbml0IHRvdWpvdXJzIHBhciDDqWNob3VlciB1biBqb3VyIHN1ciB1bmUgbWFjaGluZSBwbHVzIGxlbnRlLgoKIyMgVW4gdGVzdCBkb2l0IHBvdXZvaXIgw6ljaG91ZXIKCg==')
print("  édits ok (1 substitutions, 0 fichiers créés, 0 remplacés)")
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
docs : « Un clic qui se perd » (tester de bout en bout)

Pourquoi une ligne visible n'est pas encore cliquable (hydratation), le
remède : vérifier ce que le clic devait produire et recommencer, plutôt
qu'attendre au hasard. Extrait : clickUntilUrl.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : git push (la migration est portée par apply-fix-circuit-parent.sh)."