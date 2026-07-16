#!/usr/bin/env bash
###############################################################################
# E4a — Destination d'upload « vers events » (BACKEND)
#
# Un événement (forum des associations, démonstration) porte ses propres
# photos. Le membre choisit un événement EXISTANT (créés par les admins) et
# 0..N disciplines, qui ENRICHISSENT les disciplines de l'événement.
#
#   1. contracts/upload.schema.ts : + { kind:'event', eventId, disciplineIds }
#   2. storage/router.ts (r2)     : idem (parité avec `general`)
#   3. resolvePendingUploadFolder : `${appRoot}/pending/events/<slug|event-id>`
#   4. registerUploadedAssets     : MediaAsset.eventId + enrichissement des
#                                   disciplines de l'événement
#   5. r2StorageAdapter           : gère le kind `event`
#   6. event.listForUpload        : liste légère des événements pour le picker
#                                   (protectedProcedure — tout membre
#                                   authentifié, pas de manage_events)
#
# Requiert E1 (MediaAsset.eventId + jointure) appliqué et migré.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q "model EventDiscipline" prisma/schema.prisma 2>/dev/null; then
  echo "ERREUR: E1 absent. Applique la chaîne E d'abord."; exit 1
fi
if grep -q 'z.literal("event")' packages/contracts/src/cloudinary/upload.schema.ts 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. contracts                                                                #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/contracts/src/cloudinary/upload.schema.ts"
s = open(p, encoding="utf-8").read()
a = '''  z.object({
    kind: z.literal("perso"),
  }),
]);'''
b = '''  z.object({
    kind: z.literal("perso"),
  }),
  // `event` : contenus d'un événement (forum des associations, démonstration).
  // L'événement est créé par les admins ; le membre le choisit ici. Les
  // `disciplineIds` ENRICHISSENT les disciplines de l'événement (elles
  // décrivent l'ÉVÉNEMENT, pas chaque photo).
  z.object({
    kind: z.literal("event"),
    eventId: z.number().int().positive(),
    disciplineIds: z.array(z.number().int().positive()).default([]),
  }),
]);'''
assert s.count(a) == 1, f"[1] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [1] upload.schema.ts : + kind event OK")
PY

# --------------------------------------------------------------------------- #
# 2. router r2UploadDestinationSchema                                        #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()
a = '''  z.object({
    kind: z.literal('general'),
    folder: z.string().trim().min(1).max(120).optional(),
  }),
]);'''
b = '''  z.object({
    kind: z.literal('general'),
    folder: z.string().trim().min(1).max(120).optional(),
  }),
  // Contenus d'un événement (parité avec `general`).
  z.object({
    kind: z.literal('event'),
    eventId: z.number().int().positive(),
    disciplineIds: z.array(z.number().int().positive()).default([]),
  }),
]);'''
assert s.count(a) == 1, f"[2] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [2] router.ts : r2 + kind event OK")
PY

# --------------------------------------------------------------------------- #
# 3. resolvePendingUploadFolder : branche event                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
s = open(p, encoding="utf-8").read()
a = '''  /* ── Destination personnelle de l'admin (dérivée de userId) ── */'''
b = '''  /* ── Destination événement ── */
  if (destination.kind === "event") {
    const event = await prisma.event.findUnique({
      where: { id: destination.eventId },
      select: { id: true, slug: true },
    });

    if (!event) {
      throw new Error(`Event not found (id=${destination.eventId})`);
    }

    // `Event.slug` est nullable (le temps du backfill) → fallback sur l'id,
    // qui reste stable et unique.
    const eventSlug = event.slug ? slug(event.slug) : `event-${event.id}`;

    return `${appRoot}/pending/events/${eventSlug || `event-${event.id}`}`;
  }

  /* ── Destination personnelle de l'admin (dérivée de userId) ── */'''
assert s.count(a) == 1, f"[3] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [3] resolvePendingUploadFolder : branche event OK")
PY

# --------------------------------------------------------------------------- #
# 4. registerUploadedAssets : eventId + enrichissement disciplines           #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/registerUploadedAssets.service.ts"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

# 4.1 validation des disciplines (l'existence de l'event est déjà vérifiée par
#     resolvePendingUploadFolder, appelé plus haut pour `expectedFolder`).
sub('''  const created = await prisma.$transaction(async (tx) => {''',
'''  // Les disciplines transmises doivent exister (sinon erreur FK opaque).
  if (destination.kind === "event" && destination.disciplineIds.length > 0) {
    const uniqueIds = [...new Set(destination.disciplineIds)];
    const found = await prisma.discipline.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (found.length !== uniqueIds.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Discipline(s) introuvable(s) pour cet événement.",
      });
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    // Les disciplines choisies à l'upload ENRICHISSENT l'événement : elles
    // décrivent ce qui a été présenté lors de l'événement, pas chaque photo.
    // `skipDuplicates` → l'enrichissement est idempotent.
    if (destination.kind === "event" && destination.disciplineIds.length > 0) {
      await tx.eventDiscipline.createMany({
        data: [...new Set(destination.disciplineIds)].map((disciplineId) => ({
          eventId: destination.eventId,
          disciplineId,
        })),
        skipDuplicates: true,
      });
    }
''',
"4.1.enrich")

# 4.2 eventId sur l'asset
sub('''          proposedDisciplineName:
            destination.kind === "new-discipline"
              ? destination.proposedDisciplineName
              : null,''',
'''          proposedDisciplineName:
            destination.kind === "new-discipline"
              ? destination.proposedDisciplineName
              : null,
          eventId: destination.kind === "event" ? destination.eventId : null,''',
"4.2.eventId")

open(p, "w", encoding="utf-8").write(s)
print("  [4] registerUploadedAssets : eventId + enrichissement OK")
PY

# --------------------------------------------------------------------------- #
# 5. r2StorageAdapter : kind event                                            #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
s = open(p, encoding="utf-8").read()
a = '''        case "general":
          // Espace club partagé, sans discipline ni catégorie
          // (categoryId reste null).
          break;'''
b = '''        case "general":
          // Espace club partagé, sans discipline ni catégorie
          // (categoryId reste null).
          break;
        case "event":
          // Contenus d'un événement : ni catégorie ni discipline unique — le
          // rattachement se fait par `eventId` (côté Cloudinary) et par les
          // liens de disciplines de l'événement.
          break;'''
assert s.count(a) == 1, f"[5] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [5] r2StorageAdapter : kind event OK")
PY

# --------------------------------------------------------------------------- #
# 6. event.listForUpload                                                      #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/events/router.ts"
s = open(p, encoding="utf-8").read()
a = '''  getAllByDiscipline: publicProcedure'''
b = '''  /**
   * Liste légère des événements pour le picker de l'uploader.
   * `protectedProcedure` SANS `manage_events` : tout membre authentifié peut
   * déposer des photos sur un événement, même s'il ne peut pas l'éditer.
   * Brouillons inclus — un événement peut être préparé avant sa publication.
   */
  listForUpload: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      select: { id: true, label: true, slug: true },
      orderBy: [
        { publicationDate: { sort: "desc", nulls: "first" } },
        { createdAt: "desc" },
      ],
    });
  }),

  getAllByDiscipline: publicProcedure'''
assert s.count(a) == 1, f"[6] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [6] events/router.ts : listForUpload OK")
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
git commit -m "feat(upload): event destination (existing event + 0..N disciplines enriching it)"
echo "OK — E4a commité."