#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RENOMMER — incrément 2/2 : l'interface, côté GRILLE.
#
#   - « Renommer » dans le menu contextuel ;
#   - édition en ligne au DOUBLE-CLIC SUR LE NOM (le double-clic sur la carte
#     reste l'ouverture — les deux cohabitent grâce à stopPropagation) ;
#   - Entrée valide, Échap annule, la perte de focus valide ;
#   - erreur affichée SOUS le champ, édition maintenue pour corriger
#     (convention du projet : pas de toast, affichage inline).
#
# On n'édite que la BASE du nom : l'extension affichée est reconstruite par
# `displayName` et n'appartient pas toujours au path réel (public_id Cloudinary
# sans extension). Le backend réapplique celle de la source.
#
# L'arbre suivra dans un incrément séparé.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

FT="apps/web/src/features/finder-core/utils/fileType.ts"
HOOK="apps/web/src/features/finder-core/hooks/useNodeActions.ts"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"

for f in "$FT" "$HOOK" "$GRID"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done
grep -q "rename: protectedProcedure" packages/backend/src/modules/storage/router.ts \
  || { echo "✗ storage.rename absent — applique d'abord le backend."; exit 1; }

# Garde sur le DERNIER élément écrit.
if grep -q "RenameInput" "$GRID"; then
  echo "→ déjà appliqué (édition en ligne présente), rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def edit(path, old, new, label, count=1):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

FT   = "apps/web/src/features/finder-core/utils/fileType.ts"
HOOK = "apps/web/src/features/finder-core/hooks/useNodeActions.ts"
GRID = "apps/web/src/features/finder-core/components/GridItem.tsx"

# ── 1) fileType : baseNameOf ────────────────────────────────────────────────
ft = pathlib.Path(FT)
src = ft.read_text(encoding="utf-8")
assert "baseNameOf" not in src, "baseNameOf deja present"
src = src.rstrip() + '''

/** Nom sans son extension — ce que l'utilisateur édite lors d'un renommage. */
export function baseNameOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : name;
}
'''
ft.write_text(src, encoding="utf-8")
print("  ✓ fileType : baseNameOf")

# ── 2) hook : renameNode ────────────────────────────────────────────────────
edit(HOOK,
     "  const purgeMutation = trpc.trash.purge.useMutation();",
     """  const purgeMutation = trpc.trash.purge.useMutation();
  const renameMutation = trpc.storage.rename.useMutation();""",
     "hook : mutation rename")

edit(HOOK,
     """  return {
    deleteNodes,""",
     """  /**
   * Renomme un node. Retourne `null` si tout s'est bien passé, sinon le
   * message d'erreur à afficher (collision de nom, nom invalide…) — le
   * projet n'a pas de système de toast, l'appelant l'affiche inline.
   */
  const renameNode = useCallback(
    async (node: FinderNode, newBaseName: string): Promise<string | null> => {
      const clean = newBaseName.trim();
      if (!clean) return 'Le nom ne peut pas être vide.';
      if (clean === baseNameOf(node.name)) return null; // rien à faire

      try {
        await renameMutation.mutateAsync({
          path: storagePathOf(node),
          type: node.type === 'folder' ? 'folder' : 'file',
          newBaseName: clean,
        });
        reloadFolderContent();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : 'Le renommage a échoué.';
      }
    },
    [renameMutation, reloadFolderContent],
  );

  return {
    deleteNodes,
    renameNode,""",
     "hook : renameNode + export")

edit(HOOK,
     "    isPending: trashToBinMutation.isPending || purgeMutation.isPending,",
     """    isPending:
      trashToBinMutation.isPending ||
      purgeMutation.isPending ||
      renameMutation.isPending,""",
     "hook : isPending inclut rename")

# import baseNameOf dans le hook
h = pathlib.Path(HOOK)
src = h.read_text(encoding="utf-8")
if "baseNameOf" in src and "utils/fileType" not in src:
    src = src.replace(
        "import { storagePathOf } from '@features/finder-core/utils/storagePath';",
        "import { storagePathOf } from '@features/finder-core/utils/storagePath';\nimport { baseNameOf } from '@features/finder-core/utils/fileType';",
        1)
    h.write_text(src, encoding="utf-8")
    print("  ✓ hook : import baseNameOf")

# ── 3) GridItem ─────────────────────────────────────────────────────────────
edit(GRID,
     "import { getFileExtension, isAudioFile, isPdfFile, videoPosterUrl, isTextFile, displayName } from '@features/finder-core/utils/fileType';",
     "import { getFileExtension, isAudioFile, isPdfFile, videoPosterUrl, isTextFile, displayName, baseNameOf } from '@features/finder-core/utils/fileType';",
     "GridItem : import baseNameOf")

edit(GRID,
     "  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions",
     "  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode } = useNodeActions",
     "GridItem : renameNode du hook")

edit(GRID,
     "  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>",
     """  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>""",
     "GridItem : état d'édition")

# item de menu « Renommer », avant l'item Supprimer
edit(GRID,
     """    return [
      {
        label: deleteLabel(targetNodes.length, targetNodes),""",
     """    return [
      {
        label: 'Renommer',
        onClick: () => {
          setRenameError(null);
          setIsRenaming(true);
        },
      },
      {
        label: deleteLabel(targetNodes.length, targetNodes),""",
     "GridItem : item de menu Renommer")

# le libellé devient éditable
edit(GRID,
     "        {displayName(node.name, node.meta?.format)}\n",
     """        {isRenaming ? (
          <RenameInput
            initial={baseNameOf(node.name)}
            error={renameError}
            onCancel={() => {
              setIsRenaming(false);
              setRenameError(null);
            }}
            onCommit={async (value) => {
              const message = await renameNode(node, value);
              if (message) {
                setRenameError(message);
                return;
              }
              setIsRenaming(false);
              setRenameError(null);
            }}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              // Le double-clic sur la CARTE ouvre ; sur le NOM il renomme.
              e.stopPropagation();
              if (!isStatus) {
                setRenameError(null);
                setIsRenaming(true);
              }
            }}
          >
            {displayName(node.name, node.meta?.format)}
          </span>
        )}
""",
     "GridItem : libellé éditable")

# composant d'édition
g = pathlib.Path(GRID)
src = g.read_text(encoding="utf-8")
assert "function RenameInput" not in src, "RenameInput deja defini"
src = src.rstrip() + '''

/**
 * Champ d'édition en ligne du nom. Entrée valide, Échap annule, la perte de
 * focus valide. En cas d'erreur (collision…), le champ RESTE ouvert avec le
 * message dessous, pour que l'utilisateur corrige sans tout ressaisir.
 */
function RenameInput({
  initial,
  error,
  onCommit,
  onCancel,
}: {
  initial: string;
  error: string | null;
  onCommit: (value: string) => void | Promise<void>;
  onCancel: () => void;
}): JSX.Element {
  const [value, setValue] = useState(initial);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onDoubleClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            void onCommit(value);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        onBlur={() => void onCommit(value)}
        className="w-full rounded border border-blue-400 bg-white px-1 py-0.5 text-xs text-gray-800 outline-none"
      />
      {error && (
        <p className="mt-0.5 rounded bg-red-50 px-1 text-[10px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
'''
g.write_text(src, encoding="utf-8")
print("  ✓ GridItem : composant RenameInput")
PYEOF

echo
echo "→ contrôle"
grep -q "baseNameOf" "$FT"     && echo "  ✓ baseNameOf exporté"   || { echo "  ✗"; exit 1; }
grep -q "renameNode" "$HOOK"   && echo "  ✓ renameNode dans le hook" || { echo "  ✗"; exit 1; }
grep -q "RenameInput" "$GRID"  && echo "  ✓ édition en ligne"     || { echo "  ✗"; exit 1; }
grep -q "'Renommer'" "$GRID"   && echo "  ✓ item de menu"         || { echo "  ✗"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): renommage en ligne dans la grille (double-clic sur le nom + menu)"
echo "✓ commité."