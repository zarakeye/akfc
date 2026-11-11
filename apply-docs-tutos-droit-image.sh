#!/usr/bin/env bash
# Doc développeur : portée du refus d'une photo (espace membres).
# Prérequis : apply-fix-tutos-droit-image.sh.
# Usage (racine du repo) : bash apply-docs-tutos-droit-image.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/legal/tags-de-personnes.mdx" 2>/dev/null | grep -qF "comme tout refus, c’est un avertissement : rien n’y est masqué"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "export const adminDroitImagePhotos" "apps/web/src/features/tours/definitions/admin.droit-image.photos.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-tutos-droit-image.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/legal/tags-de-personnes.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "comme tout refus, c’est un avertissement : rien n’y est masqué" "apps/web/content/docs/dev/legal/tags-de-personnes.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/legal/tags-de-personnes.mdx', 'IyMjIFJlZnVzZXIgdW5lIHBob3RvIHByw6ljaXNlCgpBdS1kZWzDoCBkZSBzb24gYXV0b3Jpc2F0aW9uIGfDqW7DqXJhbGUsIHVuIG1lbWJyZSBwZXV0IHJlZnVzZXIgKip1bmUqKiBwaG90byAowqsgSmUgbmUgc291aGFpdGUgcGFzIHF1ZSBjZXR0ZSBwaG90byBzb2l0IGRpZmZ1c8OpZSDCuykgOiBlbGxlIHBhc3NlIGF1IHJvdWdlIHBvdXIgdG91cyBsZXMgdXNhZ2VzLCBldCBsZXMgYXV0cmVzIHJlc3RlbnQgY29tbWUgc29uIGF1dG9yaXNhdGlvbiBsZSBkaXQuIElsIHBldXQgcmV2ZW5pciBzdXIgY2UgcmVmdXMgw6AgdG91dCBtb21lbnQuIEPigJllc3Qgc29uIGRyb2l0IGTigJlvcHBvc2l0aW9uLCBwaG90byBwYXIgcGhvdG8uCgpGYXV0LWlsIGNyYWluZHJlIHF1ZSBjZXMgZXhjZXB0aW9ucyBjb21wbGlxdWVudCBsZSByZXNwZWN0IGRlcyBhdXRvcmlzYXRpb25zIGfDqW7DqXJhbGVzID8gTm9uLCBwYXJjZSBxdeKAmWVsbGVzIG5lIGZvbnQgcXVlICoqcmVzdHJlaW5kcmUqKiA6IHVuZSBwaG90byBlc3QgYXV0b3Jpc8OpZSBwb3VyIHVuIHVzYWdlIHNpIGzigJlhdXRvcmlzYXRpb24gZ8OpbsOpcmFsZSBkaXQgb3VpIEVUIHNpIGxhIHBlcnNvbm5lIG7igJlhIHBhcyByZWZ1c8OpIGNldHRlIHBob3RvLiBVbiByZWZ1cyBnw6luw6lyYWwgcmVzdGUgdW4gcmVmdXMgOyBhdWN1bmUgZXhjZXB0aW9uIG5lIHJlbmQgdmVydCBjZSBxdWUgbOKAmWF1dG9yaXNhdGlvbiBnw6luw6lyYWxlIG1ldCBlbiByb3VnZS4gRGFucyBsZSBjYWxjdWwsIGPigJllc3QgdW5lIGxpZ25lLCBhdmFudCB0b3V0ZXMgbGVzIGF1dHJlcyAobGUgcHJlbWllciBleHRyYWl0IGRlIGNlIGNoYXBpdHJlLCBsaWduZSA3KS4gTGUgcmVzdGUgc3VpdCBzYW5zIHJpZW4gY2hhbmdlciA6IHRhYmxlYXUsIGJsb2NhZ2VzLCBtYXNxdWFnZSwgcmFwcG9ydC4gRGFucyBsYSBmZW7DqnRyZSBkZXMgdGFncywgbGEgcGVyc29ubmUgcG9ydGUgbGEgbWVudGlvbiDCqyBhIHJlZnVzw6kgY2V0dGUgcGhvdG8gwrssIHBvdXIgcXXigJlvbiBzYWNoZSBk4oCZb8O5IHZpZW50IGxlIHJvdWdlLgo=',
    'IyMjIFJlZnVzZXIgdW5lIHBob3RvIHByw6ljaXNlCgpBdS1kZWzDoCBkZSBzb24gYXV0b3Jpc2F0aW9uIGfDqW7DqXJhbGUsIHVuIG1lbWJyZSBwZXV0IHJlZnVzZXIgKip1bmUqKiBwaG90byAowqsgSmUgbmUgc291aGFpdGUgcGFzIHF1ZSBjZXR0ZSBwaG90byBzb2l0IGRpZmZ1c8OpZSDCuykgOiBlbGxlIHBhc3NlIGF1IHJvdWdlIHBvdXIgdG91cyBsZXMgdXNhZ2VzIChwb3VyIGzigJllc3BhY2UgbWVtYnJlcywgY29tbWUgdG91dCByZWZ1cywgY+KAmWVzdCB1biBhdmVydGlzc2VtZW50IDogcmllbiBu4oCZeSBlc3QgbWFzcXXDqSksIGV0IGxlcyBhdXRyZXMgcmVzdGVudCBjb21tZSBzb24gYXV0b3Jpc2F0aW9uIGxlIGRpdC4gSWwgcGV1dCByZXZlbmlyIHN1ciBjZSByZWZ1cyDDoCB0b3V0IG1vbWVudC4gQ+KAmWVzdCBzb24gZHJvaXQgZOKAmW9wcG9zaXRpb24sIHBob3RvIHBhciBwaG90by4KCkZhdXQtaWwgY3JhaW5kcmUgcXVlIGNlcyBleGNlcHRpb25zIGNvbXBsaXF1ZW50IGxlIHJlc3BlY3QgZGVzIGF1dG9yaXNhdGlvbnMgZ8OpbsOpcmFsZXMgPyBOb24sIHBhcmNlIHF14oCZZWxsZXMgbmUgZm9udCBxdWUgKipyZXN0cmVpbmRyZSoqIDogdW5lIHBob3RvIGVzdCBhdXRvcmlzw6llIHBvdXIgdW4gdXNhZ2Ugc2kgbOKAmWF1dG9yaXNhdGlvbiBnw6luw6lyYWxlIGRpdCBvdWkgRVQgc2kgbGEgcGVyc29ubmUgbuKAmWEgcGFzIHJlZnVzw6kgY2V0dGUgcGhvdG8uIFVuIHJlZnVzIGfDqW7DqXJhbCByZXN0ZSB1biByZWZ1cyA7IGF1Y3VuZSBleGNlcHRpb24gbmUgcmVuZCB2ZXJ0IGNlIHF1ZSBs4oCZYXV0b3Jpc2F0aW9uIGfDqW7DqXJhbGUgbWV0IGVuIHJvdWdlLiBEYW5zIGxlIGNhbGN1bCwgY+KAmWVzdCB1bmUgbGlnbmUsIGF2YW50IHRvdXRlcyBsZXMgYXV0cmVzIChsZSBwcmVtaWVyIGV4dHJhaXQgZGUgY2UgY2hhcGl0cmUsIGxpZ25lIDcpLiBMZSByZXN0ZSBzdWl0IHNhbnMgcmllbiBjaGFuZ2VyIDogdGFibGVhdSwgYmxvY2FnZXMsIG1hc3F1YWdlLCByYXBwb3J0LiBEYW5zIGxhIGZlbsOqdHJlIGRlcyB0YWdzLCBsYSBwZXJzb25uZSBwb3J0ZSBsYSBtZW50aW9uIMKrIGEgcmVmdXPDqSBjZXR0ZSBwaG90byDCuywgcG91ciBxdeKAmW9uIHNhY2hlIGTigJlvw7kgdmllbnQgbGUgcm91Z2UuCg==')
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
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs : refus d'une photo, portée dans l'espace membres

Comme tout refus, un avertissement dans l'espace membres : rien n'y est
masqué.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : git push, puis sur le serveur : git pull → bash akfc-migrate-prod.sh → docker compose up -d --build akfc."