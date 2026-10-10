#!/usr/bin/env bash
# AKFC — « Mot de passe oublié » : le lien est enfin ENVOYÉ PAR E-MAIL (il était écrit dans les journaux).
#  - email/mailer.ts (nouveau) : transport SMTP partagé, expéditeur robuste, URL canonique du site
#  - sendPasswordResetEmail.ts : vrai e-mail (lien 30 min, usage unique) ; JAMAIS le jeton dans les
#    journaux en production ; en dev sans SMTP, le lien reste affiché dans la console ([DEV])
#  - auth.requestPasswordReset : un échec d'envoi est journalisé SANS le jeton et la réponse reste
#    identique (sinon une erreur trahirait qu'un compte existe pour l'adresse saisie)
# Usage : bash apply-password-reset-email.sh
set -euo pipefail
[ -f package.json ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
E="packages/backend/src/email"; MAILER="$E/mailer.ts"; SEND="$E/services/sendPasswordResetEmail.ts"
ROUTER="packages/backend/src/modules/auth/router.ts"
for f in "$SEND" "$ROUTER"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
grep -q "@backend/email/mailer" "$SEND" && { echo "— déjà appliqué"; exit 0; }
grep -q "DEV STUB" "$SEND" || { echo "ERREUR: $SEND ne ressemble pas à l'ébauche attendue : rien n'a été modifié." >&2; exit 1; }
[ -e "$MAILER" ] && { echo "ERREUR: $MAILER existe déjà : rien n'a été modifié." >&2; exit 1; }

python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = """      await sendPasswordResetEmail({
        toEmail: user.email,
        token,
      });
"""
new = """      try {
        await sendPasswordResetEmail({ toEmail: user.email, token });
      } catch (err) {
        // Jamais le jeton dans les journaux. Réponse identique en cas d'échec : sinon, une
        // erreur trahirait qu'un compte existe pour l'adresse saisie.
        console.error(
          "[auth] e-mail de réinitialisation non envoyé :",
          err instanceof Error ? err.message : err,
        );
      }
"""
assert s.count(old) == 1, f"routeur : ancre ×{s.count(old)}"
p.write_text(s.replace(old, new), encoding="utf-8")
print("  ok  routeur : échec d'envoi intercepté, réponse identique")
PY
echo 'aW1wb3J0IG5vZGVtYWlsZXIsIHsgdHlwZSBUcmFuc3BvcnRlciB9IGZyb20gIm5vZGVtYWlsZXIiOwoKLyoqCiAqIFRyYW5zcG9ydCBTTVRQIHBhcnRhZ8OpIChub2RlbWFpbGVyKSwgY29uZmlndXLDqSBwYXIgbCdlbnZpcm9ubmVtZW50IDoKICogU01UUF9IT1NULCBTTVRQX1BPUlQgKDU4NyBwYXIgZMOpZmF1dCA6IFNUQVJUVExTIDsgNDY1IDogVExTIGRpcmVjdCksIFNNVFBfVVNFUiwgU01UUF9QQVNTV09SRC4KICogQ3LDqcOpIMOgIGxhIHByZW1pw6hyZSB1dGlsaXNhdGlvbiA6IHVuIFNNVFAgYWJzZW50IG5lIGJsb3F1ZSBwYXMgbGUgZMOpbWFycmFnZSBkZSBsJ2FwcGxpY2F0aW9uLgogKi8KbGV0IHRyYW5zcG9ydGVyOiBUcmFuc3BvcnRlciB8IG51bGwgPSBudWxsOwoKLyoqIFZyYWkgc2kgbGVzIHZhcmlhYmxlcyBTTVRQIGluZGlzcGVuc2FibGVzIHNvbnQgcmVuc2VpZ27DqWVzLiAqLwpleHBvcnQgZnVuY3Rpb24gaXNNYWlsQ29uZmlndXJlZCgpOiBib29sZWFuIHsKICByZXR1cm4gQm9vbGVhbihwcm9jZXNzLmVudi5TTVRQX0hPU1QgJiYgcHJvY2Vzcy5lbnYuU01UUF9VU0VSICYmIHByb2Nlc3MuZW52LlNNVFBfUEFTU1dPUkQpOwp9CgpleHBvcnQgZnVuY3Rpb24gZ2V0TWFpbFRyYW5zcG9ydCgpOiBUcmFuc3BvcnRlciB7CiAgaWYgKCF0cmFuc3BvcnRlcikgewogICAgY29uc3QgcG9ydCA9IE51bWJlci5wYXJzZUludChwcm9jZXNzLmVudi5TTVRQX1BPUlQgfHwgIjU4NyIsIDEwKTsKICAgIHRyYW5zcG9ydGVyID0gbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQoewogICAgICBob3N0OiBwcm9jZXNzLmVudi5TTVRQX0hPU1QsCiAgICAgIHBvcnQsCiAgICAgIHNlY3VyZTogcG9ydCA9PT0gNDY1LAogICAgICBhdXRoOiB7IHVzZXI6IHByb2Nlc3MuZW52LlNNVFBfVVNFUiwgcGFzczogcHJvY2Vzcy5lbnYuU01UUF9QQVNTV09SRCB9LAogICAgfSk7CiAgfQogIHJldHVybiB0cmFuc3BvcnRlcjsKfQoKLyoqCiAqIEFkcmVzc2UgZCdleHDDqWRpdGlvbiA6IFNNVFBfRlJPTV9OT1JFUExZIHNpIGMnZXN0IHVuZSBhZHJlc3NlIGNvbXBsw6h0ZSwgc2lub24gbGUgY29tcHRlIFNNVFAKICogbHVpLW3Dqm1lIChHbWFpbCwgcGFyIGV4ZW1wbGUsIG4nYWNjZXB0ZSBxdWUgbGUgY29tcHRlIGF1dGhlbnRpZmnDqSBvdSBzZXMgYWxpYXMgZMOpY2xhcsOpcykuCiAqLwpleHBvcnQgZnVuY3Rpb24gbWFpbEZyb20oZGlzcGxheU5hbWU6IHN0cmluZyk6IHN0cmluZyB7CiAgY29uc3Qgbm9yZXBseSA9IHByb2Nlc3MuZW52LlNNVFBfRlJPTV9OT1JFUExZPy50cmltKCk7CiAgY29uc3QgYWRkcmVzcyA9IG5vcmVwbHkgJiYgbm9yZXBseS5pbmNsdWRlcygiQCIpID8gbm9yZXBseSA6IChwcm9jZXNzLmVudi5TTVRQX1VTRVIgPz8gIiIpOwogIHJldHVybiBgJHtkaXNwbGF5TmFtZX0gPCR7YWRkcmVzc30+YDsKfQoKLyoqIFVSTCBwdWJsaXF1ZSBjYW5vbmlxdWUgZHUgc2l0ZSAobcOqbWUgcsOoZ2xlIHF1ZSBsJ2UtbWFpbCBkZSBiaWVudmVudWUgZXQgY29uZmlnL3NpdGVVcmwudHMpLiAqLwpleHBvcnQgZnVuY3Rpb24gc2l0ZUJhc2VVcmwoKTogc3RyaW5nIHsKICByZXR1cm4gKHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NJVEVfVVJMIHx8IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1VSTCB8fCAiaHR0cHM6Ly9ha2ZjLmZyIikucmVwbGFjZSgvXC8rJC8sICIiKTsKfQo=' | base64 -d > "$MAILER" && echo "  ok  $MAILER (nouveau)"
echo 'aW1wb3J0IHsgcHJpc21hIH0gZnJvbSAiQGJhY2tlbmQvcHJpc21hIjsKaW1wb3J0IHsgZ2V0TWFpbFRyYW5zcG9ydCwgaXNNYWlsQ29uZmlndXJlZCwgbWFpbEZyb20sIHNpdGVCYXNlVXJsIH0gZnJvbSAiQGJhY2tlbmQvZW1haWwvbWFpbGVyIjsKCi8qKgogKiBFbnZvaWUgbGUgbGllbiBkZSByw6lpbml0aWFsaXNhdGlvbiBkZSBtb3QgZGUgcGFzc2UgKMKrIG1vdCBkZSBwYXNzZSBvdWJsacOpIMK7KS4KICoKICogTGUgbGllbiBjb250aWVudCBsZSBqZXRvbiBFTiBDTEFJUiA6IGlsIG5lIGRvaXQgamFtYWlzIGFwcGFyYcOudHJlIGRhbnMgbGVzIGpvdXJuYXV4IGVuCiAqIHByb2R1Y3Rpb24sIGNhciBxdWljb25xdWUgbGVzIGxpdCBwb3VycmFpdCByw6lpbml0aWFsaXNlciBsZSBjb21wdGUgcGVuZGFudCAzMCBtaW51dGVzLgogKiBTYW5zIFNNVFAgY29uZmlndXLDqSA6IGVuIGTDqXZlbG9wcGVtZW50LCBsZSBsaWVuIGVzdCBhZmZpY2jDqSBkYW5zIGxhIGNvbnNvbGUgKG1hcnF1w6kgW0RFVl0pIDsKICogZW4gcHJvZHVjdGlvbiwgbCdlbnZvaSDDqWNob3VlLCBldCBsJ2FwcGVsYW50IGpvdXJuYWxpc2UgbCfDqWNoZWMgc2FucyBsZSBqZXRvbi4KICovCmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kUGFzc3dvcmRSZXNldEVtYWlsKHBhcmFtczogeyB0b0VtYWlsOiBzdHJpbmc7IHRva2VuOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4gewogIGNvbnN0IHsgdG9FbWFpbCwgdG9rZW4gfSA9IHBhcmFtczsKICBjb25zdCByZXNldExpbmsgPSBgJHtzaXRlQmFzZVVybCgpfS9hdXRoL3Jlc2V0LXBhc3N3b3JkP3Rva2VuPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRva2VuKX1gOwoKICBpZiAoIWlzTWFpbENvbmZpZ3VyZWQoKSkgewogICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAicHJvZHVjdGlvbiIpIHsKICAgICAgY29uc29sZS5sb2coYFtERVZdIGxpZW4gZGUgcsOpaW5pdGlhbGlzYXRpb24gcG91ciAke3RvRW1haWx9IDogJHtyZXNldExpbmt9YCk7CiAgICAgIHJldHVybjsKICAgIH0KICAgIHRocm93IG5ldyBFcnJvcigiU01UUCBub24gY29uZmlndXLDqSA6IGUtbWFpbCBkZSByw6lpbml0aWFsaXNhdGlvbiBub24gZW52b3nDqSIpOwogIH0KCiAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBwcmlzbWEuc2l0ZVNldHRpbmdzCiAgICAuZmluZFVuaXF1ZSh7IHdoZXJlOiB7IGlkOiAic2l0ZSIgfSwgc2VsZWN0OiB7IHNob3J0VGl0bGU6IHRydWUgfSB9KQogICAgLmNhdGNoKCgpID0+IG51bGwpOwogIGNvbnN0IG5hbWUgPSBzZXR0aW5ncz8uc2hvcnRUaXRsZT8udHJpbSgpIHx8IHByb2Nlc3MuZW52LkFQUF9TSE9SVF9OQU1FIHx8ICJBS0ZDIjsKICBjb25zdCBzYWZlTmFtZSA9IGVzY2FwZUh0bWwobmFtZSk7CgogIGF3YWl0IGdldE1haWxUcmFuc3BvcnQoKS5zZW5kTWFpbCh7CiAgICBmcm9tOiBtYWlsRnJvbShuYW1lKSwKICAgIHRvOiB0b0VtYWlsLAogICAgc3ViamVjdDogYCR7bmFtZX0g4oCUIHLDqWluaXRpYWxpc2F0aW9uIGRlIHZvdHJlIG1vdCBkZSBwYXNzZWAsCiAgICB0ZXh0OiBbCiAgICAgICJCb25qb3VyLCIsCiAgICAgICIiLAogICAgICBgVW5lIHLDqWluaXRpYWxpc2F0aW9uIGR1IG1vdCBkZSBwYXNzZSBkZSB2b3RyZSBjb21wdGUgJHtuYW1lfSBhIMOpdMOpIGRlbWFuZMOpZS5gLAogICAgICAiUG91ciBjaG9pc2lyIHVuIG5vdXZlYXUgbW90IGRlIHBhc3NlLCBvdXZyZXogY2UgbGllbiAodmFsYWJsZSAzMCBtaW51dGVzLCB1bmUgc2V1bGUgZm9pcykgOiIsCiAgICAgICIiLAogICAgICByZXNldExpbmssCiAgICAgICIiLAogICAgICAiU2kgdm91cyBuJ8OqdGVzIHBhcyDDoCBsJ29yaWdpbmUgZGUgY2V0dGUgZGVtYW5kZSwgaWdub3JleiBjZSBtZXNzYWdlIDogdm90cmUgbW90IGRlIHBhc3NlIGFjdHVlbCByZXN0ZSB2YWxhYmxlLiIsCiAgICBdLmpvaW4oIlxuIiksCiAgICBodG1sOiBgCiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtZmFtaWx5OiBBcmlhbCwgc2Fucy1zZXJpZjsgbWF4LXdpZHRoOiA2MDBweDsgbWFyZ2luOiAwIGF1dG87IHBhZGRpbmc6IDIwcHg7Ij4KICAgICAgICA8cD5Cb25qb3VyLDwvcD4KICAgICAgICA8cD5VbmUgcsOpaW5pdGlhbGlzYXRpb24gZHUgbW90IGRlIHBhc3NlIGRlIHZvdHJlIGNvbXB0ZSAke3NhZmVOYW1lfSBhIMOpdMOpIGRlbWFuZMOpZS48L3A+CiAgICAgICAgPHA+UG91ciBjaG9pc2lyIHVuIG5vdXZlYXUgbW90IGRlIHBhc3NlLCBjbGlxdWV6IHN1ciBsZSBib3V0b24gY2ktZGVzc291cy4KICAgICAgICAgICBMZSBsaWVuIGVzdCB2YWxhYmxlIDxzdHJvbmc+MzAgbWludXRlczwvc3Ryb25nPiBldCBuZSBwZXV0IHNlcnZpciBxdSd1bmUgZm9pcy48L3A+CiAgICAgICAgPHAgc3R5bGU9Im1hcmdpbjogMjRweCAwOyI+CiAgICAgICAgICA8YSBocmVmPSIke3Jlc2V0TGlua30iIHN0eWxlPSJiYWNrZ3JvdW5kOiAjMDA3MGYzOyBjb2xvcjogI2ZmZjsgcGFkZGluZzogMTBweCAyMHB4OyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IGJvcmRlci1yYWRpdXM6IDVweDsgZGlzcGxheTogaW5saW5lLWJsb2NrOyI+Q2hvaXNpciB1biBub3V2ZWF1IG1vdCBkZSBwYXNzZTwvYT4KICAgICAgICA8L3A+CiAgICAgICAgPHAgc3R5bGU9ImZvbnQtc2l6ZTogMTNweDsgY29sb3I6ICM1NTU7Ij5TaSB2b3VzIG4nw6p0ZXMgcGFzIMOgIGwnb3JpZ2luZSBkZSBjZXR0ZSBkZW1hbmRlLCBpZ25vcmV6IGNlIG1lc3NhZ2UgOgogICAgICAgICAgIHZvdHJlIG1vdCBkZSBwYXNzZSBhY3R1ZWwgcmVzdGUgdmFsYWJsZS48L3A+CiAgICAgIDwvZGl2PmAsCiAgfSk7Cn0KCmZ1bmN0aW9uIGVzY2FwZUh0bWwoczogc3RyaW5nKTogc3RyaW5nIHsKICByZXR1cm4gcy5yZXBsYWNlKC9bJjw+IiddL2csIChjKSA9PiAoeyAiJiI6ICImYW1wOyIsICI8IjogIiZsdDsiLCAiPiI6ICImZ3Q7IiwgJyInOiAiJnF1b3Q7IiwgIiciOiAiJiMzOTsiIH0pW2NdIGFzIHN0cmluZyk7Cn0K' | base64 -d > "$SEND" && echo "  ok  $SEND (vrai e-mail)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ — pas de commit (git checkout -- $SEND $ROUTER && rm -f $MAILER pour annuler) :"
  grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -12; exit 1
fi
echo "✅ check OK"; git add "$MAILER" "$SEND" "$ROUTER"
git commit -qm "fix(auth): le lien « mot de passe oublié » est envoyé par e-mail, plus jamais journalisé en production" && echo "✅ commit $(git rev-parse --short HEAD)"