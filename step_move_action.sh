#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# DÉPLACER — une seule action, avec choix du dossier de destination.
#
# Pas de couper/coller (deux gestes, un presse-papiers à maintenir) : un item
# « Déplacer » ouvre une modale de navigation, on choisit le dossier, on valide.
#
#   1) `moveNodes` dans `useNodeActions` — via tRPC `storage.move`, comme
#      `deleteNodes`. Aucun adapter à faire descendre dans les composants.
#      Un seul node → source `file`/`folder` ; plusieurs → source `selection`.
#
#   2) `MoveDialog` — navigateur de dossiers autonome : fil d'Ariane cliquable,
#      liste des sous-dossiers, bouton « Déplacer ici ». Il ne s'appuie que sur
#      `storage.getTree`, donc pas de dépendance à l'adapter du finder.
#
#   3) Item « Déplacer » dans les menus de la grille et de l'arbre, entre
#      « Renommer » et « Supprimer ».
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HOOK="apps/web/src/features/finder-core/hooks/useNodeActions.ts"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
DLG="apps/web/src/features/finder-core/components/MoveDialog.tsx"

for f in "$HOOK" "$GRID" "$TREE"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done
grep -q "renameNode" "$HOOK" || { echo "✗ le renommage n'est pas en place."; exit 1; }

# Garde sur le DERNIER élément écrit (l'arbre).
if grep -q "MoveDialog" "$TREE"; then
  echo "→ déjà appliqué (déplacement branché), rien à faire."
  exit 0
fi

# ── 1) La modale de destination ─────────────────────────────────────────────
cat > "$DLG" <<'TSEOF'
'use client';

import { JSX, useState } from 'react';
import { Folder, ChevronRight, Loader2 } from 'lucide-react';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

/**
 * Choix d'un dossier de destination pour un déplacement.
 *
 * Navigateur autonome : il n'utilise que `storage.getTree` (profondeur 1) et
 * ne dépend pas de l'adapter du finder, ce qui lui évite d'être branché à
 * l'état global. Le dossier COURANT de la modale est la destination — le
 * bouton « Déplacer ici » valide, le fil d'Ariane permet de remonter.
 */
export function MoveDialog({
  title,
  onConfirm,
  onClose,
  disabledPaths = [],
}: {
  title: string;
  onConfirm: (destination: string) => void | Promise<void>;
  onClose: () => void;
  /** Chemins qu'on ne peut pas choisir (l'élément déplacé, son parent…). */
  disabledPaths?: string[];
}): JSX.Element {
  const [current, setCurrent] = useState<string>(APP_ROOT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tree = trpc.storage.getTree.useQuery(
    { path: current, depth: 1 },
    { staleTime: 30_000 },
  );

  const folders = (tree.data?.root.children ?? []).filter(
    (child) => child.type === 'folder',
  );

  const segments = current.split('/').filter(Boolean);
  const isDisabled = disabledPaths.includes(current);

  async function confirm(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le déplacement a échoué.');
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[70vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        </div>

        {/* Fil d'Ariane : chaque segment ramène à son niveau. */}
        <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 px-4 py-2 text-xs text-gray-600">
          {segments.map((segment, index) => {
            const path = segments.slice(0, index + 1).join('/');
            const last = index === segments.length - 1;
            return (
              <span key={path} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrent(path)}
                  className={
                    last
                      ? 'font-medium text-gray-900'
                      : 'hover:text-blue-600 hover:underline'
                  }
                >
                  {segment}
                </button>
                {!last && <ChevronRight className="h-3 w-3 text-gray-400" />}
              </span>
            );
          })}
        </div>

        <div className="min-h-[10rem] flex-1 overflow-auto p-2">
          {tree.isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : folders.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-gray-400">
              Aucun sous-dossier ici.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {folders.map((folder) => (
                <li key={folder.path}>
                  <button
                    type="button"
                    onClick={() => setCurrent(folder.path)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Folder className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="mx-4 mb-2 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
          <span className="truncate text-xs text-gray-500">
            Destination : <span className="font-mono">{current}</span>
          </span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={busy || isDisabled}
              onClick={() => void confirm()}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Déplacement…' : 'Déplacer ici'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
TSEOF
echo "✓ $DLG créé"

python3 - <<'PYEOF'
import pathlib

def edit(path, old, new, label, count=1):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

HOOK = "apps/web/src/features/finder-core/hooks/useNodeActions.ts"
GRID = "apps/web/src/features/finder-core/components/GridItem.tsx"
TREE = "apps/web/src/features/finder-core/components/FinderTreeFile.tsx"

# ── 2) hook : moveNodes ─────────────────────────────────────────────────────
edit(HOOK,
     "  const renameMutation = trpc.storage.rename.useMutation();",
     """  const renameMutation = trpc.storage.rename.useMutation();
  const moveMutation = trpc.storage.move.useMutation();""",
     "hook : mutation move")

edit(HOOK,
     """  renameNode: (
    node: FinderNode,
    newBaseName: string,
  ) => Promise<string | null>;""",
     """  renameNode: (
    node: FinderNode,
    newBaseName: string,
  ) => Promise<string | null>;
  /**
   * Déplace des nodes vers un dossier. Retourne `null` en cas de succès,
   * sinon le message d'erreur à afficher.
   */
  moveNodes: (
    nodes: FinderNode[],
    destination: string,
  ) => Promise<string | null>;""",
     "hook : déclaration moveNodes")

edit(HOOK,
     """  return {
    deleteNodes,
    renameNode,""",
     """  /**
   * Déplacement via `storage.move` — un seul node donne une source
   * `file`/`folder`, plusieurs donnent une source `selection`.
   */
  const moveNodes = useCallback(
    async (
      nodes: FinderNode[],
      destination: string,
    ): Promise<string | null> => {
      if (nodes.length === 0) return null;

      const source =
        nodes.length === 1
          ? {
              type: (nodes[0].type === 'folder' ? 'folder' : 'file') as
                | 'folder'
                | 'file',
              path: storagePathOf(nodes[0]),
            }
          : {
              type: 'selection' as const,
              roots: nodes.map(storagePathOf),
            };

      try {
        await moveMutation.mutateAsync({
          source,
          target: { type: 'folder', path: destination },
        });
        reloadFolderContent();
        return null;
      } catch (err) {
        return err instanceof Error
          ? err.message
          : 'Le déplacement a échoué.';
      }
    },
    [moveMutation, reloadFolderContent],
  );

  return {
    deleteNodes,
    renameNode,
    moveNodes,""",
     "hook : moveNodes + export")

edit(HOOK,
     "      renameMutation.isPending,",
     "      renameMutation.isPending ||\n      moveMutation.isPending,",
     "hook : isPending inclut move")

# ── 3) GridItem : item de menu + modale ─────────────────────────────────────
edit(GRID,
     "import { RenameInput } from '@features/finder-core/components/RenameInput';",
     "import { RenameInput } from '@features/finder-core/components/RenameInput';\nimport { MoveDialog } from '@features/finder-core/components/MoveDialog';",
     "grille : import MoveDialog")

edit(GRID,
     "  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode } = useNodeActions",
     "  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode, moveNodes } = useNodeActions",
     "grille : moveNodes du hook")

edit(GRID,
     "  const [isRenaming, setIsRenaming] = useState(false);",
     """  const [isRenaming, setIsRenaming] = useState(false);
  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);""",
     "grille : état de déplacement")

edit(GRID,
     """      {
        label: deleteLabel(targetNodes.length, targetNodes),""",
     """      {
        label: 'Déplacer…',
        onClick: () => setMovingNodes(targetNodes),
      },
      {
        label: deleteLabel(targetNodes.length, targetNodes),""",
     "grille : item de menu Déplacer")

edit(GRID,
     "      {menuPos && (",
     """      {movingNodes && (
        <MoveDialog
          title={
            movingNodes.length === 1
              ? `Déplacer « ${movingNodes[0].name} »`
              : `Déplacer ${movingNodes.length} éléments`
          }
          onClose={() => setMovingNodes(null)}
          onConfirm={async (destination) => {
            const message = await moveNodes(movingNodes, destination);
            if (message) throw new Error(message);
            setMovingNodes(null);
          }}
        />
      )}

      {menuPos && (""",
     "grille : rendu de la modale")

# ── 4) FinderTreeFile : idem ────────────────────────────────────────────────
edit(TREE,
     "import { RenameInput } from '@features/finder-core/components/RenameInput';",
     "import { RenameInput } from '@features/finder-core/components/RenameInput';\nimport { MoveDialog } from '@features/finder-core/components/MoveDialog';",
     "arbre : import MoveDialog")

edit(TREE,
     "  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode } =\n    useNodeActions();",
     "  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode, moveNodes } =\n    useNodeActions();",
     "arbre : moveNodes du hook")

edit(TREE,
     "  const [isRenaming, setIsRenaming] = useState(false);",
     """  const [isRenaming, setIsRenaming] = useState(false);
  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);""",
     "arbre : état de déplacement")

edit(TREE,
     """      {
        label: deleteLabel(targetNodes.length, targetNodes),""",
     """      {
        label: 'Déplacer…',
        onClick: () => setMovingNodes(targetNodes),
      },
      {
        label: deleteLabel(targetNodes.length, targetNodes),""",
     "arbre : item de menu Déplacer")

edit(TREE,
     "      {menuPos && (",
     """      {movingNodes && (
        <MoveDialog
          title={
            movingNodes.length === 1
              ? `Déplacer « ${movingNodes[0].name} »`
              : `Déplacer ${movingNodes.length} éléments`
          }
          onClose={() => setMovingNodes(null)}
          onConfirm={async (destination) => {
            const message = await moveNodes(movingNodes, destination);
            if (message) throw new Error(message);
            setMovingNodes(null);
          }}
        />
      )}

      {menuPos && (""",
     "arbre : rendu de la modale")
PYEOF

echo
echo "→ contrôle"
grep -q "export function MoveDialog" "$DLG" && echo "  ✓ MoveDialog exporté" || { echo "  ✗"; exit 1; }
grep -q "moveNodes: (" "$HOOK" && echo "  ✓ moveNodes déclaré" || { echo "  ✗"; exit 1; }
grep -q "Déplacer…" "$GRID" && echo "  ✓ menu grille" || { echo "  ✗"; exit 1; }
grep -q "Déplacer…" "$TREE" && echo "  ✓ menu arbre" || { echo "  ✗"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): action Deplacer avec selection du dossier de destination"
echo "✓ commité."