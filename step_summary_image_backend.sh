#!/usr/bin/env bash
#
# step_summary_image_backend.sh
#
# Refonte de la présentation synthétique : une IMAGE choisie au picker, et un
# texte. Première moitié — le champ et sa plomberie. Le formulaire et la carte
# suivent dans un second script.
#
# ─── Pourquoi abandonner le bloc ───────────────────────────────────────────
#
# Un média-texte reste un BLOC, avec sa mise en page propre : ratios, côté,
# alternance, seuils de bascule. Pour une carte dont la disposition est fixe
# — image en haut, texte dessous — tout cela est du bagage inutile, et ce
# bagage s'est déjà retourné contre nous une fois.
#
# Deux champs distincts suppriment le problème à la racine : le contenu ne
# décide plus de rien, c'est la carte qui dispose. Un bloc ne peut plus
# « mal » se rendre puisqu'il n'y a plus de bloc.
#
# ─── Ce que devient `summary` ──────────────────────────────────────────────
#
# Il reste un `PageContentV1`, mais en TEXTE seul (le builder n'offrira que le
# bloc texte). Garder le format composite plutôt que passer à une chaîne
# préserve le texte riche — gras, liens, listes — et laisse `PageRenderer`
# s'appliquer sans exception.
#
# ─── Le champ image ────────────────────────────────────────────────────────
#
# `summaryMediaId` est un identifiant de `MediaAsset` en texte simple, et non
# une relation Prisma. C'est la convention déjà suivie par les blocs, qui
# stockent des `mediaId` bruts dans leur Json : introduire ici une clé
# étrangère créerait deux régimes de référence pour la même chose.
#
# ─── Le piège des références, encore ───────────────────────────────────────
#
# `syncPageMediaReferences` déduit les références du COMPOSITE. Une image
# rangée dans une colonne à part lui échapperait donc entièrement, et
# passerait pour orpheline — éligible au nettoyage.
#
# Le service accepte désormais des `extraMediaIds` : des identifiants
# référencés par la page sans passer par un bloc. C'est une extension et non
# un contournement — le besoin réapparaîtra dès qu'une entité portera une
# image hors composite (une vignette de stage, par exemple).
#
# Usage :
#   bash step_summary_image_backend.sh
#   AKFC_APPLY_ONLY=1 bash step_summary_image_backend.sh
#
set -euo pipefail

schema_file="prisma/schema.prisma"
sync_service="packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts"
disc_router="packages/backend/src/modules/disciplines/router.ts"
migration_dir="prisma/migrations/20260730200000_discipline_summary_image"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "summaryMediaId" "$schema_file" 2>/dev/null; then
  echo "✓ déjà appliqué (champ summaryMediaId présent) — rien à faire"
  exit 0
fi

for f in "$schema_file" "$sync_service" "$disc_router"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

mkdir -p "$migration_dir"
cat > "$migration_dir/migration.sql" <<'SQL'
-- Image de la carte de présentation synthétique d'une discipline.
--
-- Identifiant de MediaAsset en texte simple, sans clé étrangère : c'est la
-- convention déjà suivie par les blocs du PageBuilder, qui stockent des
-- mediaId bruts dans leur Json. Deux régimes de référence pour la même chose
-- seraient une source de confusion durable.
--
-- Nullable : une discipline peut n'avoir aucune image de carte.
ALTER TABLE "Discipline" ADD COLUMN "summaryMediaId" TEXT;
SQL
echo "  + migration 20260730200000_discipline_summary_image"

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

schema_file  = "prisma/schema.prisma"
sync_service = "packages/backend/src/modules/media/services/syncPageMediaReferences.service.ts"
disc_router  = "packages/backend/src/modules/disciplines/router.ts"

# ── 1/8 schéma ────────────────────────────────────────────────────────────
edit(schema_file, """  summary Json @default("{\\"version\\":1,\\"blocks\\":[]}")

  /// Catégorie d'appartenance (NOT NULL).""",
"""  summary Json @default("{\\"version\\":1,\\"blocks\\":[]}")

  /// Image de la carte de présentation synthétique.
  ///
  /// Identifiant de `MediaAsset` en texte simple et non relation Prisma :
  /// c'est la convention des blocs du PageBuilder, qui stockent des `mediaId`
  /// bruts. Deux régimes de référence pour la même chose seraient une source
  /// de confusion durable.
  summaryMediaId String?

  /// Catégorie d'appartenance (NOT NULL).""")

# ── 2/8 service de synchronisation : références hors composite ────────────
edit(sync_service, """  args: {
    pageType: PageReferencerKind;
    pageId: string;
    newContent: PageContentV1 | null;
  },
): Promise<{ added: string[]; removed: string[] }> {
  const { pageType, pageId, newContent } = args;""",
"""  args: {
    pageType: PageReferencerKind;
    pageId: string;
    newContent: PageContentV1 | null;
    /**
     * Médias référencés par la page SANS passer par un bloc — par exemple
     * l'image de carte d'une discipline, rangée dans une colonne à part.
     *
     * Sans eux, ces médias échapperaient au recensement et passeraient pour
     * orphelins, donc éligibles au nettoyage. Ignorés quand `newContent` est
     * `null` : ce cas signifie « la page disparaît », et tout doit alors
     * partir avec elle.
     */
    extraMediaIds?: readonly string[];
  },
): Promise<{ added: string[]; removed: string[] }> {
  const { pageType, pageId, newContent, extraMediaIds } = args;""")

edit(sync_service, """  const newRefs = new Set(extractMediaIdsFromContent(newContent));""",
"""  const newRefs = new Set([
    ...extractMediaIdsFromContent(newContent),
    ...(extraMediaIds ?? []),
  ]);""")

# ── 3/8 createInput ───────────────────────────────────────────────────────
edit(disc_router, """  summary: pageContentSchemaV1.optional(),

  categoryId: z.number().int().positive(),""",
"""  summary: pageContentSchemaV1.optional(),

  // Image de la carte d'accueil. Nullable : une discipline peut ne pas en
  // avoir, et la carte se rend alors sans illustration.
  summaryMediaId: z.string().min(1).nullable().optional(),

  categoryId: z.number().int().positive(),""")

# ── 4/8 updateInput ───────────────────────────────────────────────────────
edit(disc_router, """  // summary optional, même logique que description : non fourni = inchangé.
  summary: pageContentSchemaV1.optional(),""",
"""  // summary optional, même logique que description : non fourni = inchangé.
  summary: pageContentSchemaV1.optional(),

  // nullable + optional : permet d'attacher, de détacher, ou de ne pas
  // toucher, selon `undefined` vs `null` vs un identifiant.
  summaryMediaId: z.string().min(1).nullable().optional(),""")

# ── 5/8 create : écriture ─────────────────────────────────────────────────
edit(disc_router, """              summary:
                input.summary === undefined
                  ? undefined
                  : (input.summary as Prisma.InputJsonValue),
              categoryId: input.categoryId,""",
"""              summary:
                input.summary === undefined
                  ? undefined
                  : (input.summary as Prisma.InputJsonValue),
              summaryMediaId: input.summaryMediaId ?? null,
              categoryId: input.categoryId,""")

# ── 6/8 create : l'image compte parmi les références ──────────────────────
edit(disc_router, """          newContent: {
            version: 1,
            blocks: [
              ...input.description.blocks,
              ...(input.summary?.blocks ?? []),
            ],
          },
        });""",
"""          newContent: {
            version: 1,
            blocks: [
              ...input.description.blocks,
              ...(input.summary?.blocks ?? []),
            ],
          },
          // L'image de carte vit hors composite : sans cette ligne elle
          // échapperait au recensement et passerait pour orpheline.
          extraMediaIds: input.summaryMediaId ? [input.summaryMediaId] : [],
        });""")

# ── 7/8 update : écriture ─────────────────────────────────────────────────
edit(disc_router, """            summary:
              rest.summary === undefined
                ? undefined
                : (rest.summary as Prisma.InputJsonValue),
          };""",
"""            summary:
              rest.summary === undefined
                ? undefined
                : (rest.summary as Prisma.InputJsonValue),
            summaryMediaId: rest.summaryMediaId,
          };""")

# ── 8/8 update : la sync relit l'état réel, image comprise ────────────────
edit(disc_router, """        if (rest.description !== undefined || rest.summary !== undefined) {
          const row = await tx.discipline.findUnique({
            where: { id },
            select: { description: true, summary: true },
          });

          await syncPageMediaReferences(tx, {
            pageType: "DISCIPLINE",
            pageId: String(id),
            newContent: {
              version: 1,
              blocks: [
                ...parsePageContentV1(row?.description).blocks,
                ...parsePageContentV1(row?.summary).blocks,
              ],
            },
          });
        }""",
"""        if (
          rest.description !== undefined ||
          rest.summary !== undefined ||
          rest.summaryMediaId !== undefined
        ) {
          const row = await tx.discipline.findUnique({
            where: { id },
            select: {
              description: true,
              summary: true,
              summaryMediaId: true,
            },
          });

          await syncPageMediaReferences(tx, {
            pageType: "DISCIPLINE",
            pageId: String(id),
            newContent: {
              version: 1,
              blocks: [
                ...parsePageContentV1(row?.description).blocks,
                ...parsePageContentV1(row?.summary).blocks,
              ],
            },
            extraMediaIds: row?.summaryMediaId ? [row.summaryMediaId] : [],
          });
        }""")
PY

echo "✓ champ image, service et routeur posés"

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
if [ -z "$generated_types" ] || ! grep -q "summaryMediaId" "$generated_types"; then
  echo "✗ le client généré ne connaît pas summaryMediaId — rien n'est commité"
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
git commit -m "feat(disciplines): image de carte hors composite

La presentation synthetique abandonne le bloc au profit de deux champs
distincts : une image choisie au picker, et un texte.

Un media-texte reste un BLOC, avec sa mise en page propre — ratios,
cote, alternance, seuils. Pour une carte dont la disposition est fixe,
c'est du bagage inutile, et ce bagage s'est deja retourne contre nous.
Deux champs suppriment le probleme a la racine : le contenu ne decide
plus de rien, c'est la carte qui dispose.

summary reste un PageContentV1, mais en texte seul : garder le format
composite preserve le texte riche et laisse PageRenderer s'appliquer
sans exception.

summaryMediaId est un identifiant en texte simple et non une relation :
c'est la convention des blocs, qui stockent des mediaId bruts. Deux
regimes de reference pour la meme chose seraient une confusion durable.

syncPageMediaReferences accepte desormais des extraMediaIds — des
medias references par la page sans passer par un bloc. Sans eux,
l'image de carte echapperait au recensement et passerait pour
orpheline. Extension et non contournement : le besoin reapparaitra des
qu'une entite portera une image hors composite."

echo "✓ commité"
git log -1 --oneline