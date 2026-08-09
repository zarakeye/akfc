#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 1/6 : modèle Prisma + migration.
#
# Ajoute au schéma : enum `DocumentAudience`, modèles `MemberDocument`
# (surcouche « publié aux membres » sur un MediaAsset, pas de duplication),
# `MemberDocumentRecipient` (destinataires explicites — perso = 1, bureau = N,
# vide pour une diffusion à tous), `DocumentReceipt` (statut de lecture par
# membre : la double entrée en relationnel). Relations ajoutées sur User et
# MediaAsset.
#
# La migration SQL est fournie prête (prisma non exécutable côté Claude, et la
# contrainte CREATEDB interdit `migrate dev`). Après ce script :
#   pnpm prisma migrate deploy   # applique la migration en LOCAL
#   git push                     # puis, sur le serveur : pull + migrate deploy + up -d --build
#
# Le script régénère le client (`prisma generate`) avant le typecheck.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-model.sh
# Usage Claude sur clone (édite le schéma + écrit la migration, sans prisma) :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-model.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
MIG_DIR="prisma/migrations/20261013000000_member_documents"

if [ ! -f "package.json" ] || [ ! -f "$SCHEMA" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SCHEMA attendu)." >&2
  exit 1
fi

python3 - "$SCHEMA" <<'PY'
import sys, pathlib

sp = pathlib.Path(sys.argv[1])
s = sp.read_text(encoding="utf-8")

if "model MemberDocument" in s:
    print("schéma déjà à jour")
else:
    # ── Relations sur User ──────────────────────────────────────────────────
    U_OLD = '''  eventsAsOrganizer         Event[]       @relation("EventOrganizer")  // ← AJOUT'''
    U_NEW = '''  eventsAsOrganizer         Event[]       @relation("EventOrganizer")  // ← AJOUT

  // --- Documents membres
  memberDocumentsPublished  MemberDocument[]          @relation("MemberDocumentPublisher")
  memberDocumentRecipients  MemberDocumentRecipient[] @relation("MemberDocumentRecipient")
  documentReceipts          DocumentReceipt[]         @relation("DocumentReceiptUser")'''
    assert s.count(U_OLD) == 1, "ancre User introuvable/multiple — abandon"
    s = s.replace(U_OLD, U_NEW)

    # ── Relation inverse sur MediaAsset ─────────────────────────────────────
    M_OLD = '''  galleryItems GalleryItem[]'''
    M_NEW = '''  galleryItems GalleryItem[]

  /// Surcouche « mis à disposition des membres », si ce fichier est publié.
  memberDocument MemberDocument?'''
    assert s.count(M_OLD) == 1, "ancre MediaAsset introuvable/multiple — abandon"
    s = s.replace(M_OLD, M_NEW)

    # ── Enum + modèles (fin de fichier) ─────────────────────────────────────
    MODELS = '''

enum DocumentAudience {
  ALL_MEMBERS
  SPECIFIC
}

/// Document du club mis à disposition des membres (compte rendu d'AG, carte
/// d'affiliation…). Surcouche « publié aux membres » posée sur un fichier du
/// finder : référence le MediaAsset, ne duplique ni son chemin ni son URL.
model MemberDocument {
  id           String     @id @default(cuid())
  mediaAssetId String     @unique
  mediaAsset   MediaAsset @relation(fields: [mediaAssetId], references: [id], onDelete: Cascade)

  /// Titre affiché ; à défaut, le displayName de l'asset.
  title String?

  /// ALL_MEMBERS = diffusé à tous (nouveaux membres inclus d'office).
  /// SPECIFIC    = réservé aux membres listés dans `recipients` (perso = 1,
  /// bureau plus tard = N).
  audience DocumentAudience @default(ALL_MEMBERS)

  publishedAt   DateTime @default(now())
  publishedById String?
  publishedBy   User?    @relation("MemberDocumentPublisher", fields: [publishedById], references: [id], onDelete: SetNull)

  recipients MemberDocumentRecipient[]
  receipts   DocumentReceipt[]

  @@index([audience])
}

/// Destinataire explicite d'un MemberDocument SPECIFIC. Vide pour ALL_MEMBERS.
model MemberDocumentRecipient {
  id               String         @id @default(cuid())
  memberDocumentId String
  memberDocument   MemberDocument @relation(fields: [memberDocumentId], references: [id], onDelete: Cascade)
  userId           String
  user             User           @relation("MemberDocumentRecipient", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([memberDocumentId, userId])
  @@index([userId])
}

/// Statut de lecture par membre. Absence de ligne = jamais ouvert.
/// `readAt` null = marqué non lu (garde le signal de la cloche).
model DocumentReceipt {
  id               String         @id @default(cuid())
  memberDocumentId String
  memberDocument   MemberDocument @relation(fields: [memberDocumentId], references: [id], onDelete: Cascade)
  userId           String
  user             User           @relation("DocumentReceiptUser", fields: [userId], references: [id], onDelete: Cascade)
  readAt           DateTime?

  @@unique([memberDocumentId, userId])
  @@index([userId])
}
'''
    s = s.rstrip() + "\n" + MODELS
    sp.write_text(s, encoding="utf-8")
    print("schéma patché (MemberDocument + Recipient + Receipt)")
PY

# ── Migration SQL prête (idempotente : ne réécrit pas si déjà là) ────────────
if [ ! -f "$MIG_DIR/migration.sql" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- CreateEnum
CREATE TYPE "DocumentAudience" AS ENUM ('ALL_MEMBERS', 'SPECIFIC');

-- CreateTable
CREATE TABLE "MemberDocument" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "title" TEXT,
    "audience" "DocumentAudience" NOT NULL DEFAULT 'ALL_MEMBERS',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedById" TEXT,

    CONSTRAINT "MemberDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberDocumentRecipient" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MemberDocumentRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentReceipt" (
    "id" TEXT NOT NULL,
    "memberDocumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "DocumentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberDocument_mediaAssetId_key" ON "MemberDocument"("mediaAssetId");
CREATE INDEX "MemberDocument_audience_idx" ON "MemberDocument"("audience");
CREATE UNIQUE INDEX "MemberDocumentRecipient_memberDocumentId_userId_key" ON "MemberDocumentRecipient"("memberDocumentId", "userId");
CREATE INDEX "MemberDocumentRecipient_userId_idx" ON "MemberDocumentRecipient"("userId");
CREATE UNIQUE INDEX "DocumentReceipt_memberDocumentId_userId_key" ON "DocumentReceipt"("memberDocumentId", "userId");
CREATE INDEX "DocumentReceipt_userId_idx" ON "DocumentReceipt"("userId");

-- AddForeignKey
ALTER TABLE "MemberDocument" ADD CONSTRAINT "MemberDocument_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocument" ADD CONSTRAINT "MemberDocument_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentRecipient" ADD CONSTRAINT "MemberDocumentRecipient_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberDocumentRecipient" ADD CONSTRAINT "MemberDocumentRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentReceipt" ADD CONSTRAINT "DocumentReceipt_memberDocumentId_fkey" FOREIGN KEY ("memberDocumentId") REFERENCES "MemberDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentReceipt" ADD CONSTRAINT "DocumentReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
SQL
  echo "migration SQL écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente — laissée telle quelle"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de prisma generate, ni typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -8 /tmp/akfc_gen.log; exit 1; }
echo "✅ client régénéré"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): modèle MemberDocument + Recipient + Receipt (+ migration)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo ""
  echo "➡️  Applique la migration :  pnpm prisma migrate deploy   (puis git push, et sur le serveur : pull + migrate deploy + docker compose up -d --build akfc)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi