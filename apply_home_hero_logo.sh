#!/usr/bin/env bash
#
# AKFC — Logo centré et responsive en tête du hero de la page d'accueil.
#
# Placé DANS la section hero (au-dessus du titre « Bienvenue à l'AKFC »),
# pas dans un bloc intercalaire : le carousel n'affiche rien sans galerie
# « accueil », un bloc entre carousel et hero serait donc orphelin. Le logo
# en tête du hero tombe juste dans tous les cas. Bien visible sur mobile
# (h-24), réduit sur desktop (lg:h-20) où la navbar le porte déjà.
#
# Réutilise le même asset que la navbar (`/AKFC_logo.svg`, via next/image).
# Indépendant du retrait du bloc « Accès aux pages publiques » (autre endroit
# du fichier) : l'ordre d'application des deux scripts est libre.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-home-hero-logo.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-home-hero-logo.sh
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

if 'src="/AKFC_logo.svg"' in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) Import next/image ────────────────────────────────────────────────────
IMP_OLD = '''import Link from "next/link";'''
IMP_NEW = '''import Link from "next/link";
import Image from "next/image";'''
assert s.count(IMP_OLD) == 1, "ancre import Link introuvable/multiple — abandon"
s = s.replace(IMP_OLD, IMP_NEW)

# ── 2) Logo en tête du hero (au-dessus du H1) ───────────────────────────────
HERO_OLD = '''      {/* Intro */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Bienvenue à l&apos;AKFC</h1>'''
HERO_NEW = '''      {/* Intro */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        {/* Logo — plus visible qu'en navbar, surtout sur mobile ; réduit sur
            desktop (lg) où la navbar le porte déjà. */}
        <Image
          src="/AKFC_logo.svg"
          alt="AKFC logo"
          width={160}
          height={160}
          priority
          className="mx-auto mb-6 block h-24 w-auto sm:h-28 lg:h-20"
        />
        <h1 className="mb-4 text-4xl font-bold">Bienvenue à l&apos;AKFC</h1>'''
assert s.count(HERO_OLD) == 1, "ancre hero introuvable/multiple — abandon"
s = s.replace(HERO_OLD, HERO_NEW)

p.write_text(s, encoding="utf-8")
print("patch home OK (logo en tête du hero)")
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
if git commit -m "feat(home): logo centré responsive en tête du hero (visibilité mobile)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi