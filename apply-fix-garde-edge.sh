#!/usr/bin/env bash
# Garde du poste de dev : plus d'avertissement Edge sur process.exit (instrumentation.ts).
# Prérequis : apply-docs-categories.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-garde-edge.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/lib/devTargetGuard.ts" 2>/dev/null | grep -qF "export async function assertDevTargets"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "### Une clé pour ce que le code reconnaît" "apps/web/content/docs/dev/domaine/un-modele-qui-s-ouvre.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-categories.sh"; exit 1; }
MODIFIED=("apps/web/src/instrumentation.ts")
EXPECT=("2d34fa4d127d:apps/web/src/instrumentation.ts")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=("apps/web/src/lib/devTargetGuard.ts")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "export async function assertDevTargets" "apps/web/src/lib/devTargetGuard.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR

mkdir -p "apps/web/src/lib"
base64 -d > "apps/web/src/lib/devTargetGuard.ts" <<'B64'
LyoqCiAqIExhIGdhcmRlIGR1IHBvc3RlIGRlIGTDqXZlbG9wcGVtZW50IDogYHBucG0gZGV2YCBu
ZSBkw6ltYXJyZSBwYXMgc3VyIGxhIGJhc2Ugb3UgbGUgc3RvY2thZ2UgZGUgbGEKICogcHJvZHVj
dGlvbi4gTGUgaG9vayBkZSBkw6ltYXJyYWdlIChpbnN0cnVtZW50YXRpb24udHMpIHkgw6ljcmly
YWl0IGF1c3NpdMO0dCDigJQgc2VnbWVudHMsIGRvc3NpZXJzLAogKiBncm91cGVzIOKAlCwgcHVp
cyBjaGFxdWUgYWN0aW9uIGR1IHNpdGUgbG9jYWwuCiAqCiAqIE1vZHVsZSDDoCBwYXJ0LCBwb3Vy
IGxlIHJ1bnRpbWUgTm9kZSBzZXVsIDogaW5zdHJ1bWVudGF0aW9uLnRzIGVzdCBjb21waWzDqSBB
VVNTSSBwb3VyIGwnRWRnZSwgZXQKICogVHVyYm9wYWNrIHkgc2lnbmFsZSB0b3V0IGBwcm9jZXNz
LmV4aXRgIMOpY3JpdCBkYW5zIGxlIGZpY2hpZXIsIG3Dqm1lIGRlcnJpw6hyZSB1biBgcmV0dXJu
YC4gSW1wb3J0w6kKICogc291cyBgcHJvY2Vzcy5lbnYuTkVYVF9SVU5USU1FID09PSAibm9kZWpz
ImAsIGNlIG1vZHVsZSBuJ2VudHJlIHBhcyBkYW5zIGxhIGNvbXBpbGF0aW9uIEVkZ2UuCiAqLwpl
eHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzZXJ0RGV2VGFyZ2V0cygpOiBQcm9taXNlPHZvaWQ+IHsK
ICBjb25zdCB7IGFzc2VydExvY2FsVGFyZ2V0IH0gPSBhd2FpdCBpbXBvcnQoIi4uLy4uLy4uLy4u
L3ByaXNtYS9kYi10YXJnZXQubWpzIik7CiAgdHJ5IHsKICAgIGFzc2VydExvY2FsVGFyZ2V0KHBy
b2Nlc3MuZW52LkRBVEFCQVNFX1VSTCwgIkxhIGJhc2UiKTsKICAgIGFzc2VydExvY2FsVGFyZ2V0
KHByb2Nlc3MuZW52LlIyX0VORFBPSU5ULCAiTGUgc3RvY2thZ2UiKTsKICB9IGNhdGNoIChlcnIp
IHsKICAgIGNvbnNvbGUuZXJyb3IoYFxu4p2MICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIu
bWVzc2FnZSA6IGVycn1cbmApOwogICAgcHJvY2Vzcy5leGl0KDEpOwogIH0KfQo=
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
sub('apps/web/src/instrumentation.ts', 'CmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWdpc3RlcigpIHsKICBpZiAocHJvY2Vzcy5lbnYuTkVYVF9SVU5USU1FICE9PSAibm9kZWpzIikgcmV0dXJuOwoKICAvLyBgcG5wbSBkZXZgIG5lIGTDqW1hcnJlIHBhcyBzdXIgbGEgYmFzZSBvdSBsZSBzdG9ja2FnZSBkZSBsYSBwcm9kdWN0aW9uIDogY2UgaG9vayB5IMOpY3JpcmFpdCBkw6hzCiAgLy8gbGUgZMOpbWFycmFnZSAoc2VnbWVudHMsIGRvc3NpZXJzLCBncm91cGVz4oCmKSwgcHVpcyBjaGFxdWUgYWN0aW9uIGR1IHNpdGUgbG9jYWwuCiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAiZGV2ZWxvcG1lbnQiKSB7CiAgICBjb25zdCB7IGFzc2VydExvY2FsVGFyZ2V0IH0gPSBhd2FpdCBpbXBvcnQoIi4uLy4uLy4uL3ByaXNtYS9kYi10YXJnZXQubWpzIik7CiAgICB0cnkgewogICAgICBhc3NlcnRMb2NhbFRhcmdldChwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwsICJMYSBiYXNlIik7CiAgICAgIGFzc2VydExvY2FsVGFyZ2V0KHByb2Nlc3MuZW52LlIyX0VORFBPSU5ULCAiTGUgc3RvY2thZ2UiKTsKICAgIH0gY2F0Y2ggKGVycikgewogICAgICBjb25zb2xlLmVycm9yKGBcbuKdjCAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBlcnJ9XG5gKTsKICAgICAgcHJvY2Vzcy5leGl0KDEpOwogICAgfQogIH0KCiAgY29uc3QgeyBwcmlzbWEgfSA9IGF3YWl0IGltcG9ydCgiQGJhY2tlbmQvcHJpc21hIik7Cg==',
    'CmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWdpc3RlcigpIHsKICAvLyBgcG5wbSBkZXZgIG5lIGTDqW1hcnJlIHBhcyBzdXIgbGEgYmFzZSBvdSBsZSBzdG9ja2FnZSBkZSBsYSBwcm9kdWN0aW9uIDogY2UgaG9vayB5IMOpY3JpcmFpdCBkw6hzCiAgLy8gbGUgZMOpbWFycmFnZSAoc2VnbWVudHMsIGRvc3NpZXJzLCBncm91cGVz4oCmKSwgcHVpcyBjaGFxdWUgYWN0aW9uIGR1IHNpdGUgbG9jYWwuIExhIGdhcmRlIHZpdCBkYW5zCiAgLy8gdW4gbW9kdWxlIMOgIHBhcnQsIGltcG9ydMOpIHNvdXMgdW5lIGNvbmRpdGlvbiBQT1NJVElWRSBzdXIgTkVYVF9SVU5USU1FIDogbGEgY29tcGlsYXRpb24gRWRnZSBkZQogIC8vIGNlIGZpY2hpZXIgbCfDqWxpbWluZSwgZXQgbmUgdm9pdCBwYXMgc29uIHByb2Nlc3MuZXhpdCAoZGV2VGFyZ2V0R3VhcmQudHMpLgogIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgPT09ICJub2RlanMiICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAiZGV2ZWxvcG1lbnQiKSB7CiAgICBjb25zdCB7IGFzc2VydERldlRhcmdldHMgfSA9IGF3YWl0IGltcG9ydCgiQC9saWIvZGV2VGFyZ2V0R3VhcmQiKTsKICAgIGF3YWl0IGFzc2VydERldlRhcmdldHMoKTsKICB9CgogIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgIT09ICJub2RlanMiKSByZXR1cm47CgogIGNvbnN0IHsgcHJpc21hIH0gPSBhd2FpdCBpbXBvcnQoIkBiYWNrZW5kL3ByaXNtYSIpOwo=')
print("  édits ok (1 substitutions, 1 fichiers créés, 0 remplacés)")
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
Garde du poste de dev : plus d'avertissement Edge sur process.exit

instrumentation.ts est compilé aussi pour l'Edge ; Turbopack y signalait le
process.exit de la garde (« A Node.js API is used… not supported in the
Edge Runtime »), même placé après le return sur NEXT_RUNTIME. La garde
passe dans lib/devTargetGuard.ts, importé sous une condition positive
(NEXT_RUNTIME === "nodejs") : la compilation Edge élimine la branche et le
module. Comportement inchangé : adresse distante → arrêt, avec le message.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration. Relancer pnpm dev : l'avertissement Edge a disparu. Serveur : rien d'urgent (la garde ne vaut qu'en dev)."