#!/usr/bin/env bash
# AKFC — Page « S'inscrire » : l'étape 2 disait « inscription et paiement à l'accueil uniquement ».
# La MJC propose désormais aussi la pré-inscription en ligne (plateforme GOasso : compte,
# pré-inscription, paiement en ligne après validation) en plus de l'accueil. Texte seulement.
# Usage : bash fix-inscription-online.sh   (AKFC_APPLY_ONLY=1 : applique sans vérifier ni committer)
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/app/(public)/inscription/page.tsx"
[ -f "$F" ] || { echo "ERREUR: applique d'abord apply-site-partners-front.sh." >&2; exit 1; }
grep -q "L'inscription se fait auprès de la MJC" "$F" && { echo "— déjà appliqué"; exit 0; }
BK=/tmp/akfc_insc_backup; rm -rf "$BK"; mkdir -p "$BK"; cp "$F" "$BK/page"
restore(){ cp "$BK/page" "$F"; echo "↩ fichier restauré à l'identique (aucun commit)."; }
W=/tmp/akfc_insc; rm -rf "$W"; mkdir -p "$W"
echo 'aW1wb3J0IHN5cwpwID0gc3lzLmFyZ3ZbMV0gKyAiL2FwcHMvd2ViL3NyYy9hcHAvKHB1YmxpYykvaW5zY3JpcHRpb24vcGFnZS50c3giCnMgPSBvcGVuKHAsIGVuY29kaW5nPSJ1dGYtOCIpLnJlYWQoKQpvID0gJycnICAgICAgICAgIDxTdGVwIG49ezJ9IHRpdGxlPSJMJ2luc2NyaXB0aW9uIHNlIGZhaXQgw6AgbCdhY2N1ZWlsIGRlIGxhIE1KQyI+CiAgICAgICAgICAgIEluc2NyaXB0aW9uIGV0IHBhaWVtZW50IHNlIGZvbnQgc3VyIHBsYWNlLCDDoCBsJmFwb3M7YWNjdWVpbCBkZSBsYSBNSkMgKGFkaMOpc2lvbiDDoCBsYSBNSkMgZXQgYWN0aXZpdMOpCiAgICAgICAgICAgIGNob2lzaWUpLiBMZXMgdGFyaWZzIHNvbnQgcHVibGnDqXMgc3VyIHNvbiBzaXRle2hvc3QgJiYgaG9zdC5saW5rcy5sZW5ndGggPiAwID8gIiA6IHZvaXIgbGVzIGxpZW5zIGNpLWRlc3NvdXMiIDogIiJ9LgogICAgICAgICAgPC9TdGVwPicnJwpuID0gJycnICAgICAgICAgIDxTdGVwIG49ezJ9IHRpdGxlPSJMJ2luc2NyaXB0aW9uIHNlIGZhaXQgYXVwcsOocyBkZSBsYSBNSkMiPgogICAgICAgICAgICBFbiBsaWduZSBzdXIgbGEgcGxhdGVmb3JtZSBkZSBsYSBNSkMgKGNyw6lhdGlvbiBkJmFwb3M7dW4gY29tcHRlLCBwcsOpLWluc2NyaXB0aW9uIMOgIGwmYXBvczthY3Rpdml0w6ksIHB1aXMKICAgICAgICAgICAgcGFpZW1lbnQgZW4gbGlnbmUgdW5lIGZvaXMgbGEgZGVtYW5kZSB2YWxpZMOpZSBwYXIgbGEgTUpDKSBvdSBkaXJlY3RlbWVudCDDoCBzb24gYWNjdWVpbC4gTCZhcG9zO2FkaMOpc2lvbgogICAgICAgICAgICBhbm51ZWxsZSDDoCBsYSBNSkMgZXN0IG9ibGlnYXRvaXJlLiBIb3JhaXJlcywgdGFyaWZzIGV0IGNhbGVuZHJpZXIgZGVzIGluc2NyaXB0aW9ucyAoY2VydGFpbmVzIHDDqXJpb2RlcyBzb250CiAgICAgICAgICAgIHLDqXNlcnbDqWVzIMOgIGwmYXBvczthY2N1ZWlsKSBzb250IHB1Ymxpw6lzIHBhciBsYSBNSkN7aG9zdCAmJiBob3N0LmxpbmtzLmxlbmd0aCA+IDAgPyAiIDogdm9pciBsZXMgbGllbnMgY2ktZGVzc291cyIgOiAiIn0uCiAgICAgICAgICA8L1N0ZXA+JycnCmFzc2VydCBzLmNvdW50KG8pID09IDEsIGYiw6l0YXBlIDIgOiBhbmNyZSDDl3tzLmNvdW50KG8pfSIKcyA9IHMucmVwbGFjZShvLCBuKQpvcGVuKHAsICJ3IiwgZW5jb2Rpbmc9InV0Zi04Iikud3JpdGUocyk7IHByaW50KCIgIG9rICBwYWdlIMKrIFMnaW5zY3JpcmUgwrsgOiDDqXRhcGUgMiAoZW4gbGlnbmUgb3Ugw6AgbCdhY2N1ZWlsKSIpCg==' | base64 -d > "$W/edit.py"
echo "== application =="
python3 "$W/edit.py" . || { restore; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; restore; exit 1
fi
echo "  ✅ check OK"
git add "$F"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs(inscription): inscription à la MJC en ligne ou à l'accueil

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01QwiRBHC9Woay42Lx5GUVBU
MSG