#!/usr/bin/env bash
# Termine apply-docs-next-config.sh, arrêté au commit (git add sur des fichiers déjà retirés).
# Tout est appliqué et vérifié (check OK) : il ne reste qu'à committer.
# Usage (racine du repo) : bash finish-docs-next-config.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
if git show HEAD:apps/web/content/docs/dev/configuration/next-config.mdx >/dev/null 2>&1; then echo "Déjà commité."; exit 0; fi
[ -f apps/web/content/docs/dev/configuration/next-config.mdx ] || { echo "❌ chapitre absent : relancer apply-docs-next-config.sh"; exit 1; }
grep -q '"@next/mdx"' apps/web/package.json && { echo "❌ @next/mdx encore présent : relancer apply-docs-next-config.sh"; exit 1; }
[ ! -e apps/web/mdx.d.ts ] || { echo "❌ mdx.d.ts encore présent : relancer apply-docs-next-config.sh"; exit 1; }
git add apps/web/next.config.ts apps/web/src/mdx-components.tsx \
  apps/web/content/docs/dev/configuration/typescript-et-tsconfig.mdx \
  apps/web/content/docs/dev/configuration/next-config.mdx \
  apps/web/package.json pnpm-lock.yaml
# Les trois fichiers supprimés sont déjà enregistrés (git rm) par le premier script.
for f in apps/web/mdx/remark-flatten-mdx-attrs.mjs apps/web/mdx.d.ts apps/README-MDX-DOCS-SETUP.txt; do
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then git rm -q --cached "$f"; fi
done
echo "== fichiers du commit =="; git diff --cached --name-status | head -12
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
docs+build: chapitre « Next.js et next.config.ts » ; next.config nettoyé

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG