#!/usr/bin/env bash
# Doc : la partie « Le finder » dans la navigation.
# Prérequis : apply-docs-extraits-ancres.sh. Pas de migration.
# Usage (racine du repo) : bash apply-fix-doc-finder.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/docs/lib/docs.navigation.ts" 2>/dev/null | grep -qF "Le finder"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "## Les extraits de code, ancrés sur le texte" "apps/web/content/docs/dev/qualite/les-gardes-maison.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-extraits-ancres.sh puis apply-docs-extraits-ancres.sh"; exit 1; }
MODIFIED=("apps/web/src/features/docs/lib/docs.navigation.ts")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Le finder" "apps/web/src/features/docs/lib/docs.navigation.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/features/docs/lib/docs.navigation.ts', 'ICAiQXV0aGVudGlmaWNhdGlvbiBldCBkcm9pdHMiLAogICJTdG9ja2FnZSBldCBtw6lkaWFzIiwKICAiQ29udGVudSDDqWRpdG9yaWFsIiwKICAiRG9tYWluZSBkdSBjbHViIiwK',
    'ICAiQXV0aGVudGlmaWNhdGlvbiBldCBkcm9pdHMiLAogICJTdG9ja2FnZSBldCBtw6lkaWFzIiwKICAiTGUgZmluZGVyIiwKICAiQ29udGVudSDDqWRpdG9yaWFsIiwKICAiRG9tYWluZSBkdSBjbHViIiwK')
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
Doc : la partie « Le finder » dans la navigation

Rangée après « Stockage et médias » dans la barre latérale.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Pas de migration. Ensuite : apply-docs-finder.sh."