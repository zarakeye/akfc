#!/usr/bin/env bash
#
# step_site_pages_backend.sh
#
# Socle des pages de contenu éditoriales — première moitié du dernier
# incrément. La page « L'association », son éditeur et le menu
# « Qui sommes-nous ? » suivent dans un second script.
#
# ─── Pourquoi un modèle générique et non une page « association » ──────────
#
# Le menu demandé compte deux entrées : « L'association » et « Nos
# instructeurs ». La seconde existe déjà et se calcule (elle boucle sur les
# instructeurs titulaires). La première n'existe pas du tout : `/about` n'a
# jamais été créé, seul `/about/instructeurs` l'a été.
#
# Coder une page « association » en dur aurait résolu le cas du jour et rien
# d'autre. Or « L'histoire du club », « Le règlement », « Nous rejoindre »
# sont exactement le même besoin : un titre, un composite PageBuilder, une
# URL stable. `SitePage` couvre la famille entière au même prix.
#
# Sa clé primaire est le SLUG et non un entier auto-incrémenté : ces pages
# sont désignées par leur nom dans le code et dans les URLs (« association »),
# jamais par un rang. Un identifiant numérique aurait obligé à une table de
# correspondance mentale entre 1 et « association ».
#
# ─── L'énumération des types de page ───────────────────────────────────────
#
# `syncPageMediaReferences` classe ses références par `PageReferencerKind`.
# Une valeur `SITE_PAGE` y est ajoutée, sans quoi les images d'une page de
# contenu ne seraient rattachées à rien et passeraient pour orphelines — le
# piège déjà rencontré avec le résumé de discipline.
#
# Note : `ALTER TYPE … ADD VALUE` exige PostgreSQL 12 ou plus lorsqu'il
# s'exécute dans une transaction, ce que fait Prisma. La valeur ajoutée n'est
# pas UTILISÉE dans la même transaction, ce qui satisfait la seule restriction
# qui subsiste sur ces versions.
#
# ─── L'écriture n'exige pas de permission dédiée ───────────────────────────
#
# Il n'existe pas de permission « manage_site_pages », et en inventer une
# demanderait de la créer en base puis de l'attribuer — une permission absente
# refuse tout le monde, y compris toi. `siteStyle.save` a le même statut et se
# contente de `protectedProcedure` : je suis ce précédent. Une permission
# propre reste possible plus tard, quand elle pourra être semée proprement.
#
# Usage :
#   bash step_site_pages_backend.sh
#   AKFC_APPLY_ONLY=1 bash step_site_pages_backend.sh
#
set -euo pipefail

schema_file="prisma/schema.prisma"
router_file="packages/backend/src/modules/sitePages/router.ts"
modules_index="packages/backend/src/modules/index.ts"
migration_dir="prisma/migrations/20260730180000_site_pages"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "model SitePage" "$schema_file" 2>/dev/null; then
  echo "✓ déjà appliqué (modèle SitePage présent) — rien à faire"
  exit 0
fi

for f in "$schema_file" "$modules_index"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Migration ──────────────────────────────────────────────────────────────
mkdir -p "$migration_dir"
cat > "$migration_dir/migration.sql" <<'SQL'
-- Pages de contenu éditoriales (« L'association », « L'histoire du club »…).
--
-- La clé primaire est le slug : ces pages sont désignées par leur nom dans
-- les URLs et dans le code, jamais par un rang.

ALTER TYPE "PageReferencerKind" ADD VALUE 'SITE_PAGE';

CREATE TABLE "SitePage" (
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SitePage_pkey" PRIMARY KEY ("slug")
);
SQL
echo "  + migration 20260730180000_site_pages"

# ── Routeur ────────────────────────────────────────────────────────────────
mkdir -p "$(dirname "$router_file")"
cat > "$router_file" <<'TS'
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

import { pageContentSchemaV1 } from "@contracts/page";

/**
 * Pages de contenu éditoriales du site.
 *
 * Un titre, un composite PageBuilder, une URL stable. « L'association » en
 * est la première ; « L'histoire du club », « Le règlement » ou « Nous
 * rejoindre » sont le même besoin et n'en coûteront pas davantage.
 *
 * Lecture PUBLIQUE : ces pages sont la vitrine du club. Écriture protégée.
 */

/**
 * Slug d'une page de contenu.
 *
 * Contraint parce qu'il sert de clé primaire ET de segment d'URL : un slug
 * libre laisserait entrer des caractères qui casseraient l'un ou l'autre.
 */
const sitePageSlug = z
  .string()
  .regex(/^[a-z][a-z0-9-]{0,40}$/, "Slug de page non conforme");

export const sitePageRouter = router({
  /** La page demandée, ou `null` si elle n'a jamais été rédigée. */
  get: publicProcedure
    .input(z.object({ slug: sitePageSlug }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.sitePage.findUnique({ where: { slug: input.slug } });
    }),

  /**
   * Crée ou remplace une page.
   *
   * `protectedProcedure` sans permission nommée : il n'existe pas de
   * « manage_site_pages », et une permission absente de la base refuserait
   * tout le monde. `siteStyle.save` a le même statut — précédent suivi ici.
   */
  save: protectedProcedure
    .input(
      z.object({
        slug: sitePageSlug,
        title: z.string().trim().min(1).max(120),
        content: pageContentSchemaV1,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const saved = await tx.sitePage.upsert({
          where: { slug: input.slug },
          create: {
            slug: input.slug,
            title: input.title,
            content: input.content as Prisma.InputJsonValue,
          },
          update: {
            title: input.title,
            content: input.content as Prisma.InputJsonValue,
          },
        });

        // Sans cette synchronisation, les images d'une page de contenu ne
        // seraient rattachées à rien et passeraient pour orphelines — donc
        // éligibles au nettoyage. Le piège déjà rencontré sur le résumé de
        // discipline.
        await syncPageMediaReferences(tx, {
          pageType: "SITE_PAGE",
          pageId: input.slug,
          newContent: input.content,
        });

        return saved;
      });
    }),
});
TS
echo "  + sitePages/router.ts"

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

# ── 1/4 énumération ───────────────────────────────────────────────────────
edit("prisma/schema.prisma", """  DISCIPLINE  // ← AJOUT v2
  EVENT       // ← AJOUT v2
}""",
"""  DISCIPLINE  // ← AJOUT v2
  EVENT       // ← AJOUT v2
  SITE_PAGE   // pages de contenu éditoriales (« L'association »…)
}""")

# ── 2/4 modèle ────────────────────────────────────────────────────────────
edit("prisma/schema.prisma", """model SiteStyle {""",
"""/// Page de contenu éditoriale du site : un titre, un composite PageBuilder,
/// une URL stable. « L'association » en est la première.
///
/// La clé primaire est le SLUG et non un entier : ces pages sont désignées
/// par leur nom dans les URLs et dans le code, jamais par un rang.
model SitePage {
  /// Clé stable, également segment d'URL (« association »).
  slug String @id

  /// Titre affiché en tête de page.
  title String

  /// Contenu composite édité au PageBuilder, format `PageContentV1`.
  content Json @default("{\\"version\\":1,\\"blocks\\":[]}")

  updatedAt DateTime @updatedAt
}

model SiteStyle {""")

# ── 3/4 import du routeur ────────────────────────────────────────────────
edit("packages/backend/src/modules/index.ts",
"""import { siteStyleRouter } from "@backend/modules/siteStyle/router";""",
"""import { siteStyleRouter } from "@backend/modules/siteStyle/router";
import { sitePageRouter } from "@backend/modules/sitePages/router";""")

# ── 4/4 enregistrement ───────────────────────────────────────────────────
edit("packages/backend/src/modules/index.ts",
"""export const appRouter = router({
  siteStyle: siteStyleRouter,""",
"""export const appRouter = router({
  siteStyle: siteStyleRouter,
  sitePage: sitePageRouter,""")
PY

echo "✓ modèle, migration et routeur posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni migration, ni typecheck, ni commit."
  exit 0
fi

echo "→ migration (depuis la racine)…"
pnpm prisma migrate deploy || { echo "✗ migration échouée — rien n'est commité"; exit 1; }

echo "→ génération du client (depuis la racine)…"
pnpm prisma generate || { echo "✗ génération échouée — rien n'est commité"; exit 1; }

echo "→ vérification du client généré…"
generated_types="$(find node_modules -path '*.prisma/client/index.d.ts' 2>/dev/null | head -1 || true)"
if [ -z "$generated_types" ] || ! grep -q "SitePage" "$generated_types"; then
  echo "✗ le client généré ne connaît pas SitePage — rien n'est commité"
  exit 1
fi
echo "  ✓ client à jour"

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(site-pages): socle des pages de contenu editoriales

Le menu « Qui sommes-nous ? » demande deux entrees. « Nos instructeurs »
existe deja et se calcule. « L'association » n'existe pas du tout :
/about n'a jamais ete cree, seul /about/instructeurs l'a ete.

Coder une page « association » en dur aurait resolu le cas du jour et
rien d'autre. « L'histoire du club », « Le reglement », « Nous
rejoindre » sont le meme besoin : un titre, un composite PageBuilder,
une URL stable. SitePage couvre la famille au meme prix.

Cle primaire = le slug et non un entier : ces pages sont designees par
leur nom dans les URLs et dans le code, jamais par un rang.

PageReferencerKind gagne SITE_PAGE, sans quoi les images d'une page de
contenu ne seraient rattachees a rien et passeraient pour orphelines —
le piege deja rencontre sur le resume de discipline.

Ecriture en protectedProcedure sans permission nommee : il n'existe pas
de manage_site_pages, et une permission absente de la base refuserait
tout le monde. siteStyle.save a le meme statut."

echo "✓ commité"
git log -1 --oneline