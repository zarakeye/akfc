#!/usr/bin/env bash
# Récapitulatif PDF du droit à l'image — la case du mineur et le pied de page.
# - Validation par le parent : la case « Signature du membre mineur » dit que ses souhaits ont été exprimés en
#   ligne, depuis son compte, et s'ils ont été gardés ou modifiés par son parent (détail en dernière page) ;
# - pied de page du modèle (« à remettre signée… sur papier », « 1/2 ») recouvert : « validée en ligne »,
#   numérotation qui compte la page des souhaits ;
# - doc. Pas de migration. Les récapitulatifs déjà produits ne changent pas.
# Prérequis : apply-parent-date-facultative.sh.
# Usage (racine du repo) : bash apply-pdf-case-mineur.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"packages/backend/src/modules/imageConsent/consentPdf.service.ts" 2>/dev/null | grep -qF "drawOnlineFooters"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Pour valider, cochez la case" "apps/web/src/features/image-consent/GuardianConsentPage.tsx" 2>/dev/null || { echo "lancez d'abord apply-parent-date-facultative.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/legal/consentement-en-ligne.mdx" "packages/backend/src/modules/imageConsent/consentPdf.service.ts")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "drawOnlineFooters" "packages/backend/src/modules/imageConsent/consentPdf.service.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/legal/consentement-en-ligne.mdx', 'PEluc3RhbGxlciBwYXF1ZXRzPSJwZGYtbGliIiBkYW5zPSJiYWNrZW5kIiAvPgoKTGUgZm9ybXVsYWlyZSBwYXBpZXIgcmVzdGUgbGEgdm9pZSBkZSB0b3VzLiBNYWlzIHJlbWV0dHJlIHVuZSBmZXVpbGxlIHNpZ27DqWUgw6AgdW4gcmVzcG9uc2FibGUsIGxhIGZhaXJlIHNjYW5uZXIsIGxhIGZhaXJlIGTDqXBvc2VyLCBj4oCZZXN0IHRyb2lzIHBlcnNvbm5lcyBwb3VyIHVuIG91aS4gVW4gbWVtYnJlICoqbWFqZXVyKiogcGV1dCBkb25uZXIgc29uIGFjY29yZCBsdWktbcOqbWUsIGRlcHVpcyBzb24gcHJvZmlsLiBMZSBzaXRlIGRvaXQgYWxvcnMgcHJvZHVpcmUgY2UgcXVlIHByb2R1aXNhaXQgbGEgc2lnbmF0dXJlIDogdW4gZG9jdW1lbnQsIHVuZSBkYXRlLCBsYSB2ZXJzaW9uIGR1IHRleHRlIGFjY2VwdMOpLCBldCBsYSBjZXJ0aXR1ZGUgcXVlIGPigJllc3QgYmllbiBsdWkuCgojIyBMZXMgcGFyY291cnMgZHUgY2hhcGl0cmUK',
    'PEluc3RhbGxlciBwYXF1ZXRzPSJwZGYtbGliIiBkYW5zPSJiYWNrZW5kIiAvPgoKUmVtZXR0cmUgdW5lIGZldWlsbGUgc2lnbsOpZSDDoCB1biByZXNwb25zYWJsZSwgbGEgZmFpcmUgc2Nhbm5lciwgbGEgZmFpcmUgZMOpcG9zZXIsIGPigJllc3QgdHJvaXMgcGVyc29ubmVzIHBvdXIgdW4gb3VpIDogdG91dCBzZSBmYWl0IGRvbmMgZW4gbGlnbmUuIFVuIG1lbWJyZSAqKm1hamV1cioqIGRvbm5lIHNvbiBhY2NvcmQgbHVpLW3Dqm1lLCBkZXB1aXMgc29uIHByb2ZpbC4gTGUgc2l0ZSBkb2l0IGFsb3JzIHByb2R1aXJlIGNlIHF1ZSBwcm9kdWlzYWl0IGxhIHNpZ25hdHVyZSA6IHVuIGRvY3VtZW50LCB1bmUgZGF0ZSwgbGEgdmVyc2lvbiBkdSB0ZXh0ZSBhY2NlcHTDqSwgZXQgbGEgY2VydGl0dWRlIHF1ZSBj4oCZZXN0IGJpZW4gbHVpLgoKIyMgTGVzIHBhcmNvdXJzIGR1IGNoYXBpdHJlCg==')
sub('apps/web/content/docs/dev/legal/consentement-en-ligne.mdx', 'TGUgcGFyZW50IG91dnJlIGxlIGZvcm11bGFpcmUgcHLDqS1yZW1wbGkgZGVzIHNvdWhhaXRzLCBwZXV0IHRvdXQgY2hhbmdlciwgcGV1dCBjb25maXJtZXIgb3UgZG9ubmVyIGxhIGRhdGUgZGUgbmFpc3NhbmNlIChmYWN1bHRhdGl2ZSksIGNvY2hlIMKrIGplIHN1aXMgbGUgcmVwcsOpc2VudGFudCBsw6lnYWwgwrsgKHJlZnVzw6kgcGFyIGxlIHNjaMOpbWEgdGFudCBxdeKAmWVsbGUgbmUgdmF1dCBwYXMgYHRydWVgKSBldCB2YWxpZGUuIFVuZSBkYXRlIHF14oCZaWwgZG9ubmUgZGV2aWVudCBjZWxsZSBkZSBsYSBmaWNoZSwgbWFycXXDqWUgdsOpcmlmacOpZSA6IGPigJllc3QgZWxsZSBxdWkgZmVyYSBwYXNzZXIgbGUgbWVtYnJlIG1hamV1ciDDoCBzZXMgMTggYW5zLiBTYW5zIGRhdGUsIGNlIHBhc3NhZ2UgbuKAmWVzdCBwYXMgYXV0b21hdGlxdWUgOiB1biBhZG1pbmlzdHJhdGV1ciBsZSBmYWl0LgoKPENvZGVXYWxrdGhyb3VnaAogIGxhbmd1YWdlPSJ0cyIK',
    'TGUgcGFyZW50IG91dnJlIGxlIGZvcm11bGFpcmUgcHLDqS1yZW1wbGkgZGVzIHNvdWhhaXRzLCBwZXV0IHRvdXQgY2hhbmdlciwgcGV1dCBjb25maXJtZXIgb3UgZG9ubmVyIGxhIGRhdGUgZGUgbmFpc3NhbmNlIChmYWN1bHRhdGl2ZSksIGNvY2hlIMKrIGplIHN1aXMgbGUgcmVwcsOpc2VudGFudCBsw6lnYWwgwrsgKHJlZnVzw6kgcGFyIGxlIHNjaMOpbWEgdGFudCBxdeKAmWVsbGUgbmUgdmF1dCBwYXMgYHRydWVgKSBldCB2YWxpZGUuIFVuZSBkYXRlIHF14oCZaWwgZG9ubmUgZGV2aWVudCBjZWxsZSBkZSBsYSBmaWNoZSwgbWFycXXDqWUgdsOpcmlmacOpZSA6IGPigJllc3QgZWxsZSBxdWkgZmVyYSBwYXNzZXIgbGUgbWVtYnJlIG1hamV1ciDDoCBzZXMgMTggYW5zLiBTYW5zIGRhdGUsIGNlIHBhc3NhZ2UgbuKAmWVzdCBwYXMgYXV0b21hdGlxdWUgOiB1biBhZG1pbmlzdHJhdGV1ciBsZSBmYWl0LgoKTGUgcsOpY2FwaXR1bGF0aWYgcmVtcGxpdCBhdXNzaSBsYSBjYXNlIMKrIFNpZ25hdHVyZSBkdSBtZW1icmUgbWluZXVyIMK7IGR1IGZvcm11bGFpcmUuIFNhIHNpZ25hdHVyZSBu4oCZeSBlc3QgcXVlIGNvbnNlaWxsw6llIDogZWxsZSBtb250cmUgcXVlIHNvbiBhdmlzIGEgw6l0w6kgcmVjdWVpbGxpLiBMZSBzaXRlIGzigJlhIHJlY3VlaWxsaSwgcHVpc3F1ZSBsZSBtaW5ldXIgYSBlbnZvecOpIGx1aS1tw6ptZSBzZXMgc291aGFpdHMgZGVwdWlzIHNvbiBjb21wdGUgOyBsYSBjYXNlIGxlIGRpdCwgYXZlYyBjZSBxdeKAmWVuIGEgZmFpdCBsZSBwYXJlbnQgKGdhcmTDqXMgb3UgbW9kaWZpw6lzLCBkw6l0YWlsIGVuIGRlcm5pw6hyZSBwYWdlKS4gTGUgcGllZCBkZSBwYWdlIGR1IG1vZMOobGUsIHF1aSBwYXJsZSBk4oCZdW5lIGZldWlsbGUgw6AgcmVtZXR0cmUsIGVzdCByZWNvdXZlcnQgOiDCqyB2YWxpZMOpZSBlbiBsaWduZSDCuywgZXQgdW5lIG51bcOpcm90YXRpb24gcXVpIGNvbXB0ZSBsYSBwYWdlIGRlcyBzb3VoYWl0cy4KCjxDb2RlV2Fsa3Rocm91Z2gKICBsYW5ndWFnZT0idHMiCg==')
sub('packages/backend/src/modules/imageConsent/consentPdf.service.ts', 'ZnVuY3Rpb24gYmlydGhEYXkoZDogRGF0ZSk6IHN0cmluZyB7CiAgcmV0dXJuIGQudG9Mb2NhbGVEYXRlU3RyaW5nKCJmci1GUiIsIHsgdGltZVpvbmU6ICJVVEMiIH0pOwp9Cgo=',
    'ZnVuY3Rpb24gYmlydGhEYXkoZDogRGF0ZSk6IHN0cmluZyB7CiAgcmV0dXJuIGQudG9Mb2NhbGVEYXRlU3RyaW5nKCJmci1GUiIsIHsgdGltZVpvbmU6ICJVVEMiIH0pOwp9CgovKioKICogUGllZCBkZSBwYWdlIGQndW4gcsOpY2FwaXR1bGF0aWYgdmFsaWTDqSBlbiBsaWduZSA6IGxlIG1vZMOobGUgZGl0IMKrIMOgIHJlbWV0dHJlIHNpZ27DqWXigKYgc3VyIHBhcGllciDCuywKICogZXQgY29tcHRlIDIgcGFnZXMgOyBvbiBsZSByZWNvdXZyZSwgcGFnZSBwYXIgcGFnZSwgYXZlYyBsYSBib25uZSBtZW50aW9uIGV0IGxhIGJvbm5lIG51bcOpcm90YXRpb24KICogKGxhIHBhZ2UgZGVzIHNvdWhhaXRzIHMnYWpvdXRlIHBvdXIgdW4gbWluZXVyKS4KICovCmZ1bmN0aW9uIGRyYXdPbmxpbmVGb290ZXJzKGRvYzogUERGRG9jdW1lbnQsIGZvbnQ6IFBERkZvbnQpOiB2b2lkIHsKICBjb25zdCBwYWdlcyA9IGRvYy5nZXRQYWdlcygpOwogIGNvbnN0IGdyZXkgPSByZ2IoMC4zNSwgMC4zNSwgMC4zNSk7CiAgcGFnZXMuZm9yRWFjaCgocGFnZSwgaSkgPT4gewogICAgcGFnZS5kcmF3UmVjdGFuZ2xlKHsgeDogNDQsIHk6IDI1LCB3aWR0aDogNTA4LCBoZWlnaHQ6IDEwLCBjb2xvcjogcmdiKDEsIDEsIDEpIH0pOwogICAgcGFnZS5kcmF3VGV4dCgiQUtGQyDigJQgQXV0b3Jpc2F0aW9uIGRlIGRyb2l0IMOgIGwnaW1hZ2UgwrcgdmFsaWTDqWUgZW4gbGlnbmUiLCB7IHg6IDQ1LjQsIHk6IDI4LjMsIHNpemU6IDcsIGZvbnQsIGNvbG9yOiBncmV5IH0pOwogICAgY29uc3QgbnVtID0gYCR7aSArIDF9LyR7cGFnZXMubGVuZ3RofWA7CiAgICBwYWdlLmRyYXdUZXh0KG51bSwgeyB4OiA1NDkuOSAtIGZvbnQud2lkdGhPZlRleHRBdFNpemUobnVtLCA3KSwgeTogMjguMywgc2l6ZTogNywgZm9udCwgY29sb3I6IGdyZXkgfSk7CiAgfSk7Cn0KCg==')
sub('packages/backend/src/modules/imageConsent/consentPdf.service.ts', 'ICAgICAgcGFnZS5kcmF3VGV4dChsaW5lLCB7IHg6IDUzLCB5LCBzaXplOiA4LCBmb250LCBjb2xvcjogcmdiKDAuMiwgMC4yLCAwLjIpLCBtYXhXaWR0aDogMjQwIH0pOwogICAgfQogICAgZm9ybS51cGRhdGVGaWVsZEFwcGVhcmFuY2VzKGZvbnQpOwogICAgZm9ybS5mbGF0dGVuKCk7CgogICAgaWYgKGNvbmZpcm1hdGlvbi5tZW1iZXJXaXNoZXMpIGRyYXdXaXNoZXNQYWdlKGRvYywgZm9udCwgYm9sZCwgY29uZmlybWF0aW9uLCBjb25maXJtYXRpb24ubWVtYmVyV2lzaGVzKTsKICB9Cgo=',
    'ICAgICAgcGFnZS5kcmF3VGV4dChsaW5lLCB7IHg6IDUzLCB5LCBzaXplOiA4LCBmb250LCBjb2xvcjogcmdiKDAuMiwgMC4yLCAwLjIpLCBtYXhXaWR0aDogMjQwIH0pOwogICAgfQogICAgLy8gQ2FkcmUgZHUgbWluZXVyIChwYWdlIDEsIMKrIFNpZ25hdHVyZSBkdSBtZW1icmUgbWluZXVyIMK7KSA6IHZhbGlkYXRpb24gcGFyIGxlIHBhcmVudCwgbGVzCiAgICAvLyBzb3VoYWl0cyBxdWUgbGUgbWluZXVyIGEgbHVpLW3Dqm1lIGVudm95w6lzIGRlcHVpcyBzb24gY29tcHRlIChkw6l0YWlsIGVuIGRlcm5pw6hyZSBwYWdlKS4KICAgIGlmIChjb25maXJtYXRpb24ubWVtYmVyV2lzaGVzKSB7CiAgICAgIGNvbnN0IGNoYW5nZWQgPSBjb21wYXJlV2lzaGVzKGNvbmZpcm1hdGlvbi5tZW1iZXJXaXNoZXMsIGNvbmZpcm1hdGlvbikuc29tZSgocikgPT4gci5jaGFuZ2VkKTsKICAgICAgY29uc3QgbmFtZSA9IFttZW1iZXIuZmlyc3ROYW1lLCBtZW1iZXIubGFzdE5hbWVdLmZpbHRlcihCb29sZWFuKS5qb2luKCIgIikudHJpbSgpIHx8IG1lbWJlci5lbWFpbDsKICAgICAgY29uc3QgbWlub3JMaW5lcyA9IFsKICAgICAgICAiZGVwdWlzIHNvbiBjb21wdGUgbWVtYnJlLiIsCiAgICAgICAgY2hhbmdlZCA/ICJNb2RpZmnDqXMgcGFyIHNvbiBwYXJlbnQgOiB2b2lyIGxhIGRlcm5pw6hyZSBwYWdlLiIgOiAiR2FyZMOpcyBwYXIgc29uIHBhcmVudCA6IHZvaXIgbGEgZGVybmnDqHJlIHBhZ2UuIiwKICAgICAgXTsKICAgICAgbGV0IG15ID0gODQ7CiAgICAgIHBhZ2UuZHJhd1RleHQoYFNvdWhhaXRzIGV4cHJpbcOpcyBlbiBsaWduZSBwYXIgJHtuYW1lfWAsIHsgeDogMzE0LCB5OiBteSwgc2l6ZTogOC41LCBmb250OiBib2xkLCBjb2xvcjogcmdiKDAuMSwgMC4xLCAwLjEpLCBtYXhXaWR0aDogMjMyIH0pOwogICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbWlub3JMaW5lcykgewogICAgICAgIG15IC09IDExOwogICAgICAgIHBhZ2UuZHJhd1RleHQobGluZSwgeyB4OiAzMTQsIHk6IG15LCBzaXplOiA4LCBmb250LCBjb2xvcjogcmdiKDAuMiwgMC4yLCAwLjIpLCBtYXhXaWR0aDogMjMyIH0pOwogICAgICB9CiAgICB9CiAgICBmb3JtLnVwZGF0ZUZpZWxkQXBwZWFyYW5jZXMoZm9udCk7CiAgICBmb3JtLmZsYXR0ZW4oKTsKCiAgICBpZiAoY29uZmlybWF0aW9uLm1lbWJlcldpc2hlcykgZHJhd1dpc2hlc1BhZ2UoZG9jLCBmb250LCBib2xkLCBjb25maXJtYXRpb24sIGNvbmZpcm1hdGlvbi5tZW1iZXJXaXNoZXMpOwogICAgZHJhd09ubGluZUZvb3RlcnMoZG9jLCBmb250KTsKICB9Cgo=')
print("  édits ok (4 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && node scripts/check-doc-snippets.mjs && node scripts/check-doc-components.mjs && node scripts/check-doc-installs.mjs && pnpm typecheck && pnpm lint"
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
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
Récapitulatif PDF du droit à l'image : la case « Signature du membre mineur » dit que le mineur a exprimé ses souhaits en ligne, depuis son compte, et s'ils ont été gardés ou modifiés par son parent ; pied de page « validée en ligne », numérotation comptant la page des souhaits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : pnpm install (retire les paquets de node_modules), puis git push."