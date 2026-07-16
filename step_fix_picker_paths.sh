#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — Le picker rendait des chemins logiques à une DB physique
# ═══════════════════════════════════════════════════════════════════════════
#
#  Symptôme : les images se cochent (les ghosts apparaissent), mais la galerie
#  ne retient rien.
#
#      MediaPicker.handleSubmit
#        const paths = Array.from(items.keys());   ← chemins LOGIQUES
#        onSubmit(paths);
#          → MediaItemsEditor.handlePickerSubmit
#          → media.resolveByPaths  →  where: { fullPath: p }   ← PHYSIQUE
#
#  `AKFC/cours/tchoy-lee-fut/photo` contre `AKFC/pending/cours/…/photo` : aucun
#  match, `byPath[p] = null`, zéro id. Les ghosts venaient du panier local, qui
#  ne parle à personne — d'où l'illusion que ça avait marché.
#
#  ─── Ce que ce script NE fait PAS ───────────────────────────────────────
#
#  Il ne change pas la clé du panier. `items` reste keyée par `node.path`, et
#  c'est correct : les ghosts de la grille interrogent `isInCart(node.path)`,
#  la clé et la lecture sont cohérentes. Et la collision qu'on pourrait
#  craindre (deux homonymes, l'un en attente l'autre publié, partageant un même
#  chemin logique) ne peut pas se produire ici : seuls les fichiers PUBLIÉS
#  sont épinglables, et deux publiés homonymes dans un même dossier auraient le
#  même chemin physique — ils n'existent pas.
#
#  Le seul endroit qui parle à la DB, c'est la validation. C'est le seul à
#  corriger.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  USAGE
#  -----
#     bash step_fix_picker_paths.sh
#     AKFC_APPLY_ONLY=1 bash step_fix_picker_paths.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — le picker rend des localisateurs"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

MP="apps/web/src/features/finder-core/components/MediaPicker.tsx"
CART="packages/finder-core/src/cart/usePickerCartStore.ts"
for f in "$MP" "$CART"; do [ -f "$f" ] || { echo "✗ Introuvable : $f"; exit 1; }; done

if grep -q "storagePathOf" "$MP"; then
  echo "✓ Déjà appliqué (MediaPicker utilise storagePathOf)."
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

MP = "apps/web/src/features/finder-core/components/MediaPicker.tsx"
CART = "packages/finder-core/src/cart/usePickerCartStore.ts"

sub_once(MP,
"""import {
  isPickable,
  isMediaNode,
} from '@features/finder-core/utils/statusFolders';""",
"""import {
  isPickable,
  isMediaNode,
} from '@features/finder-core/utils/statusFolders';
import { storagePathOf } from '@features/finder-core/utils/storagePath';""",
    "MediaPicker — import de storagePathOf")

sub_once(MP,
"""  function handleSubmit() {
    if (cartCount === 0) return;
    const paths = Array.from(items.keys());
    onSubmit(paths);""",
"""  function handleSubmit() {
    if (cartCount === 0) return;

    // ⚠️ Les LOCALISATEURS, pas les clés du panier.
    //
    // `items` est keyée par `node.path` — un chemin LOGIQUE depuis le
    // chantier « arbre sans strate de statut ». C'est la bonne clé pour le
    // panier (les ghosts de la grille interrogent `isInCart(node.path)`), mais
    // pas ce qu'attend le bout de la chaîne : `onSubmit` mène à
    // `media.resolveByPaths`, qui matche `MediaAsset.fullPath` — physique.
    //
    // Rendre les clés ici renvoyait `AKFC/cours/x/photo` contre un
    // `AKFC/pending/cours/x/photo` en base : aucun match, aucun id, une
    // galerie vide. Et silencieusement, parce que le panier, lui, était bien
    // rempli.
    const paths = cartNodes.map(storagePathOf);
    onSubmit(paths);""",
    "MediaPicker — la validation rend des localisateurs")

sub_once(CART,
""" * `items` est une `Map<path, FinderNode>` keyée par `node.path` (rappel :
 * `FinderNode.id === node.path` dans ce projet). On stocke le FinderNode""",
""" * `items` est une `Map<path, FinderNode>` keyée par `node.path`.
 *
 * ⚠️ `node.path` est un chemin LOGIQUE, et cette clé n'est PAS un
 * localisateur. Le chantier « arbre sans strate de statut » a séparé les deux :
 * `node.path` est ce par quoi l'admin navigue, `node.meta.storagePath` est où
 * vit le binaire. La clé du panier convient au panier — les ghosts de la
 * grille interrogent `isInCart(node.path)`, clé et lecture sont cohérentes —
 * mais tout ce qui parle à la DB doit passer par `storagePathOf(node)`.
 *
 * (Cette ligne disait autrefois « rappel : `FinderNode.id === node.path` dans
 * ce projet ». Ce n'est plus vrai : l'`id` d'un fichier EST son localisateur,
 * pour que deux homonymes — l'un publié, l'autre en attente — restent
 * distinguables sous un même chemin logique.)
 *
 * On stocke le FinderNode""",
    "usePickerCartStore — le commentaire qui mentait")
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
git commit -m "fix(finder): le picker rend des localisateurs, pas des chemins logiques

Les images se cochaient, les ghosts apparaissaient, et la galerie ne retenait
rien.

MediaPicker.handleSubmit rendait Array.from(items.keys()) — des chemins
LOGIQUES — à onSubmit, qui mène à media.resolveByPaths, lequel matche
MediaAsset.fullPath : physique. AKFC/cours/x/photo contre
AKFC/pending/cours/x/photo, aucun match, byPath[p] = null, zéro id. Et
silencieusement : le panier local, lui, était bien rempli, d'où les ghosts.

La clé du panier ne change pas. items reste keyée par node.path, et c'est
correct — les ghosts de la grille interrogent isInCart(node.path), clé et
lecture sont cohérentes. La collision théorique (deux homonymes sous un même
chemin logique) ne peut pas se produire ici : seuls les fichiers publiés sont
épinglables, et deux publiés homonymes dans un même dossier auraient le même
chemin physique.

Corrige au passage le commentaire du store, qui affirmait « rappel :
FinderNode.id === node.path dans ce projet ». C'était vrai ; ça ne l'est plus
depuis que l'id d'un fichier porte son localisateur."

echo "✅ Picker réparé, typechecké et commité."