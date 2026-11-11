#!/usr/bin/env bash
# Doc : l'en-tête des tableaux (react-ts-tab-lib) ne reste plus suspendu en haut de l'écran pendant le défilement.
# Prérequis : apply-docs-corbeille.sh. Pas de migration.
# Usage (racine du repo) : bash apply-fix-tableaux-doc.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/docs/ui/DocsTable.tsx" 2>/dev/null | grep -qF "thead_tr"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Jeter, retrouver, effacer" "apps/web/content/docs/dev/index.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-corbeille.sh puis apply-docs-corbeille.sh"; exit 1; }
MODIFIED=("apps/web/src/features/docs/ui/DocsTable.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "thead_tr" "apps/web/src/features/docs/ui/DocsTable.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/features/docs/ui/DocsTable.tsx', 'ICAvLyBDb3VsZXVycyBkdSB0aMOobWUgKGV0IG5vbiBgdGV4dC13aGl0ZWAsIGlsbGlzaWJsZSBzdXIgbGUgZm9uZCBjbGFpciBkZSBsYSBkb2MpIDsgY2VsbHVsZXMKICAvLyDDoCBsYSBsaWduZSAoYHdoaXRlc3BhY2Utbm9ybWFsYCkgcG91ciBsZXMgcGhyYXNlcyBsb25ndWVzLgogIHJldHVybiAoCiAgICA8ZGl2IGNsYXNzTmFtZT0ibXktNiB3LWZ1bGwgdGV4dC1sZWZ0Ij4KICAgICAge3RpdGxlID8gKAogICAgICAgIDxwIGNsYXNzTmFtZT0ibWItMyB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIj57dGl0bGV9PC9wPgo=',
    'ICAvLyBDb3VsZXVycyBkdSB0aMOobWUgKGV0IG5vbiBgdGV4dC13aGl0ZWAsIGlsbGlzaWJsZSBzdXIgbGUgZm9uZCBjbGFpciBkZSBsYSBkb2MpIDsgY2VsbHVsZXMKICAvLyDDoCBsYSBsaWduZSAoYHdoaXRlc3BhY2Utbm9ybWFsYCkgcG91ciBsZXMgcGhyYXNlcyBsb25ndWVzLgogIC8vCiAgLy8gRW4tdMOqdGUgTk9OIGNvbGxhbnQgOiBsYSBiaWJsaW90aMOocXVlIHBvc2UgYHN0aWNreSB0b3AtMGAgc3VyIGxhIGxpZ25lIGQnZW4tdMOqdGUsIHBlbnPDqSBwb3VyIHVuZQogIC8vIHRhYmxlIHF1aSBkw6lmaWxlIGRhbnMgc29uIHByb3ByZSBjYWRyZS4gRGFucyBsYSBkb2MsIGxhIHRhYmxlIG4nYSBwYXMgZGUgY2FkcmUgcXVpIGTDqWZpbGUgOiBjJ2VzdAogIC8vIGxhIHBhZ2UgZW50acOocmUgcXVpIGTDqWZpbGUsIGV0IGwnZW4tdMOqdGUgcmVzdGFpdCBzdXNwZW5kdSBlbiBoYXV0IGRlIGwnw6ljcmFuLCBwYXItZGVzc3VzIGxlCiAgLy8gdGV4dGUsIHRhbnQgcXVlIGxhIHRhYmxlIG4nw6l0YWl0IHBhcyBzb3J0aWUgZGUgbGEgdnVlLiBgWyZfdGhlYWRfdHJdOnN0YXRpY2AgbCdhbm51bGUgKHPDqWxlY3RldXIKICAvLyBwbHVzIHByw6ljaXMgcXVlIGxhIGNsYXNzZSBgc3RpY2t5YCBkZSBsYSBiaWJsaW90aMOocXVlKS4KICByZXR1cm4gKAogICAgPGRpdiBjbGFzc05hbWU9Im15LTYgdy1mdWxsIHRleHQtbGVmdCBbJl90aGVhZF90cl06c3RhdGljIj4KICAgICAge3RpdGxlID8gKAogICAgICAgIDxwIGNsYXNzTmFtZT0ibWItMyB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIj57dGl0bGV9PC9wPgo=')
print("  édits ok (1 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && node scripts/check-doc-snippets.mjs && pnpm typecheck && pnpm lint"
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
Doc : l'en-tête des tableaux ne reste plus suspendu pendant le défilement

La ligne d'en-tête de react-ts-tab-lib est collante (sticky top-0), pensée
pour une table qui défile dans son propre cadre. Dans la doc, c'est la page
qui défile : l'en-tête restait en haut de l'écran, par-dessus le texte,
tant que la table était visible. DocsTable l'annule ([&_thead_tr]:static).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Pas de migration. Ensuite : git push."