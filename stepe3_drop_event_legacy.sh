#!/usr/bin/env bash
###############################################################################
# E3 — CONTRACT : supprimer les colonnes dépréciées d'Event
#
# Dernière phase de l'expand/contract. Plus aucun lecteur : la jointure
# `EventDiscipline` et `externalDisciplineLabels` sont la seule vérité.
#
#   1. [id]/page.tsx (admin) : dernière page qui lisait la relation
#      `discipline` — basculée sur `disciplineLinks` (E2c l'avait ratée).
#   2. EventForm.tsx : retrait des fallbacks de compat.
#   3. events/router.ts : retrait des champs d'input dépréciés, des helpers
#      de compat, du dual-write et de `assertDisciplineExists` (mort).
#   4. schema.prisma : retrait de Event.disciplineId, Event.discipline,
#      Event.externalDisciplineLabel, @@index([disciplineId]),
#      Discipline.events.
#   5. Migration : DROP des colonnes.
#
# ⚠️ IRRÉVERSIBLE côté données : le DROP COLUMN supprime les valeurs. Le
# backfill d'E1 les a copiées dans la jointure / le tableau — vérifie que la
# requête de contrôle d'E1 renvoie bien 0 AVANT de lancer `migrate deploy`.
#
# Requiert E1 + E2a + E2b + E2c appliqués et migrés.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q "buildRattachement" apps/web/src/features/admin/events/components/EventsTable.tsx 2>/dev/null; then
  echo "ERREUR: E2c absent. Applique la chaîne E d'abord."; exit 1
fi
if ! grep -q "externalDisciplineLabel String?" prisma/schema.prisma 2>/dev/null; then
  echo "Déjà appliqué (colonnes dépréciées absentes). Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. Page admin de détail                                                     #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/app/(admin)/dashboard/events/[id]/page.tsx"
s = open(p, encoding="utf-8").read()

a = '''      discipline: { select: { name: true } },'''
b = '''      disciplineLinks: { select: { discipline: { select: { name: true } } } },'''
assert s.count(a) == 1, f"[1.include] : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''  const rattachement =
    event.discipline?.name ??
    event.externalDisciplineLabel ??'''
b = '''  // Toutes les disciplines + tous les labels externes ; à défaut, l'origine.
  const rattachements = [
    ...event.disciplineLinks.map((l) => l.discipline.name),
    ...event.externalDisciplineLabels,
  ];
  const rattachement =
    rattachements.length > 0
      ? rattachements.join(', ')
      :'''
assert s.count(a) == 1, f"[1.calc] : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [1] [id]/page.tsx : rattachement multi OK")
PY

# --------------------------------------------------------------------------- #
# 2. EventForm : retrait des fallbacks de compat                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/admin/events/forms/EventForm.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es)."
    s = s.replace(a, b)

sub('''  // 0..N disciplines enseignées. Compat : si l'événement date d'avant la
  // jointure, on retombe sur la colonne dépréciée `disciplineId`.
  const [disciplineIds, setDisciplineIds] = useState<number[]>(
    initial?.disciplineLinks?.map((l) => l.disciplineId) ??
      (initial?.disciplineId != null ? [initial.disciplineId] : []),
  );
  // 0..N libellés de disciplines non enseignées (même compat).
  const [externalLabels, setExternalLabels] = useState<string[]>(
    initial?.externalDisciplineLabels?.length
      ? initial.externalDisciplineLabels
      : initial?.externalDisciplineLabel
        ? [initial.externalDisciplineLabel]
        : [],
  );''',
'''  // 0..N disciplines enseignées, depuis la jointure (seule vérité).
  const [disciplineIds, setDisciplineIds] = useState<number[]>(
    initial?.disciplineLinks?.map((l) => l.disciplineId) ?? [],
  );
  // 0..N libellés de disciplines non enseignées.
  const [externalLabels, setExternalLabels] = useState<string[]>(
    initial?.externalDisciplineLabels ?? [],
  );''',
"2.state")

open(p, "w", encoding="utf-8").write(s)
print("  [2] EventForm.tsx : fallbacks de compat retirés OK")
PY

# --------------------------------------------------------------------------- #
# 3. events/router : retrait compat + dual-write                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/events/router.ts"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es)."
    s = s.replace(a, b)

# 3.1 helpers de compat → supprimés
sub('''/**
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

const createInput = z''', '''const createInput = z''', "3.1.helpers")

# 3.2 createInput : champs dépréciés retirés
sub('''    disciplineIds: z.array(z.number().int().positive()).optional(),
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
'''    disciplineIds: z.array(z.number().int().positive()).optional(),
    externalDisciplineLabels: z
      .array(z.string().trim().min(1).max(120))
      .optional(),
    originId: z.number().int().positive().nullable().optional(),''',
"3.2.createInput")

# 3.3 refine
sub('''      effectiveDisciplineIds(data).length > 0 ||
      effectiveExternalLabels(data).length > 0 ||''',
'''      (data.disciplineIds ?? []).length > 0 ||
      (data.externalDisciplineLabels ?? []).length > 0 ||''',
"3.3.refine")

# 3.4 updateInput
sub('''  disciplineIds: z.array(z.number().int().positive()).optional(),
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
'''  disciplineIds: z.array(z.number().int().positive()).optional(),
  externalDisciplineLabels: z
    .array(z.string().trim().min(1).max(120))
    .optional(),
  originId: z.number().int().positive().nullable().optional(),''',
"3.4.updateInput")

# 3.5 assertDisciplineExists (mort)
sub('''async function assertDisciplineExists(
  prisma: PrismaClient,
  disciplineId: number | null | undefined,
): Promise<void> {
  if (disciplineId === null || disciplineId === undefined) return;
  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
    select: { id: true },
  });
  if (!discipline) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Discipline not found (id=${disciplineId}).`,
    });
  }
}

/** Vérifie que TOUTES les disciplines existent (0..N). */''',
'''/** Vérifie que TOUTES les disciplines existent (0..N). */''',
"3.5.deadHelper")

# 3.6 create : plus de compat
sub('''      const disciplineIds = [...new Set(effectiveDisciplineIds(input))];
      const externalLabels = [...new Set(effectiveExternalLabels(input))];''',
'''      const disciplineIds = [...new Set(input.disciplineIds ?? [])];
      const externalLabels = [...new Set(input.externalDisciplineLabels ?? [])];''',
"3.6.createAsserts")

# 3.7 create : dual-write retiré
sub('''              externalDisciplineLabels: externalLabels,
              // Dual-write transitionnel : les colonnes dépréciées restent
              // alimentées (1er élément) pour les lecteurs pas encore
              // basculés. Supprimé en E3.
              disciplineId: disciplineIds[0] ?? null,
              externalDisciplineLabel: externalLabels[0] ?? null,
              originId: input.originId ?? null,''',
'''              externalDisciplineLabels: externalLabels,
              originId: input.originId ?? null,''',
"3.7.createData")

# 3.8 update select
sub('''        select: {
          disciplineId: true,
          externalDisciplineLabel: true,
          externalDisciplineLabels: true,
          originId: true,
          disciplineLinks: { select: { disciplineId: true } },
        },''',
'''        select: {
          externalDisciplineLabels: true,
          originId: true,
          disciplineLinks: { select: { disciplineId: true } },
        },''',
"3.8.updateSelect")

# 3.9 update merge
sub('''      // Les listes changent-elles ? (nouveau champ OU ancien, déprécié)
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
        : existing.externalDisciplineLabels;''',
'''      const disciplinesChanged = rest.disciplineIds !== undefined;
      const labelsChanged = rest.externalDisciplineLabels !== undefined;

      const mergedDisciplineIds = disciplinesChanged
        ? [...new Set(rest.disciplineIds ?? [])]
        : existing.disciplineLinks.map((l) => l.disciplineId);
      const mergedExternalLabels = labelsChanged
        ? [...new Set(rest.externalDisciplineLabels ?? [])]
        : existing.externalDisciplineLabels;''',
"3.9.updateMerge")

# 3.10 update data
sub('''            // Nouvelle vérité (la jointure est synchronisée juste après).
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
'''            // La jointure est synchronisée juste après.
            externalDisciplineLabels: labelsChanged
              ? mergedExternalLabels
              : undefined,
            originId: rest.originId,''',
"3.10.updateData")

open(p, "w", encoding="utf-8").write(s)
print("  [3] events/router.ts : compat + dual-write retirés OK")
PY

# --------------------------------------------------------------------------- #
# 4. schema.prisma                                                            #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
import re
p = "prisma/schema.prisma"
s = open(p, encoding="utf-8").read()

m = re.search(r'(model Event \{.*?\n\})', s, re.S)
assert m, "Bloc `model Event` introuvable."
block = m.group(1)
orig = block

# disciplineId + son doc
block, n = re.subn(
    r'\n  /// Discipline rattachée\..*?\n  disciplineId Int\?\n', '\n', block, flags=re.S)
assert n == 1, f"[4.1] Event.disciplineId : {n}"

# externalDisciplineLabel (singulier) + son doc — s'arrête avant le doc du pluriel
block, n = re.subn(
    r'\n  /// Nom libre d\'une discipline non enseignée.*?\n  externalDisciplineLabel String\?\n', '\n', block, flags=re.S)
assert n == 1, f"[4.2] Event.externalDisciplineLabel : {n}"

block, n = re.subn(
    r'\n  discipline Discipline\? @relation\(fields: \[disciplineId\], references: \[id\]\)', '', block)
assert n == 1, f"[4.3] Event.discipline relation : {n}"

block, n = re.subn(r'\n  @@index\(\[disciplineId\]\)', '', block)
assert n == 1, f"[4.4] Event @@index : {n}"

s = s[:m.start(1)] + block + s[m.end(1):]

# Discipline.events
m2 = re.search(r'(model Discipline \{.*?\n\})', s, re.S)
assert m2, "Bloc `model Discipline` introuvable."
b2 = m2.group(1)
b2b, n = re.subn(r'\n  events Event\[\]', '', b2)
assert n == 1, f"[4.5] Discipline.events : {n}"
s = s[:m2.start(1)] + b2b + s[m2.end(1):]

open(p, "w", encoding="utf-8").write(s)
print("  [4] schema.prisma : colonnes + relations dépréciées retirées OK")
PY

# --------------------------------------------------------------------------- #
# 5. Migration                                                                #
# --------------------------------------------------------------------------- #
MIG_DIR="prisma/migrations/20261012000000_drop_event_legacy_discipline"
mkdir -p "$MIG_DIR"
cat > "$MIG_DIR/migration.sql" << 'EOF'
-- CONTRACT : les colonnes `Event.disciplineId` et
-- `Event.externalDisciplineLabel` n'ont plus de lecteur. La jointure
-- `EventDiscipline` et `Event.externalDisciplineLabels` sont la seule vérité.
--
-- ⚠️ IRRÉVERSIBLE : vérifier AVANT que le backfill d'E1 a bien tout copié.
--   SELECT COUNT(*) FROM "Event" e WHERE e."disciplineId" IS NOT NULL
--     AND NOT EXISTS (SELECT 1 FROM "EventDiscipline" ed
--       WHERE ed."eventId" = e."id" AND ed."disciplineId" = e."disciplineId");
--   -- doit renvoyer 0

ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_disciplineId_fkey";
DROP INDEX IF EXISTS "Event_disciplineId_idx";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "disciplineId";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "externalDisciplineLabel";
EOF
echo "  [5] migration créée : $MIG_DIR/migration.sql"

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
git commit -m "refactor(events): drop deprecated disciplineId/externalDisciplineLabel columns (contract)"

echo
echo "###########################################################################"
echo "# ÉTAPE DB MANUELLE — LIRE AVANT DE LANCER :                              #"
echo "#                                                                         #"
echo "# 1) Vérifier que le backfill d'E1 a tout copié (doit renvoyer 0) :        #"
echo "#    SELECT COUNT(*) FROM \"Event\" e WHERE e.\"disciplineId\" IS NOT NULL  #"
echo "#      AND NOT EXISTS (SELECT 1 FROM \"EventDiscipline\" ed                 #"
echo "#        WHERE ed.\"eventId\"=e.\"id\" AND ed.\"disciplineId\"=e.\"disciplineId\");"
echo "#                                                                         #"
echo "# 2) SEULEMENT SI 0 :  pnpm prisma migrate deploy                          #"
echo "#    (le DROP COLUMN est IRRÉVERSIBLE)                                     #"
echo "###########################################################################"