#!/usr/bin/env bash
#
# step_discipline_summary_backend.sh
#
# Incrément 1/3 — le champ « présentation synthétique » d'une discipline.
#
# Découpage du chantier :
#   1/3  ce script : le champ, sa migration, sa plomberie tRPC ;
#   2/3  le builder restreint dans le formulaire de discipline ;
#   3/3  la carte d'accueil, puis le menu « Qui sommes-nous ? ».
#
# ─── Le champ ──────────────────────────────────────────────────────────────
#
# `summary` se calque exactement sur `description` : un `Json` en
# `PageContentV1`, avec le même composite vide par défaut. Aucune conversion,
# aucun cas nullable à traiter en aval, et `PageRenderer` s'y applique tel
# quel.
#
# Un résumé vide (`blocks: []`) vaut « pas de présentation synthétique ». Cela
# donne à l'admin un interrupteur naturel pour l'accueil — rédiger, c'est
# figurer ; laisser vide, c'est ne pas figurer — sans ajouter de booléen.
# C'est le même principe que la bio d'instructeur.
#
# ─── Le piège des références média, et il est sérieux ──────────────────────
#
# `syncPageMediaReferences` recalcule TOUT l'ensemble des références d'une
# page à partir du composite qu'on lui passe. Lui donner la seule description
# effacerait donc les références du résumé, et inversement : les images du
# résumé passeraient pour orphelines et seraient éligibles au nettoyage.
#
# La sync reçoit donc l'UNION des deux composites. Et pour que ce soit vrai
# quel que soit le champ modifié, l'update relit la ligne APRÈS l'écriture
# plutôt que de raisonner sur ce qui a été fourni : l'union est alors
# forcément celle de l'état réel, sans cas particulier à oublier.
#
# ─── Migration écrite à la main ────────────────────────────────────────────
#
# L'utilisateur Postgres du projet n'a pas CREATEDB, donc pas de
# `migrate dev` : le SQL est écrit à la main et appliqué par
# `migrate deploy`. Le script s'en charge, puis régénère le client Prisma —
# sans quoi le typecheck backend échouerait sur un champ que les types ne
# connaissent pas encore.
#
# Usage :
#   bash step_discipline_summary_backend.sh
#   AKFC_APPLY_ONLY=1 bash step_discipline_summary_backend.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/disciplines/router.ts"
MIGDIR="prisma/migrations/20260730120000_discipline_summary"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "summary" "$SCHEMA" 2>/dev/null; then
  echo "✓ déjà appliqué (champ summary présent) — rien à faire"
  exit 0
fi

for f in "$SCHEMA" "$ROUTER"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── La migration ───────────────────────────────────────────────────────────
mkdir -p "$MIGDIR"
cat > "$MIGDIR/migration.sql" <<'SQL'
-- Présentation synthétique d'une discipline, destinée à la page d'accueil.
--
-- Même forme que "description" : un composite PageContentV1 sérialisé, avec
-- un composite VIDE par défaut. NOT NULL + DEFAULT permet d'ajouter la
-- colonne sans backfill : les disciplines existantes reçoivent le composite
-- vide, qui signifie « pas de présentation synthétique ».
ALTER TABLE "Discipline"
  ADD COLUMN "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}';
SQL
echo "  + migration 20260730120000_discipline_summary"

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

SCHEMA = "prisma/schema.prisma"
ROUTER = "packages/backend/src/modules/disciplines/router.ts"

# ── 1/6 schéma Prisma ─────────────────────────────────────────────────────
edit(SCHEMA, """  description Json @default("{\\"version\\":1,\\"blocks\\":[]}")

  /// Catégorie d'appartenance (NOT NULL).""",
"""  description Json @default("{\\"version\\":1,\\"blocks\\":[]}")

  /// Présentation SYNTHÉTIQUE de la discipline, éditée au PageBuilder
  /// restreint (bloc « texte enrobant une image » uniquement).
  /// Alimente la carte de la page d'accueil, qui renvoie vers la page
  /// complète construite depuis `description`.
  ///
  /// Même format que `description` (`PageContentV1`) : aucune conversion, et
  /// `PageRenderer` s'y applique tel quel. Un composite VIDE signifie « pas
  /// de présentation synthétique » — c'est l'interrupteur d'apparition sur
  /// l'accueil, sans booléen supplémentaire.
  summary Json @default("{\\"version\\":1,\\"blocks\\":[]}")

  /// Catégorie d'appartenance (NOT NULL).""")

# ── 2/6 import de parsePageContentV1 ──────────────────────────────────────
edit(ROUTER, """import { pageContentSchemaV1 } from "@contracts/page";""",
"""import { pageContentSchemaV1, parsePageContentV1 } from "@contracts/page";""")

# ── 3/6 createInput ───────────────────────────────────────────────────────
edit(ROUTER, """  description: pageContentSchemaV1,

  categoryId: z.number().int().positive(),""",
"""  description: pageContentSchemaV1,

  // Présentation synthétique pour l'accueil. Optionnelle : la colonne a un
  // composite vide par défaut, et un formulaire qui ne la renseigne pas doit
  // continuer de fonctionner.
  summary: pageContentSchemaV1.optional(),

  categoryId: z.number().int().positive(),""")

# ── 4/6 updateInput ───────────────────────────────────────────────────────
edit(ROUTER, """  description: pageContentSchemaV1.optional(),

  instructorId: z.string().trim().min(1).optional(),""",
"""  description: pageContentSchemaV1.optional(),

  // summary optional, même logique que description : non fourni = inchangé.
  summary: pageContentSchemaV1.optional(),

  instructorId: z.string().trim().min(1).optional(),""")

# ── 5/6 create : écriture + sync sur l'UNION ──────────────────────────────
edit(ROUTER, """              description: input.description as Prisma.InputJsonValue,
              categoryId: input.categoryId,""",
"""              description: input.description as Prisma.InputJsonValue,
              summary:
                input.summary === undefined
                  ? undefined
                  : (input.summary as Prisma.InputJsonValue),
              categoryId: input.categoryId,""")

edit(ROUTER, """        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(created.id),
          newContent: input.description,
        });""",
"""        // UNION des deux composites. `syncPageMediaReferences` recalcule
        // l'ensemble COMPLET des références de la page : ne lui passer que la
        // description ferait passer les images du résumé pour orphelines.
        await syncPageMediaReferences(tx, {
          pageType: "DISCIPLINE",
          pageId: String(created.id),
          newContent: {
            version: 1,
            blocks: [
              ...input.description.blocks,
              ...(input.summary?.blocks ?? []),
            ],
          },
        });""")

# ── 6/6 update : écriture + sync sur l'union relue APRÈS écriture ─────────
edit(ROUTER, """            description:
              rest.description === undefined
                ? undefined
                : (rest.description as Prisma.InputJsonValue),
          };""",
"""            description:
              rest.description === undefined
                ? undefined
                : (rest.description as Prisma.InputJsonValue),
            summary:
              rest.summary === undefined
                ? undefined
                : (rest.summary as Prisma.InputJsonValue),
          };""")

edit(ROUTER, """        // La sync n'est appelée que si l'update a effectivement touché à
        // la description. Si l'admin met juste à jour `name` ou `family`,
        // les références médias n'ont pas changé.
        if (rest.description !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "DISCIPLINE",
            pageId: String(id),
            newContent: rest.description,
          });
        }""",
"""        // La sync n'est appelée que si l'update a touché à l'un des deux
        // composites. Si l'admin met juste à jour `name` ou `family`, les
        // références médias n'ont pas changé.
        //
        // On relit la ligne APRÈS l'écriture plutôt que de raisonner sur ce
        // qui a été fourni : l'union porte alors sur l'état réel, quel que
        // soit le champ modifié, et il n'y a aucun cas particulier à oublier.
        // La sync recalculant l'ensemble COMPLET des références de la page,
        // lui passer un seul des deux composites effacerait les références de
        // l'autre.
        if (rest.description !== undefined || rest.summary !== undefined) {
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
        }""")
PY

echo "✓ schéma, migration et routeur posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni migration, ni typecheck, ni commit."
  exit 0
fi

# ── Migration puis régénération du client ──────────────────────────────────
# Sans `generate`, le typecheck backend échouerait sur un champ que les types
# Prisma ne connaissent pas encore.
echo "→ application de la migration…"
if ! pnpm --filter backend prisma migrate deploy; then
  echo "✗ migration non appliquée — rien n'est commité"
  exit 1
fi

echo "→ régénération du client Prisma…"
if ! pnpm --filter backend prisma generate; then
  echo "✗ génération du client échouée — rien n'est commité"
  exit 1
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(disciplines): champ de presentation synthetique

Premier des trois increments : le champ, sa migration, sa plomberie.

summary se calque exactement sur description — un Json en PageContentV1
avec le meme composite vide par defaut. Aucune conversion, aucun cas
nullable en aval, PageRenderer s'y applique tel quel. Un composite vide
vaut « pas de presentation synthetique » : c'est l'interrupteur
d'apparition sur l'accueil, sans booleen supplementaire, comme la bio
d'instructeur.

Piege traite : syncPageMediaReferences recalcule l'ensemble COMPLET des
references d'une page. Lui passer un seul des deux composites ferait
passer les images de l'autre pour orphelines. La sync recoit donc leur
UNION, et l'update relit la ligne APRES ecriture plutot que de
raisonner sur ce qui a ete fourni — l'union porte alors sur l'etat
reel, sans cas particulier a oublier.

Migration ecrite a la main (utilisateur Postgres sans CREATEDB) et
appliquee par migrate deploy, suivie d'un generate."

echo "✓ commité"
git log -1 --oneline