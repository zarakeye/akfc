#!/usr/bin/env bash
###############################################################################
# E1 — Découpler Event de LA discipline : FONDATION (purement ADDITIVE)
#
# Stratégie expand / migrate / contract. Cette étape n'enlève RIEN : les
# colonnes `Event.disciplineId` et `Event.externalDisciplineLabel` restent en
# place, donc AUCUN fichier existant ne casse (routers events/disciplines, form
# admin, pages publiques continuent de fonctionner à l'identique).
#
#   1. schema.prisma :
#      - model EventDiscipline (jointure EXPLICITE Event <-> Discipline, 0..N)
#      - Event.externalDisciplineLabels String[]  (0..N labels non enseignés)
#      - Event.disciplineLinks / Discipline.eventLinks (back-relations)
#      - MediaAsset.eventId + relation + index (les photos appartiennent à
#        l'événement)
#      - Event.mediaAssets (back-relation)
#   2. Migration SQL : création + BACKFILL des données existantes
#      (disciplineId -> jointure ; externalDisciplineLabel -> array).
#
# Jointure EXPLICITE et non M2M implicite Prisma : la forme SQL de l'implicite
# est générée par Prisma (table `_EventDisciplines`, colonnes A/B) et on écrit
# ici le SQL à la main — mieux vaut une table dont on maîtrise la forme. Elle
# pourra porter des métadonnées plus tard si besoin.
#
# APRÈS le script : `pnpm prisma migrate deploy` (mutation DB, hors script).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json         || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }
test -f prisma/schema.prisma || { echo "ERREUR: prisma/schema.prisma introuvable."; exit 1; }

if grep -q "model EventDiscipline" prisma/schema.prisma 2>/dev/null; then
  echo "Déjà appliqué (model EventDiscipline présent). Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. schema.prisma                                                             #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
import re
p = "prisma/schema.prisma"
s = open(p, encoding="utf-8").read()

# --- 1.1 Event : nouveaux champs + back-relations -------------------------- #
a = '''  /// Nom libre d'une discipline non enseignée (« Calligraphie chinoise »).
  /// Sert quand l'événement porte sur un domaine que le club n'enseigne
  /// pas — typiquement intervenant extérieur.
  externalDisciplineLabel String?'''
b = '''  /// Nom libre d'une discipline non enseignée (« Calligraphie chinoise »).
  /// Sert quand l'événement porte sur un domaine que le club n'enseigne
  /// pas — typiquement intervenant extérieur.
  ///
  /// @deprecated Remplacé par `externalDisciplineLabels` (0..N). Conservé le
  /// temps de la bascule des lecteurs/écrivains, puis supprimé.
  externalDisciplineLabel String?

  /// Noms libres des disciplines NON enseignées présentées lors de
  /// l'événement (0..N) — ex. « Calligraphie chinoise ». Remplace
  /// `externalDisciplineLabel` (singulier).
  externalDisciplineLabels String[] @default([])'''
assert s.count(a) == 1, f"[1.1] Event.externalDisciplineLabel : {s.count(a)} match(es)."
s = s.replace(a, b)

# Marque le disciplineId d'Event comme déprécié (documentation seulement).
a = '''  /// Discipline rattachée. **Nullable** : un événement culturel large
  /// peut ne pas être rattaché à une discipline enseignée.
  disciplineId Int?'''
b = '''  /// Discipline rattachée. **Nullable** : un événement culturel large
  /// peut ne pas être rattaché à une discipline enseignée.
  ///
  /// @deprecated Un événement peut présenter 0..N disciplines (forum des
  /// associations, démonstration multi-disciplines) → voir `disciplineLinks`.
  /// Conservé le temps de la bascule, puis supprimé.
  disciplineId Int?'''
assert s.count(a) == 1, f"[1.2] Event.disciplineId doc : {s.count(a)} match(es)."
s = s.replace(a, b)

# Back-relations sur Event (avant les @@index de fin de modèle).
a = '''  /// Assets média (photos, vidéos d'illustration) rattachés à cet événement.
  galleries   Gallery[]

  @@index([disciplineId])'''
b = '''  /// Assets média (photos, vidéos d'illustration) rattachés à cet événement.
  galleries   Gallery[]

  /// Disciplines ENSEIGNÉES présentées lors de l'événement (0..N).
  disciplineLinks EventDiscipline[]

  /// Photos/vidéos déposées POUR cet événement. Distinct des `galleries`,
  /// qui sont une curation montée par les admins : ici c'est le contenu brut
  /// rattaché à l'événement.
  mediaAssets MediaAsset[]

  @@index([disciplineId])'''
assert s.count(a) == 1, f"[1.3] Event back-relations : {s.count(a)} match(es)."
s = s.replace(a, b)

# --- 1.2 Discipline : back-relation --------------------------------------- #
m = re.search(r'(model Discipline \{.*?\n\})', s, re.S)
assert m, "Bloc `model Discipline { ... }` introuvable."
block = m.group(1)
a = '''  galleries   Gallery[]'''
assert block.count(a) == 1, f"[1.4] Discipline.galleries : {block.count(a)} match(es)."
block_new = block.replace(a, '''  galleries   Gallery[]

  /// Événements où cette discipline est présentée (0..N).
  eventLinks EventDiscipline[]''')
s = s[:m.start(1)] + block_new + s[m.end(1):]

# --- 1.3 MediaAsset : eventId + relation + index --------------------------- #
a = '''  disciplineId           Int?                            // null si Discipline proposée pas encore créée
  proposedDisciplineName String?
  eventDate              DateTime?'''
b = '''  disciplineId           Int?                            // null si Discipline proposée pas encore créée
  proposedDisciplineName String?
  eventDate              DateTime?

  /// Événement auquel ce média est rattaché (upload « vers events »).
  /// Nullable : la grande majorité des assets n'appartient à aucun événement.
  eventId                Int?'''
assert s.count(a) == 1, f"[1.5] MediaAsset.eventId : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''  category   Category?    @relation(fields: [categoryId], references: [id])
  discipline Discipline? @relation(fields: [disciplineId], references: [id])'''
b = '''  category   Category?    @relation(fields: [categoryId], references: [id])
  discipline Discipline? @relation(fields: [disciplineId], references: [id])
  event      Event?      @relation(fields: [eventId], references: [id])'''
assert s.count(a) == 1, f"[1.6] MediaAsset.event relation : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''  @@index([disciplineId])
  @@index([uploaderUserId])'''
b = '''  @@index([disciplineId])
  @@index([eventId])
  @@index([uploaderUserId])'''
assert s.count(a) == 1, f"[1.7] MediaAsset @@index eventId : {s.count(a)} match(es)."
s = s.replace(a, b)

# --- 1.4 model EventDiscipline (ajouté en fin de fichier) ------------------ #
s = s.rstrip("\n") + '''

/// Jointure explicite Event <-> Discipline : un événement présente 0..N
/// disciplines ENSEIGNÉES (forum des associations, démonstration
/// multi-disciplines), une discipline apparaît dans 0..N événements.
///
/// Explicite (et non M2M implicite) pour maîtriser la forme SQL de la table
/// et pouvoir y porter des métadonnées plus tard si le besoin apparaît.
model EventDiscipline {
  eventId      Int
  disciplineId Int

  event      Event      @relation(fields: [eventId], references: [id], onDelete: Cascade)
  discipline Discipline @relation(fields: [disciplineId], references: [id], onDelete: Cascade)

  @@id([eventId, disciplineId])
  @@index([disciplineId])
}
'''

open(p, "w", encoding="utf-8").write(s)
print("  [1] schema.prisma : EventDiscipline + labels[] + MediaAsset.eventId OK")
PY

# --------------------------------------------------------------------------- #
# 2. Migration SQL (horodatage > 20261010000000)                              #
# --------------------------------------------------------------------------- #
MIG_DIR="prisma/migrations/20261011000000_event_disciplines_m2n"
mkdir -p "$MIG_DIR"
cat > "$MIG_DIR/migration.sql" << 'EOF'
-- Découple Event de LA discipline : un événement peut présenter 0..N
-- disciplines enseignées, et 0..N disciplines non enseignées (labels libres).
-- Ajoute aussi le rattachement direct des médias à un événement.
--
-- Purement ADDITIF : les colonnes `Event.disciplineId` et
-- `Event.externalDisciplineLabel` sont conservées (supprimées plus tard, une
-- fois les lecteurs/écrivains basculés).

-- 1. Jointure explicite Event <-> Discipline
CREATE TABLE "EventDiscipline" (
    "eventId" INTEGER NOT NULL,
    "disciplineId" INTEGER NOT NULL,
    CONSTRAINT "EventDiscipline_pkey" PRIMARY KEY ("eventId","disciplineId")
);

CREATE INDEX "EventDiscipline_disciplineId_idx" ON "EventDiscipline"("disciplineId");

ALTER TABLE "EventDiscipline"
    ADD CONSTRAINT "EventDiscipline_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventDiscipline"
    ADD CONSTRAINT "EventDiscipline_disciplineId_fkey"
    FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Labels de disciplines non enseignées (0..N)
ALTER TABLE "Event"
    ADD COLUMN "externalDisciplineLabels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 3. Rattachement direct des médias à un événement
ALTER TABLE "MediaAsset" ADD COLUMN "eventId" INTEGER;

CREATE INDEX "MediaAsset_eventId_idx" ON "MediaAsset"("eventId");

ALTER TABLE "MediaAsset"
    ADD CONSTRAINT "MediaAsset_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. BACKFILL des données existantes (idempotent)
INSERT INTO "EventDiscipline" ("eventId", "disciplineId")
SELECT "id", "disciplineId" FROM "Event" WHERE "disciplineId" IS NOT NULL
ON CONFLICT DO NOTHING;

UPDATE "Event"
SET "externalDisciplineLabels" = ARRAY["externalDisciplineLabel"]
WHERE "externalDisciplineLabel" IS NOT NULL
  AND btrim("externalDisciplineLabel") <> ''
  AND cardinality("externalDisciplineLabels") = 0;
EOF
echo "  [2] migration créée : $MIG_DIR/migration.sql"

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
git commit -m "feat(events): additive schema for 0..N disciplines (join table, external labels) + MediaAsset.eventId"

echo
echo "###########################################################################"
echo "# ÉTAPE DB MANUELLE REQUISE (mutation base — volontairement hors script) : #"
echo "#                                                                         #"
echo "#     pnpm prisma migrate deploy                                          #"
echo "#                                                                         #"
echo "# Elle crée EventDiscipline, ajoute les colonnes ET backfille les données #"
echo "# existantes (disciplineId -> jointure, label -> array).                   #"
echo "#                                                                         #"
echo "# Vérification post-migration (doit renvoyer 0) :                          #"
echo "#   SELECT COUNT(*) FROM \"Event\" e WHERE e.\"disciplineId\" IS NOT NULL   #"
echo "#     AND NOT EXISTS (SELECT 1 FROM \"EventDiscipline\" ed                  #"
echo "#       WHERE ed.\"eventId\" = e.\"id\" AND ed.\"disciplineId\" = e.\"disciplineId\");"
echo "###########################################################################"