#!/usr/bin/env bash
# Registre RGPD : l'identification des personnes sur les médias (tags) dans « Photos et vidéos ».
# Prérequis : apply-docs-tutos-droit-image.sh. Pas de migration.
# Usage (racine du repo) : bash apply-fix-registre-tags.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"packages/contracts/src/legal/processingRegister.ts" 2>/dev/null | grep -qF "identification des personnes sur chaque média"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "export const adminDroitImagePhotos" "apps/web/src/features/tours/definitions/admin.droit-image.photos.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-tutos-droit-image.sh puis apply-docs-tutos-droit-image.sh"; exit 1; }
MODIFIED=("packages/contracts/src/legal/processingRegister.ts")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "identification des personnes sur chaque média" "packages/contracts/src/legal/processingRegister.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('packages/contracts/src/legal/processingRegister.ts', 'ICAgICAgcHVycG9zZTogIlB1YmxpZXIgbGVzIHBob3RvcyBldCB2aWTDqW9zIGRlcyBjb3Vycywgc3RhZ2VzIGV0IMOpdsOpbmVtZW50cywgZW4gZ2FsZXJpZSBwdWJsaXF1ZSBvdSByw6lzZXJ2w6llIGF1eCBtZW1icmVzLiIsCiAgICAgIHBlb3BsZTogIk1lbWJyZXMgZXQgcGFydGljaXBhbnRzIHBob3RvZ3JhcGhpw6lzIDsgcG91ciB1biBtZW1icmUgbWluZXVyLCBzb24gcGFyZW50IHLDqWbDqXJlbnQiLAogICAgICBkYXRhOiAiSW1hZ2UgZXQgdm9peCBkZXMgcGVyc29ubmVzIHJlY29ubmFpc3NhYmxlcyA7IGZvcm11bGFpcmUgZCdhdXRvcmlzYXRpb24gc2lnbsOpICh1c2FnZXMgY2hvaXNpcywgbm9tIGV0IHF1YWxpdMOpIGR1IHNpZ25hdGFpcmUpIDsgcG91ciB1biBtaW5ldXIsIG5vbSwgcXVhbGl0w6kgZXQgZS1tYWlsIGR1IHBhcmVudCByw6lmw6lyZW50LCBsZXMgc291aGFpdHMgaW5kaXF1w6lzIHBhciBsZSBtaW5ldXIgZXQgbGUgbGllbiBlbnZvecOpIMOgIHNvbiBwYXJlbnQgKGFkcmVzc2UsIGRhdGUsIHZhbGlkaXTDqSA7IHNldWxlIHVuZSBlbXByZWludGUgZHUgbGllbiBlc3QgZ2FyZMOpZSkiLAogICAgICBsZWdhbEJhc2lzOiAiQXV0b3Jpc2F0aW9uIGRlIGxhIHBlcnNvbm5lIChkZSBzZXMgcGFyZW50cyBwb3VyIHVuIG1pbmV1cikiLAogICAgICByZWNpcGllbnRzOiAiUHVibGljIG91IG1lbWJyZXMsIHNlbG9uIGxhIGdhbGVyaWUgZXQgbGVzIHVzYWdlcyBhdXRvcmlzw6lzIDsgbGUgZm9ybXVsYWlyZSA6IGxhIHBlcnNvbm5lIGV0IGxlcyBhZG1pbmlzdHJhdGV1cnMiLAo=',
    'ICAgICAgcHVycG9zZTogIlB1YmxpZXIgbGVzIHBob3RvcyBldCB2aWTDqW9zIGRlcyBjb3Vycywgc3RhZ2VzIGV0IMOpdsOpbmVtZW50cywgZW4gZ2FsZXJpZSBwdWJsaXF1ZSBvdSByw6lzZXJ2w6llIGF1eCBtZW1icmVzLiIsCiAgICAgIHBlb3BsZTogIk1lbWJyZXMgZXQgcGFydGljaXBhbnRzIHBob3RvZ3JhcGhpw6lzIDsgcG91ciB1biBtZW1icmUgbWluZXVyLCBzb24gcGFyZW50IHLDqWbDqXJlbnQiLAogICAgICBkYXRhOiAiSW1hZ2UgZXQgdm9peCBkZXMgcGVyc29ubmVzIHJlY29ubmFpc3NhYmxlcyA7IGlkZW50aWZpY2F0aW9uIGRlcyBwZXJzb25uZXMgc3VyIGNoYXF1ZSBtw6lkaWEgKHRhZ3MgcG9zw6lzIMOgIGxhIG1haW4gcGFyIHVuIGFkbWluaXN0cmF0ZXVyLCBqYW1haXMgZGUgcmVjb25uYWlzc2FuY2UgZmFjaWFsZSkgZXQsIGxlIGNhcyDDqWNow6lhbnQsIGxldXIgcmVmdXMgZCd1biBtw6lkaWEgcHLDqWNpcyA7IGZvcm11bGFpcmUgZCdhdXRvcmlzYXRpb24gc2lnbsOpICh1c2FnZXMgY2hvaXNpcywgbm9tIGV0IHF1YWxpdMOpIGR1IHNpZ25hdGFpcmUpIDsgcG91ciB1biBtaW5ldXIsIG5vbSwgcXVhbGl0w6kgZXQgZS1tYWlsIGR1IHBhcmVudCByw6lmw6lyZW50LCBsZXMgc291aGFpdHMgaW5kaXF1w6lzIHBhciBsZSBtaW5ldXIgZXQgbGUgbGllbiBlbnZvecOpIMOgIHNvbiBwYXJlbnQgKGFkcmVzc2UsIGRhdGUsIHZhbGlkaXTDqSA7IHNldWxlIHVuZSBlbXByZWludGUgZHUgbGllbiBlc3QgZ2FyZMOpZSkiLAogICAgICBsZWdhbEJhc2lzOiAiQXV0b3Jpc2F0aW9uIGRlIGxhIHBlcnNvbm5lIChkZSBzZXMgcGFyZW50cyBwb3VyIHVuIG1pbmV1cikiLAogICAgICByZWNpcGllbnRzOiAiUHVibGljIG91IG1lbWJyZXMsIHNlbG9uIGxhIGdhbGVyaWUgZXQgbGVzIHVzYWdlcyBhdXRvcmlzw6lzIDsgbGUgZm9ybXVsYWlyZSA6IGxhIHBlcnNvbm5lIGV0IGxlcyBhZG1pbmlzdHJhdGV1cnMiLAo=')
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
Registre RGPD : identification des personnes sur les médias

Le traitement « Photos et vidéos des activités » mentionne désormais les
tags posés à la main par un administrateur (jamais de reconnaissance
faciale) et le refus d'un média précis ; la politique de confidentialité,
générée depuis le même registre, suit.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Pas de migration. Ensuite : apply-docs-modules-1.sh."