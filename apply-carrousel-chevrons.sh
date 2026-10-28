#!/usr/bin/env bash
# Accueil : les chevrons du carrousel ne passent plus par-dessus le header collant (section en isolate).
# Usage (racine du repo) : bash apply-carrousel-chevrons.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/app-shell/HomeCarousel.tsx" 2>/dev/null | grep -qF "<section className=\"relative isolate\">"; then echo "Déjà appliqué (commité)."; exit 0; fi
MODIFIED=("apps/web/src/features/app-shell/HomeCarousel.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "<section className=\"relative isolate\">" "apps/web/src/features/app-shell/HomeCarousel.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/features/app-shell/HomeCarousel.tsx', 'CiAgcmV0dXJuICgKICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0icmVsYXRpdmUiPgogICAgICA8ZGl2CiAgICAgICAgcmVmPXtjb250YWluZXJSZWZ9Cg==',
    'CiAgcmV0dXJuICgKICAgIC8vIGlzb2xhdGUgOiBsZSBjYXJyb3VzZWwgZm9ybWUgc29uIHByb3ByZSBlbXBpbGVtZW50LiBMZXMgei1pbmRleCBkZSBzZXMgYm91dG9ucyAoanVzcXUnw6AKICAgIC8vIHotWzIwMF0pIG5lIHZhbGVudCBxdSdlbnRyZSBldXgsIGV0IHBsdXMgY29udHJlIGxlIGhlYWRlciBjb2xsYW50ICh6LTUwKSBxdWkgcGFzc2UgZGVzc3VzLgogICAgPHNlY3Rpb24gY2xhc3NOYW1lPSJyZWxhdGl2ZSBpc29sYXRlIj4KICAgICAgPGRpdgogICAgICAgIHJlZj17Y29udGFpbmVyUmVmfQo=')
print("  édits ok (1 substitutions, 0 fichiers créés, 0 remplacés)")
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
fix(accueil): les chevrons du carrousel ne passent plus par-dessus le header collant

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG