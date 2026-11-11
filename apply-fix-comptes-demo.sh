#!/usr/bin/env bash
# Comptes de démo (seed sandbox / dev) : un majeur, un mineur et son parent.
# Prérequis : apply-docs-clics-e2e.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-comptes-demo.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"prisma/seed.sandbox.mjs" 2>/dev/null | grep -qF "mineur@akfc.demo"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "### Un clic qui se perd" "apps/web/content/docs/dev/qualite/tester-de-bout-en-bout.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-clics-e2e.sh puis apply-docs-clics-e2e.sh"; exit 1; }
MODIFIED=("prisma/seed.sandbox.mjs")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "mineur@akfc.demo" "prisma/seed.sandbox.mjs" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('prisma/seed.sandbox.mjs', 'fQoKYXN5bmMgZnVuY3Rpb24gZW5zdXJlVXNlcih7IGVtYWlsLCBmaXJzdE5hbWUsIGhhc2gsIGFkbWluLCBhZG1pbkdyb3VwSWQgfSkgewogIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci51cHNlcnQoewogICAgd2hlcmU6IHsgZW1haWwgfSwKICAgIHVwZGF0ZTogeyBwYXNzd29yZDogaGFzaCwgZW1haWxWZXJpZmllZDogdHJ1ZSwgaXNGaXJzdExvZ2luOiBmYWxzZSB9LAogICAgY3JlYXRlOiB7CiAgICAgIGVtYWlsLAo=',
    'fQoKLyoqCiAqIFVuIGNvbXB0ZSBkZSBkw6ltbywgcmVtaXMgw6Agc29uIMOpdGF0IGNvbm51IMOgIGNoYXF1ZSBwYXNzYWdlLiBgbGVnYWxgIDogbm9tLCBtYWpvcml0w6kgZXQsIHBvdXIgdW4KICogbWluZXVyLCBzb24gcGFyZW50IHLDqWbDqXJlbnQgKGxlIHBhcmVudCBuJ2EgcGFzIGRlIGNvbXB0ZSA6IHNlcyBlLW1haWxzIGFycml2ZW50IGRhbnMgTWFpbHBpdCkuCiAqLwphc3luYyBmdW5jdGlvbiBlbnN1cmVVc2VyKHsgZW1haWwsIGZpcnN0TmFtZSwgaGFzaCwgYWRtaW4sIGFkbWluR3JvdXBJZCwgbGVnYWwgPSB7fSB9KSB7CiAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLnVwc2VydCh7CiAgICB3aGVyZTogeyBlbWFpbCB9LAogICAgdXBkYXRlOiB7IHBhc3N3b3JkOiBoYXNoLCBlbWFpbFZlcmlmaWVkOiB0cnVlLCBpc0ZpcnN0TG9naW46IGZhbHNlLCAuLi5sZWdhbCB9LAogICAgY3JlYXRlOiB7CiAgICAgIGVtYWlsLAo=')
sub('prisma/seed.sandbox.mjs', 'ICAgICAgZW1haWxWZXJpZmllZDogdHJ1ZSwKICAgICAgaXNGaXJzdExvZ2luOiBmYWxzZSwKICAgIH0sCiAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSwK',
    'ICAgICAgZW1haWxWZXJpZmllZDogdHJ1ZSwKICAgICAgaXNGaXJzdExvZ2luOiBmYWxzZSwKICAgICAgLi4ubGVnYWwsCiAgICB9LAogICAgc2VsZWN0OiB7IGlkOiB0cnVlIH0sCg==')
sub('prisma/seed.sandbox.mjs', 'ICAgIGFkbWluOiBmYWxzZSwKICAgIGFkbWluR3JvdXBJZCwKICB9KTsKICBjb25zb2xlLmxvZygi4pyFIENvbXB0ZXMgZGUgZMOpbW8gcHLDqnRzIik7Cg==',
    'ICAgIGFkbWluOiBmYWxzZSwKICAgIGFkbWluR3JvdXBJZCwKICAgIC8vIE1hamV1ciA6IGlsIGRvbm5lIGx1aS1tw6ptZSBzb24gYXV0b3Jpc2F0aW9uIGRlIGRyb2l0IMOgIGwnaW1hZ2UsIGVuIGxpZ25lLgogICAgbGVnYWw6IHsgbGFzdE5hbWU6ICJEw6ltbyIsIGxlZ2FsQWdlOiAiQURVTFQiIH0sCiAgfSk7CiAgYXdhaXQgZW5zdXJlVXNlcih7CiAgICBlbWFpbDogIm1pbmV1ckBha2ZjLmRlbW8iLAogICAgZmlyc3ROYW1lOiAiTWluZXVyIiwKICAgIGhhc2gsCiAgICBhZG1pbjogZmFsc2UsCiAgICBhZG1pbkdyb3VwSWQsCiAgICAvLyBNaW5ldXIsIGZpY2hlIGNvbXBsw6h0ZSA6IGlsIGluZGlxdWUgc2VzIHNvdWhhaXRzLCBsZSBsaWVuIHBhcnQgw6Agwqsgc29uIHBhcmVudCDCuy4KICAgIGxlZ2FsOiB7CiAgICAgIGxhc3ROYW1lOiAiRMOpbW8iLAogICAgICBsZWdhbEFnZTogIk1JTk9SIiwKICAgICAgYmlydGhEYXRlOiBuZXcgRGF0ZSgiMjAxMi0wNS0wNFQwMDowMDowMC4wMDBaIiksCiAgICAgIGJpcnRoRGF0ZVZlcmlmaWVkOiB0cnVlLAogICAgICBndWFyZGlhbk5hbWU6ICJQYXJlbnQgRMOpbW8iLAogICAgICBndWFyZGlhblJlbGF0aW9uOiAibcOocmUiLAogICAgICBndWFyZGlhbkVtYWlsOiAicGFyZW50QGFrZmMuZGVtbyIsCiAgICB9LAogIH0pOwogIGNvbnNvbGUubG9nKCLinIUgQ29tcHRlcyBkZSBkw6ltbyBwcsOqdHMiKTsK')
sub('prisma/seed.sandbox.mjs', 'ICBjb25zb2xlLmxvZygiIik7CiAgY29uc29sZS5sb2coIiAgIEFkbWluICA6IGFkbWluQGFrZmMuZGVtbyAgLyAgIiArIERFTU9fUEFTU1dPUkQpOwogIGNvbnNvbGUubG9nKCIgICBNZW1icmUgOiBtZW1icmVAYWtmYy5kZW1vIC8gICIgKyBERU1PX1BBU1NXT1JEKTsKICBjb25zb2xlLmxvZygi8J+MsSBTZWVkIHNhbmRib3ggdGVybWluw6kiKTsKfQo=',
    'ICBjb25zb2xlLmxvZygiIik7CiAgY29uc29sZS5sb2coIiAgIEFkbWluICA6IGFkbWluQGFrZmMuZGVtbyAgLyAgIiArIERFTU9fUEFTU1dPUkQpOwogIGNvbnNvbGUubG9nKCIgICBNZW1icmUgOiBtZW1icmVAYWtmYy5kZW1vIC8gICIgKyBERU1PX1BBU1NXT1JEICsgIiAgKG1hamV1cikiKTsKICBjb25zb2xlLmxvZygiICAgTWluZXVyIDogbWluZXVyQGFrZmMuZGVtbyAvICAiICsgREVNT19QQVNTV09SRCArICIgIChwYXJlbnQgOiBwYXJlbnRAYWtmYy5kZW1vLCBzYW5zIGNvbXB0ZSwgZS1tYWlscyBkYW5zIE1haWxwaXQpIik7CiAgY29uc29sZS5sb2coIvCfjLEgU2VlZCBzYW5kYm94IHRlcm1pbsOpIik7Cn0K')
print("  édits ok (4 substitutions, 0 fichiers créés, 0 remplacés)")
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
Comptes de démo : un majeur, un mineur et son parent (seed sandbox et dev)

- membre@akfc.demo : majeur (nom « Démo »), il donne son droit à l'image
  en ligne
- mineur@akfc.demo : mineur, fiche complète (date de naissance vérifiée,
  parent « Parent Démo », mère, parent@akfc.demo) : le circuit du parent se
  teste d'un bout à l'autre
- le parent n'a pas de compte, c'est voulu : ses e-mails arrivent dans
  Mailpit
- ensureUser(legal) : nom, majorité et parent reviennent aussi à leur
  valeur de démonstration (le seed reste idempotent, vérifié deux fois)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Aucune migration. Ensuite : apply-docs-comptes-demo.sh"