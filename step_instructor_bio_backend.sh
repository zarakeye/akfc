#!/usr/bin/env bash
#
# step_instructor_bio_backend.sh
#
# Incrément 1a — socle backend de la présentation des instructeurs.
# Testable seul, sans interface.
#
# ─── Le modèle ─────────────────────────────────────────────────────────────
#
# Un instructeur, ici, est un TITULAIRE : quelqu'un rattaché à au moins une
# discipline, un cours ou un stage. Ce critère EXISTE DÉJÀ dans
# `getInstructors` (le `OR` sur quatre relations d'enseignement) — on ne le
# redéfinit pas, on le réutilise. Une seule source de vérité, aucune notion
# d'« instructeur » qui puisse diverger d'une requête à l'autre.
#
# Deux champs seulement s'ajoutent à `User` :
#   - `instructorBio`   contenu de builder (JSON), comme les descriptions de
#                       discipline ; nullable, un instructeur peut ne pas
#                       encore s'être présenté ;
#   - `instructorOrder` entier nullable, pour choisir qui apparaît en premier
#                       sur la page ; repli sur le nom quand il est absent.
#
# `aboutMe` N'EST PAS touché : il existe, il est affiché sur le profil et
# édité par UpdateMeForm. La bio d'instructeur est un champ distinct — c'est
# précisément la collision qu'on a voulu écarter en vérifiant d'abord.
#
# ─── Deux procédures ───────────────────────────────────────────────────────
#
#   - `saveMyInstructorBio` : chacun édite LA SIENNE. La cible est
#     `ctx.sessionClient.user.id`, jamais un id reçu en entrée — un
#     instructeur ne peut pas écrire la bio d'un autre, la garde est
#     structurelle et non déclarative.
#   - `listPublicInstructors` : PUBLIQUE, elle alimente la page. Elle filtre
#     sur le critère de titulaire ET sur une bio non vide — pas de carte vide
#     pour un titulaire qui ne s'est pas encore présenté.
#
# ⚠️ Migration écrite à la main (pas de CREATEDB sur l'utilisateur Postgres).
# Ce script NE la lance PAS. Séquence :
#     bash step_instructor_bio_backend.sh   (écrit tout, échoue au typecheck)
#     pnpm prisma migrate deploy
#     pnpm prisma generate
#     bash step_instructor_bio_backend.sh   (reprend au typecheck, commite)
#
# Usage :
#   bash step_instructor_bio_backend.sh
#   AKFC_APPLY_ONLY=1 bash step_instructor_bio_backend.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
MIGDIR="prisma/migrations/20260724010000_instructor_bio"
ROUTER="packages/backend/src/modules/users/router.ts"

# ── Garde anti-double-application (AVANT prérequis) ────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$SCHEMA" "$ROUTER"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

if grep -q "listPublicInstructors" "$ROUTER"; then
  echo "✓ déjà appliqué (marqueur présent dans $ROUTER) — rien à faire"
  exit 0
fi

mkdir -p "$MIGDIR"

python3 - <<'PY'
import io, os

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

def create(path, content):
    assert not os.path.exists(path), "existe déjà : %s" % path
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(content)
    print("  + %s" % path)

SCHEMA = "prisma/schema.prisma"
MIGDIR = "prisma/migrations/20260724010000_instructor_bio"
ROUTER = "packages/backend/src/modules/users/router.ts"

# ── 1/4 : les deux champs sur User ────────────────────────────────────────
edit(SCHEMA, """  aboutMe               String?
  pseudo                String?
  avatar                String?""",
"""  aboutMe               String?
  pseudo                String?
  avatar                String?

  // Présentation publique d'un instructeur titulaire (page /about/instructeurs).
  // `instructorBio` = contenu de builder (JSON), meme format que les
  // descriptions de discipline. `instructorOrder` fixe l'ordre d'affichage ;
  // repli sur le nom quand il est nul. NB : distinct de `aboutMe`, qui reste
  // le texte simple du profil.
  instructorBio         Json?
  instructorOrder       Int?""")

# ── 2/4 : migration écrite à la main ──────────────────────────────────────
create("%s/migration.sql" % MIGDIR, '''-- Présentation publique des instructeurs titulaires.
-- Ecrite a la main : l'utilisateur Postgres du projet n'a pas CREATEDB.
ALTER TABLE "User" ADD COLUMN "instructorBio" JSONB;
ALTER TABLE "User" ADD COLUMN "instructorOrder" INTEGER;
''')

# ── 3/4 : la mutation d'auto-édition ──────────────────────────────────────
# Insérée juste avant getInstructors, pour que les procédures liées aux
# instructeurs se lisent ensemble.
edit(ROUTER, """  getInstructors: protectedProcedure.query(async ({ ctx }) => {""",
"""  /**
   * Un instructeur enregistre SA PROPRE présentation.
   *
   * La cible est toujours `ctx.sessionClient.user.id`, jamais un id reçu en
   * entrée : la garde « c'est mon profil » est structurelle. Aucune
   * permission d'administration n'entre en jeu — on n'édite que soi.
   *
   * `bio` accepte n'importe quel JSON (le document de builder) ou `null`
   * pour retirer sa présentation. L'ordre est optionnel.
   */
  saveMyInstructorBio: protectedProcedure
    .input(
      z.object({
        bio: z.any().nullable(),
        order: z.number().int().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          instructorBio: input.bio ?? Prisma.DbNull,
          ...(input.order !== undefined
            ? { instructorOrder: input.order }
            : {}),
        },
      });
      return { success: true };
    }),

  /**
   * La page publique des instructeurs titulaires.
   *
   * PUBLIQUE : elle alimente une page ouverte à tous. Deux filtres —
   *   1. titulaire : le MEME critere que `getInstructors` (rattachement a
   *      une discipline, un cours ou un stage). Reutilise, pas redefini.
   *   2. presente : `instructorBio` non nul, sinon on afficherait une carte
   *      vide pour un titulaire qui ne s'est pas encore decrit.
   *
   * Tri par `instructorOrder` (les nuls en dernier), puis par nom.
   */
  listPublicInstructors: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.user.findMany({
      where: {
        AND: [
          { instructorBio: { not: Prisma.DbNull } },
          {
            OR: [
              { disciplinesAsInstructor: { some: {} } },
              { coursesAsInstructor: { some: {} } },
              { stagesAsPrimaryAnimator: { some: {} } },
              { stagesAsAnimator: { some: {} } },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        avatar: true,
        instructorBio: true,
        instructorOrder: true,
      },
      orderBy: [
        { instructorOrder: { sort: "asc", nulls: "last" } },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
    return rows;
  }),

  getInstructors: protectedProcedure.query(async ({ ctx }) => {""")

# ── 4/4 : imports (publicProcedure, Prisma) ───────────────────────────────
edit(ROUTER, """import { router, protectedProcedure } from "@backend/trpc/core";""",
"""import { Prisma } from "@prisma/client";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";""")
PY

echo "✓ schéma, migration et procédures posés"
echo
echo "⚠️  La migration n'est PAS appliquée par ce script. Avant de commiter :"
echo "      pnpm prisma migrate deploy"
echo "      pnpm prisma generate"
echo "    puis relancer ce script."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  echo "  (si l'erreur porte sur instructorBio, le client Prisma n'est pas régénéré)"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(users): socle de la presentation des instructeurs titulaires

Deux champs sur User : instructorBio (contenu de builder, JSON) et
instructorOrder. Distincts de aboutMe, qui reste le texte simple du
profil.

saveMyInstructorBio : chacun edite la sienne, cible = utilisateur de
session, jamais un id recu. listPublicInstructors : publique, filtre
sur le critere de titulaire (le meme OR que getInstructors, reutilise)
et sur une bio non vide.

Migration ecrite a la main (pas de CREATEDB sur l'utilisateur Postgres)."

echo "✓ commité"
git log -1 --oneline