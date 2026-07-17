#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — La corbeille fait le ménage à l'aller, jamais au retour
# ═══════════════════════════════════════════════════════════════════════════
#
#  Symptôme : corbeille vide à l'écran, chevron persistant. Et en base :
#
#      AKFC/bin
#      AKFC/bin/.trash
#      AKFC/bin/.trash/628bb8e1-…      ← quarantaines d'items restaurés
#      AKFC/bin/.trash/e86ca3af-…
#
#  ─── La cause ───────────────────────────────────────────────────────────
#
#  `pruneEmptyFolders` existe, il est correct, et il est appelé depuis UN SEUL
#  endroit : `cloudinaryStorageAdapter.ts:403`, dans `move()`.
#
#  Or ni `restoreFromBin` ni `purge` ne passent par l'adapter. Ils appellent
#  `cloudinary.uploader.rename` / `deleteByPrefix` en direct. Le ménage se
#  fait donc à l'ALLER (`trashToBin` supprime les lignes de la source) et
#  jamais au RETOUR : le dossier de quarantaine se vide de ses assets et sa
#  ligne `Folder` survit. Le finder bâtissant son arbre sur cette table, le
#  chevron reste.
#
#  ─── Trois corrections ──────────────────────────────────────────────────
#
#   1. `restoreFromBin` prune la quarantaine après avoir sorti son contenu.
#   2. `purge` prune la quarantaine après l'avoir supprimée.
#   3. `trashToBin` : le `folder.deleteMany` de la source utilise
#      `startsWith: normalized` — SANS slash final. Jeter `AKFC/pending/cours`
#      supprimait donc aussi les lignes de `AKFC/pending/cours-avance`. C'est
#      exactement la collision de préfixe contre laquelle la ligne du dessus
#      se prémunit pour Cloudinary (« trailing slash pour éviter les
#      collisions ») — la protection n'avait pas été portée côté DB.
#
#  ─── Pourquoi `pruneEmptyFolders` convient ici, malgré son en-tête ──────
#
#  Il se déclare « strictement Cloudinary : R2 n'utilise pas la table Folder ».
#  Ce n'est pas une limite dans ce contexte : `restoreFromBin` et `purge`
#  n'utilisent QUE `cloudinary.*` — la corbeille est entièrement Cloudinary
#  par construction. (Corollaire, hors sujet : un asset R2 ne peut aujourd'hui
#  ni être restauré ni être purgé.)
#
#  ─── Ce que le prune atteint, et où il s'arrête ─────────────────────────
#
#      AKFC/bin/.trash/<uuid>   4 segments  → purgé (vide)
#      AKFC/bin/.trash          3 segments  → purgé SI plus aucun asset dessous
#      AKFC/bin                 2 segments  → JAMAIS (minDepth = 2)
#
#  `.trash` disparaît donc quand la corbeille se vide, et le chevron avec.
#  Il se recrée au prochain `trashToBin` : `renameAsset` fait naître les
#  dossiers Cloudinary de son chemin, et `getCloudinaryFolderTree` réinscrit
#  les lignes. C'est déjà ce qui se passe à la toute première mise en
#  corbeille.
#
#  ─── Sûreté ────────────────────────────────────────────────────────────
#
#  `pruneEmptyFolders` ne supprime un palier qu'après avoir vérifié auprès de
#  CLOUDINARY qu'aucun asset ne subsiste sous son préfixe — via
#  `api.resources` en direct, pas via le cache. Et `restoreFromBin` invalide
#  déjà le cache à chaque `renameAsset`. Aucune course.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  USAGE
#  -----
#     bash step_trash_prune_leak.sh
#     AKFC_APPLY_ONLY=1 bash step_trash_prune_leak.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — la corbeille prune ses quarantaines"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "packages/backend" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

T="packages/backend/src/modules/trash/services"
for f in restoreFromBin purge trashToBin; do
  [ -f "$T/$f.service.ts" ] || { echo "✗ Introuvable : $T/$f.service.ts"; exit 1; }
done
[ -f "packages/backend/src/modules/cloudinary/services/pruneEmptyFolders.service.ts" ] \
  || { echo "✗ pruneEmptyFolders.service.ts introuvable."; exit 1; }

if grep -q "pruneEmptyFolders" "$T/restoreFromBin.service.ts"; then
  echo "✓ Déjà appliqué."
  exit 0
fi

python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

T = "packages/backend/src/modules/trash/services"
PRUNE = 'import { pruneEmptyFolders } from "@backend/modules/cloudinary/services/pruneEmptyFolders.service";'

# ── 1. restoreFromBin ────────────────────────────────────────────────────
R = f"{T}/restoreFromBin.service.ts"

sub_once(R,
'import { getAssetInfo, fileExists } from "@backend/modules/cloudinary/services/cloudinary.service";',
'import { getAssetInfo, fileExists } from "@backend/modules/cloudinary/services/cloudinary.service";\n'
+ PRUNE,
    "restoreFromBin — import")

sub_once(R,
'''    await prisma.trashEntry.update({
      where: { id: entry.id },
      data: {
        status: "RESTORED",
        restoredAt: new Date(),
        restoredToPath: normalizePath(restoredToPath),
      },
    });

    restored.push({''',
'''    await prisma.trashEntry.update({
      where: { id: entry.id },
      data: {
        status: "RESTORED",
        restoredAt: new Date(),
        restoredToPath: normalizePath(restoredToPath),
      },
    });

    // ─── La quarantaine vient d'être vidée : elle doit mourir ──────────
    //
    // `trashToBin` fait le ménage à l'aller (il supprime les lignes `Folder`
    // du dossier source). Personne ne le faisait au retour : les assets
    // sortent du wrapper `bin/.trash/<uuid>`, et sa ligne `Folder` survit.
    // Le finder bâtissant son arbre sur cette table, un chevron persistait
    // sur une corbeille visuellement vide.
    //
    // On ne passe pas par `adapter.move` (ce service renomme en direct),
    // donc le prune de l'adapter ne s'est jamais déclenché ici. On l'appelle
    // nous-mêmes.
    //
    // `pruneEmptyFolders` vérifie auprès de Cloudinary qu'aucun asset ne
    // subsiste avant de supprimer un palier, puis remonte : le wrapper, puis
    // `.trash` s'il ne reste plus rien, et s'arrête sur `${appRoot}/bin` que
    // sa borne `minDepth` protège.
    const wrapperPath =
      kind === "folder"
        ? normalizePath(entry.storageRoot)
        : // Pour un fichier, `storageRoot` EST le publicId de l'asset : son
          // dossier est son parent. Peu importe si on démarre plus profond
          // que le wrapper, le prune remonte.
          normalizePath(entry.storageRoot).split("/").slice(0, -1).join("/");

    await pruneEmptyFolders({ prisma, appRoot, startFolderPath: wrapperPath });

    restored.push({''',
    "restoreFromBin — prune de la quarantaine")

# ── 2. purge ─────────────────────────────────────────────────────────────
P = f"{T}/purge.service.ts"

sub_once(P,
'import { isTrashStoragePath, normalizePath } from "@backend/modules/trash/utils";',
'import { isTrashStoragePath, normalizePath } from "@backend/modules/trash/utils";\n'
+ PRUNE,
    "purge — import")

sub_once(P,
'''    purged.push(wrapperPath);
  }''',
'''    // ─── Le wrapper est vide : sa ligne `Folder` n'a plus rien à décrire ──
    //
    // Même raison que dans `restoreFromBin` : `purge` supprime en direct et
    // ne passe donc pas par le prune de l'adapter Cloudinary. Sans ça, la
    // quarantaine purgée laisse une ligne `Folder` orpheline, et le finder —
    // qui bâtit son arbre sur cette table — garde un chevron sur une
    // corbeille vide.
    await pruneEmptyFolders({
      prisma,
      appRoot,
      startFolderPath: normalizePath(wrapperPath),
    });

    purged.push(wrapperPath);
  }''',
    "purge — prune du wrapper")

# ── 3. trashToBin : la collision de préfixe ──────────────────────────────
B = f"{T}/trashToBin.service.ts"

sub_once(B,
'''      // 4) Nettoyage registry DB des dossiers :
      //    Si tu jettes un dossier, il ne doit plus exister "à l'ancien endroit".
      //    Donc on supprime les Folder dont le fullPath est dans ce sous-arbre.
      await prisma.folder.deleteMany({
        where: {
          appRoot,
          fullPath: {
            startsWith: normalized,
          },
        },
      });''',
'''      // 4) Nettoyage registry DB des dossiers :
      //    Si tu jettes un dossier, il ne doit plus exister "à l'ancien endroit".
      //    Donc on supprime les Folder dont le fullPath est dans ce sous-arbre.
      //
      // ⚠️ Le sous-arbre, c'est le dossier LUI-MÊME et ce qui est SOUS LUI —
      // pas tout ce qui commence par les mêmes lettres. Un `startsWith`
      // nu sur `AKFC/pending/cours` emportait aussi les lignes de
      // `AKFC/pending/cours-avance`, qui n'a rien à voir avec lui.
      //
      // C'est exactement la collision de préfixe contre laquelle la ligne
      // ci-dessus se prémunit côté Cloudinary (« trailing slash pour éviter
      // les collisions ») : la protection n'avait pas été portée côté DB. On
      // adopte ici la même forme que `pruneEmptyFolders`, qui la fait bien.
      await prisma.folder.deleteMany({
        where: {
          appRoot,
          OR: [
            { fullPath: normalized },
            { fullPath: { startsWith: `${normalized}/` } },
          ],
        },
      });''',
    "trashToBin — la collision de préfixe du deleteMany")
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "fix(trash): la corbeille prune ses quarantaines vidées

Corbeille vide à l'écran, chevron persistant, et en base des
AKFC/bin/.trash/<uuid> orphelins.

pruneEmptyFolders existe et est correct, mais il n'est appelé que depuis
cloudinaryStorageAdapter.move(). Or restoreFromBin et purge ne passent pas par
l'adapter : ils appellent cloudinary.uploader.rename / deleteByPrefix en
direct. Le ménage se faisait donc à l'aller (trashToBin supprime les lignes de
la source) et jamais au retour — le wrapper de quarantaine se vidait de ses
assets et sa ligne Folder survivait. Le finder bâtissant son arbre sur cette
table, le chevron restait.

- restoreFromBin prune la quarantaine après en avoir sorti le contenu.
- purge prune le wrapper après l'avoir supprimé.
- le prune atteint le wrapper puis .trash s'il ne reste rien, et s'arrête sur
  ${appRoot}/bin que sa borne minDepth protège. .trash se recrée au prochain
  trashToBin, comme à la toute première mise en corbeille.

Corrige au passage une collision de préfixe dans trashToBin : son
folder.deleteMany utilisait startsWith: normalized, sans slash final. Jeter
AKFC/pending/cours supprimait aussi les lignes de AKFC/pending/cours-avance.
La ligne juste au-dessus se prémunit de cette collision côté Cloudinary
(« trailing slash pour éviter les collisions ») ; la protection n'avait pas
été portée côté DB.

Sans rapport avec le chantier « arbre sans strate de statut » : les trois bugs
sont antérieurs."

echo "✅ Prune de corbeille appliqué, typechecké et commité."
echo
echo "   ▶ À vérifier : jette une photo, restaure-la, puis"
echo "       SELECT \"fullPath\" FROM \"CloudinaryFolder\" WHERE \"fullPath\" LIKE 'AKFC/bin%';"
echo "     Il ne doit rester que AKFC/bin."