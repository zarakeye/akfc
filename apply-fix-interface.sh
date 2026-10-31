#!/usr/bin/env bash
# Interface : plan du site à jour sans redémarrage, images publiques permises aux robots, page courante
# annoncée aux lecteurs d'écran. Prérequis : apply-fix-legal.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-interface.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/app/sitemap.ts" 2>/dev/null | grep -qF "function publishedWhere(now: Date)"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "assertPasswordOfConnectedUser" "packages/backend/src/modules/auth/router.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-legal.sh"; exit 1; }
MODIFIED=("apps/web/src/app/robots.ts" "apps/web/src/app/sitemap.ts" "apps/web/src/features/app-shell/Header.tsx")
EXPECT=("855824b7b0af:apps/web/src/app/robots.ts" "26e89b38de06:apps/web/src/app/sitemap.ts" "aa938956fca6:apps/web/src/features/app-shell/Header.tsx")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "function publishedWhere(now: Date)" "apps/web/src/app/sitemap.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/app/robots.ts', 'ICogQXV0b3Jpc2UgbCdpbmRleGF0aW9uIGR1IHNpdGUgdml0cmluZSwgZXhjbHV0IGxlcyBlc3BhY2VzIFBSSVbDiVMgb3UKICogZm9uY3Rpb25uZWxzICh0YWJsZWF1IGRlIGJvcmQsIHByb2ZpbCwgZG9jdW1lbnRzIG1lbWJyZXMsIGVzcGFjZXMKICogY29sbGFib3JhdGlmcywgQVBJKSwgZXQgZMOpY2xhcmUgbGUgc2l0ZW1hcC4gVW5lIHBhZ2Ugw6lkaXRvcmlhbGUgbm9uIHB1Ymxpw6llCiAqIChwbGFjZWhvbGRlciDCqyBlbiBjb25zdHJ1Y3Rpb24gwrssIHNlcnZpIMOgIGxhIG3Dqm1lIGFkcmVzc2UpIG4nZXN0IHBhcyBleGNsdWUKICogaWNpIDogZWxsZSBwb3J0ZSBlbGxlLW3Dqm1lIHVuIGBub2luZGV4YCAoZWRpdG9yaWFsUm9ib3RzKS4K',
    'ICogQXV0b3Jpc2UgbCdpbmRleGF0aW9uIGR1IHNpdGUgdml0cmluZSwgZXhjbHV0IGxlcyBlc3BhY2VzIFBSSVbDiVMgb3UKICogZm9uY3Rpb25uZWxzICh0YWJsZWF1IGRlIGJvcmQsIHByb2ZpbCwgZG9jdW1lbnRzIG1lbWJyZXMsIGVzcGFjZXMKICogY29sbGFib3JhdGlmcywgZMOpcMO0dCwgQVBJKSwgZXQgZMOpY2xhcmUgbGUgc2l0ZW1hcC4gTGVzIGZpY2hpZXJzIFBVQkxJQ1MgZGVzIHBhZ2VzIChpbWFnZXMsIGxvZ28sCiAqIGF2YXRhcnMpIHJlc3RlbnQgcGVybWlzIDogdW4gbW90ZXVyIHF1aSBhZmZpY2hlIHVuZSBwYWdlIGEgYmVzb2luIGRlIHNlcyBpbWFnZXMsIGV0IHVuIGZpY2hpZXIKICogcHVibGljIG4nYSByaWVuIMOgIGNhY2hlci4gVW5lIHBhZ2Ugw6lkaXRvcmlhbGUgbm9uIHB1Ymxpw6llCiAqIChwbGFjZWhvbGRlciDCqyBlbiBjb25zdHJ1Y3Rpb24gwrssIHNlcnZpIMOgIGxhIG3Dqm1lIGFkcmVzc2UpIG4nZXN0IHBhcyBleGNsdWUKICogaWNpIDogZWxsZSBwb3J0ZSBlbGxlLW3Dqm1lIHVuIGBub2luZGV4YCAoZWRpdG9yaWFsUm9ib3RzKS4K')
sub('apps/web/src/app/robots.ts', 'ICAgIHJ1bGVzOiB7CiAgICAgIHVzZXJBZ2VudDogIioiLAogICAgICBhbGxvdzogIi8iLAogICAgICBkaXNhbGxvdzogWwogICAgICAgICIvZGFzaGJvYXJkIiwK',
    'ICAgIHJ1bGVzOiB7CiAgICAgIHVzZXJBZ2VudDogIioiLAogICAgICAvLyBMYSByw6hnbGUgbGEgcGx1cyBwcsOpY2lzZSBsJ2VtcG9ydGUgOiBgL2FwaS9tZWRpYS9wdWJsaWMvYCBwYXNzZSBtYWxncsOpIGAvYXBpL2AuCiAgICAgIGFsbG93OiBbIi8iLCAiL2FwaS9tZWRpYS9wdWJsaWMvIiwgIi9hcGkvbWVkaWEvc2l0ZS1sb2dvIl0sCiAgICAgIGRpc2FsbG93OiBbCiAgICAgICAgIi9kYXNoYm9hcmQiLAo=')
sub('apps/web/src/app/robots.ts', 'ICAgICAgICAiL2RvY3VtZW50cyIsCiAgICAgICAgIi9tZXMtZXNwYWNlcyIsCiAgICAgICAgIi9hcGkvIiwKICAgICAgXSwK',
    'ICAgICAgICAiL2RvY3VtZW50cyIsCiAgICAgICAgIi9tZXMtZXNwYWNlcyIsCiAgICAgICAgIi9kZXBvc2VyIiwKICAgICAgICAiL2FwaS8iLAogICAgICBdLAo=')
sub('apps/web/src/app/sitemap.ts', 'CmltcG9ydCB7IFNJVEVfVVJMIH0gZnJvbSAiQC9jb25maWcvc2l0ZVVybCI7CgovKioK',
    'CmltcG9ydCB7IFNJVEVfVVJMIH0gZnJvbSAiQC9jb25maWcvc2l0ZVVybCI7CmltcG9ydCB7IFBBR0VfUkVHSVNUUlkgfSBmcm9tICJAL2NvbmZpZy9wYWdlUmVnaXN0cnkiOwoKLyoqCg==')
sub('apps/web/src/app/sitemap.ts', 'ZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSAiZm9yY2UtZHluYW1pYyI7Cgp0eXBlIEVkaXRvcmlhbCA9IHsga2V5OiBzdHJpbmc7IHBhdGg6IHN0cmluZyB9OwoKY29uc3QgRURJVE9SSUFMOiByZWFkb25seSBFZGl0b3JpYWxbXSA9IFsKICB7IGtleTogImhvbWUiLCBwYXRoOiAiLyIgfSwKICB7IGtleTogImFzc29jaWF0aW9uIiwgcGF0aDogIi9hYm91dCIgfSwKICB7IGtleTogImNvbnRhY3RzIiwgcGF0aDogIi9jb250YWN0cyIgfSwKICB7IGtleTogImluc2NyaXB0aW9uIiwgcGF0aDogIi9pbnNjcmlwdGlvbiIgfSwKXSBhcyBjb25zdDsKCmNvbnN0IGFicyA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4KICBwYXRoID09PSAiLyIgPyBgJHtTSVRFX1VSTH0vYCA6IGAke1NJVEVfVVJMfSR7cGF0aH1gOwoKLyoqIFPDqWxlY3Rpb24gY29tbXVuZSA6IHB1Ymxpw6kgPSBzbHVnICsgcHVibGljYXRpb25EYXRlIChwYXNzw6llKS4gKi8KY29uc3QgcHVibGlzaGVkV2hlcmUgPSB7CiAgc2x1ZzogeyBub3Q6IG51bGwgfSwKICBwdWJsaWNhdGlvbkRhdGU6IHsgbm90OiBudWxsLCBsdGU6IG5ldyBEYXRlKCkgfSwKfSBhcyBjb25zdDsKCmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHNpdGVtYXAoKTogUHJvbWlzZTxNZXRhZGF0YVJvdXRlLlNpdGVtYXA+IHsK',
    'ZXhwb3J0IGNvbnN0IGR5bmFtaWMgPSAiZm9yY2UtZHluYW1pYyI7CgovKiogTGVzIHBhZ2VzIMOpZGl0b3JpYWxlcyA6IGxlIHJlZ2lzdHJlIHBhcnRhZ8OpIGF2ZWMgbGUgY2VudHJlIGRlIGNvbnRyw7RsZSBldCBsYSByb3V0ZSBkZXMgZmljaGllcnMuICovCmNvbnN0IEVESVRPUklBTCA9IFBBR0VfUkVHSVNUUlk7Cgpjb25zdCBhYnMgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+CiAgcGF0aCA9PT0gIi8iID8gYCR7U0lURV9VUkx9L2AgOiBgJHtTSVRFX1VSTH0ke3BhdGh9YDsKCi8qKgogKiBTw6lsZWN0aW9uIGNvbW11bmUgOiBwdWJsacOpID0gc2x1ZyArIHB1YmxpY2F0aW9uRGF0ZSAocGFzc8OpZSkuCiAqCiAqIENhbGN1bMOpZSDDoCBDSEFRVUUgcmVxdcOqdGUgOiB1bmUgY29uc3RhbnRlIGRlIG1vZHVsZSBmaWdlcmFpdCDCqyBtYWludGVuYW50IMK7IGF1IGTDqW1hcnJhZ2UgZHUKICogc2VydmV1ciwgZXQgdW4gY29udGVudSBwcm9ncmFtbcOpIG4nZW50cmVyYWl0IGphbWFpcyBkYW5zIGxlIHBsYW4gZHUgc2l0ZSBhdmFudCBsZSByZWTDqW1hcnJhZ2UuCiAqLwpmdW5jdGlvbiBwdWJsaXNoZWRXaGVyZShub3c6IERhdGUpIHsKICByZXR1cm4gewogICAgc2x1ZzogeyBub3Q6IG51bGwgfSwKICAgIHB1YmxpY2F0aW9uRGF0ZTogeyBub3Q6IG51bGwsIGx0ZTogbm93IH0sCiAgfSBhcyBjb25zdDsKfQoKZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gc2l0ZW1hcCgpOiBQcm9taXNlPE1ldGFkYXRhUm91dGUuU2l0ZW1hcD4gewo=')
sub('apps/web/src/app/sitemap.ts', 'ICBjb25zdCBbc2VtaW5hcnMsIGRpc2NpcGxpbmVzLCBldmVudHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoWwogICAgcHJpc21hLnNlbWluYXIuZmluZE1hbnkoewogICAgICB3aGVyZTogcHVibGlzaGVkV2hlcmUsCiAgICAgIHNlbGVjdDogeyBzbHVnOiB0cnVlLCBwdWJsaWNhdGlvbkRhdGU6IHRydWUgfSwKICAgIH0pLAogICAgcHJpc21hLmRpc2NpcGxpbmUuZmluZE1hbnkoewogICAgICB3aGVyZTogcHVibGlzaGVkV2hlcmUsCiAgICAgIHNlbGVjdDogeyBzbHVnOiB0cnVlLCBwdWJsaWNhdGlvbkRhdGU6IHRydWUgfSwKICAgIH0pLAogICAgcHJpc21hLmV2ZW50LmZpbmRNYW55KHsKICAgICAgd2hlcmU6IHB1Ymxpc2hlZFdoZXJlLAogICAgICBzZWxlY3Q6IHsgc2x1ZzogdHJ1ZSwgcHVibGljYXRpb25EYXRlOiB0cnVlIH0sCiAgICB9KSwK',
    'ICBjb25zdCBbc2VtaW5hcnMsIGRpc2NpcGxpbmVzLCBldmVudHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoWwogICAgcHJpc21hLnNlbWluYXIuZmluZE1hbnkoewogICAgICB3aGVyZTogcHVibGlzaGVkV2hlcmUobm93KSwKICAgICAgc2VsZWN0OiB7IHNsdWc6IHRydWUsIHB1YmxpY2F0aW9uRGF0ZTogdHJ1ZSB9LAogICAgfSksCiAgICBwcmlzbWEuZGlzY2lwbGluZS5maW5kTWFueSh7CiAgICAgIHdoZXJlOiBwdWJsaXNoZWRXaGVyZShub3cpLAogICAgICBzZWxlY3Q6IHsgc2x1ZzogdHJ1ZSwgcHVibGljYXRpb25EYXRlOiB0cnVlIH0sCiAgICB9KSwKICAgIHByaXNtYS5ldmVudC5maW5kTWFueSh7CiAgICAgIHdoZXJlOiBwdWJsaXNoZWRXaGVyZShub3cpLAogICAgICBzZWxlY3Q6IHsgc2x1ZzogdHJ1ZSwgcHVibGljYXRpb25EYXRlOiB0cnVlIH0sCiAgICB9KSwK')
sub('apps/web/src/features/app-shell/Header.tsx', 'ICAgICAgICAgICAgY29uc3QgbGlua0NsYXNzID0gYCR7TkFWX0dMT1d9IHdoaXRlc3BhY2Utbm93cmFwIHRleHQtbGcgZm9udC1ib2xkIDJ4bDp0ZXh0LVsyMHB4XSAke2lzQWN0aXZlKGVudHJ5KSA/IE5BVl9BQ1RJVkUgOiAiIn1gOwogICAgICAgICAgICByZXR1cm4gKAogICAgICAgICAgICAgIDxMaW5rIGtleT17ZW50cnkuaHJlZn0gaHJlZj17ZW50cnkuaHJlZn0gY2xhc3NOYW1lPXtsaW5rQ2xhc3N9PgogICAgICAgICAgICAgICAge2VudHJ5LmxhYmVsfQogICAgICAgICAgICAgIDwvTGluaz4K',
    'ICAgICAgICAgICAgY29uc3QgbGlua0NsYXNzID0gYCR7TkFWX0dMT1d9IHdoaXRlc3BhY2Utbm93cmFwIHRleHQtbGcgZm9udC1ib2xkIDJ4bDp0ZXh0LVsyMHB4XSAke2lzQWN0aXZlKGVudHJ5KSA/IE5BVl9BQ1RJVkUgOiAiIn1gOwogICAgICAgICAgICByZXR1cm4gKAogICAgICAgICAgICAgIC8vIGFyaWEtY3VycmVudCA6IGwnw6l0YXQgYWN0aWYgc2UgVk9JVCAoZ3Jhcywgc291bGlnbsOpKSA7IGlsIGRvaXQgYXVzc2kgcydFTlRFTkRSRS4KICAgICAgICAgICAgICA8TGluayBrZXk9e2VudHJ5LmhyZWZ9IGhyZWY9e2VudHJ5LmhyZWZ9IGNsYXNzTmFtZT17bGlua0NsYXNzfSBhcmlhLWN1cnJlbnQ9e2lzQWN0aXZlKGVudHJ5KSA/ICJwYWdlIiA6IHVuZGVmaW5lZH0+CiAgICAgICAgICAgICAgICB7ZW50cnkubGFiZWx9CiAgICAgICAgICAgICAgPC9MaW5rPgo=')
sub('apps/web/src/features/app-shell/Header.tsx', 'ICAgICAgICAgICAgICAgICAgY29uc3QgbGlua0NsYXNzID0gYGJsb2NrIHB5LTMgdGV4dC1sZyB0ZXh0LXdoaXRlICR7aXNBY3RpdmUoZW50cnkpID8gTkFWX0FDVElWRSA6ICIifWA7CiAgICAgICAgICAgICAgICAgIHJldHVybiAoCiAgICAgICAgICAgICAgICAgICAgPExpbmsga2V5PXtlbnRyeS5ocmVmfSBocmVmPXtlbnRyeS5ocmVmfSBjbGFzc05hbWU9e2xpbmtDbGFzc30+CiAgICAgICAgICAgICAgICAgICAgICB7ZW50cnkubGFiZWx9CiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPgo=',
    'ICAgICAgICAgICAgICAgICAgY29uc3QgbGlua0NsYXNzID0gYGJsb2NrIHB5LTMgdGV4dC1sZyB0ZXh0LXdoaXRlICR7aXNBY3RpdmUoZW50cnkpID8gTkFWX0FDVElWRSA6ICIifWA7CiAgICAgICAgICAgICAgICAgIHJldHVybiAoCiAgICAgICAgICAgICAgICAgICAgPExpbmsga2V5PXtlbnRyeS5ocmVmfSBocmVmPXtlbnRyeS5ocmVmfSBjbGFzc05hbWU9e2xpbmtDbGFzc30gYXJpYS1jdXJyZW50PXtpc0FjdGl2ZShlbnRyeSkgPyAicGFnZSIgOiB1bmRlZmluZWR9PgogICAgICAgICAgICAgICAgICAgICAge2VudHJ5LmxhYmVsfQogICAgICAgICAgICAgICAgICAgIDwvTGluaz4K')
print("  édits ok (8 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
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
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
fix(interface): plan du site à jour sans redémarrage, images publiques permises aux robots, page courante annoncée

- sitemap : la règle « publié » était une constante de module (new Date() évalué au démarrage) ; un
  contenu programmé n'entrait dans le plan du site qu'au redémarrage suivant. publishedWhere(now)
  est calculé à chaque demande ; pages éditoriales lues dans PAGE_REGISTRY
- robots.txt : interdire /api/ interdisait aussi les images publiques des pages ; /api/media/public/
  et le logo sont permis (la règle la plus précise l'emporte) ; /deposer exclu
- Header : aria-current="page" sur les liens de premier niveau (barre et panneau), comme les
  sous-menus

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration. Serveur : git pull, puis reconstruire et relancer akfc."