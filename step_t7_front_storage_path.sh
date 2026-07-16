#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T7a : le front distingue le LOCALISATEUR du chemin logique
# ═══════════════════════════════════════════════════════════════════════════
#
#  Le backend est prêt (T0→T6) et entièrement inerte. Reste à apprendre au
#  front que le chemin par lequel il NAVIGUE et le chemin où vit le BINAIRE
#  sont deux choses différentes.
#
#  Ce script ne lève PAS `logical`. `meta.storagePath` n'est renseigné par le
#  backend que sous ce flag, donc chaque accès retombe aujourd'hui sur
#  `?? node.path` : le comportement est identique à l'octet près. La bascule
#  est T7b, et elle tient en quatre lignes — donc son revert aussi.
#
#  ─── Pourquoi pas `node.id` ─────────────────────────────────────────────
#
#  Parce que `id` n'est pas un localisateur et ne peut pas le devenir :
#
#     finder    → id = chemin du fichier
#     recherche → id = cuid MediaAsset  (`id: asset.id`)
#     recherche → id = `folder:<path>`  pour un dossier
#
#  Le contrat l'autorise explicitement (« peut être path ou uuid selon
#  adapter »). Les trois sont uniques, aucun ne localise. Or les résultats de
#  recherche ne sont pas draggables MAIS ils sont SÉLECTIONNABLES, et
#  `useNodeActions` les résout depuis le même pool que la grille : router les
#  actions sur `n.id` enverrait un cuid là où le backend attend un chemin.
#
#  D'où `storagePathOf(node)` : un seul accès, valable quelle que soit la
#  provenance du nœud.
#
#  AUCUNE migration Prisma. `git revert` suffit.
#
#  PRÉREQUIS : T6 (MediaMeta.storagePath).
#
#  USAGE
#  -----
#     bash step_t7a_front_storage_path.sh
#     AKFC_APPLY_ONLY=1 bash step_t7a_front_storage_path.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T7a : localisateur vs chemin logique côté front (inerte)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "apps/web" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

HELPER="apps/web/src/features/finder-core/utils/storagePath.ts"

if ! grep -q "storagePath?: string;" packages/contracts/src/finder/meta.types.ts; then
  echo "✗ T6 n'est pas appliqué (MediaMeta.storagePath absent)."
  exit 1
fi

if [ -f "$HELPER" ]; then
  echo "✓ Déjà appliqué ($HELPER présent)."
  exit 0
fi

cat > "$HELPER" <<'TSEOF'
import type { FinderNode } from '@contracts/finder';

/**
 * storagePathOf — où vit le binaire de ce nœud.
 *
 * ─── Deux chemins, deux métiers ───────────────────────────────────────────
 *
 * Depuis le chantier « arbre sans strate de statut », un nœud du finder porte
 * deux chemins qui ne coïncident plus :
 *
 *   node.path              AKFC/cours/tchoy-lee-fut/photo    ← ce que l'admin voit
 *   node.meta.storagePath  AKFC/pending/cours/…/photo        ← où est le binaire
 *
 * Règle : ce qui parle à l'UTILISATEUR (fil d'Ariane, arbre, navigation,
 * règles de drop) utilise `path`. Ce qui parle au PROVIDER ou à la DB (URL de
 * preview, métadonnées, source d'un move, mise en corbeille, jointure avec
 * `MediaAsset.fullPath`) passe par ici.
 *
 * ─── Pourquoi pas `node.id` ───────────────────────────────────────────────
 *
 * Parce que `id` n'est pas un localisateur. Le contrat dit « peut être path
 * ou uuid selon adapter », et c'est déjà le cas dans ce projet :
 *
 *   - remonté par le finder    → id = le chemin du fichier
 *   - remonté par la recherche → id = le cuid `MediaAsset.id`
 *   - dossier de recherche     → id = `folder:<path>`
 *
 * Les trois sont des identités d'unicité parfaitement valables ; aucune n'est
 * un chemin. Et comme les résultats de recherche sont sélectionnables et
 * atterrissent dans le même pool de nœuds que la grille, une action routée
 * sur `id` partirait avec un cuid une fois sur deux.
 *
 * ─── Le repli ─────────────────────────────────────────────────────────────
 *
 * `?? node.path` n'est pas de la prudence décorative : tant que le flag
 * `logical` n'est pas levé, le backend ne renseigne pas `storagePath` et le
 * repli EST le comportement — les deux chemins sont alors le même. C'est ce
 * qui rend la bascule réversible d'un booléen.
 *
 * ─── Durée de vie ─────────────────────────────────────────────────────────
 *
 * Transitoire. À l'étape 5 du chantier, `storagePath === path` pour tout le
 * monde ; ce helper devient l'identité et se supprime.
 */
export function storagePathOf(node: Pick<FinderNode, 'path' | 'meta'>): string {
  return node.meta?.storagePath ?? node.path;
}
TSEOF
echo "  ✓ $HELPER (neuf)"

python3 - <<'PYEOF'
import io

def sub(path, old, new, label, times=1):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == times, f"[{label}] ancre trouvée {n} fois dans {path} (attendu {times})"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new))
    print(f"  ✓ {label}")

FC = "apps/web/src/features/finder-core"
FA = "apps/web/src/features/finder-adapters/cloudinary"

# ── 1. DragItem transporte le localisateur ───────────────────────────────
sub(f"{FC}/dnd/payload.ts",
'''export type DragItem = {
  id: string;
  path: string;
  type: "folder" | "file";
};''',
'''export type DragItem = {
  id: string;
  path: string;
  type: "folder" | "file";
  /**
   * Où vit le binaire, quand ça diffère de `path` (cf. `storagePathOf`).
   *
   * `path` reste le chemin LOGIQUE, et c'est bien lui que veulent
   * `isDropAllowed` / `isDropEffective` : « ce dossier est-il un descendant
   * de cet item » et « le drop change-t-il quelque chose » sont des
   * questions qui se posent dans l'espace où l'admin voit son arbre, pas
   * dans celui où Cloudinary range ses octets.
   *
   * Le localisateur ne sert qu'à la traduction en intent de move.
   * Transitoire, comme le reste du pliage.
   */
  storagePath?: string;
};''',
    "DragItem.storagePath")

sub(f"{FC}/dnd/payload.ts",
'''export function dragItemFromNode(node: FinderNode): DragItem {
  return {
    id: node.id,
    path: node.path,
    type: node.type,
  };
}''',
'''export function dragItemFromNode(node: FinderNode): DragItem {
  return {
    id: node.id,
    path: node.path,
    type: node.type,
    ...(node.meta?.storagePath ? { storagePath: node.meta.storagePath } : {}),
  };
}''',
    "dragItemFromNode — transporte le localisateur")

sub(f"{FC}/dnd/payload.ts",
'''      const i = item as { id?: unknown; path?: unknown; type?: unknown };
      if (typeof i.id !== "string") return null;
      if (typeof i.path !== "string") return null;
      if (i.type !== "folder" && i.type !== "file") return null;''',
'''      const i = item as {
        id?: unknown;
        path?: unknown;
        type?: unknown;
        storagePath?: unknown;
      };
      if (typeof i.id !== "string") return null;
      if (typeof i.path !== "string") return null;
      if (i.type !== "folder" && i.type !== "file") return null;
      // Optionnel : absent tant que la vue pliée n'est pas levée. Mais s'il
      // est là, il doit être une chaîne — un payload à moitié valide est un
      // payload invalide.
      if (i.storagePath !== undefined && typeof i.storagePath !== "string") {
        return null;
      }''',
    "tryParsePayload — valide storagePath")

# ── 2. L'adapter expose le localisateur ──────────────────────────────────
sub(f"{FA}/finderStorage.adapter.ts",
'''  const url =
    backend === 'cloudinary'
      ? getMediaUrl({ publicId: file.path })
      : `/api/media/r2/${file.path.split('/').map(encodeURIComponent).join('/')}`;

  return {
    id: file.path,
    name,
    path: file.path,
    type: 'file',
    mimeType: file.metadata?.mimeType,
    meta: {
      url,
      format,
      kind: kindFromFormat(format, name),
    },
  };''',
'''  // Le LOCALISATEUR : `file.path` tant que la vue pliée n'est pas levée,
  // `AKFC/pending/…` ensuite. C'est lui qui construit l'URL — le proxy
  // `/api/media/by-public-id/…` interroge Cloudinary, qui ne connaît que
  // l'emplacement réel. Lui passer un chemin logique rendrait 404.
  const storagePath = file.storagePath ?? file.path;

  const url =
    backend === 'cloudinary'
      ? getMediaUrl({ publicId: storagePath })
      : `/api/media/r2/${storagePath.split('/').map(encodeURIComponent).join('/')}`;

  return {
    // `id` = le localisateur, et pas le chemin logique : deux fichiers
    // homonymes (l'un publié, l'autre en attente de relecture) partagent le
    // MÊME path logique une fois la strate pliée. Les distinguer est ce qui
    // évite qu'en sélectionner un sélectionne l'autre — et qu'React en
    // efface un des deux sur collision de key.
    id: storagePath,
    name,
    path: file.path,
    type: 'file',
    mimeType: file.metadata?.mimeType,
    meta: {
      url,
      storagePath,
      format,
      kind: kindFromFormat(format, name),
    },
  };''',
    "adapter — mapFileToFinderNode expose storagePath")

sub(f"{FA}/finderStorage.adapter.ts",
'''function moveOptionsToSource(items: MoveOptions['items']): StorageMoveSource {
  if (items.length === 1) {
    const only = items[0];
    return { type: only.type, path: only.path };
  }

  return {
    type: 'selection',
    roots: items.map((it) => it.path),
  };
}''',
'''function moveOptionsToSource(items: MoveOptions['items']): StorageMoveSource {
  // Le backend attend des SOURCES localisables. Pour un fichier, c'est le
  // `storagePath` ; pour un dossier, le chemin logique — un dossier logique
  // n'a pas d'emplacement unique, c'est `toPhysicalMoveIntents` qui résout
  // ses strates contre le registre `Folder`.
  const sourcePath = (it: MoveOptions['items'][number]): string =>
    it.storagePath ?? it.path;

  if (items.length === 1) {
    const only = items[0];
    return { type: only.type, path: sourcePath(only) };
  }

  return {
    type: 'selection',
    roots: items.map(sourcePath),
  };
}''',
    "adapter — moveOptionsToSource localise les sources")

# ── 3. Les consommateurs de chemins physiques ────────────────────────────
sub(f"{FC}/hooks/useMediaAssetEnrichment.ts",
    "  const filePaths = files.map((f) => f.path);",
    "  const filePaths = files.map(storagePathOf);",
    "enrichment — interroge getByPaths sur les localisateurs")

sub(f"{FC}/hooks/useMediaAssetEnrichment.ts",
    "      const meta = data[f.path];",
    "      const meta = data[storagePathOf(f)];",
    "enrichment — relit la réponse par localisateur (2 sites)",
    times=2)

sub(f"{FC}/components/PreviewPanel.tsx",
    "    useNodeMetadata(adapter, file?.path ?? null);",
    "    useNodeMetadata(adapter, file ? storagePathOf(file) : null);",
    "PreviewPanel — métadonnées par localisateur")

sub(f"{FC}/components/DescriptionField.tsx",
'''      await updateMutation.mutateAsync({
        appRoot: APP_ROOT,
        path: file.path,''',
'''      await updateMutation.mutateAsync({
        appRoot: APP_ROOT,
        path: storagePathOf(file),''',
    "DescriptionField — écrit par localisateur")

sub(f"{FC}/hooks/useStatusChange.ts",
'''            sources: nodes.map((n) => ({
              kind:
                n.type === 'folder' ? ('folder' as const) : ('file' as const),
              fullPath: n.path,
            })),''',
'''            sources: nodes.map((n) => ({
              kind:
                n.type === 'folder' ? ('folder' as const) : ('file' as const),
              fullPath: storagePathOf(n),
            })),''',
    "useStatusChange — corbeille par localisateur")

sub(f"{FC}/hooks/useNodeActions.ts",
'''        const sources = nodes.map((n) => ({
          kind: n.type === 'folder' ? ('folder' as const) : ('file' as const),
          fullPath: n.path,
        }));''',
'''        const sources = nodes.map((n) => ({
          kind: n.type === 'folder' ? ('folder' as const) : ('file' as const),
          fullPath: storagePathOf(n),
        }));''',
    "useNodeActions — corbeille par localisateur")

# ── 4. La recherche fournit le localisateur ──────────────────────────────
sub(f"{FC}/hooks/useFinderSearch.ts",
'''            size: r.bytes ?? undefined,
            meta: {
              format: r.format ?? undefined,''',
'''            size: r.bytes ?? undefined,
            meta: {
              // Un résultat de recherche porte un cuid dans `id` : sans ce
              // champ, les actions lancées depuis la recherche n'auraient
              // aucun chemin à envoyer au backend.
              storagePath: r.storagePath,
              format: r.format ?? undefined,''',
    "useFinderSearch — remonte le localisateur dans meta")
PYEOF

# ── 5. Imports du helper ─────────────────────────────────────────────────
python3 - <<'PYEOF'
import io, re

FC = "apps/web/src/features/finder-core"
TARGETS = {
    f"{FC}/hooks/useMediaAssetEnrichment.ts": "@features/finder-core/utils/storagePath",
    f"{FC}/hooks/useStatusChange.ts": "@features/finder-core/utils/storagePath",
    f"{FC}/hooks/useNodeActions.ts": "@features/finder-core/utils/storagePath",
    f"{FC}/hooks/useFinderSearch.ts": None,  # pas d'appel au helper
    f"{FC}/components/PreviewPanel.tsx": "@features/finder-core/utils/storagePath",
    f"{FC}/components/DescriptionField.tsx": "@features/finder-core/utils/storagePath",
}

for path, module in TARGETS.items():
    if module is None:
        continue
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    if "storagePathOf" not in s:
        continue
    if f"from '{module}'" in s:
        continue
    # Insérer après le DERNIER import du fichier, pour ne dépendre d'aucune
    # ligne d'import particulière (elles diffèrent d'un fichier à l'autre).
    matches = list(re.finditer(r"^import .*?;$", s, re.MULTILINE | re.DOTALL))
    assert matches, f"[import] aucun import trouvé dans {path}"
    end = matches[-1].end()
    s = s[:end] + f"\nimport {{ storagePathOf }} from '{module}';" + s[end:]
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s)
    print(f"  ✓ import storagePathOf → {path.split('/')[-1]}")
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "⚠️  Ce script touche apps/web : arrête `next dev` AVANT, sinon .next"
echo "    (qui est dans le programme tsc via \`**/*.ts\`) te renverra des"
echo "    erreurs fantômes."
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
attente) partageront le même path logique une fois la strate pliée."

echo "✅ T7a appliqué, typechecké et commité."