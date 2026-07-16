#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T6 : la recherche apprend les chemins logiques
# ═══════════════════════════════════════════════════════════════════════════
#
#  `media.searchRecursive` cherche en DB sur `MediaAsset.fullPath` avec
#  `startsWith: ${prefix}/`, et DÉRIVE les dossiers des fullPaths trouvés.
#  Après la bascule, son `prefix` sera le `currentPath` du finder — logique.
#  Sans ce script : le prefix ne matche plus rien, et les rares résultats
#  reviendraient en chemins physiques dans une grille qui affiche du logique.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. `MediaMeta.storagePath?` — champ ADDITIF au contrat finder.
#   2. `searchRecursive` accepte `logical?: boolean` :
#      - le prefix s'élargit à ses candidats physiques ;
#      - les fullPaths sont PLIÉS avant la dérivation des dossiers, qui
#        travaille donc directement en logique (et dédoublonne toute seule) ;
#      - les strates `pending`/`published` disparaissent des résultats ;
#      - chaque fichier repart avec son `storagePath`.
#
#  Baissé (le défaut), rien ne change. Aucun appelant ne lève le flag.
#
#  AUCUNE migration Prisma. `git revert` suffit.
#
#  PRÉREQUIS : T2 (logicalPath.ts).
#
#  USAGE
#  -----
#     bash step_t6_search_logical.sh
#     AKFC_APPLY_ONLY=1 bash step_t6_search_logical.sh   # usage Claude
#
set -euo pipefail

MARKER="input.logical"

echo "▶ AKFC — T6 : pliage de la recherche (non levé)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "packages/backend" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

MEDIA="packages/backend/src/modules/media/router.ts"
META="packages/contracts/src/finder/meta.types.ts"

[ -f "$MEDIA" ] || { echo "✗ Fichier introuvable : $MEDIA"; exit 1; }
[ -f "$META" ] || { echo "✗ Fichier introuvable : $META"; exit 1; }

if [ ! -f "packages/backend/src/modules/storage/logicalPath.ts" ]; then
  echo "✗ T2 n'est pas appliqué (logicalPath.ts absent)."
  exit 1
fi

if grep -q "$MARKER" "$MEDIA"; then
  echo "✓ Déjà appliqué (flag présent dans media/router.ts). Rien à faire."
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

META = "packages/contracts/src/finder/meta.types.ts"
MEDIA = "packages/backend/src/modules/media/router.ts"

# ── 1. Contrat : MediaMeta.storagePath ───────────────────────────────────
with io.open(META, encoding="utf-8") as f:
    meta_src = f.read()
assert "export type MediaMeta" in meta_src, "[MediaMeta] type introuvable"

anchor = "export type MediaMeta"
idx = meta_src.index(anchor)
brace = meta_src.index("{", idx)
addition = '''
  /**
   * Emplacement RÉEL du binaire chez le provider, quand il diffère de
   * `FinderNode.path`.
   *
   * ─── Pourquoi ce champ vit dans `meta` et pas dans `id` ───────────────
   *
   * Le chantier « arbre sans strate de statut » sépare pour de bon le chemin
   * LOGIQUE (ce par quoi la UI navigue) du chemin PHYSIQUE (où vit le
   * binaire) :
   *
   *   path         : AKFC/cours/tchoy-lee-fut/photo
   *   storagePath  : AKFC/pending/cours/tchoy-lee-fut/photo
   *
   * Tout ce qui parle au PROVIDER ou à la DB — URL de preview, lecture de
   * métadonnées, source d'un move, mise en corbeille, jointure avec
   * `MediaAsset.fullPath` — a besoin du second. Tout ce qui parle à
   * l'UTILISATEUR a besoin du premier.
   *
   * `id` ne peut PAS jouer ce rôle. Il est l'identité d'unicité du nœud, et
   * le contrat le dit : « peut être path ou uuid selon adapter ». De fait il
   * l'est déjà — un fichier remonté par le finder porte son chemin, le même
   * fichier remonté par la recherche porte son cuid `MediaAsset.id`. Les
   * deux sont légitimes, les deux sont uniques, aucun n'est un localisateur.
   * D'où ce champ dédié : un seul accès, valable quelle que soit la
   * provenance du nœud.
   *
   * ─── Durée de vie ─────────────────────────────────────────────────────
   *
   * TRANSITOIRE. À l'étape 5 du chantier (migration des binaires en chemins
   * plats), `storagePath === path` pour tout le monde et le champ se
   * supprime. Ne rien construire d'autre dessus.
   */
  storagePath?: string;
'''
meta_src = meta_src[: brace + 1] + addition + meta_src[brace + 1 :]
with io.open(META, "w", encoding="utf-8") as f:
    f.write(meta_src)
print("  ✓ MediaMeta.storagePath (additif)")

# ── 2. Import du vocabulaire de pliage ───────────────────────────────────
sub_once(
    MEDIA,
    "import { buildMediaProxyUrl } from '@backend/modules/media/helpers/media-url';",
    "import { buildMediaProxyUrl } from '@backend/modules/media/helpers/media-url';\n"
    "import {\n"
    "  physicalCandidates,\n"
    "  toLogicalPath,\n"
    "} from '@backend/modules/storage/logicalPath';",
    "media/router — import du vocabulaire de pliage",
)

# ── 3. Input : le flag ───────────────────────────────────────────────────
sub_once(
    MEDIA,
    """        prefix: z.string().min(1),
        query: z.string().min(1).max(200),""",
    """        prefix: z.string().min(1),
        query: z.string().min(1).max(200),
        /**
         * `prefix` est un chemin LOGIQUE (cf. le flag `logical` du router
         * storage) : la recherche s'élargit alors à ses emplacements
         * physiques, replie les chemins trouvés, et n'expose plus les
         * strates `pending`/`published` comme des dossiers.
         *
         * Baissé (le défaut), rien ne change.
         */
        logical: z.boolean().optional(),""",
    "searchRecursive — flag logical",
)

# ── 4. Le lookup DB s'élargit aux candidats ──────────────────────────────
sub_once(
    MEDIA,
    """      // 2. Lookup DB — match par fullPath
      const candidates = await ctx.prisma.mediaAsset.findMany({
        where: {
          appRoot: input.appRoot,
          OR: [
            { fullPath: input.prefix },
            { fullPath: { startsWith: `${input.prefix}/` } },
          ],
        },""",
    """      // ─── Pliage de la strate de statut ────────────────────────────
      //
      // Un prefix logique recouvre plusieurs emplacements physiques :
      // `AKFC/cours` vit sous `pending`, sous `published`, et (après
      // l'étape 4 du chantier) à plat. On interroge les trois.
      //
      // `toLogical` replie ensuite chaque fullPath trouvé. Tout ce qui suit
      // — dérivation des dossiers, calcul des parents, noms — travaille donc
      // en chemins LOGIQUES sans le savoir, et n'a pas eu à changer.
      const prefixes = input.logical
        ? physicalCandidates(input.prefix, input.appRoot)
        : [input.prefix];

      const toLogical = (fullPath: string): string =>
        input.logical ? toLogicalPath(fullPath, input.appRoot) : fullPath;

      // 2. Lookup DB — match par fullPath
      const candidates = await ctx.prisma.mediaAsset.findMany({
        where: {
          appRoot: input.appRoot,
          OR: prefixes.flatMap((prefix) => [
            { fullPath: prefix },
            { fullPath: { startsWith: `${prefix}/` } },
          ]),
        },""",
    "searchRecursive — lookup élargi aux candidats",
)

# ── 5. Dérivation des dossiers, en logique ───────────────────────────────
sub_once(
    MEDIA,
    """      for (const asset of candidates) {
        if (!asset.fullPath) continue;
        const relative = asset.fullPath.startsWith(`${input.prefix}/`)
          ? asset.fullPath.slice(input.prefix.length + 1)
          : asset.fullPath === input.prefix
            ? ''
            : null;""",
    """      for (const asset of candidates) {
        if (!asset.fullPath) continue;
        // Replié AVANT la dérivation : `folderPaths` étant un Set, le dossier
        // logique `AKFC/cours` dérivé depuis un asset `pending` et depuis un
        // asset `published` se dédoublonne tout seul. La fusion des strates
        // n'a pas besoin d'être écrite — elle tombe.
        const fullPath = toLogical(asset.fullPath);
        const relative = fullPath.startsWith(`${input.prefix}/`)
          ? fullPath.slice(input.prefix.length + 1)
          : fullPath === input.prefix
            ? ''
            : null;""",
    "searchRecursive — dérivation des dossiers en logique",
)

# ── 6. Les strates ne sont plus des dossiers ─────────────────────────────
sub_once(
    MEDIA,
    """      // 3c. STATUS FOLDERS — exposés depuis la racine
      const STATUS_FOLDERS = ['pending', 'published', 'bin'];""",
    """      // 3c. STATUS FOLDERS — exposés depuis la racine
      //
      // En vue pliée, `pending` et `published` ne sont plus des lieux : les
      // faire remonter comme résultats de recherche donnerait à l'admin un
      // dossier sur lequel cliquer et qui n'existe nulle part. `bin`, lui,
      // reste un vrai dossier et reste cherchable.
      const STATUS_FOLDERS = input.logical
        ? ['bin']
        : ['pending', 'published', 'bin'];""",
    "searchRecursive — strates retirées des résultats",
)

# ── 7. Projection des dossiers : pas de storagePath ──────────────────────
sub_once(
    MEDIA,
    """      const folderResults = [...statusFolders, ...matchedFolders].map((f) => ({
        kind: 'folder' as const,
        id: `folder:${f.path}`,
        path: f.path,
        parentPath: parentOf(f.path, input.appRoot),
        name: f.name,
        mimeType: null,""",
    """      const folderResults = [...statusFolders, ...matchedFolders].map((f) => ({
        kind: 'folder' as const,
        id: `folder:${f.path}`,
        path: f.path,
        // Pas de `storagePath` sur un dossier : un dossier logique recouvre
        // plusieurs dossiers physiques, il n'a pas d'emplacement unique à
        // désigner. Les écritures qui en ont besoin le résolvent côté
        // backend (cf. `resolvePhysicalLocations`).
        storagePath: null,
        parentPath: parentOf(f.path, input.appRoot),
        name: f.name,
        mimeType: null,""",
    "searchRecursive — projection des dossiers",
)

# ── 8. Projection des fichiers : path logique + storagePath ──────────────
sub_once(
    MEDIA,
    """      const fileResults = limitedFiles.map((asset) => {
        const path = asset.fullPath!;
        const lastSlash = path.lastIndexOf('/');
        const parentPath = lastSlash > 0 ? path.slice(0, lastSlash) : input.appRoot;
        const name = lastSlash > 0 ? path.slice(lastSlash + 1) : path;

        return {
          kind: 'file' as const,
          id: asset.id,
          path,
          parentPath,
          name,""",
    """      const fileResults = limitedFiles.map((asset) => {
        // `id` reste le cuid `MediaAsset.id` : c'est une identité d'unicité
        // parfaitement valable, et le contrat finder l'autorise
        // explicitement. Le LOCALISATEUR, lui, voyage à part.
        const storagePath = asset.fullPath!;
        const path = toLogical(storagePath);
        const lastSlash = path.lastIndexOf('/');
        const parentPath = lastSlash > 0 ? path.slice(0, lastSlash) : input.appRoot;
        const name = lastSlash > 0 ? path.slice(lastSlash + 1) : path;

        return {
          kind: 'file' as const,
          id: asset.id,
          path,
          storagePath,
          parentPath,
          name,""",
    "searchRecursive — projection des fichiers",
)
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
git commit -m "feat(media): plie la recherche récursive derrière \`logical\`

searchRecursive cherche sur MediaAsset.fullPath par prefix et dérive les
dossiers des fullPaths trouvés. Après la bascule du finder, son prefix sera
le currentPath — logique : le prefix ne matcherait plus rien et les résultats
reviendraient en chemins physiques dans une grille qui affiche du logique.

- le prefix s'élargit à ses candidats physiques ;
- les fullPaths sont repliés AVANT la dérivation des dossiers : folderPaths
  étant un Set, la fusion des strates tombe toute seule, sans code ;
- pending/published disparaissent des STATUS_FOLDERS en vue pliée — ce
  seraient des dossiers cliquables qui n'existent nulle part ; bin reste ;
- chaque fichier repart avec son storagePath.

MediaMeta.storagePath? porte désormais le localisateur, séparé de `id`.
C'est nécessaire parce que `id` n'est PAS un localisateur et ne peut pas le
devenir : le contrat finder dit « peut être path ou uuid selon adapter », et
c'est déjà le cas — un fichier remonté par le finder porte son chemin, le
même fichier remonté par la recherche porte son cuid. Les deux sont uniques,
aucun ne localise. D'où un champ dédié, uniforme quelle que soit la
provenance du noeud.

Baissé (le défaut), rien ne change. Aucun appelant ne lève le flag."

echo "✅ T6 appliqué, typechecké et commité."