#!/usr/bin/env bash
# Docs « Next.js et next.config.ts » : la vraie raison du build en webpack (bug Turbopack du traçage
# de la sortie standalone, août 2026, et ce qu'il en est avec Next 16.3.7).
# Prérequis : apply-docs-next-config.sh.
# Usage (racine du repo) : bash apply-docs-next-config-webpack.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/configuration/next-config.mdx" 2>/dev/null | grep -qF "ENOENT … middleware.js.nft.json"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Next.js et next.config.ts" "apps/web/content/docs/dev/configuration/next-config.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-next-config.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/configuration/next-config.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "ENOENT … middleware.js.nft.json" "apps/web/content/docs/dev/configuration/next-config.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/configuration/next-config.mdx', 'TmV4dC5qcyBkaXNwb3NlIGRlIGRldXggb3V0aWxzIHBvdXIgYXNzZW1ibGVyIGwnYXBwbGljYXRpb24uICoqVHVyYm9wYWNrKiosIGxlIHBsdXMgcsOpY2VudCwgZXN0IHV0aWxpc8OpIHBhciBkw6lmYXV0LCBldCBgcG5wbSBkZXZgIHMnZW4gc2VydCA6IGlsIHJlY29tcGlsZSB0csOocyB2aXRlIHVuZSBwYWdlIG1vZGlmacOpZS4gKip3ZWJwYWNrKiosIGwnb3V0aWwgaGlzdG9yaXF1ZSwgcmVzdGUgZGlzcG9uaWJsZSBhdmVjIGAtLXdlYnBhY2tgLCBldCBgcG5wbSBidWlsZGAgbGUgZGVtYW5kZSBleHBsaWNpdGVtZW50LgoKQ2UgY2hvaXggZGF0ZSBkZXMgZMOpYnV0cyBkdSBwcm9qZXQgOiBhdmVjIFR1cmJvcGFjaywgY2VydGFpbmVzIMOpdGFwZXMgZHUgYnVpbGQgc2VtYmxhaWVudCBvbWlzZXMgZXQgbGUgcsOpc3VsdGF0IG4nw6l0YWl0IHBhcyBjZWx1aSBhdHRlbmR1LiBMYSBjYXVzZSBleGFjdGUgbidhIHBhcyDDqXTDqSBub3TDqWUuIFVuIGluZGljZSBlc3QgcsOpYXBwYXJ1IGRlcHVpcyA6IGxhbmPDqSBhdmVjIFR1cmJvcGFjaywgbGUgYnVpbGQgYSDDqWNob3XDqSBlbiBsaXNhbnQgbCd1biBkZXMgZG9zc2llcnMgZGUgYHNoYXJwYCBsaXN0w6lzIGRhbnMgYG91dHB1dEZpbGVUcmFjaW5nSW5jbHVkZXNgLCBxdSdpbCBwcmVuYWl0IHBvdXIgdW4gZmljaGllci4gQydlc3QgcHLDqWNpc8OpbWVudCBsJ8OpdGFwZSBkdSB0cmHDp2FnZSwgY2VsbGUgZG9udCBkw6lwZW5kIGwnaW1hZ2UgRG9ja2VyLgoKPENhbGxvdXQgdHlwZT0id2FybmluZyI+Cg==',
    'TmV4dC5qcyBkaXNwb3NlIGRlIGRldXggb3V0aWxzIHBvdXIgYXNzZW1ibGVyIGwnYXBwbGljYXRpb24uICoqVHVyYm9wYWNrKiosIGxlIHBsdXMgcsOpY2VudCwgZXN0IHV0aWxpc8OpIHBhciBkw6lmYXV0LCBldCBgcG5wbSBkZXZgIHMnZW4gc2VydCA6IGlsIHJlY29tcGlsZSB0csOocyB2aXRlIHVuZSBwYWdlIG1vZGlmacOpZS4gKip3ZWJwYWNrKiosIGwnb3V0aWwgaGlzdG9yaXF1ZSwgcmVzdGUgZGlzcG9uaWJsZSBhdmVjIGAtLXdlYnBhY2tgLCBldCBgcG5wbSBidWlsZGAgbGUgZGVtYW5kZSBleHBsaWNpdGVtZW50LgoKQ2UgY2hvaXggZGF0ZSBkZSBsYSBmaW4gYW/Du3QgMjAyNiwgcXVhbmQgbGUgcHJvamV0IGEgcmXDp3Ugc29uIHByZW1pZXIgbWlkZGxld2FyZSAobGUgZmljaGllciBkZSBmaWx0cmFnZSBkZXMgcmVxdcOqdGVzLCBkZXZlbnUgZGVwdWlzIGBwcm94eS50c2ApLiBMZSBidWlsZCBkZSBwcm9kdWN0aW9uIHMnZXN0IG1pcyDDoCDDqWNob3VlciA6IGBFTk9FTlQg4oCmIG1pZGRsZXdhcmUuanMubmZ0Lmpzb25gLiBMZXMgZmljaGllcnMgYC5uZnQuanNvbmAgc29udCBjZXV4IGR1ICoqdHJhw6dhZ2UqKiA6IHBvdXIgY2hhcXVlIHBhZ2UsIHJvdXRlIG91IG1pZGRsZXdhcmUsIGxhIGxpc3RlIGRlcyBmaWNoaWVycyDDoCByZWNvcGllciBkYW5zIGxlIGRvc3NpZXIgYXV0b25vbWUuIFR1cmJvcGFjayBuZSBwcm9kdWlzYWl0IHBhcyBjZWx1aSBkdSBtaWRkbGV3YXJlLCBldCBsJ2Fzc2VtYmxhZ2UgZGUgYC5uZXh0L3N0YW5kYWxvbmVgIGxlIGNoZXJjaGFpdC4gQyfDqXRhaXQgdW4gYnVnIGNvbm51IGRlIE5leHQuanMgMTYgYXZlYyBUdXJib3BhY2ssIGBvdXRwdXQ6ICJzdGFuZGFsb25lImAgZXQgdW4gbWlkZGxld2FyZSwgZXQgbGEgZG9jdW1lbnRhdGlvbiBkZSBOZXh0LmpzIGRvbm5haXQgbGUgY29udG91cm5lbWVudCA6IGNvbnN0cnVpcmUgYXZlYyB3ZWJwYWNrLgoKTGEgcXVlc3Rpb24gYSDDqXTDqSByZXBvc8OpZSBlbiBvY3RvYnJlLCBhdmVjIE5leHQuanMgMTYuMy43LiBMZSBidWlsZCBUdXJib3BhY2sgw6ljaG91ZSB0b3Vqb3VycywgYXUgbcOqbWUgZW5kcm9pdCwgYXZlYyB1bmUgYXV0cmUgZXJyZXVyIDogZW4gdHJhw6dhbnQsIGlsIHRlbnRlIGRlIGxpcmUgY29tbWUgdW4gZmljaGllciB1biBkb3NzaWVyIGRlIGBub2RlX21vZHVsZXNgLCBhdHRlaW50IHBhciBsZXMgbW90aWZzIGRlIGBvdXRwdXRGaWxlVHJhY2luZ0luY2x1ZGVzYCAoYC4uLy4uL3BhY2thZ2VzL2JhY2tlbmQvKiovKmAsIGxlcyBkb3NzaWVycyBkZSBgc2hhcnBgKS4gQXZlYyBwbnBtLCBjZXMgZG9zc2llcnMgc29udCBkZXMgcmFjY291cmNpcyAobGllbnMgc3ltYm9saXF1ZXMpIHZlcnMgbGUgbWFnYXNpbiBkZSBwYXF1ZXRzLCBldCBUdXJib3BhY2sgbmUgbGVzIHN1aXQgcGFzIGNvbW1lIHdlYnBhY2suCgo8Q2FsbG91dCB0eXBlPSJ3YXJuaW5nIj4K')
print("  édits ok (1 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
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
git add "${MODIFIED[@]}" "${CREATED[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs(next.config): la vraie raison de webpack au build (bug Turbopack du traçage standalone)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG