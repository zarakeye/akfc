#!/usr/bin/env bash
# Doc développeur : les trois écrans du circuit parent.
# Prérequis : apply-fix-circuit-parent-pages.sh.
# Usage (racine du repo) : bash apply-docs-circuit-parent-pages.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/legal/consentement-en-ligne.mdx" 2>/dev/null | grep -qF "### Les trois écrans"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "/autorisation-parent" "apps/web/src/app/robots.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-circuit-parent-pages.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/legal/consentement-en-ligne.mdx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "### Les trois écrans" "apps/web/content/docs/dev/legal/consentement-en-ligne.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/legal/consentement-en-ligne.mdx', 'ICAgICAgICBjYWxsOiBpbWFnZUNvbnNlbnQuY29uZmlybUd1YXJkaWFuCiAgICAgICAgc2VjdGlvbjogTGEgdmFsaWRhdGlvbiBwYXIgbGUgcGFyZW50CiAgICAgIC0gbGFiZWw6IExpZW4gcGVyZHUgb3UgZXhwaXLDqSwgdW4gYWRtaW5pc3RyYXRldXIgbGUgcmVudm9pZQogICAgICAgIGNhbGw6IGltYWdlQ29uc2VudC5yZXNlbmRHdWFyZGlhbkZvclVzZXIK',
    'ICAgICAgICBjYWxsOiBpbWFnZUNvbnNlbnQuY29uZmlybUd1YXJkaWFuCiAgICAgICAgc2VjdGlvbjogTGEgdmFsaWRhdGlvbiBwYXIgbGUgcGFyZW50CiAgICAgIC0gbGFiZWw6IFN1ciBsYSBmaWNoZSBkdSBtZW1icmUsIGzigJlhZG1pbmlzdHJhdGV1ciB2b2l0IGxhIGRlbWFuZGUgZW4gY291cnMKICAgICAgICBjYWxsOiBpbWFnZUNvbnNlbnQuZ3VhcmRpYW5QZW5kaW5nRm9yVXNlcgogICAgICAgIHNlY3Rpb246IExlcyB0cm9pcyDDqWNyYW5zCiAgICAgIC0gbGFiZWw6IExpZW4gcGVyZHUgb3UgZXhwaXLDqSwgdW4gYWRtaW5pc3RyYXRldXIgbGUgcmVudm9pZQogICAgICAgIGNhbGw6IGltYWdlQ29uc2VudC5yZXNlbmRHdWFyZGlhbkZvclVzZXIK')
sub('apps/web/content/docs/dev/legal/consentement-en-ligne.mdx', 'Lz4KCkNlIHF1ZSBsZSBwcm9maWwgcHJvcG9zZSwgc2Vsb24gbGEgc2l0dWF0aW9uIDoKCg==',
    'Lz4KCiMjIyBMZXMgdHJvaXMgw6ljcmFucwoKPERvY3NUYWJsZSBjb2x1bW5zSnNvbj0nWyLDiWNyYW4iLCAiUXVpIiwgIkNlIHF14oCZb24geSBmYWl0Il0nIHJvd3NKc29uPSdbWyJQcm9maWwsIMKrIEF1dG9yaXNhdGlvbiBwYXIgdm90cmUgcGFyZW50IHLDqWbDqXJlbnQgwrsiLCAiTGUgbWVtYnJlIG1pbmV1ciwgY29ubmVjdMOpIiwgIklsIGluZGlxdWUgc2VzIHNvdWhhaXRzIGV0IGxlcyBlbnZvaWUgOyBpbCB2b2l0IGVuc3VpdGUgb8O5IGVuIGVzdCBsYSBkZW1hbmRlIChhZHJlc3NlIG1hc3F1w6llLCB2YWxpZGl0w6kpIGV0IHBldXQgbW9kaWZpZXIgc2VzIHNvdWhhaXRzLCBjZSBxdWkgcmVudm9pZSB1biBsaWVuLiJdLCBbIi9hdXRvcmlzYXRpb24tcGFyZW50LzxqZXRvbj4iLCAiTGUgcGFyZW50LCBzYW5zIGNvbXB0ZSIsICJJbCByZXRyb3V2ZSBsZXMgc291aGFpdHMgcHLDqS1jb2Now6lzLCB1bmUgY29sb25uZSDCqyBTb3VoYWl0IGR1IG1lbWJyZSDCuyBlbiByZWdhcmQgOyB1bmUgbGlnbmUgcXVpIHPigJllbiDDqWNhcnRlIGVzdCBtYXJxdcOpZSDCqyBtb2RpZmnDqSDCuy4gTGUgYm91dG9uIHJlc3RlIGdyaXPDqSB0YW50IHF1ZSBsYSBjYXNlIMKrIHJlcHLDqXNlbnRhbnQgbMOpZ2FsIMK7IG7igJllc3QgcGFzIGNvY2jDqWUuIl0sIFsiRmljaGUgZHUgbWVtYnJlLCDCqyBEZW1hbmRlIGF1IHBhcmVudCByw6lmw6lyZW50IMK7IiwgIlVuIGFkbWluaXN0cmF0ZXVyIiwgIkxlcyBzb3VoYWl0cywgbGUgbGllbiBlbnZvecOpIGV0IHNhIHZhbGlkaXTDqSwgwqsgUmVudm95ZXIgbGUgbGllbiBhdSBwYXJlbnQgwrsgOyBsYSBsaXN0ZSBkZXMgZm9ybXVsYWlyZXMgZGl0IGNlIHF1ZSBsZSBwYXJlbnQgYSBjaGFuZ8OpLiJdXScgLz4KCkxhIHBhZ2UgZHUgcGFyZW50IHZpdCBob3JzIGR1IGdyb3VwZSBgKHB1YmxpYylgLCBjb21tZSBgL2F1dGgvcmVzZXQtcGFzc3dvcmRgIDogbmkgbWVudSwgbmkgbW9kZSBjaGFudGllciwgZXQgZWxsZSBu4oCZZXN0IHBhcyBpbmRleMOpZSAoYHJvYm90cy50c2AgZXQgYG5vaW5kZXhgKS4gTGUgdGFibGVhdSBkZXMgY2hvaXgsIGBDb25zZW50Q2hvaWNlc0ZpZWxkc2AsIGVzdCBsZSBtw6ptZSBwb3VyIGxlIG1hamV1ciBxdWkgc2lnbmUsIGxlIG1pbmV1ciBxdWkgc291aGFpdGUgZXQgbGUgcGFyZW50IHF1aSB2YWxpZGUgOyBzZXVsZSBsYSBwYWdlIGR1IHBhcmVudCBsdWkgcGFzc2UgbGVzIHNvdWhhaXRzIMOgIG1vbnRyZXIgZW4gcmVnYXJkLgoKQ2UgcXVlIGxlIHByb2ZpbCBwcm9wb3NlLCBzZWxvbiBsYSBzaXR1YXRpb24gOgoK')
print("  édits ok (2 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && pnpm typecheck && pnpm lint"
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
git add -- "${MODIFIED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs : les trois écrans du circuit parent

« Le consentement en ligne » : section « Les trois écrans » (profil du
mineur, page du parent, fiche admin), la page du parent hors du groupe
(public) et non indexée, le tableau des choix partagé ; parcours :
guardianPendingForUser.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : git push (la migration est portée par apply-fix-circuit-parent.sh)."