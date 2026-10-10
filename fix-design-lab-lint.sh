#!/usr/bin/env bash
# AKFC — Laboratoire de rendu : corrige l'erreur ESLint react-hooks/set-state-in-effect.
#  Le réglage enregistré était recopié dans les curseurs par un effet qui appelait setState
#  (rendu en cascade). Il l'est désormais par ajustement d'état pendant le rendu (motif déjà
#  employé par le layout du tableau de bord), une seule fois par réponse du serveur.
#  Comportement inchangé. Preuve avant commit : pnpm check (sinon le fichier est restauré).
# Usage : bash fix-design-lab-lint.sh   (AKFC_APPLY_ONLY=1 : applique sans vérifier ni committer)
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
L="apps/web/src/features/design-lab/BlockStyleLab.tsx"
[ -f "$L" ] || { echo "ERREUR: $L introuvable." >&2; exit 1; }
grep -q "applyStoredValues" "$L" && { echo "— déjà appliqué"; exit 0; }
BK=/tmp/akfc_labfix_backup; rm -rf "$BK"; mkdir -p "$BK"; cp "$L" "$BK/lab"
restore(){ cp "$BK/lab" "$L"; echo "↩ fichier restauré à l'identique (aucun commit)."; }
W=/tmp/akfc_labfix; rm -rf "$W"; mkdir -p "$W"
echo 'aW1wb3J0IHN5cwpwID0gc3lzLmFyZ3ZbMV0gKyAiL2FwcHMvd2ViL3NyYy9mZWF0dXJlcy9kZXNpZ24tbGFiL0Jsb2NrU3R5bGVMYWIudHN4IgpzID0gb3BlbihwLCBlbmNvZGluZz0idXRmLTgiKS5yZWFkKCkKZGVmIG9uZShvLCBuLCBsKToKICAgIGdsb2JhbCBzCiAgICBhc3NlcnQgcy5jb3VudChvKSA9PSAxLCBmIntsfSA6IGFuY3JlIMOXe3MuY291bnQobyl9IgogICAgcyA9IHMucmVwbGFjZShvLCBuKQpvbmUoJycnICB1c2VFZmZlY3QoKCkgPT4gewogICAgY29uc3Qgc3RvcmVkID0gc2F2ZWQuZGF0YTsKICAgIGlmICghc3RvcmVkKSByZXR1cm47CiAgICBzZXRWYWx1ZXMoKGN1cnJlbnQpID0+IHsKICAgICAgY29uc3QgbmV4dCA9IHsgLi4uY3VycmVudCB9OwogICAgICBmb3IgKGNvbnN0IGtub2Igb2YgS05PQlMpIHsKICAgICAgICBjb25zdCByYXcgPSBzdG9yZWRba25vYi5rZXldOwogICAgICAgIGlmIChyYXcgPT09IHVuZGVmaW5lZCkgY29udGludWU7CiAgICAgICAgLy8gTGEgYmFzZSBzdG9ja2UgwqsgMS42NSDCuyBvdSDCqyAyLjVyZW0gwrsgOiBvbiByZXRpcmUgbCd1bml0w6ksIGxlCiAgICAgICAgLy8gY3Vyc2V1ciBuZSBtYW5pcHVsZSBxdWUgbGUgbm9tYnJlLgogICAgICAgIGNvbnN0IHBhcnNlZCA9IE51bWJlci5wYXJzZUZsb2F0KHJhdyk7CiAgICAgICAgaWYgKCFOdW1iZXIuaXNOYU4ocGFyc2VkKSkgbmV4dFtrbm9iLmtleV0gPSBwYXJzZWQ7CiAgICAgIH0KICAgICAgcmV0dXJuIG5leHQ7CiAgICB9KTsKICB9LCBbc2F2ZWQuZGF0YV0pOycnJywnJycgIC8vIFLDqWdsYWdlIGVucmVnaXN0csOpIOKGkiBjdXJzZXVycywgcGFyIEFKVVNURU1FTlQgRCfDiVRBVCBQRU5EQU5UIExFIFJFTkRVIGV0IG5vbiBwYXIgdW4KICAvLyBlZmZldCAobcOqbWUgbW90aWYgcXVlIGxlIGxheW91dCBkdSB0YWJsZWF1IGRlIGJvcmQpIDogdW4gZWZmZXQgcXVpIGFwcGVsbGUgc2V0U3RhdGUKICAvLyBkw6ljbGVuY2hlIHVuIHJlbmR1IGVuIGNhc2NhZGUsIGNlIHF1ZSBSZWFjdCBzaWduYWxlIChyZWFjdC1ob29rcy9zZXQtc3RhdGUtaW4tZWZmZWN0KS4KICAvLyBJY2kgUmVhY3QgcmVsYW5jZSBsZSByZW5kdSBzYW5zIHZhbGlkZXIgbGUgcHJlbWllci4gTGUgcmVww6hyZSBgc2VlZGVkRnJvbWAgZ2FyYW50aXQKICAvLyBxdSdvbiBuJ2FwcGxpcXVlIGNoYXF1ZSByw6lwb25zZSBkdSBzZXJ2ZXVyIHF1J3VuZSBmb2lzLgogIGNvbnN0IFtzZWVkZWRGcm9tLCBzZXRTZWVkZWRGcm9tXSA9IHVzZVN0YXRlPHR5cGVvZiBzYXZlZC5kYXRhPih1bmRlZmluZWQpOwogIGlmIChzYXZlZC5kYXRhICYmIHNhdmVkLmRhdGEgIT09IHNlZWRlZEZyb20pIHsKICAgIHNldFNlZWRlZEZyb20oc2F2ZWQuZGF0YSk7CiAgICBzZXRWYWx1ZXMoKGN1cnJlbnQpID0+IGFwcGx5U3RvcmVkVmFsdWVzKGN1cnJlbnQsIHNhdmVkLmRhdGEpKTsKICB9JycnLCAiZWZmZXQiKQpvbmUoJycnZXhwb3J0IGZ1bmN0aW9uIEJsb2NrU3R5bGVMYWIoKTogSlNYLkVsZW1lbnQgeycnJywnJycvKioKICogVmFsZXVycyBkZXMgY3Vyc2V1cnMgcmVwcmlzZXMgZCd1biByw6lnbGFnZSBlbnJlZ2lzdHLDqS4gTGEgYmFzZSBzdG9ja2UgwqsgMS42NSDCuyBvdQogKiDCqyAyLjVyZW0gwrsgOiBvbiByZXRpcmUgbCd1bml0w6ksIGxlIGN1cnNldXIgbmUgbWFuaXB1bGUgcXVlIGxlIG5vbWJyZS4KICovCmZ1bmN0aW9uIGFwcGx5U3RvcmVkVmFsdWVzKAogIGN1cnJlbnQ6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4sCiAgc3RvcmVkOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHwgbnVsbCB8IHVuZGVmaW5lZCwKKTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiB7CiAgaWYgKCFzdG9yZWQpIHJldHVybiBjdXJyZW50OwogIGNvbnN0IG5leHQgPSB7IC4uLmN1cnJlbnQgfTsKICBmb3IgKGNvbnN0IGtub2Igb2YgS05PQlMpIHsKICAgIGNvbnN0IHJhdyA9IHN0b3JlZFtrbm9iLmtleV07CiAgICBpZiAocmF3ID09PSB1bmRlZmluZWQpIGNvbnRpbnVlOwogICAgY29uc3QgcGFyc2VkID0gTnVtYmVyLnBhcnNlRmxvYXQocmF3KTsKICAgIGlmICghTnVtYmVyLmlzTmFOKHBhcnNlZCkpIG5leHRba25vYi5rZXldID0gcGFyc2VkOwogIH0KICByZXR1cm4gbmV4dDsKfQoKZXhwb3J0IGZ1bmN0aW9uIEJsb2NrU3R5bGVMYWIoKTogSlNYLkVsZW1lbnQgeycnJywgImhlbHBlciIpCm9wZW4ocCwgInciLCBlbmNvZGluZz0idXRmLTgiKS53cml0ZShzKTsgcHJpbnQoIiAgb2sgIGxhYm9yYXRvaXJlIDogcsOpZ2xhZ2UgZW5yZWdpc3Ryw6kgYXBwbGlxdcOpIHNhbnMgZWZmZXQgKGxpbnQgcmVhY3QtaG9va3MpIikK' | base64 -d > "$W/edit.py"

echo "== application =="
python3 "$W/edit.py" . || { restore; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi

echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; restore; exit 1
fi
echo "  ✅ check OK"
if pnpm exec eslint "$L" > /tmp/akfc_lint.log 2>&1; then echo "  ✅ ESLint OK"; else echo "  ⚠ ESLint :"; grep -E "error|warning" /tmp/akfc_lint.log | head -5; fi
git add "$L"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
fix(design-lab): réglage enregistré appliqué sans setState dans un effet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01QwiRBHC9Woay42Lx5GUVBU
MSG