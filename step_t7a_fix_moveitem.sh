#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T7a-fix : `storagePath` manquant sur MoveItem
# ═══════════════════════════════════════════════════════════════════════════
#
#  `MoveOptions.items` n'est pas `DragItem[]` mais `MoveItem[]` — un jumeau
#  structurel de `DragItem`, déclaré dans le contrat finder plutôt que dans
#  `dnd/payload.ts`. T7a a ajouté `storagePath?` au premier et pas au second :
#  l'assignation passe (elle est structurelle), la LECTURE de `storagePath`
#  dans `moveOptionsToSource` ne passe pas.
#
#      finderStorage.adapter.ts:223 - error TS2339:
#      Property 'storagePath' does not exist on type 'MoveItem'.
#
#  Ce script complète T7a et commite l'ensemble (T7a n'a pas été commité :
#  son typecheck a échoué, donc `set -e` s'est arrêté avant `git add`).
#
#  ─── Avant de lancer ────────────────────────────────────────────────────
#
#  Vide le cache incrémental de TypeScript, sinon les 4 erreurs fantômes de
#  NotificationBell (`persoPending` / `generalPending` absents d'un type qui
#  les déclare pourtant) vont revenir et masquer le vrai résultat :
#
#      rm -f apps/web/tsconfig.tsbuildinfo packages/backend/tsconfig.tsbuildinfo
#
#  Et arrête `next dev` : `.next` est dans le programme tsc (`**/*.ts` sans
#  exclusion), un serveur qui écrit dedans pendant que tsc lit fait du bruit.
#
#  USAGE
#  -----
#     bash step_t7a_fix_moveitem.sh
#     AKFC_APPLY_ONLY=1 bash step_t7a_fix_moveitem.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T7a-fix : storagePath sur MoveItem"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

ADAPTER="packages/contracts/src/finder/adapter.ts"
HELPER="apps/web/src/features/finder-core/utils/storagePath.ts"

[ -f "$ADAPTER" ] || { echo "✗ Fichier introuvable : $ADAPTER"; exit 1; }

if [ ! -f "$HELPER" ]; then
  echo "✗ T7a n'est pas appliqué ($HELPER absent)."
  echo "  Si tu as fait `git checkout .`, relance step_t7a_front_storage_path.sh."
  exit 1
fi

if grep -q "storagePath?: string;" "$ADAPTER"; then
  echo "✓ Déjà appliqué (MoveItem.storagePath présent)."
  exit 0
fi

python3 - <<'PYEOF'
import io

path = "packages/contracts/src/finder/adapter.ts"
with io.open(path, encoding="utf-8") as f:
    s = f.read()

old = '''export interface MoveItem {
  id: string;
  path: string;
  type: 'file' | 'folder';
}'''

new = '''export interface MoveItem {
  id: string;
  path: string;
  type: 'file' | 'folder';

  /**
   * Où vit réellement le binaire, quand ça diffère de `path`.
   *
   * `path` est le chemin LOGIQUE — celui par lequel l'admin navigue. Depuis
   * le chantier « arbre sans strate de statut », il ne porte plus le segment
   * `pending`/`published`, alors que le binaire, lui, vit encore dessous chez
   * le provider. Un move a besoin du second : on ne renomme pas un chemin
   * logique.
   *
   * Les DOSSIERS n'en portent pas, et c'est normal : un dossier logique
   * recouvre plusieurs dossiers physiques (un par strate), il n'a pas
   * d'emplacement unique à désigner. C'est `toPhysicalMoveIntents`, côté
   * backend, qui résout ses strates contre le registre `Folder`.
   *
   * ⚠️ Ce champ doit rester en phase avec son jumeau `DragItem.storagePath`
   * (`finder-core/dnd/payload.ts`). Les deux types sont structurellement
   * identiques et déclarés séparément — l'un est le contrat de l'adapter,
   * l'autre le payload éphémère du DnD, et `dragItemFromNode` produit le
   * second là où le premier est attendu. L'assignation étant structurelle,
   * un champ ajouté d'un seul côté ne se voit qu'à la lecture.
   *
   * Transitoire : à l'étape 5 du chantier, `storagePath === path` pour tout
   * le monde et le champ se supprime.
   */
  storagePath?: string;
}'''

n = s.count(old)
assert n == 1, f"[MoveItem] ancre trouvée {n} fois (attendu 1)"
with io.open(path, "w", encoding="utf-8") as f:
    f.write(s.replace(old, new, 1))
print("  ✓ MoveItem.storagePath (additif)")
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
git commit -m "feat(finder): le front distingue le localisateur du chemin logique

Le backend du pliage est prêt et inerte (T0->T6). Ce commit apprend au front
que le chemin par lequel il navigue et le chemin où vit le binaire sont deux
choses différentes — sans encore lever le flag.

storagePathOf(node) = node.meta?.storagePath ?? node.path. Tant que logical
n'est pas levé, le backend ne renseigne pas storagePath : le repli EST le
comportement, et rien ne change.

Pourquoi pas node.id : id n'est pas un localisateur et ne peut pas le
devenir. Le contrat dit « peut être path ou uuid selon adapter » et c'est
déjà le cas — un fichier remonté par le finder porte son chemin, le même
remonté par la recherche porte son cuid MediaAsset, un dossier de recherche
porte folder:<path>. Les résultats de recherche ne sont pas draggables mais
ils SONT sélectionnables et atterrissent dans le même pool que la grille :
router les actions sur id enverrait un cuid une fois sur deux.

Passent par le localisateur : URL de preview, getByPaths, getMetadata,
updateDescription, trashToBin (x2), sources de move. Restent en logique :
isDropAllowed / isDropEffective — « descendant de » et « le drop change-t-il
quelque chose » se posent dans l'espace où l'admin voit son arbre.

id d'un fichier = son localisateur : deux homonymes (l'un publié, l'autre en
attente) partageront le même path logique une fois la strate pliée.

storagePath est porté par les DEUX jumeaux structurels, MoveItem (contrat
adapter) et DragItem (payload DnD). Ils sont déclarés séparément et
l'assignation entre eux est structurelle : un champ ajouté d'un seul côté ne
se voit qu'à la lecture."

echo "✅ T7a + fix appliqués, typechecké et commité."