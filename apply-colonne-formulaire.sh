#!/usr/bin/env bash
# Liste des membres : colonne « Formulaire » (papier signé / en ligne / en ligne (parent) / attente du parent / aucun).
# Prérequis : apply-db-droit-image.sh (et pnpm db:migrate).
# Usage (racine du repo) : bash apply-colonne-formulaire.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"packages/contracts/src/legal/imageConsent.ts" 2>/dev/null | grep -qF "IMAGE_CONSENT_PROOF_LABEL"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "model ImageConsentRequest" "prisma/schema.prisma" 2>/dev/null || { echo "❌ lancer d'abord apply-db-droit-image.sh"; exit 1; }
MODIFIED=("packages/contracts/src/legal/imageConsent.ts" "packages/backend/src/modules/users/router.ts" "apps/web/src/features/admin/users/components/UsersTable.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "IMAGE_CONSENT_PROOF_LABEL" "packages/contracts/src/legal/imageConsent.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('packages/contracts/src/legal/imageConsent.ts', 'ICBHUkFOVEVEOiAiQWNjb3Jkw6llIiwKICBSRUZVU0VEOiAiUmVmdXPDqWUiLAp9OwoK',
    'ICBHUkFOVEVEOiAiQWNjb3Jkw6llIiwKICBSRUZVU0VEOiAiUmVmdXPDqWUiLAp9OwoKLyoqCiAqIFByZXV2ZSBkZSBsJ2F1dG9yaXNhdGlvbiwgcG91ciBsYSBsaXN0ZSBkZXMgbWVtYnJlcyA6IHZvaWUgZGUgbGEgdmVyc2lvbiBsYSBwbHVzIHLDqWNlbnRlLCBvdQogKiBkZW1hbmRlIGVuIGF0dGVudGUgZHUgcGFyZW50IChsaWVuIGVudm95w6ksIHBhcyBlbmNvcmUgY29uZmlybcOpKSwgb3Ugcmllbi4KICovCmV4cG9ydCBjb25zdCBJTUFHRV9DT05TRU5UX1BST09GX1ZBTFVFUyA9IFsiUEFQRVIiLCAiT05MSU5FX01FTUJFUiIsICJPTkxJTkVfR1VBUkRJQU4iLCAiUEVORElOR19HVUFSRElBTiIsICJOT05FIl0gYXMgY29uc3Q7CmV4cG9ydCB0eXBlIEltYWdlQ29uc2VudFByb29mVmFsdWUgPSAodHlwZW9mIElNQUdFX0NPTlNFTlRfUFJPT0ZfVkFMVUVTKVtudW1iZXJdOwoKZXhwb3J0IGNvbnN0IElNQUdFX0NPTlNFTlRfUFJPT0ZfTEFCRUw6IFJlY29yZDxJbWFnZUNvbnNlbnRQcm9vZlZhbHVlLCBzdHJpbmc+ID0gewogIFBBUEVSOiAiUGFwaWVyIHNpZ27DqSIsCiAgT05MSU5FX01FTUJFUjogIkVuIGxpZ25lIiwKICBPTkxJTkVfR1VBUkRJQU46ICJFbiBsaWduZSAocGFyZW50KSIsCiAgUEVORElOR19HVUFSRElBTjogIkF0dGVudGUgZHUgcGFyZW50IiwKICBOT05FOiAiQXVjdW4iLAp9OwoK')
sub('packages/backend/src/modules/users/router.ts', 'CmltcG9ydCB0eXBlIHsgVXNlclByb2ZpbGUgfSBmcm9tICJAY29udHJhY3RzL3VzZXJzL3VzZXItcHJvZmlsZS50eXBlcyI7CmltcG9ydCB7IHBhcnNlUGFnZUNvbnRlbnRWMSB9IGZyb20gIkBjb250cmFjdHMvcGFnZSI7CmltcG9ydCB7IHN5bmNQYWdlTWVkaWFSZWZlcmVuY2VzIH0gZnJvbSAiQGJhY2tlbmQvbW9kdWxlcy9tZWRpYS9zZXJ2aWNlcy9zeW5jUGFnZU1lZGlhUmVmZXJlbmNlcy5zZXJ2aWNlIjsK',
    'CmltcG9ydCB0eXBlIHsgVXNlclByb2ZpbGUgfSBmcm9tICJAY29udHJhY3RzL3VzZXJzL3VzZXItcHJvZmlsZS50eXBlcyI7CmltcG9ydCB0eXBlIHsgSW1hZ2VDb25zZW50UHJvb2ZWYWx1ZSB9IGZyb20gIkBjb250cmFjdHMvbGVnYWwvaW1hZ2VDb25zZW50IjsKaW1wb3J0IHsgcGFyc2VQYWdlQ29udGVudFYxIH0gZnJvbSAiQGNvbnRyYWN0cy9wYWdlIjsKaW1wb3J0IHsgc3luY1BhZ2VNZWRpYVJlZmVyZW5jZXMgfSBmcm9tICJAYmFja2VuZC9tb2R1bGVzL21lZGlhL3NlcnZpY2VzL3N5bmNQYWdlTWVkaWFSZWZlcmVuY2VzLnNlcnZpY2UiOwo=')
sub('packages/backend/src/modules/users/router.ts', 'ICAgICAgICAgICAgc2VsZWN0OiB7IGdyb3VwOiB7IHNlbGVjdDogeyBpZDogdHJ1ZSwgbmFtZTogdHJ1ZSwgaXNBZG1pbkdyb3VwOiB0cnVlIH0gfSB9LAogICAgICAgICAgfSwKICAgICAgICB9LAogICAgICB9KTsKICAgICAgcmV0dXJuIHVzZXJzLm1hcCgoeyBtZW1iZXJHcm91cE1lbWJlcnNoaXBzLCAuLi51IH0pID0+ICh7CiAgICAgICAgLi4udSwKICAgICAgICBpc0RlbW86IGlzRGVtb0VtYWlsKHUuZW1haWwpLAogICAgICAgIC8vIEdyb3VwZXMgZHUgbWVtYnJlIDogQWRtaW5pc3RyYXRldXJzIGQnYWJvcmQsIHB1aXMgb3JkcmUgYWxwaGFiw6l0aXF1ZS4KICAgICAgICBncm91cHM6IG1lbWJlckdyb3VwTWVtYmVyc2hpcHMK',
    'ICAgICAgICAgICAgc2VsZWN0OiB7IGdyb3VwOiB7IHNlbGVjdDogeyBpZDogdHJ1ZSwgbmFtZTogdHJ1ZSwgaXNBZG1pbkdyb3VwOiB0cnVlIH0gfSB9LAogICAgICAgICAgfSwKICAgICAgICAgIC8vIERyb2l0IMOgIGwnaW1hZ2UgOiB2b2llIGRlIGxhIHZlcnNpb24gbGEgcGx1cyByw6ljZW50ZSwgZXQgZGVtYW5kZSBlbiBhdHRlbnRlIGR1IHBhcmVudC4KICAgICAgICAgIGltYWdlQ29uc2VudEZvcm1zOiB7IG9yZGVyQnk6IHsgY3JlYXRlZEF0OiAiZGVzYyIgfSwgdGFrZTogMSwgc2VsZWN0OiB7IHNvdXJjZTogdHJ1ZSB9IH0sCiAgICAgICAgICBpbWFnZUNvbnNlbnRSZXF1ZXN0OiB7IHNlbGVjdDogeyBleHBpcmVzQXQ6IHRydWUgfSB9LAogICAgICAgIH0sCiAgICAgIH0pOwogICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpOwogICAgICByZXR1cm4gdXNlcnMubWFwKCh7IG1lbWJlckdyb3VwTWVtYmVyc2hpcHMsIGltYWdlQ29uc2VudEZvcm1zLCBpbWFnZUNvbnNlbnRSZXF1ZXN0LCAuLi51IH0pID0+ICh7CiAgICAgICAgLi4udSwKICAgICAgICBpc0RlbW86IGlzRGVtb0VtYWlsKHUuZW1haWwpLAogICAgICAgIGNvbnNlbnRQcm9vZjogKGltYWdlQ29uc2VudEZvcm1zWzBdPy5zb3VyY2UgPz8KICAgICAgICAgIChpbWFnZUNvbnNlbnRSZXF1ZXN0Py5leHBpcmVzQXQgJiYgaW1hZ2VDb25zZW50UmVxdWVzdC5leHBpcmVzQXQgPiBub3cKICAgICAgICAgICAgPyAiUEVORElOR19HVUFSRElBTiIKICAgICAgICAgICAgOiAiTk9ORSIpKSBzYXRpc2ZpZXMgSW1hZ2VDb25zZW50UHJvb2ZWYWx1ZSwKICAgICAgICAvLyBHcm91cGVzIGR1IG1lbWJyZSA6IEFkbWluaXN0cmF0ZXVycyBkJ2Fib3JkLCBwdWlzIG9yZHJlIGFscGhhYsOpdGlxdWUuCiAgICAgICAgZ3JvdXBzOiBtZW1iZXJHcm91cE1lbWJlcnNoaXBzCg==')
sub('apps/web/src/features/admin/users/components/UsersTable.tsx', 'aW1wb3J0IHsgdHJwYyB9IGZyb20gIkB0cnBjL3RycGNDbGllbnQiOwppbXBvcnQgeyBEZW1vQWNjb3VudHNUb2dnbGUsIERlbW9CYWRnZSB9IGZyb20gIkBmZWF0dXJlcy9hZG1pbi9jb21tb24vRGVtb0FjY291bnRzIjsKaW1wb3J0IHsgSU1BR0VfQ09OU0VOVF9MQUJFTCB9IGZyb20gIkBjb250cmFjdHMvbGVnYWwvaW1hZ2VDb25zZW50IjsKaW1wb3J0IHsgdXNlU2Vzc2lvblN0b3JlIH0gZnJvbSAiQGxpYi9zdG9yZXMvdXNlU2Vzc2lvblN0b3JlIjsKaW1wb3J0IHsgZGVsZXRlQ29sdW1uIH0gZnJvbSAiQGZlYXR1cmVzL2FkbWluL2NvbW1vbi9kZWxldGUiOwoKdHlwZSBVc2VyUm93ID0geyBpZDogc3RyaW5nOyBlbWFpbDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IGdyb3Vwczogc3RyaW5nOyBwaG90b3M6IHN0cmluZzsga2luZDogc3RyaW5nOyBzdXBwcmltZXI6IHN0cmluZyB9OwoKLyoqIFPDqXBhcmF0ZXVyIGRlcyBub21zIGRlIGdyb3VwZXMgZGFucyBsYSBjZWxsdWxlICh0ZXh0ZSA6IGxhIHJlY2hlcmNoZSBldCBsZSB0cmkgbCd1dGlsaXNlbnQpLiAqLwo=',
    'aW1wb3J0IHsgdHJwYyB9IGZyb20gIkB0cnBjL3RycGNDbGllbnQiOwppbXBvcnQgeyBEZW1vQWNjb3VudHNUb2dnbGUsIERlbW9CYWRnZSB9IGZyb20gIkBmZWF0dXJlcy9hZG1pbi9jb21tb24vRGVtb0FjY291bnRzIjsKaW1wb3J0IHsgSU1BR0VfQ09OU0VOVF9MQUJFTCwgSU1BR0VfQ09OU0VOVF9QUk9PRl9MQUJFTCB9IGZyb20gIkBjb250cmFjdHMvbGVnYWwvaW1hZ2VDb25zZW50IjsKaW1wb3J0IHsgdXNlU2Vzc2lvblN0b3JlIH0gZnJvbSAiQGxpYi9zdG9yZXMvdXNlU2Vzc2lvblN0b3JlIjsKaW1wb3J0IHsgZGVsZXRlQ29sdW1uIH0gZnJvbSAiQGZlYXR1cmVzL2FkbWluL2NvbW1vbi9kZWxldGUiOwoKdHlwZSBVc2VyUm93ID0geyBpZDogc3RyaW5nOyBlbWFpbDogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IGdyb3Vwczogc3RyaW5nOyBwaG90b3M6IHN0cmluZzsgcHJvb2Y6IHN0cmluZzsga2luZDogc3RyaW5nOyBzdXBwcmltZXI6IHN0cmluZyB9OwoKLyoqIFPDqXBhcmF0ZXVyIGRlcyBub21zIGRlIGdyb3VwZXMgZGFucyBsYSBjZWxsdWxlICh0ZXh0ZSA6IGxhIHJlY2hlcmNoZSBldCBsZSB0cmkgbCd1dGlsaXNlbnQpLiAqLwo=')
sub('apps/web/src/features/admin/users/components/UsersTable.tsx', 'ICAgICAgZ3JvdXBzOiB1Lmdyb3Vwcy5tYXAoKGcpID0+IGcubmFtZSkuam9pbihHUk9VUF9TRVApLAogICAgICBwaG90b3M6IElNQUdFX0NPTlNFTlRfTEFCRUxbdS5pbWFnZUNvbnNlbnRdLAogICAgICBraW5kOiB1LmlzRGVtbyA/ICJEw6ltbyIgOiAiTWVtYnJlIiwKICAgICAgc3VwcHJpbWVyOiB1LmlkLAo=',
    'ICAgICAgZ3JvdXBzOiB1Lmdyb3Vwcy5tYXAoKGcpID0+IGcubmFtZSkuam9pbihHUk9VUF9TRVApLAogICAgICBwaG90b3M6IElNQUdFX0NPTlNFTlRfTEFCRUxbdS5pbWFnZUNvbnNlbnRdLAogICAgICBwcm9vZjogSU1BR0VfQ09OU0VOVF9QUk9PRl9MQUJFTFt1LmNvbnNlbnRQcm9vZl0sCiAgICAgIGtpbmQ6IHUuaXNEZW1vID8gIkTDqW1vIiA6ICJNZW1icmUiLAogICAgICBzdXBwcmltZXI6IHUuaWQsCg==')
sub('apps/web/src/features/admin/users/components/UsersTable.tsx', 'ICAgIH0sCiAgICB7CiAgICAgIHByb3BlcnR5OiAia2luZCIsCiAgICAgIGRpc3BsYXlOYW1lOiAiQ29tcHRlIiwK',
    'ICAgIH0sCiAgICB7CiAgICAgIC8vIFByZXV2ZSBkZSBsJ2F1dG9yaXNhdGlvbiA6IHVuIHN0YXR1dCDCqyBBY2NvcmTDqWUgwrsgc2FucyBmb3JtdWxhaXJlIG4nYSBwYXMgZGUgdmFsZXVyIGRlIHByZXV2ZS4KICAgICAgcHJvcGVydHk6ICJwcm9vZiIsCiAgICAgIGRpc3BsYXlOYW1lOiAiRm9ybXVsYWlyZSIsCiAgICAgIHR5cGU6ICJzdHJpbmciLAogICAgICByZW5kZXI6ICh2YWx1ZSkgPT4gewogICAgICAgIGNvbnN0IHYgPSBTdHJpbmcodmFsdWUgPz8gIiIpOwogICAgICAgIGNvbnN0IHRvbmUgPQogICAgICAgICAgdiA9PT0gSU1BR0VfQ09OU0VOVF9QUk9PRl9MQUJFTC5OT05FCiAgICAgICAgICAgID8gImJnLW11dGVkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCIKICAgICAgICAgICAgOiB2ID09PSBJTUFHRV9DT05TRU5UX1BST09GX0xBQkVMLlBFTkRJTkdfR1VBUkRJQU4KICAgICAgICAgICAgICA/ICJiZy1hbWJlci0xMDAgdGV4dC1hbWJlci05MDAiCiAgICAgICAgICAgICAgOiAiYmctZW1lcmFsZC0xMDAgdGV4dC1lbWVyYWxkLTkwMCI7CiAgICAgICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHJvdW5kZWQtZnVsbCBweC0yIHB5LTAuNSB0ZXh0LXhzICR7dG9uZX1gfT57dn08L3NwYW4+OwogICAgICB9LAogICAgfSwKICAgIHsKICAgICAgcHJvcGVydHk6ICJraW5kIiwKICAgICAgZGlzcGxheU5hbWU6ICJDb21wdGUiLAo=')
print("  édits ok (6 substitutions, 0 fichiers créés, 0 remplacés)")
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
feat(membres): colonne « Formulaire » — preuve de l'autorisation de droit à l'image

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG