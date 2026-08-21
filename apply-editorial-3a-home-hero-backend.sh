#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R3a : hero d'Accueil (backend + conso).
#
#   - Modèle `HomeHero { id @default("home"), title, body }` (singleton) + migration.
#   - Router `homeHero` : get (public) + save (protégé, upsert).
#   - Page d'accueil : le <h1> et le <p> du hero consomment title/body de HomeHero,
#     avec le TEXTE ACTUEL en repli. AUCUN autre changement de structure.
#
# ⚠️ MIGRATION → après : `pnpm prisma migrate deploy` (local + serveur). Le script
# fait `prisma generate` avant le typecheck.
# Prérequis : aucun (indépendant). Le formulaire d'édition vient en R3b.
# Usage : bash apply-editorial-3a-home-hero-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-3a-home-hero-backend.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/homeHero/router.ts"
INDEX="packages/backend/src/modules/index.ts"
HOME="apps/web/src/app/(public)/page.tsx"
MIG_DIR="prisma/migrations/20261021000000_home_hero"

for f in "package.json" "$SCHEMA" "$INDEX" "$HOME"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── schéma : modèle HomeHero ────────────────────────────────────────────────
if grep -q "model HomeHero" "$SCHEMA"; then
  echo "modèle déjà présent"
else
  cat >> "$SCHEMA" <<'PRISMA'

/// Hero de la page d'accueil (singleton, id="home") : uniquement le titre et le
/// corps affichés dans la section d'intro. Le reste de la page d'accueil est en
/// dur (structure figée). La publication de la page / passe par PageVisibility.
model HomeHero {
  id    String @id @default("home")
  title String
  body  String
}
PRISMA
  echo "modèle HomeHero ajouté au schéma"
fi

# ── migration ───────────────────────────────────────────────────────────────
if [ ! -d "$MIG_DIR" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- CreateTable
CREATE TABLE "HomeHero" (
    "id" TEXT NOT NULL DEFAULT 'home',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "HomeHero_pkey" PRIMARY KEY ("id")
);
SQL
  echo "migration écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente"
fi

# ── router homeHero ─────────────────────────────────────────────────────────
mkdir -p "$(dirname "$ROUTER")"
cat > "$ROUTER" <<'TS'
import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";

const HOME_ID = "home";

/**
 * Hero de la page d'accueil (titre + corps). Lecture publique (la page / le
 * consomme) ; écriture protégée — même statut que sitePage.save / siteStyle.save
 * (pas de permission nommée).
 */
export const homeHeroRouter = router({
  get: publicProcedure.query(({ ctx }) =>
    ctx.prisma.homeHero.findUnique({ where: { id: HOME_ID } }),
  ),

  save: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(120),
        body: z.string().trim().max(2000),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.homeHero.upsert({
        where: { id: HOME_ID },
        create: { id: HOME_ID, title: input.title, body: input.body },
        update: { title: input.title, body: input.body },
      }),
    ),
});
TS
echo "router écrit : $ROUTER"

# ── enregistrement appRouter ────────────────────────────────────────────────
python3 - "$INDEX" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "homeHeroRouter" in s:
    print("appRouter déjà à jour"); sys.exit(0)
imp = 'import { memberGroupRouter } from "@backend/modules/memberGroups/router";'
assert s.count(imp) == 1, "ancre import (memberGroupRouter) introuvable"
s = s.replace(imp, imp + '\nimport { homeHeroRouter } from "@backend/modules/homeHero/router";')
reg = "export const appRouter = router({\n"
assert s.count(reg) == 1, "ancre appRouter introuvable"
s = s.replace(reg, reg + "  homeHero: homeHeroRouter,\n")
p.write_text(s, encoding="utf-8")
print("appRouter patché (homeHero)")
PY

# ── page d'accueil : consommer title/body du hero (repli = texte actuel) ─────
python3 - "$HOME" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "homeHero" in s:
    print("page d'accueil déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# fetch juste avant le return
s = sub(
    '  return (\n    <div className="flex flex-col">',
    '  const homeHero = await prisma.homeHero.findUnique({\n'
    '    where: { id: "home" },\n'
    '  });\n'
    '\n'
    '  return (\n    <div className="flex flex-col">',
    "fetch homeHero")

# titre du hero
s = sub(
    '<h1 className="mb-4 text-4xl font-bold">Bienvenue à l&apos;AKFC</h1>',
    '<h1 className="mb-4 text-4xl font-bold">\n'
    '          {homeHero?.title ?? "Bienvenue à l\'AKFC"}\n'
    '        </h1>',
    "titre hero")

# corps du hero
s = sub(
    '        <p className="mb-8 text-lg text-gray-600">\n'
    '          Un club dédié à la pratique et à la transmission des arts martiaux et\n'
    '          de leur culture, pour tous les âges et tous les niveaux. Découvrez nos\n'
    '          disciplines, nos stages et la vie du club.\n'
    '        </p>',
    '        <p className="mb-8 whitespace-pre-line text-lg text-gray-600">\n'
    '          {homeHero?.body ??\n'
    '            "Un club dédié à la pratique et à la transmission des arts martiaux et de leur culture, pour tous les âges et tous les niveaux. Découvrez nos disciplines, nos stages et la vie du club."}\n'
    '        </p>',
    "corps hero")

p.write_text(s, encoding="utf-8")
print("page d'accueil patchée (hero dynamique, repli conservé)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -5 /tmp/akfc_gen.log; exit 1; }

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(home): hero éditable (HomeHero) consommé par l'accueil, structure inchangée" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  MIGRATION : 'pnpm prisma migrate deploy' (local + serveur). Sans HomeHero enregistré, le hero garde son texte actuel (repli). Le formulaire d'édition = R3b."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi