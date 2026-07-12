#!/usr/bin/env bash
###############################################################################
# ÉTAPE 2a — Espace perso : dossier racine partagé + sous-dossier photos +
#            enforcement backend du quota.
#
#   1. resolvePersoBaseFolder.service.ts : NOUVEAU. Résout le dossier RACINE
#      de l'espace perso d'un admin (provider-agnostique). Les zones média s'y
#      accrochent : photos (Cloudinary) → `${base}/photos` ; documents/audio
#      (R2, à venir) → `${base}/documents`, `${base}/audio`. Évite la
#      divergence de slug entre Cloudinary et R2.
#   2. resolvePendingUploadFolder.service.ts : la branche perso délègue au
#      helper et renvoie `${base}/photos`.
#   3. createUploadSignatures.service.ts : refuse la signature si le quota
#      d'images perso serait dépassé (les écrasements ne comptent pas).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="

test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q 'kind: z.literal("perso")' packages/contracts/src/cloudinary/upload.schema.ts 2>/dev/null; then
  echo "ERREUR: étape 1a absente. Lance 1a/fix/1b d'abord."; exit 1
fi

MEDIA_SVC="packages/backend/src/modules/media/services"
BASE_FILE="$MEDIA_SVC/resolvePersoBaseFolder.service.ts"

if [ -f "$BASE_FILE" ]; then
  echo "Déjà appliqué (resolvePersoBaseFolder présent). Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. resolvePersoBaseFolder.service.ts (nouveau, partagé)                      #
# --------------------------------------------------------------------------- #
cat > "$BASE_FILE" << 'EOF'
import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

/**
 * Résout le dossier RACINE de l'espace perso d'un admin, SANS sous-dossier de
 * média — partagé entre providers. Chaque zone média s'y accroche :
 *   - photos (Cloudinary)          → `${base}/photos`
 *   - documents / audio (R2, plus tard) → `${base}/documents`, `${base}/audio`
 *
 * Dérivé de `userId` (identité AUTHENTIFIÉE, jamais un id fourni par le
 * client) → un admin n'accède qu'à son propre espace. Le segment `-${userId}`
 * assure l'unicité et reste STABLE même si le nom (donc le slug) change.
 *
 * Cette extraction évite la divergence de slug entre Cloudinary et R2 : les
 * deux passeront par ce même résolveur.
 */
export async function resolvePersoBaseFolder(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<string> {
  const { prisma, appRoot, userId } = params;

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
EOF
echo "  [1] resolvePersoBaseFolder.service.ts OK"

# --------------------------------------------------------------------------- #
# 2. resolvePendingUploadFolder.service.ts : perso → base + /photos            #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
s = open(p, encoding="utf-8").read()

imp = 'import type { UploadDestination } from "@contracts/cloudinary/upload.types";'
imp_add = imp + '''
import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";'''
assert s.count(imp) == 1, f"[2.imp] : {s.count(imp)} match(es)."
s = s.replace(imp, imp_add)

old = '''  if (destination.kind === "perso") {
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
  }'''
new = '''  if (destination.kind === "perso") {
    const base = await resolvePersoBaseFolder({ prisma, appRoot, userId });
    // Les photos vivent dans le sous-dossier `photos/` de l'espace perso, pour
    // une structure homogène avec les futures zones R2 (documents/, audio/).
    return `${base}/photos`;
  }'''
assert s.count(old) == 1, f"[2.perso] branche perso : {s.count(old)} match(es)."
s = s.replace(old, new)

open(p, "w", encoding="utf-8").write(s)
print("  [2] resolvePendingUploadFolder.service.ts : perso -> base + /photos OK")
PY

# --------------------------------------------------------------------------- #
# 3. createUploadSignatures.service.ts : enforcement quota perso               #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts"
s = open(p, encoding="utf-8").read()

imp = 'import { resolvePendingUploadFolder } from "@backend/modules/cloudinary/services/resolvePendingUploadFolder.service";'
imp_add = imp + '''
import { countPersoImages } from "@backend/modules/media/services/countPersoImages.service";
import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";'''
assert s.count(imp) == 1, f"[3.imp] : {s.count(imp)} match(es)."
s = s.replace(imp, imp_add)

anchor = '''  const existingSet = new Set(existing.map((e) => e.publicId));

  return assets.map((asset) => {'''
add = '''  const existingSet = new Set(existing.map((e) => e.publicId));

  // ── Enforcement du quota perso (AVANT tout upload) ──
  // Approximation volontaire : les fichiers déjà présents dans le dossier
  // (écrasements) n'augmentent pas le total → on ne compte que le neuf.
  // L'approximation penche du côté permissif (jamais de faux blocage).
  if (destination.kind === "perso") {
    const { total } = await countPersoImages({ prisma, appRoot, userId });
    const newCount = assets.length - existing.length;
    if (total + newCount > PERSO_PHOTO_QUOTA) {
      throw new Error(
        `Quota d'images perso atteint (max ${PERSO_PHOTO_QUOTA}). ` +
          `Actuel : ${total}. Nouvelles demandées : ${Math.max(0, newCount)}.`,
      );
    }
  }

  return assets.map((asset) => {'''
assert s.count(anchor) == 1, f"[3.enf] ancre existingSet : {s.count(anchor)} match(es)."
s = s.replace(anchor, add)

open(p, "w", encoding="utf-8").write(s)
print("  [3] createUploadSignatures.service.ts : enforcement quota perso OK")
PY

echo
echo "== Éditions appliquées =="

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."
  exit 0
fi

echo "== prisma generate =="
pnpm prisma generate
echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(upload): perso photos under /photos subfolder (shared base resolver) + quota enforcement"
echo "OK — 2a commité."