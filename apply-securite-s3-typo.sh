#!/usr/bin/env bash
# Sécurité, suite : deux des cinq alertes restantes de pnpm audit.
# - @aws-sdk/client-s3 et s3-request-presigner 3.1169 : leurs dernières versions n'utilisent plus
#   fast-xml-parser (alerte basse, dans la lecture des réponses de R2) ;
# - @tailwindcss/typography embarque postcss-selector-parser 6.0.10 (alerte modérée, construction
#   du CSS) : un forçage pnpm CIBLÉ sur ce seul parent impose la 6.1.6, de la même branche.
# Les trois autres (Prisma 6, ESLint, HeroUI) restent : rien d'exploitable par un visiteur.
# Relance pnpm install (réseau), puis pnpm check, puis commit. Pas de migration. ARRÊTE pnpm dev avant.
# Prérequis : apply-tablib-197.sh.
# Usage (racine du repo AKFC) : bash apply-securite-s3-typo.sh
set -euo pipefail

S3=3.1169.0
FILES=(package.json apps/web/package.json packages/backend/package.json)

[ -f packages/backend/package.json ] && [ -f pnpm-lock.yaml ] || { echo "❌ Lance le script à la racine du repo AKFC."; exit 1; }
grep -q '"react-ts-tab-lib": "^1.9.7"' apps/web/package.json || { echo "❌ Lance d'abord apply-tablib-197.sh."; exit 1; }

# Garde anti-double-application.
if grep -q '"@tailwindcss/typography>postcss-selector-parser"' package.json; then echo "Déjà fait."; exit 0; fi

[ -z "$(git status --porcelain -- "${FILES[@]}" pnpm-lock.yaml)" ] || {
  echo "❌ un des package.json ou pnpm-lock.yaml a des modifications non commitées."; exit 1; }

for f in "${FILES[@]}" pnpm-lock.yaml; do cp "$f" "/tmp/akfc_bak_$(echo "$f" | tr / _)"; done
restore() { for f in "${FILES[@]}" pnpm-lock.yaml; do cp "/tmp/akfc_bak_$(echo "$f" | tr / _)" "$f"; done; }
PNPM_I="pnpm install --config.confirmModulesPurge=false"
reinstall_old() { $PNPM_I --frozen-lockfile > /dev/null 2>&1 || true; }

python3 - "$S3" <<'PY'
import re, sys
s3 = sys.argv[1]

def edit(path, pairs):
    s = open(path).read()
    for pattern, repl in pairs:
        n = len(re.findall(pattern, s))
        assert n == 1, f"{path} : ancre {pattern!r} trouvée {n} fois (il en faut une)"
        s = re.sub(pattern, repl, s)
    open(path, "w").write(s)
    print(f"  {path} modifié")

# Le web et le backend importent tous deux le client S3 : mêmes versions, sinon deux jeux de types
# @smithy se croisent et le typecheck échoue.
for path in ("apps/web/package.json", "packages/backend/package.json"):
    edit(path, [
        (r'"@aws-sdk/client-s3": "\^3\.\d+\.\d+"', f'"@aws-sdk/client-s3": "^{s3}"'),
        (r'"@aws-sdk/s3-request-presigner": "\^3\.\d+\.\d+"', f'"@aws-sdk/s3-request-presigner": "^{s3}"'),
    ])
# Racine : seulement par ancres (le client S3 de l'outillage, et le bloc des forçages).
edit("package.json", [
    (r'"@aws-sdk/client-s3": "\^3\.\d+\.\d+"', f'"@aws-sdk/client-s3": "^{s3}"'),
    (r'("@tiptap/core": "[^"]+")(\n\s*\})', r'\1,\n      "@tailwindcss/typography>postcss-selector-parser": "^6.1.6"\2'),
])
PY

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans installation, vérification ni commit)."; exit 0; }

echo "== pnpm install =="
if ! $PNPM_I > /tmp/akfc_install.log 2>&1; then
  echo "❌ pnpm install :"; tail -12 /tmp/akfc_install.log; restore; reinstall_old; exit 1
fi
if grep -qE "^  fast-xml-parser@" pnpm-lock.yaml; then echo "  ⚠️  fast-xml-parser est encore dans le lockfile"; else echo "  ✅ fast-xml-parser parti"; fi
PSP=$(grep -oE "^  postcss-selector-parser@6\.[0-9.]+" pnpm-lock.yaml | cut -d@ -f2 | tr '\n' ' ')
echo "  postcss-selector-parser (branche 6) : ${PSP:-aucune}"

echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && node scripts/check-doc-snippets.mjs && node scripts/check-doc-components.mjs && node scripts/check-doc-installs.mjs && node scripts/check-next-unique.mjs && pnpm typecheck && pnpm lint"
else
  CHECK="pnpm check"
fi
if ! bash -c "$CHECK" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|✗ |ERR_|Error:" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -15
  restore; reinstall_old; exit 1
fi
echo "  ✅ check OK"

git add -- "${FILES[@]}" pnpm-lock.yaml
git commit -q -F - <<'MSG'
Sécurité : client S3 3.1169 (sans fast-xml-parser), postcss-selector-parser 6.1.6 pour la typographie Tailwind

- @aws-sdk/client-s3 et s3-request-presigner : leurs dernières versions n'utilisent plus
  fast-xml-parser ;
- @tailwindcss/typography embarque postcss-selector-parser 6.0.10 : un forçage pnpm ciblé
  sur ce seul parent impose la 6.1.6, de la même branche (les autres utilisateurs du paquet
  ne sont pas touchés).
Restent, en connaissance de cause : deepmerge-ts (Prisma 6), minimatch (ESLint), deepmerge
(HeroUI) — outillage ou absence de correctif, rien d'exploitable par un visiteur.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "✅ commit $(git rev-parse --short HEAD)"
echo "== pnpm audit =="
pnpm audit 2>/dev/null | tail -2 || true
echo "Ensuite : redémarrer pnpm dev, puis git push. Serveur : git pull, puis docker compose up -d --build akfc."