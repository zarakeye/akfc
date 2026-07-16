#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — Déblocage : deux types écrits à la main qui ont décroché
# ═══════════════════════════════════════════════════════════════════════════
#
#  Remplace step_t7a_fix_moveitem.sh (qui ne traitait qu'une des deux causes).
#
#  ─── Cause 1 : NotificationBell — PRÉEXISTANTE, sans rapport avec T7 ─────
#
#      NotificationBell.tsx:89
#      const [counts, setCounts] = useState<{ pending: number; bin: number } | null>(null)
#
#  Le backend a gagné `generalPending` et `persoPending` (storage/router.ts
#  L.126-129), les lignes 137/138/164/165 les lisent — mais l'annotation
#  `useState`, écrite à la main, n'a jamais suivi. `pnpm typecheck` était donc
#  déjà rouge avant ce chantier. Aucun cache n'était en cause (ni `.next`, ni
#  `tsconfig.tsbuildinfo`).
#
#  On ne réécrit pas le type à la main une deuxième fois : on le DÉRIVE de la
#  procédure. Un champ ajouté au backend ne pourra plus décrocher.
#
#  ⚠️ Ce script ne fait PAS la migration `trpcClient` + `useState` → `useQuery`
#  que le handoff décrit comme faite (le fichier contient zéro `useQuery`).
#  C'est un autre sujet, avec ses propres conséquences sur le cache
#  react-query et les `invalidate()`. À décider séparément.
#
#  ─── Cause 2 : MoveItem — celle-là vient de T7a ─────────────────────────
#
#      finderStorage.adapter.ts:223 - Property 'storagePath' does not exist
#                                     on type 'MoveItem'.
#
#  `MoveOptions.items` est `MoveItem[]` (contrat finder), pas `DragItem[]`
#  (payload DnD). Deux types structurellement identiques déclarés séparément :
#  l'assignation entre eux passe, la lecture d'un champ ajouté d'un seul côté
#  ne passe pas. T7a n'avait patché que `DragItem`.
#
#  ─── Deux commits, délibérément ─────────────────────────────────────────
#
#  La réparation de la cloche est indépendante du chantier : elle part dans
#  son propre commit, avant T7a. T7a n'a pas été commité (son typecheck a
#  échoué avant `git add`), ses édits sont dans ton arbre de travail.
#
#  AVANT DE LANCER : arrête `next dev`.
#
#  USAGE
#  -----
#     bash step_unblock_handwritten_types.sh
#     AKFC_APPLY_ONLY=1 bash step_unblock_handwritten_types.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — déblocage : NotificationBell (préexistant) + MoveItem (T7a)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

BELL="apps/web/src/features/app-shell/NotificationBell.tsx"
ADAPTER="packages/contracts/src/finder/adapter.ts"
HELPER="apps/web/src/features/finder-core/utils/storagePath.ts"

for f in "$BELL" "$ADAPTER"; do
  [ -f "$f" ] || { echo "✗ Fichier introuvable : $f"; exit 1; }
done

if [ ! -f "$HELPER" ]; then
  echo "✗ T7a n'est pas appliqué ($HELPER absent)."
  echo "  Relance step_t7a_front_storage_path.sh d'abord."
  exit 1
fi

python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    if new.split("\n")[0].strip() and new.split("\n")[0].strip() in s and old not in s:
        print(f"  ⏭  {label} — déjà appliqué")
        return
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

BELL = "apps/web/src/features/app-shell/NotificationBell.tsx"
ADAPTER = "packages/contracts/src/finder/adapter.ts"

# ── 1. La cloche : dériver le type au lieu de le recopier ────────────────
sub_once(
    BELL,
    """  const [counts, setCounts] = useState<{ pending: number; bin: number } | null>(
    null,
  );""",
    """  const [counts, setCounts] = useState<AttentionCounts | null>(null);""",
    "NotificationBell — état typé par dérivation",
)

with io.open(BELL, encoding="utf-8") as f:
    s = f.read()

if "type AttentionCounts" not in s:
    anchor = "export function NotificationBell()"
    assert s.count(anchor) == 1, "[NotificationBell] ancre de fonction introuvable"
    s = s.replace(
        anchor,
        '''/**
 * La forme de `storage.getAttentionCounts`, DÉRIVÉE de la procédure.
 *
 * Elle était écrite à la main — `{ pending: number; bin: number }` — et n'a
 * pas suivi quand le backend a gagné `generalPending` et `persoPending`. Le
 * corps du composant les lisait déjà : `pnpm typecheck` restait rouge sans
 * que rien ne pointe vers la cause, l'annotation étant syntaxiquement
 * irréprochable.
 *
 * Dérivée, elle ne peut plus décrocher : ajouter un champ à la procédure le
 * rend disponible ici, en retirer un fait échouer les lectures à l'endroit
 * exact où elles se font.
 */
type AttentionCounts = Awaited<
  ReturnType<typeof trpcClient.storage.getAttentionCounts.query>
>;

'''
        + anchor,
        1,
    )
    with io.open(BELL, "w", encoding="utf-8") as f:
        f.write(s)
    print("  ✓ NotificationBell — type AttentionCounts dérivé de la procédure")
else:
    print("  ⏭  NotificationBell — type dérivé déjà présent")

# ── 2. MoveItem : le jumeau oublié ───────────────────────────────────────
sub_once(
    ADAPTER,
    """export interface MoveItem {
  id: string;
  path: string;
  type: 'file' | 'folder';
}""",
    """export interface MoveItem {
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
   * un champ ajouté d'un seul côté ne se voit qu'à la LECTURE, et seulement
   * chez l'appelant. C'est exactement ce qui a cassé en livrant T7a.
   *
   * Transitoire : à l'étape 5 du chantier, `storagePath === path` pour tout
   * le monde et le champ se supprime.
   */
  storagePath?: string;
}""",
    "MoveItem.storagePath (le jumeau oublié)",
)
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commits sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

# ─── Deux commits : la réparation d'abord, le chantier ensuite ───────────
git add "$BELL"
git commit -m "fix(app-shell): NotificationBell dérive le type de getAttentionCounts

L'état était annoté à la main — { pending: number; bin: number } — et n'a pas
suivi quand la procédure a gagné generalPending et persoPending. Le corps du
composant les lisait déjà (L.137/138/164/165) : pnpm typecheck restait rouge,
sans que rien ne pointe vers la cause — l'annotation était syntaxiquement
irréprochable, elle mentait juste.

Le type est désormais dérivé de la procédure elle-même. Ajouter un champ au
backend le rend disponible ici ; en retirer un fait échouer les lectures à
l'endroit exact où elles se font.

Ne touche pas au reste : le composant est toujours sur trpcClient + useState
+ useEffect, et non sur useQuery."

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
adapter) et DragItem (payload DnD)."

echo "✅ Déblocage + T7a appliqués, typechecké, deux commits."