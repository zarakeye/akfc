#!/usr/bin/env bash
# Infrastructure : le migrateur ne vérifie plus les mises à jour de Prisma à chaque lancement.
# Prérequis : apply-docs-migrator.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-migrator-quiet.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"Dockerfile" 2>/dev/null | grep -qF "PRISMA_HIDE_UPDATE_MESSAGE=1"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "21 migrations found in prisma/migrations" "apps/web/content/docs/dev/infrastructure/mettre-en-production.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-migrator.sh"; exit 1; }
MODIFIED=("Dockerfile")
EXPECT=("b8c6021e7af0:Dockerfile")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "PRISMA_HIDE_UPDATE_MESSAGE=1" "Dockerfile" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('Dockerfile', 'IyBwcm9kdWN0aW9uIG5lIGTDqXBlbmQgcGx1cyBkdSByZWdpc3RyZSBucG0uClJVTiBjb3JlcGFjayBpbnN0YWxsCkNNRCBbInBucG0iLCAicHJpc21hIiwgIm1pZ3JhdGUiLCAiZGVwbG95Il0KCg==',
    'IyBwcm9kdWN0aW9uIG5lIGTDqXBlbmQgcGx1cyBkdSByZWdpc3RyZSBucG0uClJVTiBjb3JlcGFjayBpbnN0YWxsCiMgTmkgYXZpcyBkZSBtaXNlIMOgIGpvdXIsIG5pIHbDqXJpZmljYXRpb24gZW4gbGlnbmUgw6AgY2hhcXVlIG1pZ3JhdGlvbiA6IGxhIHZlcnNpb24gZGUgUHJpc21hIGVzdAojIGNlbGxlIGR1IGZpY2hpZXIgZGUgdmVycm91aWxsYWdlLCBlbGxlIGNoYW5nZSBwYXIgdW5lIG1vZGlmaWNhdGlvbiBkdSBkw6lww7R0LCBwYXMgYXUgZMOpcGxvaWVtZW50LgpFTlYgUFJJU01BX0hJREVfVVBEQVRFX01FU1NBR0U9MSBDSEVDS1BPSU5UX0RJU0FCTEU9MQpDTUQgWyJwbnBtIiwgInByaXNtYSIsICJtaWdyYXRlIiwgImRlcGxveSJdCgo=')
print("  édits ok (1 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm typecheck && pnpm lint"
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
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
fix(infra): le migrateur ne vérifie plus les mises à jour de Prisma à chaque lancement

PRISMA_HIDE_UPDATE_MESSAGE=1 et CHECKPOINT_DISABLE=1 dans l'étape migrator : plus d'avis de
mise à jour (une version de test majeure, à ne pas suivre) dans les journaux de déploiement, ni
d'appel réseau vers Prisma à chaque migration.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration. Serveur : git pull, puis docker compose up -d --build akfc."