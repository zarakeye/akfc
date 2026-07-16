#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T7b : le statut cesse d'être dérivé du chemin
# ═══════════════════════════════════════════════════════════════════════════
#
#  Dernier obstacle avant la bascule. Quatre endroits du front déduisent
#  encore le statut d'un nœud de son CHEMIN. En vue pliée, le chemin ne le
#  porte plus — `statusFromPath` d'un chemin logique renvoie `null`.
#
#  Le plus grave, et de loin :
#
#      statusFolders.ts:77
#      return node.type === 'file' && statusFromPath(node.path) === 'published';
#
#  → `null !== 'published'` → PLUS RIEN N'EST ÉPINGLABLE dans le MediaPicker
#    du page-builder. Silencieux : pas d'erreur, juste des clics sans effet.
#
#  Les trois autres (badge « En attente », colonne Statut, radios) dégradent
#  moins gravement : leur source primaire `meta.status` fonctionne, seul le
#  repli s'éteint.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. `statusOf(node)` — UNE dérivation, dans `statusFolders.ts`. L'expression
#      `n.meta?.status ?? statusFromPath(n.path)` était recopiée à trois
#      endroits ; c'est la même maladie que MoveItem/DragItem et que le type
#      de la cloche. Elle disparaît.
#   2. `isPickable` prend le nœud entier et lit `statusOf`.
#   3. L'avertissement sur `statusFromPath` — celui que le handoff réclamait
#      « au moment de la bascule », posé là où quelqu'un rétablira la
#      dérivation par réflexe.
#
#  INERTE : `statusOf` retombe sur `statusFromPath(storagePathOf(node))`, et
#  tant que `logical` est baissé, `storagePathOf(node) === node.path`.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  PRÉREQUIS : T7a (storagePathOf).
#
#  USAGE
#  -----
#     bash step_t7b_status_derivation.sh
#     AKFC_APPLY_ONLY=1 bash step_t7b_status_derivation.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T7b : une seule dérivation du statut (inerte)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

SF="apps/web/src/features/finder-core/utils/statusFolders.ts"
[ -f "$SF" ] || { echo "✗ Fichier introuvable : $SF"; exit 1; }

if [ ! -f "apps/web/src/features/finder-core/utils/storagePath.ts" ]; then
  echo "✗ T7a n'est pas appliqué (storagePath.ts absent)."
  exit 1
fi

if grep -q "export function statusOf" "$SF"; then
  echo "✓ Déjà appliqué (statusOf présent)."
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

C = "apps/web/src/features/finder-core/components"
SF = "apps/web/src/features/finder-core/utils/statusFolders.ts"

# ── 1. L'import du localisateur ──────────────────────────────────────────
sub_once(SF,
"""import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';""",
"""import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';

import { storagePathOf } from '@features/finder-core/utils/storagePath';""",
    "statusFolders — import de storagePathOf")

# ── 2. L'avertissement sur statusFromPath ────────────────────────────────
sub_once(SF,
""" * Renvoie `null` si le path n'est pas sous l'`APP_ROOT` ou si le segment de
 * statut n'est pas un statut connu (asset hors-pipeline) — le caller décide
 * quoi faire d'un `null` (typiquement : aucun radio coché).
 */
export function statusFromPath(path: string): LifecycleStatus | null {""",
""" * Renvoie `null` si le path n'est pas sous l'`APP_ROOT` ou si le segment de
 * statut n'est pas un statut connu (asset hors-pipeline) — le caller décide
 * quoi faire d'un `null` (typiquement : aucun radio coché).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️  N'APPELEZ PAS CETTE FONCTION SUR UN `node.path`.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Le chantier « arbre sans strate de statut » a INVERSÉ la dépendance que
 * cette fonction incarne.
 *
 * Avant : le chemin était la vérité, `MediaAsset.status` un cache dérivé.
 *         Conséquence — publier obligeait à DÉPLACER le binaire chez le
 *         provider, avec tout ce qui s'ensuivait : deux mécanismes de synchro
 *         au move, un publicId qui se désynchronise, un chemin construit à
 *         deux endroits devant s'accorder au caractère près.
 *
 * Après :  `MediaAsset.status` est la vérité. Publier est un `UPDATE`. Le
 *          binaire ne bouge plus. Et `node.path` est un chemin LOGIQUE — il
 *          ne porte plus de segment de statut, donc cette fonction y renvoie
 *          `null`.
 *
 * Ce `null` est SILENCIEUX. Il ne lève pas, il ne warn pas : il éteint. Un
 * badge qui n'apparaît plus, un picker où plus rien ne s'épingle. C'est
 * exactement ce qui a failli passer inaperçu en livrant cette étape.
 *
 * Pour connaître le statut d'un nœud, utilisez **`statusOf(node)`**, plus bas.
 *
 * Ce qui reste légitime ici : les chemins PHYSIQUES (`storagePathOf(node)`,
 * `MediaAsset.fullPath`), tant que la migration des binaires n'est pas faite.
 * Après elle, cette fonction n'aura plus aucun appelant et se supprimera avec
 * le reste du pliage.
 */
export function statusFromPath(path: string): LifecycleStatus | null {""",
    "statusFromPath — l'avertissement (celui que le handoff réclamait)")

# ── 3. statusOf + isPickable ─────────────────────────────────────────────
sub_once(SF,
"""export function isPickable(node: { type: 'file' | 'folder'; path: string }): boolean {
  return node.type === 'file' && statusFromPath(node.path) === 'published';
}""",
"""export function isPickable(
  node: Pick<FinderNode, 'type' | 'path' | 'meta'>,
): boolean {
  return node.type === 'file' && statusOf(node) === 'published';
}

/**
 * Le statut d'un nœud. **Le seul point d'entrée.**
 *
 * ─── L'ordre de préséance, et pourquoi il est dans cet ordre ──────────────
 *
 *   1. `meta.status` — `MediaAsset.status`, servi par `media.getByPaths` via
 *      `useMediaAssetEnrichment`. C'est la VÉRITÉ.
 *
 *   2. `statusFromPath(storagePathOf(node))` — repli sur le chemin PHYSIQUE,
 *      pour les fichiers sans row DB (antérieurs au tracking). Noter le
 *      `storagePathOf` : c'est le chemin où vit le binaire, donc le seul qui
 *      porte encore un segment de statut. Appliqué à `node.path`, ce repli
 *      renverrait `null` dès la vue pliée levée — et s'éteindrait en silence.
 *
 * Le repli disparaîtra avec la strate elle-même (étape 5 du chantier) : à ce
 * moment-là, plus aucun chemin ne portera de statut, et `meta.status` sera la
 * seule réponse possible. Ce qui est déjà le cas dans les faits.
 *
 * ─── Pourquoi une fonction plutôt que l'expression recopiée ───────────────
 *
 * `n.meta?.status ?? statusFromPath(n.path)` était écrit à l'identique dans
 * `GridItem`, `FinderTableRow` et `StatusRadioGroup`, et sous une troisième
 * forme dans `isPickable`. Quatre copies d'une règle métier, qu'il fallait
 * penser à corriger quatre fois — et dont une seule oubliée aurait éteint le
 * picker sans un mot. C'est la même maladie que `MoveItem` / `DragItem`, et
 * que le type de `getAttentionCounts` recopié à la main dans la cloche.
 */
export function statusOf(
  node: Pick<FinderNode, 'path' | 'meta'>,
): LifecycleStatus | null {
  return node.meta?.status ?? statusFromPath(storagePathOf(node));
}""",
    "statusFolders — statusOf + isPickable sur meta.status")

# ── 4. GridItem ──────────────────────────────────────────────────────────
sub_once(f"{C}/GridItem.tsx",
    "import { statusFromPath } from '@features/finder-core/utils/statusFolders';",
    "import { statusOf } from '@features/finder-core/utils/statusFolders';",
    "GridItem — import")
sub_once(f"{C}/GridItem.tsx",
    "    !isFolder && (node.meta?.status ?? statusFromPath(node.path)) === 'pending';",
    "    !isFolder && statusOf(node) === 'pending';",
    "GridItem — badge « En attente »")

# ── 5. FinderTableRow ────────────────────────────────────────────────────
sub_once(f"{C}/FinderTableRow.tsx",
    "import { statusFromPath } from '@features/finder-core/utils/statusFolders';",
    "import { statusOf } from '@features/finder-core/utils/statusFolders';",
    "FinderTableRow — import")
sub_once(f"{C}/FinderTableRow.tsx",
    "        (node.meta?.status ?? statusFromPath(node.path)) === 'pending' ? (",
    "        statusOf(node) === 'pending' ? (",
    "FinderTableRow — colonne Statut")

# ── 6. StatusRadioGroup ──────────────────────────────────────────────────
sub_once(f"{C}/StatusRadioGroup.tsx",
"""import {
  statusFromPath,
  type LifecycleStatus,
} from '@features/finder-core/utils/statusFolders';""",
"""import {
  statusOf,
  type LifecycleStatus,
} from '@features/finder-core/utils/statusFolders';""",
    "StatusRadioGroup — import")
sub_once(f"{C}/StatusRadioGroup.tsx",
"""    // Le statut vient de la MÉTADONNÉE (`MediaAsset.status`). Fallback sur le
    // chemin uniquement pour les fichiers sans row DB (antérieurs au
    // tracking) — ce fallback disparaîtra avec la strate de statut.
    const distinct = new Set(
      selectedNodes.map((n) => n.meta?.status ?? statusFromPath(n.path)),
    );""",
"""    // La règle de dérivation vit dans `statusOf` — un seul endroit.
    const distinct = new Set(selectedNodes.map(statusOf));""",
    "StatusRadioGroup — dérivation")

# ── 7. MediaPicker ───────────────────────────────────────────────────────
sub_once(f"{C}/MediaPicker.tsx",
"""import {
  isPickable,
  isMediaNode,
  statusFromPath,
} from '@features/finder-core/utils/statusFolders';""",
"""import {
  isPickable,
  isMediaNode,
} from '@features/finder-core/utils/statusFolders';""",
    "MediaPicker — import")
sub_once(f"{C}/MediaPicker.tsx",
"""  // Décision d'épinglage : seuls les FICHIERS publiés sont pickables. On
  // s'appuie sur isPickable (type === 'file' && published) ; repli sur
  // statusFromPath si la meta de type manque (cas improbable en grille).
  function handlePickToggle(node: FinderNode) {
    const pickable =
      node.type === 'file'
        ? isPickable({ type: 'file', path: node.path })
        : false;
    if (!pickable) return; // non-publié ou dossier → on n'épingle pas
    toggleCart(node);
  }""",
"""  // Décision d'épinglage : seuls les FICHIERS publiés sont pickables.
  //
  // On passe le nœud ENTIER. L'ancienne version reconstruisait un objet
  // `{ type: 'file', path: node.path }` — ce qui privait `isPickable` de
  // `meta`, donc de `meta.status`, donc de la seule source fiable du statut.
  // Elle ne pouvait plus que le déduire du chemin : correct tant que le
  // chemin portait la strate, muet ensuite.
  function handlePickToggle(node: FinderNode) {
    if (!isPickable(node)) return; // non-publié ou dossier → on n'épingle pas
    toggleCart(node);
  }""",
    "MediaPicker — isPickable reçoit le nœud entier")
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
git commit -m "refactor(finder): une seule dérivation du statut, et elle ne lit plus le chemin

Dernier obstacle avant la bascule. Quatre endroits déduisaient le statut d'un
noeud de son chemin. En vue pliée, le chemin ne le porte plus.

Le plus grave : isPickable faisait statusFromPath(node.path) === 'published'.
Sur un chemin logique → null → plus rien d'épinglable dans le MediaPicker du
page-builder. Sans erreur, sans warn : des clics sans effet.

- statusOf(node) : meta.status d'abord (MediaAsset.status, la vérité), repli
  sur statusFromPath(storagePathOf(node)) — le chemin PHYSIQUE, seul à porter
  encore une strate — pour les fichiers antérieurs au tracking.
- isPickable prend le noeud entier. MediaPicker lui reconstruisait un objet
  { type, path } sans meta, ce qui le privait de la seule source fiable.
- l'expression n.meta?.status ?? statusFromPath(n.path) était recopiée dans
  GridItem, FinderTableRow et StatusRadioGroup, plus une variante dans
  isPickable. Quatre copies d'une règle métier : même maladie que
  MoveItem/DragItem et que le type de getAttentionCounts dans la cloche.

statusFromPath porte désormais l'avertissement que le handoff réclamait « au
moment de la bascule » : le chantier a inversé la dépendance chemin/statut, et
ce fichier est l'endroit exact où quelqu'un la rétablirait par réflexe. Le
null est silencieux — il n'échoue pas, il éteint.

Inerte : tant que logical est baissé, storagePathOf(node) === node.path."

echo "✅ T7b appliqué, typechecké et commité."