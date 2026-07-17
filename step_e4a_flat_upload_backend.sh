#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 4a (BACKEND / CLOUDINARY) : les uploads écrivent à plat.
#
# Prérequis : l'étape 3 (step_e3_ab1_repair.sh + step_e3b2_flip.sh).
#   Sans elle, un upload à plat serait un asset dont personne ne sait dire le
#   statut : `reconcileMovedAsset` le dériverait encore du chemin.
#
# Après ce script, un dépôt donne `AKFC/cours/tchoy-lee-fut/x.jpg` au lieu de
# `AKFC/pending/cours/tchoy-lee-fut/x.jpg`. Le pliage accepte les deux formes
# EN MÊME TEMPS — `physicalCandidates(P)` contient P lui-même, en premier —
# donc les anciens assets restent visibles à côté des nouveaux. Rien à migrer
# pour que ça marche ; l'étape 5 ne fera que du rangement.
#
# ⚠️ Ne touche PAS `buildR2Path` (front, dans DragNDropForm.tsx, 1297 lignes
#    jamais lues). Les uploads R2 continuent d'écrire sous `pending/`. C'est
#    cohérent : le pliage les voit. C'est l'étape 4b.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

UP="packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
PERSO="packages/backend/src/modules/media/services/resolvePersoBaseFolder.service.ts"
GEN="packages/backend/src/modules/media/services/listGeneralFolders.service.ts"

# ── Gardes de prérequis ─────────────────────────────────────────────────────
for f in "$UP" "$PERSO" "$GEN"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine du repo."; exit 1; }
done
grep -q "assertStatusChangeDoesntUnpublishReferencedAssets" packages/backend/src/modules/media/router.ts \
  || { echo "✗ étape 3 absente — lance d'abord step_e3_ab1_repair.sh."; exit 1; }
grep -q "trpc.media.setStatus.useMutation" apps/web/src/features/finder-core/hooks/useStatusChange.ts \
  || { echo "✗ le flip (step_e3b2_flip.sh) n'est pas passé — publier dériverait encore du chemin."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if ! grep -q 'appRoot}/pending/general`' "$UP"; then
  echo "→ les uploads écrivent déjà à plat, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def sub(path, old, new, label):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    assert src.count(old) == 1, f"[{label}] ancre trouvee {src.count(old)} fois, attendu 1"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

UP    = "packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
PERSO = "packages/backend/src/modules/media/services/resolvePersoBaseFolder.service.ts"
GEN   = "packages/backend/src/modules/media/services/listGeneralFolders.service.ts"

print("─── le constructeur de chemins d'upload ───")

sub(UP,
    """ * Traduit une intention d'upload (`Destination`) en chemin Cloudinary
 * `pending` absolu.""",
    """ * Traduit une intention d'upload (`Destination`) en chemin Cloudinary absolu.
 *
 * ─── ⚠️ Le nom de cette fonction est historique ──────────────────────────
 *
 * Elle ne résout plus rien de « pending ». Depuis l'étape 3, un upload naît
 * `pending` parce que `registerUploadedAssets` écrit `status: "pending"` en
 * base — pas parce qu'il atterrit sous un dossier qui s'appelle ainsi. Le
 * chemin ne dit plus le statut : il dit juste où est le fichier.
 *
 * Le renommage (`resolveUploadFolder`) touche `registerUploadedAssets`,
 * `createUploadSignatures`, un commentaire de `DragNDropForm` et un tutoriel
 * MDX. Il part avec le reste à l'étape 6, plutôt que d'élargir un incrément
 * qui parle de chemins.""",
    "en-tete : le nom devient historique")

sub(UP,
    """ * ─── Destinations couplées à une discipline (historique) ─────────────────
 *   - existing-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/${slug(discipline.name)}`
 *   - new-discipline :
 *       `${appRoot}/pending/${slug(category.type)}/new/${slug(proposedName)}`""",
    """ * ─── Destinations couplées à une discipline (historique) ─────────────────
 *   - existing-discipline :
 *       `${appRoot}/${slug(category.type)}/${slug(discipline.name)}`
 *   - new-discipline :
 *       `${appRoot}/${slug(category.type)}/new/${slug(proposedName)}`""",
    "doc : destinations discipline")

sub(UP,
    """ *   - general : `${appRoot}/pending/general`""",
    """ *   - general : `${appRoot}/general`""",
    "doc : general")

sub(UP,
    """ *   - perso   : `${appRoot}/pending/persos/${personSlug}-${userId}`""",
    """ *   - perso   : `${appRoot}/persos/${personSlug}-${userId}`""",
    "doc : perso")

sub(UP,
    "      return `${appRoot}/pending/general`;",
    "      return `${appRoot}/general`;",
    "return : general (racine)")

sub(UP,
    "    return `${appRoot}/pending/general/${folderSlug}`;",
    "    return `${appRoot}/general/${folderSlug}`;",
    "return : general (sous-dossier)")

sub(UP,
    "    return `${appRoot}/pending/events/${eventSlug || `event-${event.id}`}`;",
    "    return `${appRoot}/events/${eventSlug || `event-${event.id}`}`;",
    "return : event")

sub(UP,
    "    return `${appRoot}/pending/${categorySegment}/${disciplineSlug}`;",
    "    return `${appRoot}/${categorySegment}/${disciplineSlug}`;",
    "return : existing-discipline")

sub(UP,
    "  return `${appRoot}/pending/${categorySegment}/new/${proposedSlug}`;",
    "  return `${appRoot}/${categorySegment}/new/${proposedSlug}`;",
    "return : new-discipline")

print("─── l'espace perso ───")

sub(PERSO,
    "  return `${appRoot}/pending/persos/${personSlug}-${userId}`;",
    "  return `${appRoot}/persos/${personSlug}-${userId}`;",
    "resolvePersoBaseFolder : chemin plat")

print("─── le select « dossier existant » ───")

# Cinquieme recopie de la regle des strates : deux candidats sur trois, en dur.
# Apres 4a, le troisieme (le plat) est justement celui qui recoit les uploads.
sub(GEN,
    """  const prefixes = [
    `${appRoot}/pending/general/`,
    `${appRoot}/published/general/`,
  ];""",
    """  // Les emplacements possibles d'un dossier `general/` ne se listent pas à la
  // main : `physicalCandidates` EST la règle du pliage, et elle rend les trois
  // — le plat, `pending/`, `published/`. Les deux premiers étaient codés en
  // dur ici ; le troisième, celui qui reçoit désormais les uploads, aurait
  // manqué, et le dossier aurait disparu du select sans un mot.
  const prefixes = physicalCandidates(`${appRoot}/general`, appRoot).map(
    (candidate) => `${candidate}/`,
  );""",
    "listGeneralFolders : prefixes derives, plus recopies")

# L'import qui va avec.
p = pathlib.Path(GEN)
src = p.read_text(encoding="utf-8")
IMPORT = "import { physicalCandidates } from '@backend/modules/storage/logicalPath';"
if IMPORT not in src:
    lines = src.split("\n")
    last_import = max(
        (i for i, l in enumerate(lines) if l.startswith("import ")), default=-1
    )
    assert last_import >= 0, "[listGeneralFolders] aucun import trouve — ancre introuvable"
    lines.insert(last_import + 1, IMPORT)
    p.write_text("\n".join(lines), encoding="utf-8")
    print("  ✓ listGeneralFolders : import physicalCandidates")
PYEOF

echo
echo "→ contrôle : plus aucun chemin d'upload sous une strate côté backend"
if grep -rn 'pending/' "$UP" "$PERSO" | grep -v '^\s*[0-9]*:\s*\*' | grep -v '//'; then
  echo "  ✗ il reste des occurrences — à lire"
  exit 1
fi
echo "  ✓ aucune"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck…"
pnpm --filter backend typecheck && pnpm typecheck

git add -A && git commit -m "feat(upload): chemins plats cote backend, prefixes general derives (etape 4a)"
echo "✓ commité."