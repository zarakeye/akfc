#!/usr/bin/env bash
# Garde : la CLI Prisma, pnpm dev et le seed refusent une base (et un stockage) distants depuis un poste de développement.
# Prérequis : apply-docs-parcours.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-garde-prod.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"prisma/db-target.mjs" 2>/dev/null | grep -qF "export function assertLocalTarget"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "### Un parcours, numéroté" "apps/web/content/docs/dev/etude-de-cas/lancer-verifier-ecrire.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-parcours.sh"; exit 1; }
MODIFIED=("apps/web/src/instrumentation.ts" "prisma.config.ts")
EXPECT=("a88afbaf2f89:apps/web/src/instrumentation.ts" "5571dd634c5d:prisma.config.ts")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=("prisma/db-target.d.mts" "prisma/db-target.mjs")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "export function assertLocalTarget" "prisma/db-target.mjs" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR

mkdir -p "prisma"
base64 -d > "prisma/db-target.d.mts" <<'B64'
LyoqIFR5cGVzIGRlIHByaXNtYS9kYi10YXJnZXQubWpzIChnYXJkZSDCqyBwYXMgbGEgcHJvZHVj
dGlvbiBkZXB1aXMgdW4gcG9zdGUgZGUgZMOpdmVsb3BwZW1lbnQgwrspLiAqLwpleHBvcnQgZnVu
Y3Rpb24gaG9zdE9mKHVybDogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgbnVsbDsKZXhw
b3J0IGZ1bmN0aW9uIGFzc2VydExvY2FsVGFyZ2V0KHVybDogc3RyaW5nIHwgdW5kZWZpbmVkLCB3
aGF0OiBzdHJpbmcpOiB2b2lkOwo=
B64
mkdir -p "prisma"
base64 -d > "prisma/db-target.mjs" <<'B64'
Ly8gQHRzLWNoZWNrCmltcG9ydCB7IHBhdGhUb0ZpbGVVUkwgfSBmcm9tICJub2RlOnVybCI7Cgov
KioKICogR2FyZGUgwqsgcGFzIGxhIHByb2R1Y3Rpb24gZGVwdWlzIHVuIHBvc3RlIGRlIGTDqXZl
bG9wcGVtZW50IMK7LgogKgogKiBVbmUgbcOqbWUgY29uZmlndXJhdGlvbiAoLmVudikgc2VydCBs
YSBDTEkgUHJpc21hLCBsZSBzZWVkIGV0IGBwbnBtIGRldmAuIFVuIGZpY2hpZXIgY29wacOpIGR1
CiAqIHNlcnZldXIgc3VmZml0IHBvdXIgcXUndW5lIG1pZ3JhdGlvbiwgdW4gc2VlZCBvdSBsZSBk
w6ltYXJyYWdlIGR1IHNpdGUgbG9jYWwgw6ljcml2ZW50IGRhbnMgbGEgYmFzZQogKiBkZSBwcm9k
dWN0aW9uLCBzYW5zIHVuIG1vdC4gQ2V0dGUgZ2FyZGUgcmVnYXJkZSBPw5kgbcOobmUgbCdhZHJl
c3NlLCBldCByZWZ1c2UgY2UgcXVpIHNvcnQgZGUgbGEKICogbWFjaGluZSBvdSBkdSByw6lzZWF1
IERvY2tlciA6CiAqICAgLSBhY2NlcHTDqSA6IDEyNy4wLjAuMSwgbG9jYWxob3N0LCA6OjEgKGxh
IG1hY2hpbmUpIDsgdW4gbm9tIHNhbnMgcG9pbnQgKMKrIHBvc3RncmVzIMK7LAogKiAgICAgwqsg
cGdib3VuY2VyIMK7LCDCqyBkYiDCuykgOiB1biBzZXJ2aWNlIGR1IHLDqXNlYXUgRG9ja2VyLCBj
ZWx1aSBkdSBzZXJ2ZXVyIG91IGRlIGxhIHNhbmRib3ggOwogKiAgIC0gcmVmdXPDqSA6IHRvdXRl
IGF1dHJlIGFkcmVzc2UgSVAgb3UgdG91dCBub20gZGUgZG9tYWluZS4KICogQUtGQ19BTExPV19S
RU1PVEVfREI9MSBsw6h2ZSBsZSByZWZ1cywgcG91ciB1bmUgb3DDqXJhdGlvbiB2b3VsdWUgKGFm
ZmljaGUgdW4gYXZlcnRpc3NlbWVudCkuCiAqCiAqIFJhbmfDqSBkYW5zIHByaXNtYS8gOiBsJ8Op
dGFwZSBtaWdyYXRvciBkdSBEb2NrZXJmaWxlIGNvcGllIGNlIGRvc3NpZXIsIGxhIGdhcmRlIHkg
c3VpdCBwcmlzbWEuY29uZmlnLnRzLgogKiBMYW5jw6kgc2V1bCAoYG5vZGUgLS1lbnYtZmlsZT0u
ZW52IHByaXNtYS9kYi10YXJnZXQubWpzYCksIGlsIHbDqXJpZmllIERBVEFCQVNFX1VSTCBldCBS
Ml9FTkRQT0lOVC4KICovCgovKiogQHBhcmFtIHtzdHJpbmd9IGhvc3QgKi8KZnVuY3Rpb24gaXNM
b2NhbEhvc3QoaG9zdCkgewogIGNvbnN0IGggPSBob3N0LnJlcGxhY2UoL15cW3xcXSQvZywgIiIp
LnRvTG93ZXJDYXNlKCk7CiAgaWYgKGggPT09ICJsb2NhbGhvc3QiIHx8IGggPT09ICI6OjEiIHx8
IC9eMTI3XC5cZCtcLlxkK1wuXGQrJC8udGVzdChoKSkgcmV0dXJuIHRydWU7CiAgcmV0dXJuICFo
LmluY2x1ZGVzKCIuIikgJiYgIWguaW5jbHVkZXMoIjoiKSAmJiBoICE9PSAiIjsKfQoKLyoqCiAq
IEwnaMO0dGUgZCd1bmUgYWRyZXNzZSAoc2FucyBpZGVudGlmaWFudHMpLCBvdSBudWxsIHNpIGwn
YWRyZXNzZSBlc3QgdmlkZSBvdSBpbGxpc2libGUuCiAqIEBwYXJhbSB7c3RyaW5nIHwgdW5kZWZp
bmVkfSB1cmwKICovCmV4cG9ydCBmdW5jdGlvbiBob3N0T2YodXJsKSB7CiAgaWYgKCF1cmwpIHJl
dHVybiBudWxsOwogIHRyeSB7CiAgICByZXR1cm4gbmV3IFVSTCh1cmwpLmhvc3RuYW1lIHx8IG51
bGw7CiAgfSBjYXRjaCB7CiAgICByZXR1cm4gbnVsbDsKICB9Cn0KCi8qKgogKiBMw6h2ZSB1bmUg
ZXJyZXVyIHNpIGB1cmxgIG3DqG5lIGhvcnMgZGUgbGEgbWFjaGluZSBvdSBkdSByw6lzZWF1IERv
Y2tlci4gQWRyZXNzZSB2aWRlIDogcmllbiDDoAogKiBwcm90w6lnZXIgKGxhIGNvbnN0cnVjdGlv
biBkZSBsJ2ltYWdlIGfDqW7DqHJlIGxlIGNsaWVudCBQcmlzbWEgc2FucyBiYXNlKS4KICogQHBh
cmFtIHtzdHJpbmcgfCB1bmRlZmluZWR9IHVybAogKiBAcGFyYW0ge3N0cmluZ30gd2hhdCAgY2Ug
cXVpIGVzdCBwcm90w6lnw6ksIHBvdXIgbGUgbWVzc2FnZSAowqsgbGEgYmFzZSDCuywgwqsgbGUg
c3RvY2thZ2UgwrspCiAqLwpleHBvcnQgZnVuY3Rpb24gYXNzZXJ0TG9jYWxUYXJnZXQodXJsLCB3
aGF0KSB7CiAgY29uc3QgaG9zdCA9IGhvc3RPZih1cmwpOwogIGlmICghaG9zdCB8fCBpc0xvY2Fs
SG9zdChob3N0KSkgcmV0dXJuOwogIGlmIChwcm9jZXNzLmVudi5BS0ZDX0FMTE9XX1JFTU9URV9E
QiA9PT0gIjEiKSB7CiAgICBjb25zb2xlLndhcm4oYOKaoCAke3doYXR9IDogYWRyZXNzZSBkaXN0
YW50ZSAoJHtob3N0fSkgYXV0b3Jpc8OpZSBwYXIgQUtGQ19BTExPV19SRU1PVEVfREI9MWApOwog
ICAgcmV0dXJuOwogIH0KICB0aHJvdyBuZXcgRXJyb3IoCiAgICBgJHt3aGF0fSA6IGFkcmVzc2Ug
ZGlzdGFudGUgKCR7aG9zdH0pLCByZWZ1c8OpZSBkZXB1aXMgdW4gcG9zdGUgZGUgZMOpdmVsb3Bw
ZW1lbnQuXG5gICsKICAgICAgIiAgTGUgLmVudiB2aXNlIHNhbnMgZG91dGUgbGEgcHJvZHVjdGlv
biA6IHJlbWV0cyBsYSBjb25maWd1cmF0aW9uIGxvY2FsZSAoL2RvY3MvZGV2L2RlbWFycmVyL21p
c2UtZW4tcm91dGUpLFxuIiArCiAgICAgICIgIG91LCBwb3VyIHVuZSBvcMOpcmF0aW9uIHZvdWx1
ZSBzdXIgY2Ugc2VydmV1ciA6IEFLRkNfQUxMT1dfUkVNT1RFX0RCPTEuIiwKICApOwp9CgovLyBM
YW5jw6kgc2V1bCA6IHbDqXJpZmllIGxhIGJhc2UgZXQgbGUgc3RvY2thZ2UgZGUgbCdlbnZpcm9u
bmVtZW50IGNvdXJhbnQuCmlmIChwcm9jZXNzLmFyZ3ZbMV0gJiYgaW1wb3J0Lm1ldGEudXJsID09
PSBwYXRoVG9GaWxlVVJMKHByb2Nlc3MuYXJndlsxXSkuaHJlZikgewogIHRyeSB7CiAgICBhc3Nl
cnRMb2NhbFRhcmdldChwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwsICJMYSBiYXNlIik7CiAgICBh
c3NlcnRMb2NhbFRhcmdldChwcm9jZXNzLmVudi5ESVJFQ1RfREFUQUJBU0VfVVJMLCAiTGEgYmFz
ZSAoY29ubmV4aW9uIGRpcmVjdGUpIik7CiAgICBhc3NlcnRMb2NhbFRhcmdldChwcm9jZXNzLmVu
di5SMl9FTkRQT0lOVCwgIkxlIHN0b2NrYWdlIik7CiAgfSBjYXRjaCAoZXJyKSB7CiAgICBjb25z
b2xlLmVycm9yKGDinYwgJHtlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogZXJy
fWApOwogICAgcHJvY2Vzcy5leGl0KDEpOwogIH0KfQo=
B64

python3 - <<'PY'
import base64
spec_skip_done = False
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    if s.count(old) == 0 and s.count(new) == 1 and spec_skip_done: return  # déjà fait par un script précédent
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
sub('apps/web/src/instrumentation.ts', 'ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyKCkgewogIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgIT09ICJub2RlanMiKSByZXR1cm47CgogIGNvbnN0IHsgcHJpc21hIH0gPSBhd2FpdCBpbXBvcnQoIkBiYWNrZW5kL3ByaXNtYSIpOwo=',
    'ZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyKCkgewogIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgIT09ICJub2RlanMiKSByZXR1cm47CgogIC8vIGBwbnBtIGRldmAgbmUgZMOpbWFycmUgcGFzIHN1ciBsYSBiYXNlIG91IGxlIHN0b2NrYWdlIGRlIGxhIHByb2R1Y3Rpb24gOiBjZSBob29rIHkgw6ljcmlyYWl0IGTDqHMKICAvLyBsZSBkw6ltYXJyYWdlIChzZWdtZW50cywgZG9zc2llcnMsIGdyb3VwZXPigKYpLCBwdWlzIGNoYXF1ZSBhY3Rpb24gZHUgc2l0ZSBsb2NhbC4KICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICJkZXZlbG9wbWVudCIpIHsKICAgIGNvbnN0IHsgYXNzZXJ0TG9jYWxUYXJnZXQgfSA9IGF3YWl0IGltcG9ydCgiLi4vLi4vLi4vcHJpc21hL2RiLXRhcmdldC5tanMiKTsKICAgIHRyeSB7CiAgICAgIGFzc2VydExvY2FsVGFyZ2V0KHByb2Nlc3MuZW52LkRBVEFCQVNFX1VSTCwgIkxhIGJhc2UiKTsKICAgICAgYXNzZXJ0TG9jYWxUYXJnZXQocHJvY2Vzcy5lbnYuUjJfRU5EUE9JTlQsICJMZSBzdG9ja2FnZSIpOwogICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgIGNvbnNvbGUuZXJyb3IoYFxu4p2MICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IGVycn1cbmApOwogICAgICBwcm9jZXNzLmV4aXQoMSk7CiAgICB9CiAgfQoKICBjb25zdCB7IHByaXNtYSB9ID0gYXdhaXQgaW1wb3J0KCJAYmFja2VuZC9wcmlzbWEiKTsK')
sub('prisma.config.ts', 'aW1wb3J0ICdkb3RlbnYvY29uZmlnJwppbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICdwcmlzbWEvY29uZmlnJwoKZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHsK',
    'aW1wb3J0ICdkb3RlbnYvY29uZmlnJwppbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICdwcmlzbWEvY29uZmlnJwppbXBvcnQgeyBhc3NlcnRMb2NhbFRhcmdldCB9IGZyb20gJy4vcHJpc21hL2RiLXRhcmdldC5tanMnCgovLyBVbmUgY29tbWFuZGUgcXVpIHRvdWNoZSBsYSBiYXNlIChtaWdyYXRlLCBkYiwgc3R1ZGlv4oCmKSByZWZ1c2UgdW5lIGJhc2UgZGlzdGFudGUgOiB1biAuZW52IGNvcGnDqQovLyBkdSBzZXJ2ZXVyIG1pZ3JlcmFpdCBzaW5vbiBsYSBwcm9kdWN0aW9uIGRlcHVpcyB1biBwb3N0ZSBkZSBkw6l2ZWxvcHBlbWVudC4gYGdlbmVyYXRlYCwgYHZhbGlkYXRlYAovLyBldCBgZm9ybWF0YCBuZSBsaXNlbnQgcXVlIGxlIHNjaMOpbWEgOiBpbHMgcGFzc2VudCAobCdpbnN0YWxsYXRpb24gbGFuY2UgYHByaXNtYSBnZW5lcmF0ZWApLgpjb25zdCBTQ0hFTUFfT05MWSA9IFsnZ2VuZXJhdGUnLCAndmFsaWRhdGUnLCAnZm9ybWF0JywgJ3ZlcnNpb24nLCAnLS12ZXJzaW9uJywgJy12JywgJy0taGVscCcsICctaCddCmlmICghcHJvY2Vzcy5hcmd2LnNsaWNlKDIpLnNvbWUoKGFyZykgPT4gU0NIRU1BX09OTFkuaW5jbHVkZXMoYXJnKSkpIHsKICBhc3NlcnRMb2NhbFRhcmdldChwcm9jZXNzLmVudi5EQVRBQkFTRV9VUkwsICdMYSBiYXNlJykKICBhc3NlcnRMb2NhbFRhcmdldChwcm9jZXNzLmVudi5ESVJFQ1RfREFUQUJBU0VfVVJMLCAnTGEgYmFzZSAoY29ubmV4aW9uIGRpcmVjdGUpJykKfQoKZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHsK')
print("  édits ok (2 substitutions, 2 fichiers créés, 0 remplacés)")
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
a = '"db:seed:dev": "node --env-file=.env prisma/seed.sandbox.mjs",'
n = s.count(a)
if n != 1:
    print(f"❌ package.json : ancre du script db:seed:dev trouvée {n} fois (attendu : 1)"); sys.exit(1)
open(p, "w", encoding="utf-8").write(s.replace(a, '"db:seed:dev": "node --env-file=.env prisma/db-target.mjs && node --env-file=.env prisma/seed.sandbox.mjs",'))
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
Garde : pas la production depuis un poste de développement

prisma/db-target.mjs refuse une base ou un stockage distants (ni la machine,
ni un nom du réseau Docker) ; AKFC_ALLOW_REMOTE_DB=1 pour une opération
voulue. Appelée par prisma.config.ts (toute commande qui touche la base ;
generate, validate, format passent), par instrumentation.ts sous pnpm dev
(base et stockage : le serveur s'arrête), et par db:seed:dev. Rangée dans
prisma/ : l'étape migrator du Dockerfile la copie ; sur le serveur, la
migration vise postgres:5432 et passe.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration. Contrôle : node --env-file=.env prisma/db-target.mjs && echo base locale. Serveur : git pull, puis docker compose up -d --build akfc."