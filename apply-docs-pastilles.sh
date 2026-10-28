#!/usr/bin/env bash
# Docs sur téléphone : « Entités » et « On this page » deviennent des pastilles rondes, dans une marge
# droite gardée libre : elles ne couvrent plus le texte.
# Prérequis : apply-docs-telephone.sh.
# Usage (racine du repo) : bash apply-docs-pastilles.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/docs/components/DocsRightAsideDrawer.tsx" 2>/dev/null | grep -qF "max-lg:sr-only"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "function PortraitHint" "apps/web/src/features/docs/components/PortraitHint.tsx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-telephone.sh"; exit 1; }
MODIFIED=("apps/web/src/features/docs/components/DocsLayout.tsx" "apps/web/src/features/docs/components/DocsRightAsideDrawer.tsx" "apps/web/src/features/docs/entities/EntityExplorer.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "max-lg:sr-only" "apps/web/src/features/docs/components/DocsRightAsideDrawer.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/features/docs/components/DocsLayout.tsx', 'CiAgICAgIDxtYWluIGNsYXNzTmFtZT0ibWluLXctMCBmbGV4LTEgb3ZlcmZsb3ctaGlkZGVuIj4KICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iZmxleCBoLWZ1bGwgbWluLWgtMCBvdmVyZmxvdy1oaWRkZW4gcHgtOCBweS02IG1heC1tZDpweC0zIHNob3J0OnB5LTIiPgogICAgICAgICAgey8qIMOJY3JhbiBiYXMgKGBzaG9ydDpgLCB0w6lsw6lwaG9uZSBlbiBwYXlzYWdlKSBldCB0w6lsw6lwaG9uZSBlbiBwb3J0cmFpdCAoYHBob25lLXBvcnRyYWl0OmApIDoKICAgICAgICAgICAgICBsZSB0aXRyZSBldCBsZXMgbGllbnMgwqsgUHLDqWPDqWRlbnQgLyBTdWl2YW50IMK7IGTDqWZpbGVudCBhdmVjIGxlIHRleHRlIDsgYydlc3QgbGEKICAgICAgICAgICAgICBzZWN0aW9uIGVudGnDqHJlIHF1aSBkw6lmaWxlICh2b2lyIGxpYi9kb2NzU2Nyb2xsZXIudHMpLiAqL30K',
    'CiAgICAgIDxtYWluIGNsYXNzTmFtZT0ibWluLXctMCBmbGV4LTEgb3ZlcmZsb3ctaGlkZGVuIj4KICAgICAgICA8ZGl2IGNsYXNzTmFtZT0iZmxleCBoLWZ1bGwgbWluLWgtMCBvdmVyZmxvdy1oaWRkZW4gcHgtOCBweS02IG1heC1tZDpwbC0zIG1heC1sZzpwci0xMiBzaG9ydDpweS0yIj4KICAgICAgICAgIHsvKiDDiWNyYW4gw6l0cm9pdCAoYG1heC1sZzpgKSA6IG1hcmdlIGRyb2l0ZSBsaWJyZSBwb3VyIGxlcyBwYXN0aWxsZXMgwqsgRW50aXTDqXMgwrsgZXQgwqsgT24KICAgICAgICAgICAgICB0aGlzIHBhZ2UgwrssIHF1aSBuZSBjb3V2cmVudCBhaW5zaSBqYW1haXMgbGUgdGV4dGUuCiAgICAgICAgICAgICAgw4ljcmFuIGJhcyAoYHNob3J0OmAsIHTDqWzDqXBob25lIGVuIHBheXNhZ2UpIGV0IHTDqWzDqXBob25lIGVuIHBvcnRyYWl0IChgcGhvbmUtcG9ydHJhaXQ6YCkgOgogICAgICAgICAgICAgIGxlIHRpdHJlIGV0IGxlcyBsaWVucyDCqyBQcsOpY8OpZGVudCAvIFN1aXZhbnQgwrsgZMOpZmlsZW50IGF2ZWMgbGUgdGV4dGUgOyBjJ2VzdCBsYQogICAgICAgICAgICAgIHNlY3Rpb24gZW50acOocmUgcXVpIGTDqWZpbGUgKHZvaXIgbGliL2RvY3NTY3JvbGxlci50cykuICovfQo=')
sub('apps/web/src/features/docs/components/DocsLayout.tsx', 'ICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICBpZD0iZG9jcy1jb250ZW50LXNjcm9sbCIKICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0iZG9jcy1tYWluLXNjcm9sbCBoLWZ1bGwgbWluLWgtMCBvdmVyZmxvdy15LWF1dG8gb3ZlcmZsb3cteC1oaWRkZW4gcHktNiBwci0xMCBtYXgtbWQ6cHItMSBzaG9ydDpoLWF1dG8gc2hvcnQ6b3ZlcmZsb3ctdmlzaWJsZSBzaG9ydDpvdmVyZmxvdy14LXZpc2libGUgcGhvbmUtcG9ydHJhaXQ6aC1hdXRvIHBob25lLXBvcnRyYWl0Om92ZXJmbG93LXZpc2libGUgcGhvbmUtcG9ydHJhaXQ6b3ZlcmZsb3cteC12aXNpYmxlIgogICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJteC1hdXRvIG1heC13LTR4bCB0ZXh0LWp1c3RpZnkiPntjaGlsZHJlbn08L2Rpdj4K',
    'ICAgICAgICAgICAgICA8ZGl2CiAgICAgICAgICAgICAgICBpZD0iZG9jcy1jb250ZW50LXNjcm9sbCIKICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0iZG9jcy1tYWluLXNjcm9sbCBoLWZ1bGwgbWluLWgtMCBvdmVyZmxvdy15LWF1dG8gb3ZlcmZsb3cteC1oaWRkZW4gcHktNiBwci0xMCBtYXgtbGc6cHItMSBzaG9ydDpoLWF1dG8gc2hvcnQ6b3ZlcmZsb3ctdmlzaWJsZSBzaG9ydDpvdmVyZmxvdy14LXZpc2libGUgcGhvbmUtcG9ydHJhaXQ6aC1hdXRvIHBob25lLXBvcnRyYWl0Om92ZXJmbG93LXZpc2libGUgcGhvbmUtcG9ydHJhaXQ6b3ZlcmZsb3cteC12aXNpYmxlIgogICAgICAgICAgICAgID4KICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJteC1hdXRvIG1heC13LTR4bCB0ZXh0LWp1c3RpZnkiPntjaGlsZHJlbn08L2Rpdj4K')
sub('apps/web/src/features/docs/components/DocsRightAsideDrawer.tsx', 'CmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gInJlYWN0IgppbXBvcnQgeyBEb2NzUmlnaHRBc2lkZSB9IGZyb20gIi4vRG9jc1JpZ2h0QXNpZGUiCmltcG9ydCB0eXBlIHsgVG9jSXRlbSB9IGZyb20gIkBmZWF0dXJlcy9kb2NzL2xpYi9kb2NzLnR5cGVzIgo=',
    'CmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gInJlYWN0IgppbXBvcnQgeyBMaXN0IH0gZnJvbSAibHVjaWRlLXJlYWN0IgppbXBvcnQgeyBEb2NzUmlnaHRBc2lkZSB9IGZyb20gIi4vRG9jc1JpZ2h0QXNpZGUiCmltcG9ydCB0eXBlIHsgVG9jSXRlbSB9IGZyb20gIkBmZWF0dXJlcy9kb2NzL2xpYi9kb2NzLnR5cGVzIgo=')
sub('apps/web/src/features/docs/components/DocsRightAsideDrawer.tsx', 'ICByZXR1cm4gKAogICAgPD4KICAgICAgPGJ1dHRvbgogICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4odHJ1ZSl9CiAgICAgICAgY2xhc3NOYW1lPSJmaXhlZCByaWdodC02IGJvdHRvbS02IHotNDAgcm91bmRlZC1mdWxsIGJvcmRlciBiZy1iYWNrZ3JvdW5kIHB4LTQgcHktMiB0ZXh0LXNtIHNoYWRvdy1sZyBob3ZlcjpiZy1tdXRlZCIKICAgICAgPgogICAgICAgIE9uIHRoaXMgcGFnZQogICAgICA8L2J1dHRvbj4KCg==',
    'ICByZXR1cm4gKAogICAgPD4KICAgICAgey8qIMOJY3JhbiDDqXRyb2l0IDogdW5lIHBhc3RpbGxlIHJvbmRlLCBkYW5zIGxhIG1hcmdlIGRyb2l0ZSBnYXJkw6llIGxpYnJlIHBhciBEb2NzTGF5b3V0LiAqL30KICAgICAgPGJ1dHRvbgogICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4odHJ1ZSl9CiAgICAgICAgY2xhc3NOYW1lPSJmaXhlZCByaWdodC02IGJvdHRvbS02IHotNDAgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHJvdW5kZWQtZnVsbCBib3JkZXIgYmctYmFja2dyb3VuZCBweC00IHB5LTIgdGV4dC1zbSBzaGFkb3ctbGcgaG92ZXI6YmctbXV0ZWQgbWF4LWxnOnJpZ2h0LTEuNSBtYXgtbGc6Ym90dG9tLTMgbWF4LWxnOmgtMTAgbWF4LWxnOnctMTAgbWF4LWxnOnAtMCIKICAgICAgPgogICAgICAgIDxMaXN0IGNsYXNzTmFtZT0iaGlkZGVuIGgtNCB3LTQgbWF4LWxnOmJsb2NrIiBhcmlhLWhpZGRlbj0idHJ1ZSIgLz4KICAgICAgICA8c3BhbiBjbGFzc05hbWU9Im1heC1sZzpzci1vbmx5Ij5PbiB0aGlzIHBhZ2U8L3NwYW4+CiAgICAgIDwvYnV0dG9uPgoK')
sub('apps/web/src/features/docs/entities/EntityExplorer.tsx', 'ICAgICAgICB0eXBlPSJidXR0b24iCiAgICAgICAgb25DbGljaz17KCkgPT4gc2V0T3Blbih0cnVlKX0KICAgICAgICBjbGFzc05hbWU9ImZpeGVkIGJvdHRvbS0yMCByaWdodC02IHotNDAgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgcm91bmRlZC1mdWxsIGJvcmRlciBiZy1iYWNrZ3JvdW5kIHB4LTQgcHktMiB0ZXh0LXNtIHNoYWRvdy1sZyBob3ZlcjpiZy1tdXRlZCIKICAgICAgPgogICAgICAgIDxBdG9tIGNsYXNzTmFtZT0iaC00IHctNCB0ZXh0LWVtZXJhbGQtNjAwIiBhcmlhLWhpZGRlbj0idHJ1ZSIgLz4KICAgICAgICBFbnRpdMOpcwogICAgICA8L2J1dHRvbj4KICAgICAge2lzT3BlbiAmJiAoCg==',
    'ICAgICAgICB0eXBlPSJidXR0b24iCiAgICAgICAgb25DbGljaz17KCkgPT4gc2V0T3Blbih0cnVlKX0KICAgICAgICAvLyDDiWNyYW4gw6l0cm9pdCA6IHVuZSBwYXN0aWxsZSByb25kZSwgZGFucyBsYSBtYXJnZSBkcm9pdGUgZ2FyZMOpZSBsaWJyZSBwYXIgRG9jc0xheW91dC4KICAgICAgICBjbGFzc05hbWU9ImZpeGVkIGJvdHRvbS0yMCByaWdodC02IHotNDAgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgcm91bmRlZC1mdWxsIGJvcmRlciBiZy1iYWNrZ3JvdW5kIHB4LTQgcHktMiB0ZXh0LXNtIHNoYWRvdy1sZyBob3ZlcjpiZy1tdXRlZCBtYXgtbGc6Ym90dG9tLTE2IG1heC1sZzpyaWdodC0xLjUgbWF4LWxnOmgtMTAgbWF4LWxnOnctMTAgbWF4LWxnOmp1c3RpZnktY2VudGVyIG1heC1sZzpwLTAiCiAgICAgID4KICAgICAgICA8QXRvbSBjbGFzc05hbWU9ImgtNCB3LTQgdGV4dC1lbWVyYWxkLTYwMCIgYXJpYS1oaWRkZW49InRydWUiIC8+CiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJtYXgtbGc6c3Itb25seSI+RW50aXTDqXM8L3NwYW4+CiAgICAgIDwvYnV0dG9uPgogICAgICB7aXNPcGVuICYmICgK')
print("  édits ok (5 substitutions, 0 fichiers créés, 0 remplacés)")
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
feat(docs): pastilles Entités / On this page dans une marge libre sur écran étroit

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG