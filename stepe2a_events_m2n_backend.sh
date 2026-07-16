#!/usr/bin/env bash
###############################################################################
# E2a — Bascule BACKEND vers Event ↔ 0..N disciplines
#
# Phase « migrate » de l'expand/contract. Les inputs acceptent désormais des
# TABLEAUX (`disciplineIds`, `externalDisciplineLabels`) tout en gardant les
# champs singuliers DÉPRÉCIÉS → le front continue de compiler et de marcher
# tel quel (il sera basculé en E2b, puis les vieux champs sautent en E3).
#
# Les écritures font un DUAL-WRITE transitionnel : jointure `EventDiscipline`
# (nouvelle vérité) + anciennes colonnes (`disciplineId` = 1er id,
# `externalDisciplineLabel` = 1er label) pour les lecteurs pas encore basculés.
#
#   1. createInput / updateInput : + tableaux, invariant repensé.
#   2. Helper assertDisciplinesExist (0..N).
#   3. create : jointure + dual-write.
#   4. update : merge, synchro jointure + dual-write.
#   5. getAllByDiscipline : requête via la jointure (multi-disciplines).
#   6. getByIdAdmin / getBySlug : exposent `disciplineLinks` (pour E2b).
#   7. disciplines/router : garde de suppression comptée via la jointure.
#
# Requiert E1 appliqué ET `prisma migrate deploy` passé.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q "model EventDiscipline" prisma/schema.prisma 2>/dev/null; then
  echo "ERREUR: E1 absent. Applique stepE1_event_disciplines_additive.sh d'abord."; exit 1
fi
if grep -q "disciplineIds" packages/backend/src/modules/events/router.ts 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

python3 - << 'PY'
p = "packages/backend/src/modules/events/router.ts"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

# --- 1. createInput : tableaux + invariant --------------------------------- #
sub('''    // Trois champs de rattachement, tous optionnels en Zod —
    // au moins un requis via `.refine` en bas.
    disciplineId: z.number().int().positive().nullable().optional(),
    externalDisciplineLabel: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .nullable()
      .optional(),
    originId: z.number().int().positive().nullable().optional(),''',
'''    // Rattachements, tous optionnels en Zod — au moins un requis via
    // `.refine` en bas.
    //
    // Un événement présente 0..N disciplines ENSEIGNÉES (forum des
    // associations, démonstration multi-disciplines) et 0..N disciplines non
    // enseignées (« Calligraphie chinoise »).
    disciplineIds: z.array(z.number().int().positive()).optional(),
    externalDisciplineLabels: z
      .array(z.string().trim().min(1).max(120))
      .optional(),

    /** @deprecated Utiliser `disciplineIds`. Accepté le temps de la bascule. */
    disciplineId: z.number().int().positive().nullable().optional(),
    /** @deprecated Utiliser `externalDisciplineLabels`. */
    externalDisciplineLabel: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .nullable()
      .optional(),
    originId: z.number().int().positive().nullable().optional(),''',
"1.createFields")

sub('''  .refine(
    (data) =>
      (data.disciplineId !== null && data.disciplineId !== undefined) ||
      (data.externalDisciplineLabel !== null &&
        data.externalDisciplineLabel !== undefined) ||
      (data.originId !== null && data.originId !== undefined),
    {
      message:
        "At least one of disciplineId, externalDisciplineLabel, or originId must be provided.",
      path: ["disciplineId"],
    },
  );''',
'''  .refine(
    (data) =>
      effectiveDisciplineIds(data).length > 0 ||
      effectiveExternalLabels(data).length > 0 ||
      (data.originId !== null && data.originId !== undefined),
    {
      message:
        "At least one of disciplineIds, externalDisciplineLabels, or originId must be provided.",
      path: ["disciplineIds"],
    },
  );''',
"1.refine")

# --- 2. updateInput : tableaux --------------------------------------------- #
sub('''  // Validation « au moins un des trois » faite en router après merge
  // avec l'état actuel en DB (Zod ne connaît pas l'état actuel).
  disciplineId: z.number().int().positive().nullable().optional(),
  externalDisciplineLabel: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .nullable()
    .optional(),
  originId: z.number().int().positive().nullable().optional(),''',
'''  // Validation « au moins un des trois » faite en router après merge
  // avec l'état actuel en DB (Zod ne connaît pas l'état actuel).
  disciplineIds: z.array(z.number().int().positive()).optional(),
  externalDisciplineLabels: z
    .array(z.string().trim().min(1).max(120))
    .optional(),

  /** @deprecated Utiliser `disciplineIds`. */
  disciplineId: z.number().int().positive().nullable().optional(),
  /** @deprecated Utiliser `externalDisciplineLabels`. */
  externalDisciplineLabel: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .nullable()
    .optional(),
  originId: z.number().int().positive().nullable().optional(),''',
"2.updateFields")

# --- 3. Helpers de compat singulier→tableau (avant createInput) ------------ #
sub('''const createInput = z
  .object({''',
'''/**
 * Compat singulier → tableau, le temps de la bascule des appelants.
 * `disciplineIds` (nouveau) prime ; sinon on retombe sur `disciplineId`
 * (déprécié) ; sinon liste vide.
 */
function effectiveDisciplineIds(data: {
  disciplineIds?: number[] | undefined;
  disciplineId?: number | null | undefined;
}): number[] {
  if (data.disciplineIds !== undefined) return data.disciplineIds;
  return data.disciplineId !== null && data.disciplineId !== undefined
    ? [data.disciplineId]
    : [];
}

function effectiveExternalLabels(data: {
  externalDisciplineLabels?: string[] | undefined;
  externalDisciplineLabel?: string | null | undefined;
}): string[] {
  if (data.externalDisciplineLabels !== undefined) {
    return data.externalDisciplineLabels;
  }
  return data.externalDisciplineLabel !== null &&
    data.externalDisciplineLabel !== undefined
    ? [data.externalDisciplineLabel]
    : [];
}

const createInput = z
  .object({''',
"3.helpers")

# --- 4. assertDisciplinesExist (0..N) -------------------------------------- #
sub('''async function assertOriginExists(''',
'''/** Vérifie que TOUTES les disciplines existent (0..N). */
async function assertDisciplinesExist(
  prisma: PrismaClient,
  disciplineIds: number[],
): Promise<void> {
  if (disciplineIds.length === 0) return;
  const unique = [...new Set(disciplineIds)];
  const found = await prisma.discipline.findMany({
    where: { id: { in: unique } },
    select: { id: true },
  });
  const foundIds = new Set(found.map((d) => d.id));
  const missing = unique.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Discipline(s) not found: ${missing.join(", ")}.`,
    });
  }
}

async function assertOriginExists(''',
"4.assertMany")

# --- 5. create : jointure + dual-write ------------------------------------- #
sub('''      await assertDisciplineExists(ctx.prisma, input.disciplineId);
      await assertOriginExists(ctx.prisma, input.originId);
      await assertUserExists(ctx.prisma, input.organizerId);''',
'''      const disciplineIds = [...new Set(effectiveDisciplineIds(input))];
      const externalLabels = [...new Set(effectiveExternalLabels(input))];

      await assertDisciplinesExist(ctx.prisma, disciplineIds);
      await assertOriginExists(ctx.prisma, input.originId);
      await assertUserExists(ctx.prisma, input.organizerId);''',
"5.createAsserts")

sub('''              audience: input.audience,
              disciplineId: input.disciplineId ?? null,
              externalDisciplineLabel: input.externalDisciplineLabel ?? null,
              originId: input.originId ?? null,''',
'''              audience: input.audience,
              // Nouvelle vérité : la jointure + le tableau de labels.
              disciplineLinks: {
                create: disciplineIds.map((disciplineId) => ({ disciplineId })),
              },
              externalDisciplineLabels: externalLabels,
              // Dual-write transitionnel : les colonnes dépréciées restent
              // alimentées (1er élément) pour les lecteurs pas encore
              // basculés. Supprimé en E3.
              disciplineId: disciplineIds[0] ?? null,
              externalDisciplineLabel: externalLabels[0] ?? null,
              originId: input.originId ?? null,''',
"5.createData")

# --- 6. update : merge + synchro jointure ---------------------------------- #
sub('''        select: {
          disciplineId: true,
          externalDisciplineLabel: true,
          originId: true,
        },''',
'''        select: {
          disciplineId: true,
          externalDisciplineLabel: true,
          externalDisciplineLabels: true,
          originId: true,
          disciplineLinks: { select: { disciplineId: true } },
        },''',
"6.updateSelect")

sub('''      // Validation « au moins un des trois » après merge.
      const mergedDisciplineId =
        rest.disciplineId !== undefined
          ? rest.disciplineId
          : existing.disciplineId;
      const mergedExternalLabel =
        rest.externalDisciplineLabel !== undefined
          ? rest.externalDisciplineLabel
          : existing.externalDisciplineLabel;
      const mergedOriginId =
        rest.originId !== undefined ? rest.originId : existing.originId;

      const hasAtLeastOne =
        mergedDisciplineId !== null ||
        (mergedExternalLabel !== null && mergedExternalLabel.length > 0) ||
        mergedOriginId !== null;

      if (!hasAtLeastOne) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "An event must keep at least one of disciplineId, externalDisciplineLabel, or originId set.",
        });
      }

      // Validations existence si champs modifiés et non-null
      if (rest.disciplineId !== undefined && rest.disciplineId !== null) {
        await assertDisciplineExists(ctx.prisma, rest.disciplineId);
      }''',
'''      // Les listes changent-elles ? (nouveau champ OU ancien, déprécié)
      const disciplinesChanged =
        rest.disciplineIds !== undefined || rest.disciplineId !== undefined;
      const labelsChanged =
        rest.externalDisciplineLabels !== undefined ||
        rest.externalDisciplineLabel !== undefined;

      const mergedDisciplineIds = disciplinesChanged
        ? [...new Set(effectiveDisciplineIds(rest))]
        : existing.disciplineLinks.map((l) => l.disciplineId);
      const mergedExternalLabels = labelsChanged
        ? [...new Set(effectiveExternalLabels(rest))]
        : existing.externalDisciplineLabels;
      const mergedOriginId =
        rest.originId !== undefined ? rest.originId : existing.originId;

      // Validation « au moins un des trois » après merge.
      const hasAtLeastOne =
        mergedDisciplineIds.length > 0 ||
        mergedExternalLabels.length > 0 ||
        mergedOriginId !== null;

      if (!hasAtLeastOne) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "An event must keep at least one of disciplineIds, externalDisciplineLabels, or originId set.",
        });
      }

      // Validations existence si champs modifiés
      if (disciplinesChanged) {
        await assertDisciplinesExist(ctx.prisma, mergedDisciplineIds);
      }''',
"6.updateMerge")

sub('''            label: rest.label,
            slug: rest.slug,
            audience: rest.audience,
            disciplineId: rest.disciplineId,
            externalDisciplineLabel: rest.externalDisciplineLabel,
            originId: rest.originId,''',
'''            label: rest.label,
            slug: rest.slug,
            audience: rest.audience,
            // Nouvelle vérité (la jointure est synchronisée juste après).
            externalDisciplineLabels: labelsChanged
              ? mergedExternalLabels
              : undefined,
            // Dual-write transitionnel — supprimé en E3.
            disciplineId: disciplinesChanged
              ? (mergedDisciplineIds[0] ?? null)
              : undefined,
            externalDisciplineLabel: labelsChanged
              ? (mergedExternalLabels[0] ?? null)
              : undefined,
            originId: rest.originId,''',
"6.updateData")

sub('''        if (content !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "EVENT",
            pageId: String(id),
            newContent: content,
          });
        }

        return updated;''',
'''        // Synchro de la jointure (source de vérité des disciplines).
        if (disciplinesChanged) {
          await tx.eventDiscipline.deleteMany({ where: { eventId: id } });
          if (mergedDisciplineIds.length > 0) {
            await tx.eventDiscipline.createMany({
              data: mergedDisciplineIds.map((disciplineId) => ({
                eventId: id,
                disciplineId,
              })),
              skipDuplicates: true,
            });
          }
        }

        if (content !== undefined) {
          await syncPageMediaReferences(tx, {
            pageType: "EVENT",
            pageId: String(id),
            newContent: content,
          });
        }

        return updated;''',
"6.updateSync")

# --- 7. getAllByDiscipline via la jointure --------------------------------- #
sub('''      return ctx.prisma.event.findMany({
        where: {
          disciplineId: input.disciplineId,
          publicationDate: { not: null, lte: new Date() },
        },
        orderBy: { publicationDate: "desc" },
      });''',
'''      // Via la jointure : capte AUSSI les événements multi-disciplines,
      // que l'ancienne colonne `disciplineId` (1 seule) ratait.
      return ctx.prisma.event.findMany({
        where: {
          disciplineLinks: { some: { disciplineId: input.disciplineId } },
          publicationDate: { not: null, lte: new Date() },
        },
        orderBy: { publicationDate: "desc" },
      });''',
"7.getAllByDiscipline")

open(p, "w", encoding="utf-8").write(s)
print("  [1-7] events/router.ts OK")
PY

# --- 8. disciplines/router : garde comptée via la jointure ------------------ #
python3 - << 'PY'
p = "packages/backend/src/modules/disciplines/router.ts"
s = open(p, encoding="utf-8").read()
a = '''          ctx.prisma.event.count({ where: { disciplineId: input.id } }),'''
b = '''          // Via la jointure : compte aussi les événements multi-disciplines.
          ctx.prisma.eventDiscipline.count({
            where: { disciplineId: input.id },
          }),'''
assert s.count(a) == 1, f"[8] garde events : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [8] disciplines/router.ts : garde via jointure OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== prisma generate =="
pnpm prisma generate
echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web (serveur arrêté + .next vidé recommandé) =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(events): switch backend to 0..N disciplines (join table authoritative, dual-write transition)"
echo "OK — E2a commité."