#!/usr/bin/env bash
# Base locale : revenir-base-locale.sh branche les photos de dev sur le SeaweedFS du compose (plus sur akfc-storage-local).
# Prérequis : apply-docs-seaweedfs.sh. Aucune migration. Sur le MAC uniquement.
# Usage (racine du repo) : bash apply-fix-base-locale-seaweedfs.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"revenir-base-locale.sh" 2>/dev/null | grep -qF "photos : SeaweedFS"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Ce que la machine neuve a trouvé" "apps/web/content/docs/dev/qualite/l-integration-continue.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-seaweedfs.sh puis apply-docs-seaweedfs.sh"; exit 1; }
[ "$(uname)" = "Darwin" ] || { echo "❌ ce script est pour le Mac (poste de dev), pas pour le serveur."; exit 1; }
MODIFIED=("revenir-base-locale.sh" "passer-en-dev-local.sh")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "photos : SeaweedFS" "revenir-base-locale.sh" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('revenir-base-locale.sh', 'IyBMZSBzaXRlIGxvY2FsIHN1ciBsYSBjb3BpZSBBTk9OWU1JU8OJRSBkZSBsYSBwcm9kdWN0aW9uLCBkw6lqw6Agc3VyIGNlIE1hYyA6CiMgICBiYXNlICAgwqsgYWtmYy1kYi1sb2NhbCDCuyAgICAgIChzZXR1cC1sb2NhbC1kYi5zaCkgIOKAlCBkaXNjaXBsaW5lcywgcGFnZXMsIGNvbXB0ZXMgQGFrZmMuZGVtb+KApgojICAgcGhvdG9zIMKrIGFrZmMtc3RvcmFnZS1sb2NhbCDCuyAoZmFjZXMtMy1sb2NhbC5zaCkgICDigJQgdmlzYWdlcyBkZSBzdWJzdGl0dXRpb24KIyAgIGUtbWFpbHMgOiBNYWlscGl0IGRlIGRvY2tlci1jb21wb3NlLmRldi55bWwgKGh0dHA6Ly9sb2NhbGhvc3Q6ODAyNiksIHJpZW4gbmUgcGFydCBzdXIgaW50ZXJuZXQuCiMgTW9kaWZpZSAuZW52IGV0IGFwcHMvd2ViLy5lbnYubG9jYWwgKGNvcGllIGRlIHNhdXZlZ2FyZGUgw6AgY8O0dMOpIGRlIGNoYWN1bikuIEF1Y3VuIHNlY3JldCBhZmZpY2jDqSwK',
    'IyBMZSBzaXRlIGxvY2FsIHN1ciBsYSBjb3BpZSBBTk9OWU1JU8OJRSBkZSBsYSBwcm9kdWN0aW9uLCBkw6lqw6Agc3VyIGNlIE1hYyA6CiMgICBiYXNlICAgwqsgYWtmYy1kYi1sb2NhbCDCuyAgICAgIChzZXR1cC1sb2NhbC1kYi5zaCkgIOKAlCBkaXNjaXBsaW5lcywgcGFnZXMsIGNvbXB0ZXMgQGFrZmMuZGVtb+KApgojICAgcGhvdG9zIFNlYXdlZWRGUyBkZSBkb2NrZXItY29tcG9zZS5kZXYueW1sLCBidWNrZXQgYWtmYy1kZXYg4oCUIHZpc2FnZXMgZGUgc3Vic3RpdHV0aW9uCiMgICAgICAgICAgKHJlY29wacOpZXMgZGUgbCdhbmNpZW4gY29udGVuZXVyIE1pbklPIMKrIGFrZmMtc3RvcmFnZS1sb2NhbCDCuyBwYXIgYWtmYy1yZWNvcGllci1zdG9ja2FnZS1kZXYuc2gpCiMgICBlLW1haWxzIDogTWFpbHBpdCBkZSBkb2NrZXItY29tcG9zZS5kZXYueW1sIChodHRwOi8vbG9jYWxob3N0OjgwMjYpLCByaWVuIG5lIHBhcnQgc3VyIGludGVybmV0LgojIE1vZGlmaWUgLmVudiBldCBhcHBzL3dlYi8uZW52LmxvY2FsIChjb3BpZSBkZSBzYXV2ZWdhcmRlIMOgIGPDtHTDqSBkZSBjaGFjdW4pLiBBdWN1biBzZWNyZXQgYWZmaWNow6ksCg==')
sub('revenir-base-locale.sh', 'ZG9ja2VyIGluZm8gPi9kZXYvbnVsbCAyPiYxIHx8IHsgZWNobyAi4p2MIERvY2tlciBuZSByw6lwb25kIHBhcyA6IGxhbmNlIERvY2tlciBEZXNrdG9wLiI7IGV4aXQgMTsgfQoKREI9YWtmYy1kYi1sb2NhbDsgU1Q9YWtmYy1zdG9yYWdlLWxvY2FsCmRvY2tlciBjb250YWluZXIgaW5zcGVjdCAiJERCIiA+L2Rldi9udWxsIDI+JjEgfHwgeyBlY2hvICLinYwgcGFzIGRlIGNvbnRlbmV1ciAkREIgc3VyIGNlIE1hYyA6IGxhbmNlIGQnYWJvcmQgc2V0dXAtbG9jYWwtZGIuc2guIjsgZXhpdCAxOyB9CmVudm9mKCkgeyBkb2NrZXIgaW5zcGVjdCAtZiAne3tyYW5nZSAuQ29uZmlnLkVudn19e3twcmludGxuIC59fXt7ZW5kfX0nICIkMSIgfCBzZWQgLW4gInMvXiQyPS8vcCI7IH0K',
    'ZG9ja2VyIGluZm8gPi9kZXYvbnVsbCAyPiYxIHx8IHsgZWNobyAi4p2MIERvY2tlciBuZSByw6lwb25kIHBhcyA6IGxhbmNlIERvY2tlciBEZXNrdG9wLiI7IGV4aXQgMTsgfQoKREI9YWtmYy1kYi1sb2NhbApkb2NrZXIgY29udGFpbmVyIGluc3BlY3QgIiREQiIgPi9kZXYvbnVsbCAyPiYxIHx8IHsgZWNobyAi4p2MIHBhcyBkZSBjb250ZW5ldXIgJERCIHN1ciBjZSBNYWMgOiBsYW5jZSBkJ2Fib3JkIHNldHVwLWxvY2FsLWRiLnNoLiI7IGV4aXQgMTsgfQplbnZvZigpIHsgZG9ja2VyIGluc3BlY3QgLWYgJ3t7cmFuZ2UgLkNvbmZpZy5FbnZ9fXt7cHJpbnRsbiAufX17e2VuZH19JyAiJDEiIHwgc2VkIC1uICJzL14kMj0vL3AiOyB9Cg==')
sub('revenir-base-locale.sh', 'UEdfVVJMPSJwb3N0Z3Jlc3FsOi8vcG9zdGdyZXM6JChlbnZvZiAiJERCIiBQT1NUR1JFU19QQVNTV09SRClAMTI3LjAuMC4xOiQocG9ydG9mICIkREIiIDU0MzIpL2FrZmNfZGI/c2NoZW1hPXB1YmxpYyIKZWNobyAi4pyTIGJhc2UgJERCIDogMTI3LjAuMC4xOiQocG9ydG9mICIkREIiIDU0MzIpIgppZiBkb2NrZXIgY29udGFpbmVyIGluc3BlY3QgIiRTVCIgPi9kZXYvbnVsbCAyPiYxOyB0aGVuCiAgZG9ja2VyIHN0YXJ0ICIkU1QiID4vZGV2L251bGwKICBSMkU9Imh0dHA6Ly8xMjcuMC4wLjE6JChwb3J0b2YgIiRTVCIgOTAwMCkiOyBSMks9JChlbnZvZiAiJFNUIiBNSU5JT19ST09UX1VTRVIpOyBSMlM9JChlbnZvZiAiJFNUIiBNSU5JT19ST09UX1BBU1NXT1JEKQogIGVjaG8gIuKckyBwaG90b3MgJFNUIDogJFIyRSIKZWxzZQogIFIyRT0iIjsgZWNobyAi4pqgIHBhcyBkZSBjb250ZW5ldXIgJFNUIDogbGVzIHBob3RvcyByZXN0ZXJvbnQgY2VsbGVzIGR1IE1pbklPIGRlIGRldiAodmlkZXMpIgpmaQojIExlIE1pbklPIGV0IGxlIFBvc3RncmVzIGRlIGRvY2tlci1jb21wb3NlLmRldi55bWwgbmUgc2VydmVudCBwbHVzIDsgTWFpbHBpdCwgc2kuCmRvY2tlciBjb21wb3NlIC1mIGRvY2tlci1jb21wb3NlLmRldi55bWwgc3RvcCBkYiBzdG9yYWdlID4vZGV2L251bGwgMj4mMSB8fCB0cnVlCmRvY2tlciBjb21wb3NlIC1mIGRvY2tlci1jb21wb3NlLmRldi55bWwgdXAgLWQgbWFpbCA+L2Rldi9udWxsIDI+JjEgfHwgeyBlY2hvICLinYwgTWFpbHBpdCBuZSBkw6ltYXJyZSBwYXMiOyBleGl0IDE7IH0KCiMg4pSA4pSA4pSAIDIuIExlcyBkZXV4IGZpY2hpZXJzIC5lbnYg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACg==',
    'UEdfVVJMPSJwb3N0Z3Jlc3FsOi8vcG9zdGdyZXM6JChlbnZvZiAiJERCIiBQT1NUR1JFU19QQVNTV09SRClAMTI3LjAuMC4xOiQocG9ydG9mICIkREIiIDU0MzIpL2FrZmNfZGI/c2NoZW1hPXB1YmxpYyIKZWNobyAi4pyTIGJhc2UgJERCIDogMTI3LjAuMC4xOiQocG9ydG9mICIkREIiIDU0MzIpIgojIExlIFBvc3RncmVzIGRlIGRvY2tlci1jb21wb3NlLmRldi55bWwgbmUgc2VydCBwYXMgaWNpIChsYSBiYXNlIGVzdCAkREIpIDsgc29uIHN0b2NrYWdlIGV0IE1haWxwaXQsIHNpLgojIElkZW50aWZpYW50cyBkdSBzdG9ja2FnZSA6IGNldXggZGUgZG9ja2VyLWNvbXBvc2UuZGV2LnltbCwgcHVibGljcyBwYXIgbmF0dXJlIChkZXYgc2V1bGVtZW50KS4KZG9ja2VyIGNvbXBvc2UgLWYgZG9ja2VyLWNvbXBvc2UuZGV2LnltbCBzdG9wIGRiID4vZGV2L251bGwgMj4mMSB8fCB0cnVlCmRvY2tlciBjb21wb3NlIC1mIGRvY2tlci1jb21wb3NlLmRldi55bWwgdXAgLWQgLS13YWl0IHN0b3JhZ2UgbWFpbCA+L2Rldi9udWxsIDI+JjEgfHwgeyBlY2hvICLinYwgU2Vhd2VlZEZTIG91IE1haWxwaXQgbmUgZMOpbWFycmUgcGFzIjsgZXhpdCAxOyB9ClIyRT0iaHR0cDovLzEyNy4wLjAuMTo5MjAwIjsgUjJLPSJha2ZjLWRldiI7IFIyUz0iYWtmYy1kZXYtc2VjcmV0IgplY2hvICLinJMgcGhvdG9zIDogU2Vhd2VlZEZTICRSMkUsIGJ1Y2tldCBha2ZjLWRldiIKCiMg4pSA4pSA4pSAIDIuIExlcyBkZXV4IGZpY2hpZXJzIC5lbnYg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACg==')
sub('passer-en-dev-local.sh', 'ICBzbGVlcCAxCmRvbmUKZWNobyAi4pyTIFBvc3RncmVzLCBNaW5JTyBldCBNYWlscGl0IGxvY2F1eCBkw6ltYXJyw6lzIgoKIyDilIDilIDilIAgNC4gTGVzIG1pZ3JhdGlvbnMsIHN1ciBsYSBiYXNlIExPQ0FMRSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAK',
    'ICBzbGVlcCAxCmRvbmUKZWNobyAi4pyTIFBvc3RncmVzLCBTZWF3ZWVkRlMgZXQgTWFpbHBpdCBsb2NhdXggZMOpbWFycsOpcyIKCiMg4pSA4pSA4pSAIDQuIExlcyBtaWdyYXRpb25zLCBzdXIgbGEgYmFzZSBMT0NBTEUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACg==')
print("  édits ok (4 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

for f in "${MODIFIED[@]}"; do bash -n "$f" || { echo "❌ syntaxe bash : $f"; restore; exit 1; }; done
[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm typecheck && pnpm lint"
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
git add -- "${MODIFIED[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
Base locale : les photos de dev passent sur le SeaweedFS du compose

revenir-base-locale.sh branchait le dev sur le conteneur MinIO
« akfc-storage-local », dont l'image ne peut plus être téléchargée. Il
démarre maintenant le stockage SeaweedFS de docker-compose.dev.yml
(--wait) et y fait pointer R2_* (127.0.0.1:9200, bucket akfc-dev) ; la base
reste akfc-db-local. Les photos y sont recopiées, avec les mêmes clés, par
akfc-recopier-stockage-dev.sh (hors dépôt, lancé une fois).
passer-en-dev-local.sh : message (MinIO → SeaweedFS).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Aucune migration, rien sur le serveur. Ensuite : bash akfc-recopier-stockage-dev.sh"