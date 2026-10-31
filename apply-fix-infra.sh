#!/usr/bin/env bash
# Infrastructure : racine de stockage par défaut alignée, pnpm du migrateur figé au build, couches
# Docker réordonnées, contexte allégé, ESLint de la racine aligné. Prérequis : apply-e2e.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-infra.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"Dockerfile" 2>/dev/null | grep -qF "RUN corepack install"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "AKFC_E2E" "apps/web/next.config.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-e2e.sh"; exit 1; }
MODIFIED=(".dockerignore" "Dockerfile" "docker-compose.sandbox.yml" "eslint.config.mjs" "packages/config/app.ts")
EXPECT=("014b1d9b74ba:.dockerignore" "935ce02c0a12:Dockerfile" "7e5e8ffbfda9:docker-compose.sandbox.yml" "05e726d1b420:eslint.config.mjs" "41494117d16d:packages/config/app.ts")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "RUN corepack install" "Dockerfile" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('.dockerignore', 'Lm5leHQKKiovLm5leHQKZGlzdAoqKi9kaXN0Cg==',
    'Lm5leHQKKiovLm5leHQKLm5leHQtZTJlCioqLy5uZXh0LWUyZQpkaXN0CioqL2Rpc3QK')
sub('.dockerignore', 'Ki5sb2cKCiMgU2NyaXB0cyBkJ2FwcGxpY2F0aW9uIGV0IHNhdXZlZ2FyZGVzIHF1aSB0cmHDrm5lbnQgw6AgbGEgcmFjaW5lLgpzdGVwXyouc2gKZml4Xyouc2gKZGlhZ18qLnNoCmF1ZGl0Xyouc2gK',
    'Ki5sb2cKCiMgVGVzdHMgZGUgYm91dCBlbiBib3V0IDogbmkgbGV1ciBjb2RlLCBuaSBsZXVycyByw6lzdWx0YXRzIG5lIHNlcnZlbnQgw6AgbCdpbWFnZS4KZTJlCnBsYXl3cmlnaHQuY29uZmlnLnRzCnRlc3QtcmVzdWx0cwpwbGF5d3JpZ2h0LXJlcG9ydAoKIyBTY3JpcHRzIGQnYXBwbGljYXRpb24gZXQgc2F1dmVnYXJkZXMgcXVpIHRyYcOubmVudCDDoCBsYSByYWNpbmUuCnN0ZXBfKi5zaApmaXhfKi5zaAphcHBseS0qLnNoCmRpYWdfKi5zaAphdWRpdF8qLnNoCg==')
sub('Dockerfile', 'UlVOIHBucG0gcHJpc21hIGdlbmVyYXRlIC0tc2NoZW1hPXByaXNtYS9zY2hlbWEucHJpc21hCkVOViBORVhUX1RFTEVNRVRSWV9ESVNBQkxFRD0xCkFSRyBORVhUX1BVQkxJQ19BUFBfU0hPUlRfTkFNRQpFTlYgTkVYVF9QVUJMSUNfQVBQX1NIT1JUX05BTUU9JHtORVhUX1BVQkxJQ19BUFBfU0hPUlRfTkFNRX0KUlVOIHBucG0gLS1maWx0ZXIgd2ViIGJ1aWxkCg==',
    'UlVOIHBucG0gcHJpc21hIGdlbmVyYXRlIC0tc2NoZW1hPXByaXNtYS9zY2hlbWEucHJpc21hCkVOViBORVhUX1RFTEVNRVRSWV9ESVNBQkxFRD0xCiMgRMOpZmF1dCA9IGxhIHJhY2luZSBkZSBzdG9ja2FnZSBkdSBjbHViIDogdW4gYXJndW1lbnQgZGUgYnVpbGQgb3VibGnDqSBuZSBmYWl0IHBsdXMgY2hlcmNoZXIgbGVzCiMgZmljaGllcnMgc291cyB1bmUgYXV0cmUgcmFjaW5lIChzYW5zIGTDqWZhdXQsIEVOViByZWNldmFpdCB1bmUgY2hhw65uZSBWSURFKS4KQVJHIE5FWFRfUFVCTElDX0FQUF9TSE9SVF9OQU1FPUFLRkMKRU5WIE5FWFRfUFVCTElDX0FQUF9TSE9SVF9OQU1FPSR7TkVYVF9QVUJMSUNfQVBQX1NIT1JUX05BTUV9ClJVTiBwbnBtIC0tZmlsdGVyIHdlYiBidWlsZAo=')
sub('Dockerfile', 'Q09QWSBwcmlzbWEgLi9wcmlzbWEKQ09QWSBwcmlzbWEuY29uZmlnLnRzIHBhY2thZ2UuanNvbiAuLwpDTUQgWyJwbnBtIiwgInByaXNtYSIsICJtaWdyYXRlIiwgImRlcGxveSJdCgo=',
    'Q09QWSBwcmlzbWEgLi9wcmlzbWEKQ09QWSBwcmlzbWEuY29uZmlnLnRzIHBhY2thZ2UuanNvbiAuLwojIHBucG0gKHZlcnNpb24gw6lwaW5nbMOpZSBwYXIgcGFja2FnZU1hbmFnZXIpIHTDqWzDqWNoYXJnw6kgYXUgQlVJTEQgOiB1bmUgbWlncmF0aW9uIGxhbmPDqWUgZW4KIyBwcm9kdWN0aW9uIG5lIGTDqXBlbmQgcGx1cyBkdSByZWdpc3RyZSBucG0uClJVTiBjb3JlcGFjayBpbnN0YWxsCkNNRCBbInBucG0iLCAicHJpc21hIiwgIm1pZ3JhdGUiLCAiZGVwbG95Il0KCg==')
sub('Dockerfile', 'ICAmJiBjaG93biAtUiBuZXh0anM6bm9kZWpzIC9ob21lL25leHRqcwoKQ09QWSAtLWZyb209YnVpbGRlciAtLWNob3duPW5leHRqczpub2RlanMgL2FwcC9hcHBzL3dlYi8ubmV4dC9zdGFuZGFsb25lIC4vCkNPUFkgLS1mcm9tPWJ1aWxkZXIgLS1jaG93bj1uZXh0anM6bm9kZWpzIC9hcHAvYXBwcy93ZWIvLm5leHQvc3RhdGljIC4vYXBwcy93ZWIvLm5leHQvc3RhdGljCkNPUFkgLS1mcm9tPWJ1aWxkZXIgLS1jaG93bj1uZXh0anM6bm9kZWpzIC9hcHAvYXBwcy93ZWIvcHVibGljIC4vYXBwcy93ZWIvcHVibGljCkNPUFkgLS1mcm9tPWJ1aWxkZXIgLS1jaG93bj1uZXh0anM6bm9kZWpzIC9vcHQvc2hhcnAgLi9ub2RlX21vZHVsZXMvc2hhcnAKCiMgZmZtcGVnIDogYWZmaWNoZXMgZGVzIHZpZMOpb3Mgc3RvY2vDqWVzIHN1ciBSMiA7IGxpYmhlaWYgOiBwaG90b3MgSEVJQyBkJ2lQaG9uZSAoc2VydmljZSBtZWRpYURlcml2YXRpdmVzKS4KUlVOIGFwdC1nZXQgdXBkYXRlIFwKICAmJiBhcHQtZ2V0IGluc3RhbGwgLXkgLS1uby1pbnN0YWxsLXJlY29tbWVuZHMgZmZtcGVnIGxpYmhlaWYtZXhhbXBsZXMgXAo=',
    'ICAmJiBjaG93biAtUiBuZXh0anM6bm9kZWpzIC9ob21lL25leHRqcwoKIyBmZm1wZWcgOiBhZmZpY2hlcyBkZXMgdmlkw6lvcyBzdG9ja8OpZXMgc3VyIFIyIDsgbGliaGVpZiA6IHBob3RvcyBIRUlDIGQnaVBob25lIChzZXJ2aWNlIG1lZGlhRGVyaXZhdGl2ZXMpLgojIEFWQU5UIGxhIGNvcGllIGRlIGwnYXBwbGljYXRpb24gOiBjZXR0ZSBjb3VjaGUgKGxhIHBsdXMgbG91cmRlKSBuZSBjaGFuZ2UgcGFzIGQndW4gZMOpcGxvaWVtZW50IMOgCiMgbCdhdXRyZSBldCByZXN0ZSBlbiBjYWNoZSA7IGFwcsOocyBsYSBjb3BpZSwgZWxsZSDDqXRhaXQgcmVmYWl0ZSDDoCBjaGFxdWUgbW9kaWZpY2F0aW9uIGR1IGNvZGUuClJVTiBhcHQtZ2V0IHVwZGF0ZSBcCiAgJiYgYXB0LWdldCBpbnN0YWxsIC15IC0tbm8taW5zdGFsbC1yZWNvbW1lbmRzIGZmbXBlZyBsaWJoZWlmLWV4YW1wbGVzIFwK')
sub('Dockerfile', 'ICAmJiBybSAtcmYgL3Zhci9saWIvYXB0L2xpc3RzLyoKClVTRVIgbmV4dGpzCkVYUE9TRSAzMDAwCg==',
    'ICAmJiBybSAtcmYgL3Zhci9saWIvYXB0L2xpc3RzLyoKCkNPUFkgLS1mcm9tPWJ1aWxkZXIgLS1jaG93bj1uZXh0anM6bm9kZWpzIC9hcHAvYXBwcy93ZWIvLm5leHQvc3RhbmRhbG9uZSAuLwpDT1BZIC0tZnJvbT1idWlsZGVyIC0tY2hvd249bmV4dGpzOm5vZGVqcyAvYXBwL2FwcHMvd2ViLy5uZXh0L3N0YXRpYyAuL2FwcHMvd2ViLy5uZXh0L3N0YXRpYwpDT1BZIC0tZnJvbT1idWlsZGVyIC0tY2hvd249bmV4dGpzOm5vZGVqcyAvYXBwL2FwcHMvd2ViL3B1YmxpYyAuL2FwcHMvd2ViL3B1YmxpYwpDT1BZIC0tZnJvbT1idWlsZGVyIC0tY2hvd249bmV4dGpzOm5vZGVqcyAvb3B0L3NoYXJwIC4vbm9kZV9tb2R1bGVzL3NoYXJwCgpVU0VSIG5leHRqcwpFWFBPU0UgMzAwMAo=')
sub('docker-compose.sandbox.yml', 'ICAgICAgSldUX1NFQ1JFVDogInNhbmRib3gtZGVtby1qd3Qtc2VjcmV0LWNoYW5nZS1tZS1wbGVhc2UtMDEyMzQ1Njc4OSIKICAgICAgTkVYVEFVVEhfVVJMOiAiaHR0cDovL2xvY2FsaG9zdDozMDEwIgogICAgICBBUFBfU0hPUlRfTkFNRTogIkFLRkMiCiAgICAgIEFQUF9GVUxMX05BTUU6ICJBS0ZDIOKAlCBTYW5kYm94IGRlIGTDqW1vbnN0cmF0aW9uIgo=',
    'ICAgICAgSldUX1NFQ1JFVDogInNhbmRib3gtZGVtby1qd3Qtc2VjcmV0LWNoYW5nZS1tZS1wbGVhc2UtMDEyMzQ1Njc4OSIKICAgICAgTkVYVEFVVEhfVVJMOiAiaHR0cDovL2xvY2FsaG9zdDozMDEwIgogICAgICAjIEx1ZSBhdSBkw6ltYXJyYWdlIChsZSBidWlsZCBuZSBsYSByZcOnb2l0IHBhcykgOiBtw6l0YWRvbm7DqWVzLCBwbGFuIGR1IHNpdGUgZXQgcm9ib3RzLnR4dAogICAgICAjIGTDqXNpZ25lbnQgbGEgc2FuZGJveCwgcGFzIGxlIHNpdGUgZHUgY2x1Yi4KICAgICAgTkVYVF9QVUJMSUNfU0lURV9VUkw6ICJodHRwOi8vbG9jYWxob3N0OjMwMTAiCiAgICAgIEFQUF9TSE9SVF9OQU1FOiAiQUtGQyIKICAgICAgQVBQX0ZVTExfTkFNRTogIkFLRkMg4oCUIFNhbmRib3ggZGUgZMOpbW9uc3RyYXRpb24iCg==')
sub('eslint.config.mjs', 'aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBnbG9iYWxJZ25vcmVzIH0gZnJvbSAiZXNsaW50L2NvbmZpZyI7CmltcG9ydCBuZXh0Vml0YWxzIGZyb20gImVzbGludC1jb25maWctbmV4dC9jb3JlLXdlYi12aXRhbHMiOwppbXBvcnQgbmV4dFRzIGZyb20gImVzbGludC1jb25maWctbmV4dC90eXBlc2NyaXB0IjsKCmNvbnN0IGVzbGludENvbmZpZyA9IGRlZmluZUNvbmZpZyhbCiAgLi4ubmV4dFZpdGFscywKICAuLi5uZXh0VHMsCiAgLy8gT3ZlcnJpZGUgZGVmYXVsdCBpZ25vcmVzIG9mIGVzbGludC1jb25maWctbmV4dC4KICBnbG9iYWxJZ25vcmVzKFsKICAgIC8vIERlZmF1bHQgaWdub3JlcyBvZiBlc2xpbnQtY29uZmlnLW5leHQ6CiAgICAiLm5leHQvKioiLAogICAgIm91dC8qKiIsCiAgICAiYnVpbGQvKioiLAogICAgIm5leHQtZW52LmQudHMiLAogIF0pLApdKTsKCmV4cG9ydCBkZWZhdWx0IGVzbGludENvbmZpZzsK',
    'Ly8gQ29uZmlndXJhdGlvbiBFU0xpbnQgZGUgbGEgUkFDSU5FLCBwb3VyIHRvdXQgY2UgcXVpIHZpdCBob3JzIGRlIGFwcHMvd2ViIChwYWNrYWdlcy8qLCBlMmUvKSA6Ci8vIGNlbGxlIHF1ZSBsaXNlbnQgYHBucG0gbGludGAgKHNlY29uZGUgcGFzc2UpIGV0IGwnw6lkaXRldXIuIENlIHNvbnQgbGVzIHLDqGdsZXMgZHUgd2ViIOKAlCB1bmUgc2V1bGUKLy8gbGlzdGUgcG91ciB0b3V0IGxlIGTDqXDDtHQg4oCUIG1vaW5zIHVuZSByw6hnbGUgc2FucyBvYmpldCBpY2kgOiBgbm8taHRtbC1saW5rLWZvci1wYWdlc2AgY2hlcmNoZSB1bgovLyBkb3NzaWVyIHBhZ2VzLyBkZSBOZXh0IMOgIGxhIHJhY2luZSwgZXQgbCdhbm5vbmNlIGFic2VudCDDoCBjaGFxdWUgZmljaGllci4KaW1wb3J0IHdlYiBmcm9tICIuL2FwcHMvd2ViL2VzbGludC5jb25maWcubWpzIjsKCmV4cG9ydCBkZWZhdWx0IFsuLi53ZWIsIHsgcnVsZXM6IHsgIkBuZXh0L25leHQvbm8taHRtbC1saW5rLWZvci1wYWdlcyI6ICJvZmYiIH0gfV07Cg==')
sub('packages/config/app.ts', 'ZXhwb3J0IGNvbnN0IEFQUF9ST09UID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfQVBQX1NIT1JUX05BTUUgfHwgJ215X2FwcCc7',
    'LyoqCiAqIFJhY2luZSBkdSBzdG9ja2FnZSwgbHVlIHBhciBsZSBuYXZpZ2F0ZXVyIChleHBsb3JhdGV1cikgRVQgcGFyIGxlIGJhY2tlbmQgKGNvbnRleHRlIHRSUEMpIDoKICogYE5FWFRfUFVCTElDX2AsIGRvbmMgZmlnw6llIGF1IGJ1aWxkLiBNw6ptZSB2YWxldXIsIG3Dqm1lIHJlcGxpIHF1ZSBgQVBQX1NIT1JUX05BTUVgLCBsdWUgYXUKICogZMOpbWFycmFnZSBwYXIgaW5zdHJ1bWVudGF0aW9uLnRzIDogc2kgbCdhcmd1bWVudCBkZSBidWlsZCBtYW5xdWUsIGxlcyBkZXV4IHRvbWJlbnQgZCdhY2NvcmQuCiAqLwpleHBvcnQgY29uc3QgQVBQX1JPT1QgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19BUFBfU0hPUlRfTkFNRSB8fCAiQUtGQyI7')
print("  édits ok (9 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

# package.json : substitution par ancre (le fichier porte les dépendances ajoutées sur ta machine
# par pnpm add, que la comparaison exacte refuserait).
F=package.json
if ! git diff --quiet HEAD -- "$F"; then echo "❌ $F a des modifications non commitées"; restore; exit 1; fi
MODIFIED+=("$F")
python3 - "$F" <<'PY3' || { restore; exit 1; }
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
a = "eslint -c apps/web/eslint.config.mjs --rule '@next/next/no-html-link-for-pages: off' --max-warnings 0 packages/"
n = s.count(a)
if n != 1:
    print(f"❌ package.json : ancre du script lint trouvée {n} fois (attendu : 1)"); sys.exit(1)
open(p, "w", encoding="utf-8").write(s.replace(a, "eslint --max-warnings 0 packages/"))
PY3
[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm typecheck && pnpm lint"
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
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
fix(infra): racine de stockage par défaut alignée, pnpm du migrateur figé au build, couches Docker réordonnées

- NEXT_PUBLIC_APP_SHORT_NAME : défaut AKFC comme argument de build (sans défaut, ENV recevait une
  chaîne vide) et comme repli de packages/config/app.ts (était « my_app ») — un argument oublié ne
  fait plus chercher les fichiers sous une autre racine que celle que crée le serveur
- Migrateur : `corepack install` au build ; une migration en production ne télécharge plus pnpm
- Image de service : ffmpeg et libheif installés AVANT la copie de l'application ; la couche la plus
  lourde était refaite à chaque déploiement, elle reste désormais en cache
- .dockerignore : construction des tests (.next-e2e), tests et résultats, scripts apply-*.sh
- Sandbox : NEXT_PUBLIC_SITE_URL lue au démarrage (métadonnées et plan du site désignaient le site
  du club)
- eslint.config.mjs de la racine (celui de create-next-app, avec d'autres règles) : reprend celles
  du web ; `pnpm lint` et l'éditeur appliquent la même liste aux paquets et aux tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration. Serveur : git pull, puis docker compose up -d --build pour le site (la couche ffmpeg se refait une dernière fois)."