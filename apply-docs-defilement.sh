#!/usr/bin/env bash
# Docs : « On this page » ramène de nouveau aux sections. La mise en page prend la hauteur de l'écran ;
# c'est la colonne centrale qui défile, plus la fenêtre.
# Usage (racine du repo) : bash apply-docs-defilement.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/app/docs/layout.tsx" 2>/dev/null | grep -qF "h-dvh min-h-0 overflow-hidden"; then echo "Déjà appliqué (commité)."; exit 0; fi
MODIFIED=("apps/web/src/app/docs/layout.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "h-dvh min-h-0 overflow-hidden" "apps/web/src/app/docs/layout.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/app/docs/layout.tsx', 'ICBjaGlsZHJlbjogUmVhY3ROb2RlCn0pIHsKICByZXR1cm4gPGRpdiBjbGFzc05hbWU9ImgtZnVsbCBtaW4taC0wIG92ZXJmbG93LWhpZGRlbiI+e2NoaWxkcmVufTwvZGl2Pgp9',
    'ICBjaGlsZHJlbjogUmVhY3ROb2RlCn0pIHsKICAvLyBIYXV0ZXVyIGRlIGwnw6ljcmFuIChgaC1kdmhgKSwgcGFzIGBoLWZ1bGxgIDogYDxodG1sPmAgZXQgYDxib2R5PmAgbidvbnQgcGFzIGRlIGhhdXRldXIgZml4w6llLAogIC8vIHVuIGBoLWZ1bGxgIGxhaXNzZXJhaXQgbGEgcGFnZSBncmFuZGlyIGF2ZWMgbGUgY29udGVudS4gQydlc3QgYWxvcnMgbGEgZmVuw6p0cmUgcXVpIGTDqWZpbGVyYWl0LAogIC8vIGV0IG5vbiBsYSBjb2xvbm5lIGNlbnRyYWxlICgjZG9jcy1jb250ZW50LXNjcm9sbCkgcXVlIHBpbG90ZW50IGxhIHRhYmxlIGRlcyBtYXRpw6hyZXMgwqsgT24gdGhpcwogIC8vIHBhZ2UgwrssIGxhIGJhcnJlIGRlIHByb2dyZXNzaW9uIGV0IGxlcyBib3V0b25zIGhhdXQgLyBiYXMuCiAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPSJoLWR2aCBtaW4taC0wIG92ZXJmbG93LWhpZGRlbiI+e2NoaWxkcmVufTwvZGl2Pgp9')
print("  édits ok (1 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
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
fix(docs): la colonne centrale défile, pas la fenêtre (« On this page » rétabli)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG