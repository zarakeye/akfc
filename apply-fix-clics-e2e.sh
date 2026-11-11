#!/usr/bin/env bash
# Tests e2e : un clic sur une ligne qui se perd avant l'hydratation, rattrapé (clickUntilUrl).
# Prérequis : apply-docs-circuit-parent-tuto.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-clics-e2e.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"e2e/helpers.ts" 2>/dev/null | grep -qF "export async function clickUntilUrl"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Les souhaits d’un mineur restés sans réponse" "apps/web/content/docs/dev/legal/donnees-personnelles.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-circuit-parent-tuto.sh puis apply-docs-circuit-parent-tuto.sh"; exit 1; }
MODIFIED=("e2e/helpers.ts" "e2e/seances.spec.ts" "e2e/tutos-admin.spec.ts")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "export async function clickUntilUrl" "e2e/helpers.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('e2e/helpers.ts', 'aW1wb3J0IHsgZXhwZWN0LCB0eXBlIEFQSVJlcXVlc3RDb250ZXh0LCB0eXBlIFBhZ2UgfSBmcm9tICJAcGxheXdyaWdodC90ZXN0IjsKCmltcG9ydCB7IE1BSUxQSVRfQVBJIH0gZnJvbSAiLi9lbnYubWpzIjsK',
    'aW1wb3J0IHsgZXhwZWN0LCB0eXBlIEFQSVJlcXVlc3RDb250ZXh0LCB0eXBlIExvY2F0b3IsIHR5cGUgUGFnZSB9IGZyb20gIkBwbGF5d3JpZ2h0L3Rlc3QiOwoKaW1wb3J0IHsgTUFJTFBJVF9BUEkgfSBmcm9tICIuL2Vudi5tanMiOwo=')
sub('e2e/helpers.ts', 'ICByZXR1cm4gdGV4dCBhcyB1bmtub3duIGFzIHN0cmluZzsKfQo=',
    'ICByZXR1cm4gdGV4dCBhcyB1bmtub3duIGFzIHN0cmluZzsKfQoKLyoqCiAqIENsaXF1ZSBzdXIgdW5lIGxpZ25lIChvdSB1biBsaWVuIHJlbmR1IGPDtHTDqSBjbGllbnQpIGp1c3F1J8OgIGFycml2ZXIgw6AgYHVybGAuIFVuZSBsaWduZSBkZSB0YWJsZWF1CiAqIHBldXQgw6p0cmUgdmlzaWJsZSBhdmFudCBxdWUgUmVhY3QgeSBhaXQgYnJhbmNow6kgc29uIGNsaWMgKG5hdmlnYXRldXIgdG91dCBuZXVmLCBkb25uw6llcyBlbmNvcmUgZW4KICogcmVjaGFyZ2VtZW50KSA6IGNlIGNsaWMtbMOgIHNlIHBlcmQgc2FucyBlcnJldXIuIE9uIHJlY29tbWVuY2UgdGFudCBxdWUgbCdhZHJlc3NlIG4nYSBwYXMgY2hhbmfDqS4KICovCmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGlja1VudGlsVXJsKHBhZ2U6IFBhZ2UsIHRhcmdldDogTG9jYXRvciwgdXJsOiBSZWdFeHApOiBQcm9taXNlPHZvaWQ+IHsKICBhd2FpdCBleHBlY3QoYXN5bmMgKCkgPT4gewogICAgaWYgKCF1cmwudGVzdChwYWdlLnVybCgpKSkgYXdhaXQgdGFyZ2V0LmNsaWNrKHsgdGltZW91dDogMl8wMDAgfSk7CiAgICBhd2FpdCBleHBlY3QocGFnZSkudG9IYXZlVVJMKHVybCwgeyB0aW1lb3V0OiAyXzAwMCB9KTsKICB9KS50b1Bhc3MoeyB0aW1lb3V0OiAxNV8wMDAgfSk7Cn0K')
sub('e2e/seances.spec.ts', 'aW1wb3J0IHsgZXhwZWN0LCB0ZXN0IH0gZnJvbSAiQHBsYXl3cmlnaHQvdGVzdCI7CgppbXBvcnQgeyBsb2dpbkFzIH0gZnJvbSAiLi9oZWxwZXJzIjsKaW1wb3J0IHsgU0VNSU5BUiwgVVNFUlMgfSBmcm9tICIuL2RhdGEubWpzIjsKCg==',
    'aW1wb3J0IHsgZXhwZWN0LCB0ZXN0IH0gZnJvbSAiQHBsYXl3cmlnaHQvdGVzdCI7CgppbXBvcnQgeyBjbGlja1VudGlsVXJsLCBsb2dpbkFzIH0gZnJvbSAiLi9oZWxwZXJzIjsKaW1wb3J0IHsgU0VNSU5BUiwgVVNFUlMgfSBmcm9tICIuL2RhdGEubWpzIjsKCg==')
sub('e2e/seances.spec.ts', 'ICBhd2FpdCBsb2dpbkFzKHBhZ2UsIFVTRVJTLmFkbWluLmVtYWlsKTsKICBhd2FpdCBwYWdlLmdvdG8oIi9kYXNoYm9hcmQvc2VtaW5hcnMiKTsKICBhd2FpdCBwYWdlLmdldEJ5VGV4dChTRU1JTkFSLmxhYmVsLCB7IGV4YWN0OiB0cnVlIH0pLmNsaWNrKCk7CiAgYXdhaXQgZXhwZWN0KHBhZ2UpLnRvSGF2ZVVSTCgvXC9kYXNoYm9hcmRcL3NlbWluYXJzXC9cZCskLyk7CiAgYXdhaXQgcGFnZS5sb2NhdG9yKCdbZGF0YS10b3VyPSJmaWNoZS5lZGl0Il0nKS5jbGljaygpOwogIGF3YWl0IGV4cGVjdChwYWdlKS50b0hhdmVVUkwoL1wvZGFzaGJvYXJkXC9zZW1pbmFyc1wvXGQrXC9lZGl0JC8pOwo=',
    'ICBhd2FpdCBsb2dpbkFzKHBhZ2UsIFVTRVJTLmFkbWluLmVtYWlsKTsKICBhd2FpdCBwYWdlLmdvdG8oIi9kYXNoYm9hcmQvc2VtaW5hcnMiKTsKICBhd2FpdCBjbGlja1VudGlsVXJsKHBhZ2UsIHBhZ2UuZ2V0QnlUZXh0KFNFTUlOQVIubGFiZWwsIHsgZXhhY3Q6IHRydWUgfSksIC9cL2Rhc2hib2FyZFwvc2VtaW5hcnNcL1xkKyQvKTsKICBhd2FpdCBwYWdlLmxvY2F0b3IoJ1tkYXRhLXRvdXI9ImZpY2hlLmVkaXQiXScpLmNsaWNrKCk7CiAgYXdhaXQgZXhwZWN0KHBhZ2UpLnRvSGF2ZVVSTCgvXC9kYXNoYm9hcmRcL3NlbWluYXJzXC9cZCtcL2VkaXQkLyk7Cg==')
sub('e2e/tutos-admin.spec.ts', 'aW1wb3J0IHsgZXhwZWN0LCB0ZXN0LCB0eXBlIFBhZ2UgfSBmcm9tICJAcGxheXdyaWdodC90ZXN0IjsKCmltcG9ydCB7IGxvZ2luQXMsIHRycGNNdXRhdGlvbiB9IGZyb20gIi4vaGVscGVycyI7CmltcG9ydCB7IFNFTUlOQVIsIFVTRVJTIH0gZnJvbSAiLi9kYXRhLm1qcyI7Cgo=',
    'aW1wb3J0IHsgZXhwZWN0LCB0ZXN0LCB0eXBlIFBhZ2UgfSBmcm9tICJAcGxheXdyaWdodC90ZXN0IjsKCmltcG9ydCB7IGNsaWNrVW50aWxVcmwsIGxvZ2luQXMsIHRycGNNdXRhdGlvbiB9IGZyb20gIi4vaGVscGVycyI7CmltcG9ydCB7IFNFTUlOQVIsIFVTRVJTIH0gZnJvbSAiLi9kYXRhLm1qcyI7Cgo=')
sub('e2e/tutos-admin.spec.ts', 'ICBjb25zdCB0ID0gIkxlIGRyb2l0IMOgIGwnaW1hZ2UgZCd1biBtaW5ldXIiOwogIGF3YWl0IGV4cGVjdChidWJibGUocGFnZSwgdCwgMSwgMykpLnRvQmVWaXNpYmxlKCk7CiAgYXdhaXQgcGFnZS5nZXRCeVJvbGUoInJvdyIsIHsgbmFtZTogbmV3IFJlZ0V4cChVU0VSUy5taW5ldXIuZW1haWwpIH0pLmNsaWNrKCk7CiAgYXdhaXQgZXhwZWN0KHBhZ2UpLnRvSGF2ZVVSTChuZXcgUmVnRXhwKGAvZGFzaGJvYXJkL3VzZXJzLyR7VVNFUlMubWluZXVyLmlkfSRgKSk7CiAgYXdhaXQgZXhwZWN0KGJ1YmJsZShwYWdlLCB0LCAyLCAzKSkudG9CZVZpc2libGUoKTsKICBhd2FpdCBuZXh0QnV0dG9uKHBhZ2UpLmNsaWNrKCk7Cg==',
    'ICBjb25zdCB0ID0gIkxlIGRyb2l0IMOgIGwnaW1hZ2UgZCd1biBtaW5ldXIiOwogIGF3YWl0IGV4cGVjdChidWJibGUocGFnZSwgdCwgMSwgMykpLnRvQmVWaXNpYmxlKCk7CiAgYXdhaXQgY2xpY2tVbnRpbFVybChwYWdlLCBwYWdlLmdldEJ5Um9sZSgicm93IiwgeyBuYW1lOiBuZXcgUmVnRXhwKFVTRVJTLm1pbmV1ci5lbWFpbCkgfSksIG5ldyBSZWdFeHAoYC9kYXNoYm9hcmQvdXNlcnMvJHtVU0VSUy5taW5ldXIuaWR9JGApKTsKICBhd2FpdCBleHBlY3QoYnViYmxlKHBhZ2UsIHQsIDIsIDMpKS50b0JlVmlzaWJsZSgpOwogIGF3YWl0IG5leHRCdXR0b24ocGFnZSkuY2xpY2soKTsK')
sub('e2e/tutos-admin.spec.ts', 'ICBhd2FpdCBuZXh0QnV0dG9uKHBhZ2UpLmNsaWNrKCk7CiAgYXdhaXQgZXhwZWN0KGJ1YmJsZShwYWdlLCB0LCAyLCA2KSkudG9CZVZpc2libGUoKTsKICBhd2FpdCBwYWdlLmxvY2F0b3IoJ1tkYXRhLXRvdXI9InRpY2tldHMuaXRlbSJdJywgeyBoYXNUZXh0OiAiRGVtYW5kZSBlMmUgZHUgdHV0byIgfSkuY2xpY2soKTsKICBhd2FpdCBleHBlY3QocGFnZSkudG9IYXZlVVJMKC9cL2Rhc2hib2FyZFwvdGlja2V0c1wvW14vXSskLyk7CiAgZm9yIChjb25zdCBuIG9mIFszLCA0LCA1XSkgewogICAgYXdhaXQgZXhwZWN0KGJ1YmJsZShwYWdlLCB0LCBuLCA2KSkudG9CZVZpc2libGUoKTsK',
    'ICBhd2FpdCBuZXh0QnV0dG9uKHBhZ2UpLmNsaWNrKCk7CiAgYXdhaXQgZXhwZWN0KGJ1YmJsZShwYWdlLCB0LCAyLCA2KSkudG9CZVZpc2libGUoKTsKICBhd2FpdCBjbGlja1VudGlsVXJsKHBhZ2UsIHBhZ2UubG9jYXRvcignW2RhdGEtdG91cj0idGlja2V0cy5pdGVtIl0nLCB7IGhhc1RleHQ6ICJEZW1hbmRlIGUyZSBkdSB0dXRvIiB9KSwgL1wvZGFzaGJvYXJkXC90aWNrZXRzXC9bXi9dKyQvKTsKICBmb3IgKGNvbnN0IG4gb2YgWzMsIDQsIDVdKSB7CiAgICBhd2FpdCBleHBlY3QoYnViYmxlKHBhZ2UsIHQsIG4sIDYpKS50b0JlVmlzaWJsZSgpOwo=')
sub('e2e/tutos-admin.spec.ts', 'ICBjb25zdCB0ID0gIkFqb3V0ZXIgZGVzIHPDqWFuY2VzIjsKICBhd2FpdCBleHBlY3QoYnViYmxlKHBhZ2UsIHQsIDEsIDMpKS50b0JlVmlzaWJsZSgpOwogIGF3YWl0IHBhZ2UuZ2V0QnlUZXh0KFNFTUlOQVIubGFiZWwsIHsgZXhhY3Q6IHRydWUgfSkuY2xpY2soKTsKICBhd2FpdCBleHBlY3QoYnViYmxlKHBhZ2UsIHQsIDIsIDMpKS50b0JlVmlzaWJsZSgpOwogIGF3YWl0IHBhZ2UubG9jYXRvcignW2RhdGEtdG91cj0iZmljaGUuZWRpdCJdJykuY2xpY2soKTsK',
    'ICBjb25zdCB0ID0gIkFqb3V0ZXIgZGVzIHPDqWFuY2VzIjsKICBhd2FpdCBleHBlY3QoYnViYmxlKHBhZ2UsIHQsIDEsIDMpKS50b0JlVmlzaWJsZSgpOwogIGF3YWl0IGNsaWNrVW50aWxVcmwocGFnZSwgcGFnZS5nZXRCeVRleHQoU0VNSU5BUi5sYWJlbCwgeyBleGFjdDogdHJ1ZSB9KSwgL1wvZGFzaGJvYXJkXC9zZW1pbmFyc1wvXGQrJC8pOwogIGF3YWl0IGV4cGVjdChidWJibGUocGFnZSwgdCwgMiwgMykpLnRvQmVWaXNpYmxlKCk7CiAgYXdhaXQgcGFnZS5sb2NhdG9yKCdbZGF0YS10b3VyPSJmaWNoZS5lZGl0Il0nKS5jbGljaygpOwo=')
print("  édits ok (8 substitutions, 0 fichiers créés, 0 remplacés)")
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
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
e2e : un clic sur une ligne qui se perd avant l'hydratation, rattrapé

« Ajouter des séances » échouait parfois, juste après un test raté : dans
un navigateur tout neuf, la ligne du tableau est visible avant que React y
branche son clic, et le clic se perd sans erreur. Le site n'est pas en
cause.

- helpers.ts : clickUntilUrl clique jusqu'à arriver à l'adresse attendue
  (15 s au plus), au lieu de cliquer une fois et d'espérer
- utilisé pour les lignes des stages (seances, tuto des séances), des
  utilisateurs (tuto du droit à l'image d'un mineur) et des demandes
- vérifié : le scénario qui échouait (un test raté juste avant) passe

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Aucune migration. Ensuite : apply-docs-clics-e2e.sh"