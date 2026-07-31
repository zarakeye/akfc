#!/usr/bin/env bash
#
# step_agenda_backend.sh
#
# Incrément 1 de l'agenda — le résumé et l'image de carte, sur les stages et
# les événements.
#
# Découpage prévu :
#   1  ce script : `summary` + `summaryMediaId` sur Stage et Event
#   2  les deux formulaires d'administration (picker + builder texte)
#   3  la page « Agenda » et son entrée de navbar
#
# ─── Un pageType par composite, et non une union ───────────────────────────
#
# Pour les disciplines, j'avais fait porter à un seul `pageType` la réunion de
# la description et du résumé — d'où l'obligation de relire la ligne pour
# recalculer leur union à chaque écriture.
#
# Les stages font mieux depuis le début : `STAGE_DESCRIPTION` et
# `STAGE_PROGRAM` sont deux jeux de références distincts, chacun synchronisé
# séparément. `STAGE_SUMMARY` et `EVENT_SUMMARY` suivent cette voie. Chaque
# composite est alors indépendant : modifier le résumé ne touche pas aux
# références de la description, sans qu'aucun calcul d'union soit nécessaire.
#
# ─── L'image de carte compte parmi les références ──────────────────────────
#
# `summaryMediaId` vit hors composite ; sans `extraMediaIds`, elle échapperait
# au recensement et passerait pour orpheline. C'est le paramètre ajouté au
# service lors du chantier disciplines, réemployé tel quel — la deuxième
# occurrence prévue est arrivée plus vite que je ne le pensais.
#
# ─── La synchronisation relit la ligne ─────────────────────────────────────
#
# À l'update, la sync porte sur l'état RÉEL relu après écriture, et non sur ce
# qui a été fourni : le composite et l'image peuvent être modifiés
# séparément, et l'un sans l'autre laisserait la référence de l'autre à
# l'abandon.
#
# ─── Pas de champ « date » ajouté ──────────────────────────────────────────
#
# Les dates restent où elles sont : sur `StageSession` et `EventSession`.
# L'agenda triera sur la prochaine session à venir, calculée à la lecture.
# Dupliquer une date sur le parent créerait deux vérités à tenir en accord.
#
# Usage :
#   bash step_agenda_backend.sh
#   AKFC_APPLY_ONLY=1 bash step_agenda_backend.sh
#
set -euo pipefail

schema_file="prisma/schema.prisma"
stages_router="packages/backend/src/modules/stages/router.ts"
events_router="packages/backend/src/modules/events/router.ts"
migration_dir="prisma/migrations/20260731100000_agenda_summaries"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "STAGE_SUMMARY" "$schema_file" 2>/dev/null; then
  echo "✓ déjà appliqué (résumés de stage/événement présents) — rien à faire"
  exit 0
fi

for f in "$schema_file" "$stages_router" "$events_router"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

mkdir -p "$migration_dir"
cat > "$migration_dir/migration.sql" <<'SQL'
-- Résumé et image de carte pour les stages et les événements, destinés à la
-- page « Agenda ».
--
-- Un pageType par composite, comme STAGE_DESCRIPTION / STAGE_PROGRAM : chaque
-- jeu de références média reste indépendant.
ALTER TYPE "PageReferencerKind" ADD VALUE 'STAGE_SUMMARY';
ALTER TYPE "PageReferencerKind" ADD VALUE 'EVENT_SUMMARY';

ALTER TABLE "Stage"
  ADD COLUMN "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
  ADD COLUMN "summaryMediaId" TEXT;

ALTER TABLE "Event"
  ADD COLUMN "summary" JSONB NOT NULL DEFAULT '{"version":1,"blocks":[]}',
  ADD COLUMN "summaryMediaId" TEXT;
SQL
echo "  + migration 20260731100000_agenda_summaries"

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

schema_file   = "prisma/schema.prisma"
stages_router = "packages/backend/src/modules/stages/router.ts"
events_router = "packages/backend/src/modules/events/router.ts"

summary_doc = """
  /// Présentation SYNTHÉTIQUE, éditée au builder restreint (texte seul).
  /// Alimente la carte de la page « Agenda », qui renvoie ici.
  /// Composite VIDE = pas de carte.
  summary Json @default("{\\"version\\":1,\\"blocks\\":[]}")

  /// Image de la carte d'agenda. Identifiant de `MediaAsset` en texte
  /// simple, comme les blocs du PageBuilder — pas de clé étrangère, pour
  /// n'avoir qu'un seul régime de référence.
  summaryMediaId String?
"""

# ── 1/16 énumération ──────────────────────────────────────────────────────
edit(schema_file, """  SITE_PAGE   // pages de contenu éditoriales (« L'association »…)
}""",
"""  SITE_PAGE   // pages de contenu éditoriales (« L'association »…)
  STAGE_SUMMARY // présentation synthétique d'un stage (carte d'agenda)
  EVENT_SUMMARY // présentation synthétique d'un événement (carte d'agenda)
}""")

# ── 2/16 modèle Stage ─────────────────────────────────────────────────────
edit(schema_file, """  /// Format : `PageContentV1`.
  program Json
""",
"""  /// Format : `PageContentV1`.
  program Json
""" + summary_doc)

# ── 3/16 modèle Event ─────────────────────────────────────────────────────
edit(schema_file, """  /// Format : `PageContentV1` (cf. `packages/contracts/src/page`).
  content Json @default("{\\"version\\":1,\\"blocks\\":[]}")
""",
"""  /// Format : `PageContentV1` (cf. `packages/contracts/src/page`).
  content Json @default("{\\"version\\":1,\\"blocks\\":[]}")
""" + summary_doc)

# ─────────────────────────────────────────────────────────────────────────
#  Routeur des stages
# ─────────────────────────────────────────────────────────────────────────

# ── 4/16 import de la relecture ───────────────────────────────────────────
edit(stages_router, """import { pageContentSchemaV1 } from "@contracts/page";""",
"""import { pageContentSchemaV1, parsePageContentV1 } from "@contracts/page";""")

# ── 5/16 createInput ──────────────────────────────────────────────────────
edit(stages_router, """    description: pageContentSchemaV1,
    program: pageContentSchemaV1,""",
"""    description: pageContentSchemaV1,
    program: pageContentSchemaV1,
    // Résumé pour la carte d'agenda. Optionnel : la colonne a un composite
    // vide par défaut, et un formulaire qui ne le renseigne pas doit
    // continuer de fonctionner.
    summary: pageContentSchemaV1.optional(),
    summaryMediaId: z.string().min(1).nullable().optional(),""")

# ── 6/16 updateInput ──────────────────────────────────────────────────────
edit(stages_router, """    description: pageContentSchemaV1.optional(),
    program: pageContentSchemaV1.optional(),""",
"""    description: pageContentSchemaV1.optional(),
    program: pageContentSchemaV1.optional(),
    summary: pageContentSchemaV1.optional(),
    summaryMediaId: z.string().min(1).nullable().optional(),""")

# ── 7/16 create : écriture ────────────────────────────────────────────────
edit(stages_router, """              description: input.description as Prisma.InputJsonValue,
              program: input.program as Prisma.InputJsonValue,""",
"""              description: input.description as Prisma.InputJsonValue,
              program: input.program as Prisma.InputJsonValue,
              summary:
                input.summary === undefined
                  ? undefined
                  : (input.summary as Prisma.InputJsonValue),
              summaryMediaId: input.summaryMediaId ?? null,""")

# ── 8/16 create : troisième synchronisation ───────────────────────────────
edit(stages_router, """        await syncPageMediaReferences(tx, {
          pageType: "STAGE_PROGRAM",
          pageId: String(created.id),
          newContent: input.program,
        });""",
"""        await syncPageMediaReferences(tx, {
          pageType: "STAGE_PROGRAM",
          pageId: String(created.id),
          newContent: input.program,
        });
        // Le résumé porte ses propres références, image de carte comprise :
        // celle-ci vit hors composite et échapperait au recensement sans
        // `extraMediaIds`.
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_SUMMARY",
          pageId: String(created.id),
          newContent: input.summary ?? { version: 1, blocks: [] },
          extraMediaIds: input.summaryMediaId ? [input.summaryMediaId] : [],
        });""")

# ── 9/16 update : destructuration ─────────────────────────────────────────
edit(stages_router, """      const {
        id,
        coAnimatorIds,
        primaryAnimatorId,
        description,
        program,
        ...rest
      } = input;""",
"""      const {
        id,
        coAnimatorIds,
        primaryAnimatorId,
        description,
        program,
        summary,
        ...rest
      } = input;""")

# ── 10/16 update : écriture ───────────────────────────────────────────────
edit(stages_router, """            program:
              program === undefined
                ? undefined
                : (program as Prisma.InputJsonValue),""",
"""            program:
              program === undefined
                ? undefined
                : (program as Prisma.InputJsonValue),
            summary:
              summary === undefined
                ? undefined
                : (summary as Prisma.InputJsonValue),
            summaryMediaId: rest.summaryMediaId,""")

# ── 11/16 update : synchronisation du résumé ──────────────────────────────
edit(stages_router, """        if (program !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "STAGE_PROGRAM",
            pageId: String(id),
            newContent: program,
          });
        }""",
"""        if (program !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "STAGE_PROGRAM",
            pageId: String(id),
            newContent: program,
          });
        }
        // Relecture APRÈS écriture plutôt que raisonnement sur ce qui a été
        // fourni : composite et image se modifient séparément, et traiter
        // l'un sans l'autre laisserait la référence de l'autre à l'abandon.
        if (summary !== undefined || rest.summaryMediaId !== undefined) {
          const row = await tx.stage.findUnique({
            where: { id },
            select: { summary: true, summaryMediaId: true },
          });
          await syncPageMediaReferences(tx, {
            pageType: "STAGE_SUMMARY",
            pageId: String(id),
            newContent: parsePageContentV1(row?.summary),
            extraMediaIds: row?.summaryMediaId ? [row.summaryMediaId] : [],
          });
        }""")

# ── 12/16 delete : libération du troisième jeu ────────────────────────────
edit(stages_router, """        await syncPageMediaReferences(tx, {
          pageType: "STAGE_PROGRAM",
          pageId: String(input.id),
          newContent: null,
        });""",
"""        await syncPageMediaReferences(tx, {
          pageType: "STAGE_PROGRAM",
          pageId: String(input.id),
          newContent: null,
        });
        await syncPageMediaReferences(tx, {
          pageType: "STAGE_SUMMARY",
          pageId: String(input.id),
          newContent: null,
        });""")

# ─────────────────────────────────────────────────────────────────────────
#  Routeur des événements
# ─────────────────────────────────────────────────────────────────────────

# ── 13/16 import, entrées et écriture ─────────────────────────────────────
edit(events_router, """import { pageContentSchemaV1 } from "@contracts/page";""",
"""import { pageContentSchemaV1, parsePageContentV1 } from "@contracts/page";""")

edit(events_router, """    content: pageContentSchemaV1,""",
"""    content: pageContentSchemaV1,
    // Résumé pour la carte d'agenda, même logique que pour les stages.
    summary: pageContentSchemaV1.optional(),
    summaryMediaId: z.string().min(1).nullable().optional(),""")

edit(events_router, """  content: pageContentSchemaV1.optional(),""",
"""  content: pageContentSchemaV1.optional(),
  summary: pageContentSchemaV1.optional(),
  summaryMediaId: z.string().min(1).nullable().optional(),""")

edit(events_router, """              content: input.content as Prisma.InputJsonValue,""",
"""              content: input.content as Prisma.InputJsonValue,
              summary:
                input.summary === undefined
                  ? undefined
                  : (input.summary as Prisma.InputJsonValue),
              summaryMediaId: input.summaryMediaId ?? null,""")

# ── 14/16 create : synchronisation du résumé ──────────────────────────────
edit(events_router, """        await syncPageMediaReferences(tx, {
          pageType: "EVENT",
          pageId: String(created.id),
          newContent: input.content,
        });""",
"""        await syncPageMediaReferences(tx, {
          pageType: "EVENT",
          pageId: String(created.id),
          newContent: input.content,
        });
        await syncPageMediaReferences(tx, {
          pageType: "EVENT_SUMMARY",
          pageId: String(created.id),
          newContent: input.summary ?? { version: 1, blocks: [] },
          extraMediaIds: input.summaryMediaId ? [input.summaryMediaId] : [],
        });""")

# ── 15/16 update : destructuration, écriture et synchronisation ───────────
edit(events_router, """      const { id, content, ...rest } = input;""",
"""      const { id, content, summary, ...rest } = input;""")

edit(events_router, """            content:
              content === undefined
                ? undefined
                : (content as Prisma.InputJsonValue),
          };""",
"""            content:
              content === undefined
                ? undefined
                : (content as Prisma.InputJsonValue),
            summary:
              summary === undefined
                ? undefined
                : (summary as Prisma.InputJsonValue),
            summaryMediaId: rest.summaryMediaId,
          };""")

edit(events_router, """        if (content !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "EVENT",
            pageId: String(id),
            newContent: content,
          });
        }""",
"""        if (content !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "EVENT",
            pageId: String(id),
            newContent: content,
          });
        }
        if (summary !== undefined || rest.summaryMediaId !== undefined) {
          const row = await tx.event.findUnique({
            where: { id },
            select: { summary: true, summaryMediaId: true },
          });
          await syncPageMediaReferences(tx, {
            pageType: "EVENT_SUMMARY",
            pageId: String(id),
            newContent: parsePageContentV1(row?.summary),
            extraMediaIds: row?.summaryMediaId ? [row.summaryMediaId] : [],
          });
        }""")

# ── 16/16 delete : libération ─────────────────────────────────────────────
edit(events_router, """        await syncPageMediaReferences(tx, {
          pageType: "EVENT",
          pageId: String(input.id),
          newContent: null,""",
"""        await syncPageMediaReferences(tx, {
          pageType: "EVENT_SUMMARY",
          pageId: String(input.id),
          newContent: null,
        });
        await syncPageMediaReferences(tx, {
          pageType: "EVENT",
          pageId: String(input.id),
          newContent: null,""")
PY

echo "✓ résumés posés sur les stages et les événements"

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
if [ -z "$generated_types" ] || ! grep -q "STAGE_SUMMARY" "$generated_types"; then
  echo "✗ le client généré ne connaît pas STAGE_SUMMARY — rien n'est commité"
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
git commit -m "feat(agenda): resume et image de carte sur stages et evenements

Increment 1 de l'agenda. Les formulaires puis la page suivront.

Un pageType par composite, et non une union. Pour les disciplines,
j'avais fait porter a un seul pageType la reunion de la description et
du resume, d'ou l'obligation de recalculer leur union a chaque
ecriture. Les stages font mieux depuis le debut avec
STAGE_DESCRIPTION / STAGE_PROGRAM : STAGE_SUMMARY et EVENT_SUMMARY
suivent cette voie, et chaque composite reste independant.

L'image de carte vit hors composite : sans extraMediaIds elle
echapperait au recensement et passerait pour orpheline. C'est le
parametre ajoute au service lors du chantier disciplines, reemploye tel
quel — la deuxieme occurrence prevue est arrivee vite.

A l'update, la sync porte sur l'etat REEL relu apres ecriture et non
sur ce qui a ete fourni : composite et image se modifient separement,
et traiter l'un sans l'autre laisserait la reference de l'autre a
l'abandon.

Aucun champ date ajoute : les dates restent sur StageSession et
EventSession. L'agenda triera sur la prochaine session a venir,
calculee a la lecture. Dupliquer une date sur le parent creerait deux
verites a tenir en accord."

echo "✓ commité"
git log -1 --oneline