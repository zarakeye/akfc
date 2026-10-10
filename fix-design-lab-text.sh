#!/usr/bin/env bash
# AKFC — Laboratoire de rendu : la phrase d'en-tête disait « Rien n'est enregistré, recopiez dans
# globals.css », ce qui est faux depuis le bouton « Appliquer au site ». Remplacée par :
# « Les curseurs modifient l'aperçu en direct ; « Appliquer au site » enregistre le réglage pour
# toutes les pages. » (+ commentaire du composant mis à jour). Texte seulement.
# Usage : bash fix-design-lab-text.sh   (AKFC_APPLY_ONLY=1 : applique sans vérifier ni committer)
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
FILES=("apps/web/src/app/(admin)/dashboard/design-lab/page.tsx" apps/web/src/features/design-lab/BlockStyleLab.tsx)
grep -q "enregistre le réglage pour toutes les pages" "${FILES[0]}" && { echo "— déjà appliqué"; exit 0; }
BK=/tmp/akfc_labtxt_backup; rm -rf "$BK"; mkdir -p "$BK"
for f in "${FILES[@]}"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; mkdir -p "$BK/$(dirname "$f")"; cp "$f" "$BK/$f"; done
restore(){ for f in "${FILES[@]}"; do cp "$BK/$f" "$f"; done; echo "↩ fichiers restaurés à l'identique (aucun commit)."; }
W=/tmp/akfc_labtxt; rm -rf "$W"; mkdir -p "$W"
echo 'aW1wb3J0IHN5cwpyb290ID0gc3lzLmFyZ3ZbMV0KZGVmIGVkaXQocmVsLCBwYWlycyk6CiAgICBwID0gZiJ7cm9vdH0ve3JlbH0iOyBzID0gb3BlbihwLCBlbmNvZGluZz0idXRmLTgiKS5yZWFkKCkKICAgIGZvciBvLCBuLCBsIGluIHBhaXJzOgogICAgICAgIGFzc2VydCBzLmNvdW50KG8pID09IDEsIGYie3JlbH0ge2x9IDogYW5jcmUgw5d7cy5jb3VudChvKX0iCiAgICAgICAgcyA9IHMucmVwbGFjZShvLCBuKQogICAgb3BlbihwLCAidyIsIGVuY29kaW5nPSJ1dGYtOCIpLndyaXRlKHMpCgplZGl0KCJhcHBzL3dlYi9zcmMvYXBwLyhhZG1pbikvZGFzaGJvYXJkL2Rlc2lnbi1sYWIvcGFnZS50c3giLCBbCignJycgICAgICAgIDxwIGNsYXNzTmFtZT0idGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQiPgogICAgICAgICAgTGVzIGN1cnNldXJzIG1vZGlmaWVudCBsZXMgdmFyaWFibGVzIENTUyByw6llbGxlbWVudCB1dGlsaXPDqWVzIHBhciBsZQogICAgICAgICAgcmVuZHUgZGVzIGJsb2NzLiBSaWVuIG4mYXBvcztlc3QgZW5yZWdpc3Ryw6kmbmJzcDs6IHVuZSBmb2lzIGxlCiAgICAgICAgICByw6lnbGFnZSB0cm91dsOpLCByZWNvcGlleiBsZSBibG9jIENTUyBhZmZpY2jDqSBkYW5zeyIgIn0KICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT0icm91bmRlZCBiZy1tdXRlZCBweC0xIj5nbG9iYWxzLmNzczwvY29kZT4uCiAgICAgICAgPC9wPicnJywnJycgICAgICAgIDxwIGNsYXNzTmFtZT0idGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQiPgogICAgICAgICAgTGVzIGN1cnNldXJzIG1vZGlmaWVudCBsJmFwb3M7YXBlcsOndSBlbiBkaXJlY3QmbmJzcDs7IMKrJm5ic3A7QXBwbGlxdWVyCiAgICAgICAgICBhdSBzaXRlJm5ic3A7wrsgZW5yZWdpc3RyZSBsZSByw6lnbGFnZSBwb3VyIHRvdXRlcyBsZXMgcGFnZXMuCiAgICAgICAgPC9wPicnJywgInBocmFzZSIpLApdKQplZGl0KCJhcHBzL3dlYi9zcmMvZmVhdHVyZXMvZGVzaWduLWxhYi9CbG9ja1N0eWxlTGFiLnRzeCIsIFsKKCcnJyAqIFJpZW4gbidlc3QgcGVyc2lzdMOpLCBkw6lsaWLDqXLDqW1lbnQuIExlIGxhYm9yYXRvaXJlIHNlcnQgw6AgQ0hFUkNIRVIgZGVzCiAqIHZhbGV1cnMgOyBvbiBsZXMgcmVjb3BpZSBlbnN1aXRlIGRhbnMgYGdsb2JhbHMuY3NzYCwgcXVpIHJlc3RlIGxhIHNldWxlCiAqIHNvdXJjZSBkZSB2w6lyaXTDqS4gRGV1eCBzb3VyY2VzIHJlbmRyYWllbnQgaW5zb2x1YmxlIGxhIHF1ZXN0aW9uCiAqIMKrIHBvdXJxdW9pIGxhIHBhZ2UgbmUgcmVzc2VtYmxlIHBhcyBhdSBsYWJvID8gwrsuJycnLCcnJyAqIExlcyBjdXJzZXVycyBuZSBjaGFuZ2VudCBxdWUgbCdhcGVyw6d1IDsgwqsgQXBwbGlxdWVyIGF1IHNpdGUgwrsgZW5yZWdpc3RyZSBsZQogKiByw6lnbGFnZSBlbiBiYXNlIChTaXRlU3R5bGUpLCBxdWUgbGUgbGF5b3V0IHJhY2luZSBpbmplY3RlIHN1ciB0b3V0ZXMgbGVzIHBhZ2VzLgogKiBgZ2xvYmFscy5jc3NgIG5lIGdhcmRlIHF1ZSBsZXMgdmFsZXVycyBkZSBSRVBMSSAoc2FucyByw6lnbGFnZSBlbnJlZ2lzdHLDqSkgOiBsZQogKiBibG9jIENTUyBhZmZpY2jDqSBzZXJ0IMOgIHkgZmlnZXIgdW4gcsOpZ2xhZ2UsIHNpIG9uIGxlIHNvdWhhaXRlLicnJywgImRvYyIpLApdKQpwcmludCgiICBvayAgbGFib3JhdG9pcmUgOiB0ZXh0ZSBkJ2VuLXTDqnRlIMOgIGpvdXIgKMKrIEFwcGxpcXVlciBhdSBzaXRlIMK7IGVucmVnaXN0cmUpIikK' | base64 -d > "$W/edit.py"
echo "== application =="
python3 "$W/edit.py" . || { restore; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; restore; exit 1
fi
echo "  ✅ check OK"
git add "${FILES[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs(design-lab): l'en-tête décrit le bouton « Appliquer au site »

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01QwiRBHC9Woay42Lx5GUVBU
MSG