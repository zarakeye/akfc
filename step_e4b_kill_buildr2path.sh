#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 4b (FRONT + BACKEND + CONTRACTS) : `buildR2Path` disparaît.
#
# Le chemin R2 était calculé DEUX fois — une fois côté client (`buildR2Path`,
# slugify maison), une fois côté serveur (`resolvePendingUploadFolder`, npm
# slugify). Prouvé divergent sur `&` et `%`. On supprime la copie client :
# `createR2Upload` reçoit désormais une `destination` (comme la branche
# Cloudinary l'a toujours fait) et calcule le chemin lui-même, avec la MÊME
# fonction — donc plus aucun écart possible.
#
# Bonus : en passant par le schéma `destination` des contracts (5 kinds), la
# destination `perso` devient acceptée gratuitement. Item de backlog « R2
# perso » fermé — `resolvePendingUploadFolder` savait déjà faire perso, seule
# la copie client l'ignorait.
#
# Prérequis : étape 4a (chemins plats backend).
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

FORM="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
ROUTER="packages/backend/src/modules/storage/router.ts"
SCHEMA="packages/contracts/src/storage/r2-upload.schema.ts"
R2ADAPTER="packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
NAMER="packages/backend/src/modules/storage/services/buildUploadFileName.service.ts"

# ── Gardes de prérequis ─────────────────────────────────────────────────────
for f in "$FORM" "$ROUTER" "$SCHEMA" "$R2ADAPTER"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine du repo."; exit 1; }
done
grep -q 'appRoot}/general`' packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts \
  || { echo "✗ étape 4a absente — lance d'abord step_e4a_flat_upload_backend.sh."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if ! grep -q "const buildR2Path" "$FORM"; then
  echo "→ buildR2Path déjà supprimé, rien à faire."
  exit 0
fi

# ── 1) Le nommeur de fichier serveur (une règle, un endroit) ────────────────
mkdir -p "$(dirname "$NAMER")"
cat > "$NAMER" <<'TSEOF'
import slugify from 'slugify';

/**
 * Nom de fichier sûr pour une clé de stockage, dérivé du nom d'origine.
 *
 * Vivait côté client dans `DragNDropForm` (`buildR2Path` + un `slugify`
 * maison). Deux problèmes réglés en le remontant ici :
 *
 *   1. le `slugify` maison divergeait du paquet npm sur `&` (→ `and`) et `%`
 *      (→ `percent`) : une discipline « Arts & Combat » produisait deux
 *      dossiers, l'un pour ses photos (Cloudinary, chemin serveur), l'autre
 *      pour ses PDF (R2, chemin client). Une seule fonction = zéro écart ;
 *   2. la règle de nommage devient une décision serveur, pas une supposition
 *      que le client aurait pu contourner.
 *
 * Le base name est slugifié ; l'extension est conservée en minuscules. Un nom
 * sans extension reste sans extension.
 */
export function buildUploadFileName(originalFileName: string): string {
  const dotIdx = originalFileName.lastIndexOf('.');
  const hasExt = dotIdx > 0 && dotIdx < originalFileName.length - 1;

  const baseName = hasExt
    ? originalFileName.slice(0, dotIdx)
    : originalFileName;
  const ext = hasExt ? originalFileName.slice(dotIdx).toLowerCase() : '';

  const safeBase =
    slugify(baseName, { lower: true, strict: true }) || 'fichier';

  return `${safeBase}${ext}`;
}
TSEOF
echo "✓ $NAMER créé"

python3 - <<'PYEOF'
import pathlib

def sub(path, old, new, label):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    assert src.count(old) == 1, f"[{label}] ancre trouvee {src.count(old)} fois, attendu 1"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

FORM   = "apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
ROUTER = "packages/backend/src/modules/storage/router.ts"
SCHEMA = "packages/contracts/src/storage/r2-upload.schema.ts"

print("─── contracts ───")

# Le schema d'auth R2 prend une destination + un nom de fichier, plus un path.
sub(SCHEMA,
    'import { z } from "zod";',
    'import { z } from "zod";\n\nimport { uploadDestinationSchema } from "@contracts/cloudinary/upload.schema";',
    "schema : import uploadDestinationSchema")

sub(SCHEMA,
    """export const createR2UploadAuthorizationSchema = z.object({
  /**
   * Path virtuel cible (ex: \"AKFC/pending/Cours/12/intro.mp3\"). Doit
   * commencer par l'appRoot configuré côté backend — la validation
   * détaillée est faite par l'adapter.
   */
  path: z.string().min(1),
""",
    """export const createR2UploadAuthorizationSchema = z.object({
  /**
   * Destination métier — le serveur en dérive le chemin, exactement comme la
   * branche Cloudinary. Le client ne calcule plus de chemin : c'était la
   * source de la divergence de slug entre les deux providers.
   */
  destination: uploadDestinationSchema,

  /**
   * Nom de fichier d'origine. Le serveur en tire une clé sûre via
   * `buildUploadFileName` — même règle pour tous les providers.
   */
  originalFileName: z.string().min(1).max(255),
""",
    "schema : path → destination + originalFileName")

print("─── routeur ───")

# createR2Upload calcule le chemin serveur et le RENVOIE.
sub(ROUTER,
    """  createR2Upload: protectedProcedure
    .input(createR2UploadAuthorizationSchema)
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter(\"r2\", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      return adapter.createUploadAuthorization({
        path: input.path,
        mimeType: input.mimeType,
        maxBytes: input.maxBytes,
      });
    }),""",
    """  createR2Upload: protectedProcedure
    .input(createR2UploadAuthorizationSchema)
    .mutation(async ({ ctx, input }) => {
      // Le chemin se calcule ICI, une seule fois, avec la même règle que
      // Cloudinary. `buildR2Path` (client) n'existe plus.
      const folder = await resolvePendingUploadFolder({
        prisma: ctx.prisma,
        destination: input.destination,
        appRoot: ctx.appRoot,
        userId: ctx.user.id,
      });
      const fileName = buildUploadFileName(input.originalFileName);
      const path = `${folder}/${fileName}`;

      const adapter = getAdapter(\"r2\", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      const auth = await adapter.createUploadAuthorization({
        path,
        mimeType: input.mimeType,
        maxBytes: input.maxBytes,
      });

      // Le client a besoin du chemin résolu : il le renverra tel quel à
      // `registerR2Upload`. Le chemin ne retraverse jamais une règle de calcul.
      return { ...auth, path };
    }),""",
    "routeur : createR2Upload calcule et renvoie le chemin")

# Les imports du routeur.
p = pathlib.Path(ROUTER)
src = p.read_text(encoding="utf-8")
imports = []
if "resolvePendingUploadFolder" not in src.split("router({")[0]:
    imports.append("import { resolvePendingUploadFolder } from '@backend/modules/cloudinary/services/resolvePendingUploadFolder.service';")
if "buildUploadFileName" not in src:
    imports.append("import { buildUploadFileName } from '@backend/modules/storage/services/buildUploadFileName.service';")
if imports:
    lines = src.split("\n")
    last = max(i for i, l in enumerate(lines) if l.startswith("import "))
    for imp in reversed(imports):
        lines.insert(last + 1, imp)
    p.write_text("\n".join(lines), encoding="utf-8")
    print(f"  ✓ routeur : {len(imports)} import(s) ajouté(s)")

print("─── front ───")

# Suppression de buildR2Path (l.465-507) : on coupe du commentaire de section
# au dernier return, bloc entier.
p = pathlib.Path(FORM)
src = p.read_text(encoding="utf-8")
START = "  // -------------------------------\n  // Helpers — path R2\n  // -------------------------------\n  const buildR2Path"
end_marker = "return `${APP_ROOT}/pending/${categorySlug}/${disciplineSlug}/${safeFileName}`;\n  };\n"
i = src.find(START)
assert i != -1, "[form] début de buildR2Path introuvable"
j = src.find(end_marker, i)
assert j != -1, "[form] fin de buildR2Path introuvable"
src = src[:i] + src[j + len(end_marker):]
p.write_text(src, encoding="utf-8")
print("  ✓ front : buildR2Path supprimé")

# L'appel dans uploadR2Single : plus de path client, on envoie destination.
sub(FORM,
    """    const path = buildR2Path(destination, item.file.name);

    try {
      const auth = await createR2UploadMutation.mutateAsync({
        path,
        mimeType: item.file.type,
        maxBytes: item.file.size,
      });""",
    """    try {
      // Le serveur calcule le chemin (une seule règle, tous providers) et le
      // renvoie dans `auth.path` — on le réutilise pour l'enregistrement.
      const auth = await createR2UploadMutation.mutateAsync({
        destination,
        originalFileName: item.file.name,
        mimeType: item.file.type,
        maxBytes: item.file.size,
      });
      const path = auth.path;""",
    "front : uploadR2Single envoie destination")

# Le slugify maison ne servait qu'à buildR2Path : il devient du code mort.
sub(FORM,
    """function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

""",
    "",
    "front : slugify maison supprimé (ne servait qu'à buildR2Path)")
PYEOF

echo
echo "→ contrôle : plus aucune trace de buildR2Path ni du slugify maison"
if grep -n "buildR2Path\|^function slugify" "$FORM"; then
  echo "  ✗ il en reste"; exit 1
fi
echo "  ✓ propre"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck…"
pnpm --filter backend typecheck && pnpm typecheck

git add -A && git commit -m "feat(upload): supprime buildR2Path, chemin R2 calcule cote serveur — un seul slug (etape 4b)"
echo "✓ commité."