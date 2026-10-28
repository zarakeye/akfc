#!/usr/bin/env bash
# Tableau de bord en mode sombre : élément actif de la barre latérale blanc comme en clair (et son
# bouton « + » lisible) ; icônes e-mail et téléphone de « Mes informations » visibles.
# Usage (racine du repo) : bash apply-dashboard-sombre.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/app-shell/ControlPanelSidebar.tsx" 2>/dev/null | grep -qF "bg-[#ffffff] text-[#111827]"; then echo "Déjà appliqué (commité)."; exit 0; fi
MODIFIED=("apps/web/src/features/admin/users/components/UserCard.tsx" "apps/web/src/features/app-shell/ControlPanelSidebar.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "bg-[#ffffff] text-[#111827]" "apps/web/src/features/app-shell/ControlPanelSidebar.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/features/admin/users/components/UserCard.tsx', 'CiAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IHRleHQtZ3JheS02MDAgbWItMSI+CiAgICAgICAgPEltYWdlIHNyYz0iL2VtYWlsLnN2ZyIgYWx0PSJlbWFpbCIgd2lkdGg9ezIwfSBoZWlnaHQ9ezIwfSAvPjp7IiAifQogICAgICAgIHt1c2VyPy5lbWFpbH0KICAgICAgPC9kaXY+CiAgICAgIHt1c2VyPy5waG9uZSAmJiAoCiAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggdGV4dC1ncmF5LTYwMCBtYi0xIj4KICAgICAgICAgIDxJbWFnZSBzcmM9Ii9tb2JpbGVQaG9uZS5zdmciIGFsdD0icGhvbmUiIHdpZHRoPXsyMH0gaGVpZ2h0PXsyMH0gLz4gOnsiICJ9CiAgICAgICAgICA8c3Bhbj57dXNlci5waG9uZX08L3NwYW4+CiAgICAgICAgPC9kaXY+Cg==',
    'CiAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IHRleHQtZ3JheS02MDAgbWItMSI+CiAgICAgICAgPEltYWdlIHNyYz0iL2VtYWlsLnN2ZyIgYWx0PSJlbWFpbCIgd2lkdGg9ezIwfSBoZWlnaHQ9ezIwfSBjbGFzc05hbWU9ImRhcms6aW52ZXJ0IiAvPjp7IiAifQogICAgICAgIHt1c2VyPy5lbWFpbH0KICAgICAgPC9kaXY+CiAgICAgIHt1c2VyPy5waG9uZSAmJiAoCiAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggdGV4dC1ncmF5LTYwMCBtYi0xIj4KICAgICAgICAgIDxJbWFnZSBzcmM9Ii9tb2JpbGVQaG9uZS5zdmciIGFsdD0icGhvbmUiIHdpZHRoPXsyMH0gaGVpZ2h0PXsyMH0gY2xhc3NOYW1lPSJkYXJrOmludmVydCIgLz4gOnsiICJ9CiAgICAgICAgICA8c3Bhbj57dXNlci5waG9uZX08L3NwYW4+CiAgICAgICAgPC9kaXY+Cg==')
sub('apps/web/src/features/app-shell/ControlPanelSidebar.tsx', 'ICAgICAgICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggaXRlbXMtc3RyZXRjaCByb3VuZGVkLXItZnVsbCByb3VuZGVkLWwtZnVsbCAkewogICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlID8gImJnLXdoaXRlIHRleHQtZ3JheS05MDAiIDogIiIKICAgICAgICAgICAgICAgICAgICAgICAgICB9YH0KICAgICAgICAgICAgICAgICAgICAgICAgPgo=',
    'ICAgICAgICAgICAgICAgICAgICAgICAgPGRpdgogICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggaXRlbXMtc3RyZXRjaCByb3VuZGVkLXItZnVsbCByb3VuZGVkLWwtZnVsbCAkewogICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ291bGV1cnMgZW4gdmFsZXVycyBmaXhlcyAocGFzIGJnLXdoaXRlIC8gdGV4dC1ncmF5LTkwMCkgOiBsYSBiYXJyZSByZXN0ZQogICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc29tYnJlIGRhbnMgbGVzIGRldXggdGjDqG1lcywgbCfDqWzDqW1lbnQgYWN0aWYgZG9pdCBkb25jIHJlc3RlciBibGFuYyBzdXIKICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRleHRlIGZvbmPDqSwgc2FucyDDqnRyZSByw6lvcmllbnTDqSBwYXIgc3R5bGVzL2RhcmstbGVnYWN5LmNzcy4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZSA/ICJiZy1bI2ZmZmZmZl0gdGV4dC1bIzExMTgyN10iIDogIiIKICAgICAgICAgICAgICAgICAgICAgICAgICB9YH0KICAgICAgICAgICAgICAgICAgICAgICAgPgo=')
print("  édits ok (2 substitutions, 0 fichiers créés, 0 remplacés)")
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
style(dashboard): mode sombre — élément actif blanc, icônes e-mail / téléphone visibles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG