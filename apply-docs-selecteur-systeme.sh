#!/usr/bin/env bash
# Docs : sélecteur « Système » dans la barre latérale (même réglage que les onglets de commandes) et
# mention « Choix retenu pour toute la documentation » sous chaque bloc à onglets.
# Prérequis : apply-docs-installation.sh.
# Usage (racine du repo) : bash apply-docs-selecteur-systeme.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/docs/ui/OsSelect.tsx" 2>/dev/null | grep -qF "function OsSelect"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Windows : travailler dans WSL 2" "apps/web/content/docs/dev/demarrer/mise-en-route.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-installation.sh"; exit 1; }
MODIFIED=("apps/web/src/features/docs/components/DocsSidebar.tsx" "apps/web/src/features/docs/ui/OsTabs.tsx")
CREATED=("apps/web/src/features/docs/ui/OsSelect.tsx")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "function OsSelect" "apps/web/src/features/docs/ui/OsSelect.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
trap 'restore' ERR

mkdir -p "apps/web/src/features/docs/ui"
base64 -d > "apps/web/src/features/docs/ui/OsSelect.tsx" <<'B64'
InVzZSBjbGllbnQiCgppbXBvcnQgeyBNb25pdG9yIH0gZnJvbSAibHVjaWRlLXJlYWN0IgoKaW1w
b3J0IHsgY2hvb3NlT3MsIE9TX0xBQkVMLCB1c2VDaG9zZW5PcywgdHlwZSBPc05hbWUgfSBmcm9t
ICJAZmVhdHVyZXMvZG9jcy91aS9Pc1RhYnMiCgovKioKICogTGUgc3lzdMOobWUgcG91ciBsZXF1
ZWwgbGEgZG9jIG1vbnRyZSBzZXMgY29tbWFuZGVzLCBkYW5zIGxhIGJhcnJlIGxhdMOpcmFsZSwg
w6AgY8O0dMOpIGR1IHRow6htZS4KICogTcOqbWUgcsOpZ2xhZ2UgcXVlIGxlcyBvbmdsZXRzIDxP
c1RhYnM+IGRlcyBwYWdlcyA6IGNoYW5nZXIgbCd1biBjaGFuZ2UgbGVzIGF1dHJlcy4KICovCmV4
cG9ydCBmdW5jdGlvbiBPc1NlbGVjdCgpIHsKICBjb25zdCBjaG9zZW4gPSB1c2VDaG9zZW5Pcygp
CiAgcmV0dXJuICgKICAgIDxsYWJlbCBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0y
IHRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj4KICAgICAgPE1vbml0b3IgY2xhc3NOYW1l
PSJoLTMuNSB3LTMuNSBzaHJpbmstMCIgYXJpYS1oaWRkZW49InRydWUiIC8+CiAgICAgIDxzcGFu
PlN5c3TDqG1lPC9zcGFuPgogICAgICA8c2VsZWN0CiAgICAgICAgdmFsdWU9e2Nob3NlbiA/PyAi
In0KICAgICAgICBvbkNoYW5nZT17KGUpID0+IGNob29zZU9zKGUudGFyZ2V0LnZhbHVlIGFzIE9z
TmFtZSl9CiAgICAgICAgY2xhc3NOYW1lPSJtaW4tdy0wIGZsZXgtMSByb3VuZGVkLW1kIGJvcmRl
ciBib3JkZXItaW5wdXQgYmctYmFja2dyb3VuZCBweC0xLjUgcHktMSB0ZXh0LXhzIHRleHQtZm9y
ZWdyb3VuZCIKICAgICAgPgogICAgICAgIHsvKiBBdmFudCBsJ2h5ZHJhdGF0aW9uLCBsZSBjaG9p
eCBuJ2VzdCBwYXMgZW5jb3JlIGx1IDogcmllbiBuJ2VzdCBzw6lsZWN0aW9ubsOpLiAqL30KICAg
ICAgICB7Y2hvc2VuID09PSBudWxsID8gPG9wdGlvbiB2YWx1ZT0iIiBkaXNhYmxlZCBoaWRkZW4g
Lz4gOiBudWxsfQogICAgICAgIHsoT2JqZWN0LmtleXMoT1NfTEFCRUwpIGFzIE9zTmFtZVtdKS5t
YXAoKG9zKSA9PiAoCiAgICAgICAgICA8b3B0aW9uIGtleT17b3N9IHZhbHVlPXtvc30+CiAgICAg
ICAgICAgIHtPU19MQUJFTFtvc119CiAgICAgICAgICA8L29wdGlvbj4KICAgICAgICApKX0KICAg
ICAgPC9zZWxlY3Q+CiAgICA8L2xhYmVsPgogICkKfQoKZXhwb3J0IGRlZmF1bHQgT3NTZWxlY3QK
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
sub('apps/web/src/features/docs/components/DocsSidebar.tsx', 'aW1wb3J0IHsgVGhlbWVUb2dnbGUgfSBmcm9tICJAZmVhdHVyZXMvdGhlbWUiCmltcG9ydCB7IEFycm93TGVmdCB9IGZyb20gImx1Y2lkZS1yZWFjdCIKCnR5cGUgTmF2aWdhdGlvblNlY3Rpb24gPSB7Cg==',
    'aW1wb3J0IHsgVGhlbWVUb2dnbGUgfSBmcm9tICJAZmVhdHVyZXMvdGhlbWUiCmltcG9ydCB7IEFycm93TGVmdCB9IGZyb20gImx1Y2lkZS1yZWFjdCIKaW1wb3J0IHsgT3NTZWxlY3QgfSBmcm9tICJAZmVhdHVyZXMvZG9jcy91aS9Pc1NlbGVjdCIKCnR5cGUgTmF2aWdhdGlvblNlY3Rpb24gPSB7Cg==')
sub('apps/web/src/features/docs/components/DocsSidebar.tsx', 'ICAgICAgPC9kaXY+CgogICAgICB7LyogU29ydGllIGRlIGxhIGRvY3VtZW50YXRpb24sIHRvdWpvdXJzIHZpc2libGUgKGJhcnJlIHJlcGxpw6llIGNvbXByaXNlKS4gKi99CiAgICAgIDxMaW5rCg==',
    'ICAgICAgPC9kaXY+CgogICAgICB7LyogU3lzdMOobWUgZGVzIGNvbW1hbmRlcyBtb250csOpZXMgcGFyIGxhIGRvYyAobWFjT1MsIExpbnV4LCBXaW5kb3dzIFdTTCAyKSwgw6AgY8O0dMOpIGR1IHRow6htZS4gKi99CiAgICAgIHtvcGVuID8gKAogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJzaHJpbmstMCBib3JkZXItYiBweC01IHB5LTIiPgogICAgICAgICAgPE9zU2VsZWN0IC8+CiAgICAgICAgPC9kaXY+CiAgICAgICkgOiBudWxsfQoKICAgICAgey8qIFNvcnRpZSBkZSBsYSBkb2N1bWVudGF0aW9uLCB0b3Vqb3VycyB2aXNpYmxlIChiYXJyZSByZXBsacOpZSBjb21wcmlzZSkuICovfQogICAgICA8TGluawo=')
sub('apps/web/src/features/docs/ui/OsTabs.tsx', 'ZXhwb3J0IHR5cGUgT3NOYW1lID0gIm1hYyIgfCAibGludXgiIHwgIndpbmRvd3MiCgpjb25zdCBPU19MQUJFTDogUmVjb3JkPE9zTmFtZSwgc3RyaW5nPiA9IHsKICBtYWM6ICJtYWNPUyIsCiAgbGludXg6ICJMaW51eCIsCg==',
    'ZXhwb3J0IHR5cGUgT3NOYW1lID0gIm1hYyIgfCAibGludXgiIHwgIndpbmRvd3MiCgpleHBvcnQgY29uc3QgT1NfTEFCRUw6IFJlY29yZDxPc05hbWUsIHN0cmluZz4gPSB7CiAgbWFjOiAibWFjT1MiLAogIGxpbnV4OiAiTGludXgiLAo=')
sub('apps/web/src/features/docs/ui/OsTabs.tsx', 'fQoKZnVuY3Rpb24gY2hvb3NlT3Mob3M6IE9zTmFtZSk6IHZvaWQgewogIHRyeSB7CiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oU1RPUkFHRV9LRVksIG9zKQo=',
    'fQoKZXhwb3J0IGZ1bmN0aW9uIGNob29zZU9zKG9zOiBPc05hbWUpOiB2b2lkIHsKICB0cnkgewogICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFNUT1JBR0VfS0VZLCBvcykK')
sub('apps/web/src/features/docs/ui/OsTabs.tsx', 'ICB9CiAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKQp9Cgo=',
    'ICB9CiAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKQp9CgovKioKICogTGUgc3lzdMOobWUgY2hvaXNpIHBhciBsZSBsZWN0ZXVyIChudWxsIGPDtHTDqSBzZXJ2ZXVyIGV0IHBlbmRhbnQgbCdoeWRyYXRhdGlvbikuIFBhcnRhZ8OpIHBhciBsZXMKICogb25nbGV0cyBkZXMgcGFnZXMgZXQgcGFyIGxlIHPDqWxlY3RldXIgZGUgbGEgYmFycmUgbGF0w6lyYWxlIChPc1NlbGVjdCkuCiAqLwpleHBvcnQgZnVuY3Rpb24gdXNlQ2hvc2VuT3MoKTogT3NOYW1lIHwgbnVsbCB7CiAgcmV0dXJuIHVzZVN5bmNFeHRlcm5hbFN0b3JlKHN1YnNjcmliZSwgcmVhZE9zLCAoKSA9PiBudWxsKQp9Cgo=')
sub('apps/web/src/features/docs/ui/OsTabs.tsx', 'ICAgICAgaXNWYWxpZEVsZW1lbnQoY2hpbGQpICYmIHR5cGVvZiAoY2hpbGQucHJvcHMgYXMgeyBuYW1lPzogdW5rbm93biB9KS5uYW1lID09PSAic3RyaW5nIiwKICApCiAgY29uc3QgY2hvc2VuID0gdXNlU3luY0V4dGVybmFsU3RvcmUoc3Vic2NyaWJlLCByZWFkT3MsICgpID0+IG51bGwpCiAgY29uc3QgYXZhaWxhYmxlID0gcGFuZXMubWFwKChwKSA9PiBwLnByb3BzLm5hbWUpCiAgLy8gTGUgc3lzdMOobWUgY2hvaXNpLCBzJ2lsIGEgdW4gb25nbGV0IGljaSA7IHNpbm9uIExpbnV4IChXaW5kb3dzIHBhc3NlIHBhciBXU0wpLCBzaW5vbiBsZSBwcmVtaWVyLgo=',
    'ICAgICAgaXNWYWxpZEVsZW1lbnQoY2hpbGQpICYmIHR5cGVvZiAoY2hpbGQucHJvcHMgYXMgeyBuYW1lPzogdW5rbm93biB9KS5uYW1lID09PSAic3RyaW5nIiwKICApCiAgY29uc3QgY2hvc2VuID0gdXNlQ2hvc2VuT3MoKQogIGNvbnN0IGF2YWlsYWJsZSA9IHBhbmVzLm1hcCgocCkgPT4gcC5wcm9wcy5uYW1lKQogIC8vIExlIHN5c3TDqG1lIGNob2lzaSwgcydpbCBhIHVuIG9uZ2xldCBpY2kgOyBzaW5vbiBMaW51eCAoV2luZG93cyBwYXNzZSBwYXIgV1NMKSwgc2lub24gbGUgcHJlbWllci4K')
sub('apps/web/src/features/docs/ui/OsTabs.tsx', 'ICAgICAgICB7cGFuZXMuZmluZCgocCkgPT4gcC5wcm9wcy5uYW1lID09PSBhY3RpdmUpPy5wcm9wcy5jaGlsZHJlbn0KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICApCg==',
    'ICAgICAgICB7cGFuZXMuZmluZCgocCkgPT4gcC5wcm9wcy5uYW1lID09PSBhY3RpdmUpPy5wcm9wcy5jaGlsZHJlbn0KICAgICAgPC9kaXY+CiAgICAgIDxwIGNsYXNzTmFtZT0iYm9yZGVyLXQgcHgtNCBweS0xLjUgdGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQiPgogICAgICAgIENob2l4IHJldGVudSBwb3VyIHRvdXRlIGxhIGRvY3VtZW50YXRpb24gOyBpbCBzZSBjaGFuZ2UgYXVzc2kgZGFucyBsYSBiYXJyZSBsYXTDqXJhbGUuCiAgICAgIDwvcD4KICAgIDwvZGl2PgogICkK')
print("  édits ok (7 substitutions, 1 fichiers créés, 0 remplacés)")
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
docs: sélecteur « Système » dans la barre latérale, mention sous les onglets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG