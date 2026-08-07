#!/usr/bin/env bash
#
# AKFC — Logo agrandi, inscrit dans un disque noir (hero de la home).
#
# Remplace le logo simple par un logo plus grand, enveloppé dans une div
# ronde (`rounded-full`) à fond noir (`bg-black`) avec du padding : le logo
# s'inscrit dans un disque noir. Tailles augmentées pour la lisibilité
# (h-48 mobile, h-56 sm, h-48 lg vs h-24/h-28/h-20 auparavant).
#
# ⚠️ Si le logo SVG est SOMBRE (traits noirs sur transparent), il disparaîtra
# sur fond noir. Ce script pose le fond noir tel que demandé ; si le rendu
# fait disparaître le logo, il faudra un variant clair du logo ou une autre
# couleur de disque (dis-le et j'ajuste).
#
# Suppose que le logo hero simple a déjà été appliqué (script précédent).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-home-hero-logo-disc.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-home-hero-logo-disc.sh
#
set -euo pipefail

PAGE="apps/web/src/app/(public)/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$PAGE" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($PAGE attendu)." >&2
  exit 1
fi

python3 - "$PAGE" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "rounded-full bg-black" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

OLD = '''        {/* Logo — plus visible qu'en navbar, surtout sur mobile ; réduit sur
            desktop (lg) où la navbar le porte déjà. */}
        <Image
          src="/AKFC_logo.svg"
          alt="AKFC logo"
          width={160}
          height={160}
          priority
          className="mx-auto mb-6 block h-24 w-auto sm:h-28 lg:h-20"
        />'''

NEW = '''        {/* Logo inscrit dans un disque noir — agrandi pour la lisibilité.
            Le disque (rounded-full + bg-black) fait cadre ; le padding donne
            l'impression que le logo s'inscrit dedans. */}
        <div className="mx-auto mb-6 h-48 w-48 rounded-full bg-black p-6 sm:h-56 sm:w-56 lg:h-48 lg:w-48">
          <Image
            src="/AKFC_logo.svg"
            alt="AKFC logo"
            width={224}
            height={224}
            priority
            className="h-full w-full object-contain"
          />
        </div>'''

assert s.count(OLD) == 1, "ancre logo hero introuvable/multiple — abandon (le logo simple a-t-il été appliqué ?)"
p.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("patch home OK (logo agrandi dans un disque noir)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(home): logo hero agrandi et inscrit dans un disque noir" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi