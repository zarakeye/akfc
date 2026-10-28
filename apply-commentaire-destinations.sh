#!/usr/bin/env bash
# Commentaire d'en-tête de assertUploadDestinationAllowed conforme au code (aucun changement de comportement).
# Prérequis : apply-docs-espaces-collaboratifs.sh.
# Usage (racine du repo) : bash apply-commentaire-destinations.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"packages/backend/src/modules/storage/assertUploadDestinationAllowed.service.ts" 2>/dev/null | grep -qF "Le dossier de dépôt lui-même n"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "title: \"Les espaces collaboratifs\"" "apps/web/content/docs/dev/membres/espaces-collaboratifs.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-espaces-collaboratifs.sh"; exit 1; }
MODIFIED=("packages/backend/src/modules/storage/assertUploadDestinationAllowed.service.ts")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Le dossier de dépôt lui-même n" "packages/backend/src/modules/storage/assertUploadDestinationAllowed.service.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('packages/backend/src/modules/storage/assertUploadDestinationAllowed.service.ts', 'ICogQXV0b3Jpc2UgKG91IHJlZnVzZSkgdW5lIGRlc3RpbmF0aW9uIGQndXBsb2FkIHNlbG9uIGwndXRpbGlzYXRldXIuCiAqCiAqICAgLSBncm91cCAgICAgICAgICAgICAgICAgICAgIDogZHJvaXQgZCfDqWNyaXR1cmUgc3VyIGwnZXNwYWNlIChhc3NlcnRDYW5Xcml0ZUdyb3VwU3BhY2UpCiAqICAgLSBjb21tb25fcmVwb3NpdG9yeSwgcGVyc28gIDogdG91dCB1dGlsaXNhdGV1ciBDT05ORUNUw4kgKHBlcnNvID0gc29uIHByb3ByZQogKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVzcGFjZSwgZMOpcml2w6kgZGUgc29uIHVzZXJJZCBjw7R0w6kgc2VydmV1cikKICogICAtIGV4aXN0aW5nL25ldy1kaXNjaXBsaW5lLAogKiAgICAgZXZlbnQgICAgICAgICAgICAgICAgICAgICA6IHLDqXNlcnbDqSBhdXggQURNSU4gKGNvbnRlbnVzIGN1cmF0w6lzKQogKgogKiBEw6lmZW5zZSBlbiBwcm9mb25kZXVyIDogbCdVSSBtZW1icmUgbmUgcHJvcG9zZXJhIHF1ZSBgY29tbW9uX3JlcG9zaXRvcnlgLCBtYWlzCiAqIGNlIGdhcmRlIGVtcMOqY2hlIGF1c3NpIHVuIGFwcGVsIGQnQVBJIGZvcmfDqSBkZSB2aXNlciB1bmUgZGVzdGluYXRpb24gY3VyYXTDqWUuCiAqIExlIGBzd2l0Y2hgIGVzdCBleGhhdXN0aWYgc3VyIGwndW5pb24g4oCUIHVuIG5vdXZlYXUgYGtpbmRgIGNhc3NlcmFpdCBsZQogKiB0eXBlY2hlY2sgKHNpZ25hbCB2b3VsdSkuCiAqLwpleHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzZXJ0VXBsb2FkRGVzdGluYXRpb25BbGxvd2VkKHBhcmFtczogewo=',
    'ICogQXV0b3Jpc2UgKG91IHJlZnVzZSkgdW5lIGRlc3RpbmF0aW9uIGQndXBsb2FkIHNlbG9uIGwndXRpbGlzYXRldXIuCiAqCiAqICAgLSBncm91cCA6IGRyb2l0IGQnw4lDUklUVVJFIHN1ciBsJ2VzcGFjZSBkdSBncm91cGUgKGFzc2VydENhbldyaXRlR3JvdXBTcGFjZSA6CiAqICAgICAgICAgICAgIEVESVRPUiwgaMOpcml0YWdlIGRlIGxhIGhpw6lyYXJjaGllIGNvbXByaXMgOyB1biBhZG1pbmlzdHJhdGV1ciBwYXNzZSkgOwogKiAgIC0gdG91dGVzIGxlcyBhdXRyZXMgZGVzdGluYXRpb25zIChkaXNjaXBsaW5lIGV4aXN0YW50ZSBvdSBwcm9wb3PDqWUsIHN0YWdlLAogKiAgICAgw6l2w6luZW1lbnQsIGTDqXDDtHQgY29tbXVuLCBwZXJzbykgOiB0b3V0IHV0aWxpc2F0ZXVyIENPTk5FQ1TDiS4gTGUgZmljaGllciB5IG5hw650CiAqICAgICBFTiBBVFRFTlRFIDogaWwgbidhcHBhcmHDrnQgbnVsbGUgcGFydCB0YW50IHF1J3VuIGFkbWluaXN0cmF0ZXVyIG5lIGwnYSBwYXMKICogICAgIHZhbGlkw6ksIGV0IGxhIExFQ1RVUkUgZGUgY2VzIGRvc3NpZXJzIHJlc3RlIHLDqXNlcnbDqWUgYXV4IGFkbWluaXN0cmF0ZXVycwogKiAgICAgKGFzc2VydENhblJlYWRQYXRoKS4gTCdlc3BhY2UgcGVyc28gZXN0IHRvdWpvdXJzIGNlbHVpIGRlIGwnYXBwZWxhbnQgOiBzb24KICogICAgIGNoZW1pbiBlc3QgZMOpcml2w6kgZGUgc29uIGlkZW50aWZpYW50IGPDtHTDqSBzZXJ2ZXVyLgogKgogKiBMZSBkb3NzaWVyIGRlIGTDqXDDtHQgbHVpLW3Dqm1lIG4nZXN0IGphbWFpcyBmb3VybmkgcGFyIGxlIGNsaWVudCA6IGxlIHNlcnZldXIgbGUKICogY2FsY3VsZSBkZXB1aXMgbGEgZGVzdGluYXRpb24gKHJlc29sdmVQZW5kaW5nVXBsb2FkRm9sZGVyKS4KICovCmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3NlcnRVcGxvYWREZXN0aW5hdGlvbkFsbG93ZWQocGFyYW1zOiB7Cg==')
print("  édits ok (1 substitutions, 0 fichiers créés, 0 remplacés)")
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
assertUploadDestinationAllowed : commentaire d'en-tête conforme au code

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG