#!/usr/bin/env bash
###############################################################################
# ÉTAPE 1a — Découpler la destination d'upload de la discipline (FONDATION)
#
# Ce que fait ce script :
#   1. prisma/schema.prisma  : MediaAsset.categoryId devient nullable (Int?)
#                              + relation category optionnelle (Option A).
#   2. prisma/migrations/... : migration SQL non destructive (DROP NOT NULL).
#   3. contracts/upload.schema.ts : uploadDestinationSchema passe en
#                              discriminatedUnion + 2 destinations découplées :
#                              `general` et `perso`.
#   4. resolvePendingUploadFolder.service.ts : chemins pour general/perso ;
#                              perso dérivé de userId (jamais du client).
#   5. createUploadSignatures.service.ts : thread userId + garde images-only perso.
#   6. registerUploadedAssets.service.ts : row categoryId=null pour general/perso,
#                              + garde images-only perso.
#   7. cloudinaryStorageAdapter.ts : userId dans l'input createUploadAuthorization.
#   8. storage/router.ts     : passe ctx.user.id à createUploadAuthorization.
#
# NON inclus (étape 1b) : comptage images perso + quota constant + procédure
# tRPC de statut quota.
#
# Garde-fous : chaque édition est une substitution vérifiée (assert count==1) →
# si une ancre ne matche pas TON fichier, le script s'arrête AVANT tout commit.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
ROOT="$(pwd)"
echo "== Repo : $ROOT =="

test -f package.json          || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }
test -f prisma/schema.prisma  || { echo "ERREUR: prisma/schema.prisma introuvable."; exit 1; }

# Anti double-application : si `perso` est déjà là, on ne rejoue pas les edits.
if grep -q 'kind: z.literal("perso")' packages/contracts/src/cloudinary/upload.schema.ts 2>/dev/null; then
  echo "Déjà appliqué (destination \`perso\` présente). Rien à faire."
  exit 0
fi

# --------------------------------------------------------------------------- #
# 1. prisma/schema.prisma — categoryId nullable (scopé au modèle MediaAsset)  #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
import re
p = "prisma/schema.prisma"
s = open(p, encoding="utf-8").read()

m = re.search(r'(model MediaAsset \{.*?\n\})', s, re.S)
assert m, "Bloc `model MediaAsset { ... }` introuvable."
block = m.group(1)

block, n1 = re.subn(r'(\n\s*categoryId\s+Int)(?!\?)', r'\1?', block)
assert n1 == 1, f"Substitution `categoryId Int?` : {n1} match(es) (attendu 1)."

block, n2 = re.subn(
    r'(\n\s*category\s+)Category(\s+@relation\(fields: \[categoryId\])',
    r'\1Category?\2', block)
assert n2 == 1, f"Substitution relation `category Category?` : {n2} match(es) (attendu 1)."

s = s[:m.start(1)] + block + s[m.end(1):]
open(p, "w", encoding="utf-8").write(s)
print("  [1] schema.prisma : MediaAsset.categoryId -> Int? (+ relation optionnelle) OK")
PY

# --------------------------------------------------------------------------- #
# 2. Migration SQL (horodatage > dernière migration pour s'appliquer en dernier)
# --------------------------------------------------------------------------- #
MIG_DIR="prisma/migrations/20261010000000_media_asset_category_nullable"
mkdir -p "$MIG_DIR"
cat > "$MIG_DIR/migration.sql" << 'EOF'
-- Découple MediaAsset de la catégorie : les uploads `general` et `perso`
-- n'ont ni discipline ni catégorie. `categoryId` devient nullable, exactement
-- comme `disciplineId` l'est déjà. Opération non destructive (DROP NOT NULL
-- sur une colonne existante) — aucun besoin de CREATEDB.
ALTER TABLE "MediaAsset" ALTER COLUMN "categoryId" DROP NOT NULL;
EOF
echo "  [2] migration créée : $MIG_DIR/migration.sql"

# --------------------------------------------------------------------------- #
# 3. contracts/upload.schema.ts — discriminatedUnion + general/perso          #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/contracts/src/cloudinary/upload.schema.ts"
s = open(p, encoding="utf-8").read()

old = '''export const uploadDestinationSchema = z.union([
  z.object({
    kind: z.literal("existing-discipline"),
    categoryId: z.number().int().positive(),
    disciplineId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("new-discipline"),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().trim().min(1).max(120),
  }),
]);'''

new = '''export const uploadDestinationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("existing-discipline"),
    categoryId: z.number().int().positive(),
    disciplineId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("new-discipline"),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().trim().min(1).max(120),
  }),
  // ── Destinations découplées de la discipline (fondation) ──
  // `general` : contenus du club sans discipline ni catégorie. Fait office
  //             d'espace partagé de fait entre admins (pas de permissions :
  //             club petit, confiance).
  z.object({
    kind: z.literal("general"),
  }),
  // `perso`   : espace personnel de l'admin. Aucune identité transportée ici —
  //             le dossier cible est dérivé côté serveur de `ctx.user.id`, si
  //             bien qu'un admin ne peut uploader QUE dans son propre dossier.
  z.object({
    kind: z.literal("perso"),
  }),
]);'''

assert s.count(old) == 1, f"Bloc uploadDestinationSchema : {s.count(old)} match(es) (attendu 1)."
open(p, "w", encoding="utf-8").write(s.replace(old, new))
print("  [3] upload.schema.ts : discriminatedUnion + general/perso OK")
PY

# --------------------------------------------------------------------------- #
# 4. resolvePendingUploadFolder.service.ts — réécriture complète              #
# --------------------------------------------------------------------------- #
cat > packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts << 'EOF'
import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";

/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin Cloudinary
 * `pending` absolu.
 *
 * ─── Destinations couplées à une discipline (historique) ─────────────────
 *   - existing-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/${slug(discipline.name)}`
 *   - new-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/new/${slug(proposedName)}`
 *     Les assets restent isolés dans `new/` jusqu'à validation admin.
 *
 * ─── Destinations découplées (fondation « destination générique ») ────────
 *   - general : `${appRoot}/pending/general`
 *       Espace club sans discipline ni catégorie. Sert d'espace partagé de
 *       fait entre admins (pas de permissions : club petit, confiance).
 *   - perso   : `${appRoot}/pending/persos/${personSlug}-${userId}`
 *       Espace personnel de l'admin qui uploade. Le dossier est dérivé de
 *       `userId` (identité AUTHENTIFIÉE issue du contexte tRPC, jamais un id
 *       fourni par le client) → un admin ne peut écrire que dans son dossier.
 *       `personSlug` = slug(firstName lastName), sinon slug(pseudo), sinon
 *       `user-${userId}` (les trois champs de nom sont nullable en DB).
 *
 * ─── ⚠️ Pourquoi slug du nom et pas l'ID numérique (disciplines) ──────────
 *
 * Historiquement le path utilisait `discipline.id`, ce qui divergeait de
 * `buildR2Path` (UI, en slug) et du finder/TreeView (navigation en slug) :
 * les assets sous `cours/3/` devenaient invisibles dans le finder qui
 * cherchait sous `cours/tchoy-lee-fut/`. On aligne donc Cloudinary sur la
 * convention slug, la seule cohérente avec la navigation UI.
 */
const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

export async function resolvePendingUploadFolder(params: {
  prisma: PrismaClient;
  destination: UploadDestination;
  appRoot: string;
  /**
   * Identité de l'admin qui uploade (issue de `ctx.user.id`). Requise pour la
   * destination `perso` (dossier dérivé de cet id). Ignorée pour les autres.
   */
  userId: string;
}): Promise<string> {
  const { prisma, destination, appRoot, userId } = params;

  /* ── Destination club générique (sans discipline ni catégorie) ── */
  if (destination.kind === "general") {
    return `${appRoot}/pending/general`;
  }

  /* ── Destination personnelle de l'admin (dérivée de userId) ── */
  if (destination.kind === "perso") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, pseudo: true },
    });

    if (!user) {
      throw new Error(`Acting user not found (id=${userId})`);
    }

    const fullName = [user.firstName, user.lastName]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(" ");

    const personSlug =
      slug(fullName) || slug(user.pseudo ?? "") || `user-${userId}`;

    return `${appRoot}/pending/persos/${personSlug}-${userId}`;
  }

  /* ── Destinations couplées à une discipline (historique) ── */
  const category = await prisma.category.findUnique({
    where: { id: destination.categoryId },
    select: { id: true, type: true },
  });

  if (!category) {
    throw new Error(`Category not found (id=${destination.categoryId})`);
  }

  const categorySegment = slug(category.type);

  if (destination.kind === "existing-discipline") {
    const discipline = await prisma.discipline.findUnique({
      where: { id: destination.disciplineId },
      select: { id: true, categoryId: true, name: true },
    });

    if (!discipline) {
      throw new Error(`Discipline not found (id=${destination.disciplineId})`);
    }

    if (discipline.categoryId !== destination.categoryId) {
      throw new Error(
        `Discipline ${destination.disciplineId} does not belong to category ${destination.categoryId}`,
      );
    }

    // Fallback `disc-${id}` si le nom slugifie en chaîne vide (cas très rare
    // de nom uniquement composé de caractères non transliterables).
    const disciplineSlug = slug(discipline.name) || `disc-${discipline.id}`;

    return `${appRoot}/pending/${categorySegment}/${disciplineSlug}`;
  }

  // kind === "new-discipline"
  const proposedSlug = slug(destination.proposedDisciplineName);

  if (!proposedSlug) {
    throw new Error(
      "Proposed discipline name must contain at least one slug-friendly character",
    );
  }

  return `${appRoot}/pending/${categorySegment}/new/${proposedSlug}`;
}
EOF
echo "  [4] resolvePendingUploadFolder.service.ts : general/perso + userId OK"

# --------------------------------------------------------------------------- #
# 5. createUploadSignatures.service.ts — userId + garde images-only perso     #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts"
s = open(p, encoding="utf-8").read()

a = "  appRoot: string;\n  destination: UploadDestination;"
b = "  appRoot: string;\n  userId: string;\n  destination: UploadDestination;"
assert s.count(a) == 1, f"[5.1] params userId : {s.count(a)} match(es)."
s = s.replace(a, b)

a = "  const { prisma, appRoot, destination, assets, allowOverwrite } = params;"
b = "  const { prisma, appRoot, userId, destination, assets, allowOverwrite } = params;"
assert s.count(a) == 1, f"[5.2] destructure userId : {s.count(a)} match(es)."
s = s.replace(a, b)

guard = b + '''

  // Le dossier perso n'accepte que des images (comme les avatars).
  if (destination.kind === "perso") {
    const hasNonImage = assets.some((asset) => asset.mediaType !== "image");
    if (hasNonImage) {
      throw new Error("Le dossier perso n'accepte que des images.");
    }
  }'''
assert s.count(b) == 1, f"[5.3] ancre garde perso : {s.count(b)} match(es)."
s = s.replace(b, guard)

a = '''  const folder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
  });'''
b = '''  const folder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
    userId,
  });'''
assert s.count(a) == 1, f"[5.4] resolve call userId : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [5] createUploadSignatures.service.ts : userId + garde images-only OK")
PY

# --------------------------------------------------------------------------- #
# 6. registerUploadedAssets.service.ts — row nullable + garde images-only     #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/registerUploadedAssets.service.ts"
s = open(p, encoding="utf-8").read()

a = '''  const expectedFolder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
  });'''
b = '''  const expectedFolder = await resolvePendingUploadFolder({
    prisma,
    destination,
    appRoot,
    userId,
  });'''
assert s.count(a) == 1, f"[6.1] resolve call userId : {s.count(a)} match(es)."
s = s.replace(a, b)

anchor = "  const { prisma, appRoot, userId, destination, assets, eventDate } = params;"
guard = anchor + '''

  // Le dossier perso n'accepte que des images (garde-fou côté persistance —
  // la source de vérité resourceType vient déjà de Cloudinary en amont).
  if (destination.kind === "perso") {
    const hasNonImage = assets.some((asset) => asset.resourceType !== "image");
    if (hasNonImage) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Le dossier perso n'accepte que des images.",
      });
    }
  }'''
assert s.count(anchor) == 1, f"[6.2] ancre garde perso : {s.count(anchor)} match(es)."
s = s.replace(anchor, guard)

a = '''          categoryId: destination.categoryId,
          disciplineId:
            destination.kind === "existing-discipline"
              ? destination.disciplineId
              : null,'''
b = '''          categoryId:
            destination.kind === "existing-discipline" ||
            destination.kind === "new-discipline"
              ? destination.categoryId
              : null,
          disciplineId:
            destination.kind === "existing-discipline"
              ? destination.disciplineId
              : null,'''
assert s.count(a) == 1, f"[6.3] bloc create categoryId : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [6] registerUploadedAssets.service.ts : categoryId nullable + garde OK")
PY

# --------------------------------------------------------------------------- #
# 7. cloudinaryStorageAdapter.ts — userId dans l'input                        #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"
s = open(p, encoding="utf-8").read()

a = '''export type CloudinaryCreateUploadAuthorizationInput = {
  destination: UploadDestination;'''
b = '''export type CloudinaryCreateUploadAuthorizationInput = {
  userId: string; // Admin qui uploade (ctx.user.id) — requis pour la destination `perso`.
  destination: UploadDestination;'''
assert s.count(a) == 1, f"[7.1] input type userId : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''      return createUploadSignatures({
        prisma,
        appRoot,
        destination: input.destination,'''
b = '''      return createUploadSignatures({
        prisma,
        appRoot,
        userId: input.userId,
        destination: input.destination,'''
assert s.count(a) == 1, f"[7.2] pass userId : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [7] cloudinaryStorageAdapter.ts : userId threading OK")
PY

# --------------------------------------------------------------------------- #
# 8. storage/router.ts — passe ctx.user.id à createUploadAuthorization        #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()

a = '''          return adapter.createUploadAuthorization({
            destination: input.destination,'''
b = '''          return adapter.createUploadAuthorization({
            userId: ctx.user.id,
            destination: input.destination,'''
assert s.count(a) == 1, f"[8] router userId : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [8] storage/router.ts : ctx.user.id passé OK")
PY

echo
echo "== Éditions appliquées =="

# Escape-hatch de test (ne PAS définir en usage normal) : applique les edits
# puis s'arrête avant tooling/commit, pour inspecter `git diff`.
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."
  exit 0
fi

# --------------------------------------------------------------------------- #
#  Tooling : prisma generate -> typecheck -> commit (si vert)                 #
# --------------------------------------------------------------------------- #
echo "== prisma generate (client avec categoryId nullable) =="
pnpm prisma generate

echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(upload): decouple upload destination from discipline (general/perso), categoryId nullable"

echo
echo "###########################################################################"
echo "# ÉTAPE DB MANUELLE REQUISE (mutation base — volontairement hors script) : #"
echo "#                                                                         #"
echo "#     pnpm prisma migrate deploy                                          #"
echo "#                                                                         #"
echo "# Tant que non appliquée, un upload general/perso lèvera une erreur à     #"
echo "# l'écriture (categoryId NULL refusé par la contrainte encore active).    #"
echo "# Les uploads discipline restent inchangés d'ici là.                      #"
echo "###########################################################################"