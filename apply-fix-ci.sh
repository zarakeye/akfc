#!/usr/bin/env bash
# CI : pnpm check et les tests de bout en bout à chaque push (GitHub Actions).
# Prérequis : apply-docs-ordre-disciplines.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-ci.sh  — puis git push.
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:".github/workflows/ci.yml" 2>/dev/null | grep -qF "name: Vérifications (pnpm check)"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Le menu « Nos disciplines » et la page Galeries le lisent dans une seule fonction" "apps/web/content/docs/dev/domaine/un-modele-qui-s-ouvre.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-docs-ordre-disciplines.sh"; exit 1; }
MODIFIED=()
EXPECT=()
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=(".github/workflows/ci.yml")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; rmdir -p ".github/workflows" 2>/dev/null || true; echo "  ↩ fichiers restaurés"; }
if grep -qF "name: Vérifications (pnpm check)" ".github/workflows/ci.yml" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR

mkdir -p ".github/workflows"
base64 -d > ".github/workflows/ci.yml" <<'B64'
IyBJbnTDqWdyYXRpb24gY29udGludWUgZCdBS0ZDIDogw6AgY2hhcXVlIHB1c2ggZXQgw6AgY2hh
cXVlIHB1bGwgcmVxdWVzdCwgbGEgbcOqbWUgY2hvc2UgcXVlIHN1ciBsZSBNYWMuCiMKIyAgIDEu
IFbDqXJpZmljYXRpb25zIDogcG5wbSBjaGVjayAoZ2FyZGVzIG1haXNvbiwgdHlwZWNoZWNrLCBs
aW50KSDigJQgY2UgcXVlIGxhbmNlbnQgbGVzIHNjcmlwdHMKIyAgICAgIGF2YW50IGNoYXF1ZSBj
b21taXQuCiMgICAyLiBUZXN0cyBkZSBib3V0IGVuIGJvdXQgOiBwbnBtIGUyZSwgY29udHJlIFBv
c3RncmVzLCBNaW5JTyBldCBNYWlscGl0IGTDqW1hcnLDqXMgZGVwdWlzCiMgICAgICBkb2NrZXIt
Y29tcG9zZS5kZXYueW1sLCBhdXggbcOqbWVzIGFkcmVzc2VzIHF1ZSBzdXIgbGUgTWFjIChlMmUv
ZW52Lm1qcykuCiMKIyBBdWN1biBzZWNyZXQgOiB0b3V0IGwnZW52aXJvbm5lbWVudCBkZSB0ZXN0
IGVzdCBmYWN0aWNlIGV0IGxvY2FsIMOgIGxhIG1hY2hpbmUgZGUgR2l0SHViLCBldAojIGUyZS9l
bnYubWpzIHJlZnVzZSB1bmUgYWRyZXNzZSBxdWkgbmUgc2VyYWl0IHBhcyBsb2NhbGUuIExlIHdv
cmtmbG93IG5lIGxpdCBxdWUgbGUgY29kZQojIChwZXJtaXNzaW9ucyBlbiBsZWN0dXJlIHNldWxl
KSBldCBuZSBkw6lwbG9pZSByaWVuIDogbGEgcHJvZHVjdGlvbiBuZSBzZSB0b3VjaGUgcXVlIGRl
cHVpcyBsZQojIHNlcnZldXIsIG1pZ3JhdGlvbiBkJ2Fib3JkLgojCiMgTGVzIGFjdGlvbnMgZXh0
ZXJuZXMgc29udCBmaWfDqWVzIMOgIHVuIGNvbW1pdCBwcsOpY2lzIChsZSBudW3DqXJvIGRlIHZl
cnNpb24gZW4gY29tbWVudGFpcmUpIDoKIyB1bmUgbm91dmVsbGUgdmVyc2lvbiwgbcOqbWUgcGnD
qWfDqWUsIG5lIHMnZXjDqWN1dGUgcGFzIHNhbnMgcXUnb24gbCdhaXQgY2hvaXNpZS4KCm5hbWU6
IENJCgpvbjoKICBwdXNoOgogIHB1bGxfcmVxdWVzdDoKICB3b3JrZmxvd19kaXNwYXRjaDoKCnBl
cm1pc3Npb25zOgogIGNvbnRlbnRzOiByZWFkCgojIERldXggcHVzaGVzIHJhcHByb2Now6lzIHN1
ciBsYSBtw6ptZSBicmFuY2hlIDogc2V1bCBsZSBkZXJuaWVyIHZhIGF1IGJvdXQuCmNvbmN1cnJl
bmN5OgogIGdyb3VwOiBjaS0ke3sgZ2l0aHViLnJlZiB9fQogIGNhbmNlbC1pbi1wcm9ncmVzczog
dHJ1ZQoKam9iczoKICBjaGVjazoKICAgIG5hbWU6IFbDqXJpZmljYXRpb25zIChwbnBtIGNoZWNr
KQogICAgcnVucy1vbjogdWJ1bnR1LTI0LjA0CiAgICB0aW1lb3V0LW1pbnV0ZXM6IDIwCiAgICBz
dGVwczoKICAgICAgLSB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QDNkM2M0MmU1YWFjNWJhODA1ODI1
ZGE3NjQxMGMxODEyNzNiYTkwYjEgIyB2Ny4wLjEKICAgICAgICB3aXRoOgogICAgICAgICAgcGVy
c2lzdC1jcmVkZW50aWFsczogZmFsc2UKICAgICAgIyBMYSB2ZXJzaW9uIGRlIHBucG0gdmllbnQg
ZHUgY2hhbXAgcGFja2FnZU1hbmFnZXIgZGUgcGFja2FnZS5qc29uLgogICAgICAtIHVzZXM6IHBu
cG0vYWN0aW9uLXNldHVwQDczZTQ2OTkyZTA1YjE5YWJkMzFmMmYzYzIwZTBlNzM3MGQ3NjIxMTUg
IyB2Ni4xLjEKICAgICAgLSB1c2VzOiBhY3Rpb25zL3NldHVwLW5vZGVAOTQ5ZmViMjQxM2Q2NDU4
Nzk0ZGNkMjQ5MWM0YmFiYmJjZTBjMTVjMSAjIHY3LjEuMAogICAgICAgIHdpdGg6CiAgICAgICAg
ICBub2RlLXZlcnNpb24tZmlsZTogLm52bXJjCiAgICAgICAgICBjYWNoZTogcG5wbQogICAgICAt
IG5hbWU6IETDqXBlbmRhbmNlcyAoZXhhY3RlbWVudCBjZWxsZXMgZHUgbG9ja2ZpbGUpCiAgICAg
ICAgcnVuOiBwbnBtIGluc3RhbGwgLS1mcm96ZW4tbG9ja2ZpbGUKICAgICAgLSBuYW1lOiBwbnBt
IGNoZWNrCiAgICAgICAgcnVuOiBwbnBtIGNoZWNrCgogIGUyZToKICAgIG5hbWU6IFRlc3RzIGRl
IGJvdXQgZW4gYm91dCAocG5wbSBlMmUpCiAgICBuZWVkczogY2hlY2sKICAgIHJ1bnMtb246IHVi
dW50dS0yNC4wNAogICAgdGltZW91dC1taW51dGVzOiA0MAogICAgc3RlcHM6CiAgICAgIC0gdXNl
czogYWN0aW9ucy9jaGVja291dEAzZDNjNDJlNWFhYzViYTgwNTgyNWRhNzY0MTBjMTgxMjczYmE5
MGIxICMgdjcuMC4xCiAgICAgICAgd2l0aDoKICAgICAgICAgIHBlcnNpc3QtY3JlZGVudGlhbHM6
IGZhbHNlCiAgICAgIC0gdXNlczogcG5wbS9hY3Rpb24tc2V0dXBANzNlNDY5OTJlMDViMTlhYmQz
MWYyZjNjMjBlMGU3MzcwZDc2MjExNSAjIHY2LjEuMQogICAgICAtIHVzZXM6IGFjdGlvbnMvc2V0
dXAtbm9kZUA5NDlmZWIyNDEzZDY0NTg3OTRkY2QyNDkxYzRiYWJiYmNlMGMxNWMxICMgdjcuMS4w
CiAgICAgICAgd2l0aDoKICAgICAgICAgIG5vZGUtdmVyc2lvbi1maWxlOiAubnZtcmMKICAgICAg
ICAgIGNhY2hlOiBwbnBtCiAgICAgIC0gbmFtZTogRMOpcGVuZGFuY2VzIChleGFjdGVtZW50IGNl
bGxlcyBkdSBsb2NrZmlsZSkKICAgICAgICBydW46IHBucG0gaW5zdGFsbCAtLWZyb3plbi1sb2Nr
ZmlsZQogICAgICAtIG5hbWU6IFNlcnZpY2VzIGRlIHRlc3QgKGJhc2UsIHN0b2NrYWdlLCBib8Ou
dGUgbWFpbCkKICAgICAgICBydW46IHwKICAgICAgICAgIGRvY2tlciBjb21wb3NlIC1mIGRvY2tl
ci1jb21wb3NlLmRldi55bWwgdXAgLWQgLS13YWl0IGRiIHN0b3JhZ2UgbWFpbAogICAgICAgICAg
IyBNaW5JTyBuJ2EgcGFzIGRlIGhlYWx0aGNoZWNrIGRhbnMgbGUgY29tcG9zZSA6IG9uIGF0dGVu
ZCBxdSdpbCByw6lwb25kZS4KICAgICAgICAgIGZvciBpIGluICQoc2VxIDEgMzApOyBkbwogICAg
ICAgICAgICBjdXJsIC1mc1MgaHR0cDovLzEyNy4wLjAuMTo5MjAwL21pbmlvL2hlYWx0aC9saXZl
ID4vZGV2L251bGwgJiYgYnJlYWsKICAgICAgICAgICAgc2xlZXAgMQogICAgICAgICAgZG9uZQog
ICAgICAgICAgY3VybCAtZnNTIGh0dHA6Ly8xMjcuMC4wLjE6OTIwMC9taW5pby9oZWFsdGgvbGl2
ZSA+L2Rldi9udWxsCiAgICAgIC0gbmFtZTogTmF2aWdhdGV1ciBkZXMgdGVzdHMgKENocm9taXVt
KQogICAgICAgIHJ1bjogcG5wbSBleGVjIHBsYXl3cmlnaHQgaW5zdGFsbCAtLXdpdGgtZGVwcyBj
aHJvbWl1bQogICAgICAtIG5hbWU6IHBucG0gZTJlCiAgICAgICAgcnVuOiBwbnBtIGUyZQogICAg
ICAtIG5hbWU6IFJhcHBvcnQgZGVzIHRlc3RzIChlbiBjYXMgZCfDqWNoZWMpCiAgICAgICAgaWY6
IGZhaWx1cmUoKQogICAgICAgIHVzZXM6IGFjdGlvbnMvdXBsb2FkLWFydGlmYWN0QGNmNDMwZTAz
MGRkYmI1YjBhYmY5M2QyMjk2MmY0NzUyZjM2NDZjZDkgIyB2Ny4wLjIKICAgICAgICB3aXRoOgog
ICAgICAgICAgbmFtZTogcmFwcG9ydC1lMmUKICAgICAgICAgIHBhdGg6IHwKICAgICAgICAgICAg
cGxheXdyaWdodC1yZXBvcnQvCiAgICAgICAgICAgIHRlc3QtcmVzdWx0cy8KICAgICAgICAgIHJl
dGVudGlvbi1kYXlzOiA3CiAgICAgICAgICBpZi1uby1maWxlcy1mb3VuZDogaWdub3JlCiAgICAg
IC0gbmFtZTogSm91cm5hdXggZGVzIHNlcnZpY2VzIChlbiBjYXMgZCfDqWNoZWMpCiAgICAgICAg
aWY6IGZhaWx1cmUoKQogICAgICAgIHJ1bjogZG9ja2VyIGNvbXBvc2UgLWYgZG9ja2VyLWNvbXBv
c2UuZGV2LnltbCBsb2dzIC0tdGFpbCAxMDAK
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
print("  édits ok (0 substitutions, 1 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== ce dont la CI aura besoin (lecture seule) =="
CI_OK=1
node -e 'const p=require("./package.json");const d={...p.dependencies,...p.devDependencies};const m=["@playwright/test","@aws-sdk/client-s3"].filter(n=>!d[n]);if(m.length){console.log("  ⚠ absents de package.json (racine) : "+m.join(", ")+" — les tests de bout en bout échoueront en CI");process.exit(1)}' || CI_OK=0
git diff --quiet HEAD -- package.json pnpm-lock.yaml .nvmrc 2>/dev/null || { echo "  ⚠ package.json, pnpm-lock.yaml ou .nvmrc ont des modifications non commitées : la CI ne verra que la version commitée"; CI_OK=0; }
pnpm install --frozen-lockfile --lockfile-only >/tmp/akfc_lock.log 2>&1 || { echo "  ⚠ pnpm-lock.yaml n'est pas à jour avec package.json : la CI s'arrêtera dès l'installation (lancer pnpm install, puis commiter le lockfile)"; CI_OK=0; }
[ "$CI_OK" = 1 ] && echo "  ✅ package.json, lockfile et .nvmrc prêts pour la CI"
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
CI : pnpm check et les tests de bout en bout à chaque push (GitHub Actions)

.github/workflows/ci.yml — à chaque push, sur une pull request, et à la main
(onglet Actions) :
1. vérifications : pnpm install --frozen-lockfile, puis pnpm check ;
2. tests de bout en bout (si 1 passe) : Postgres, MinIO et Mailpit depuis
   docker-compose.dev.yml (les adresses de e2e/env.mjs), Chromium, pnpm e2e ;
   en cas d'échec, rapport Playwright et journaux des services joints à
   l'exécution (7 jours).

Aucun secret, aucun déploiement : l'environnement de test est factice et
local à la machine de GitHub. Permissions en lecture seule ; actions externes
figées à un commit (version en commentaire) ; un push plus récent sur la même
branche annule l'exécution en cours.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration, rien à faire sur le serveur."
echo "Ensuite : git push — puis sur GitHub, onglet Actions : la première exécution démarre (≈ 20 min)."