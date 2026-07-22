#!/usr/bin/env bash
#
# step_rows_actions.sh
#
# §6.1 du document de reprise : les vues Tableau et Compacte n'ont ni menu
# contextuel ni `useNodeActions`, et affichent `node.name` BRUT — donc sans
# extension pour les assets Cloudinary, dont le public_id n'en porte pas.
#
# On leur greffe exactement ce que la grille a déjà :
#   - `displayName` / `baseNameOf` pour le nom affiché et le nom édité ;
#   - menu contextuel Renommer / Déplacer… / Supprimer, sur la sélection
#     effective (`effectiveNodesFor`), muet sur les dossiers de statut ;
#   - renommage en ligne au double-clic sur le NOM (le double-clic ailleurs
#     sur la ligne garde son rôle d'ouverture) ;
#   - `MoveDialog` pour le déplacement.
#
# Une seule particularité par rapport à la grille : dans la vue tableau, la
# ligne est un `<tr>` monté dans un `<tbody>`. Un menu ou une modale rendus
# en frère du `<tr>` produiraient un `<div>` enfant de `<tbody>` — nesting
# invalide, et avertissement d'hydratation. Les deux overlays passent donc
# par un portail vers `document.body`. Ils ne sont montés que sur action
# utilisateur, jamais au rendu serveur : `createPortal` n'est pas appelé
# côté SSR.
#
# Usage :
#   bash step_rows_actions.sh
#   AKFC_APPLY_ONLY=1 bash step_rows_actions.sh   # édits seuls
#
set -euo pipefail

TABLE="apps/web/src/features/finder-core/components/FinderTableRow.tsx"
COMPACT="apps/web/src/features/finder-core/components/FinderCompactRow.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$TABLE" "$COMPACT"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "buildMenuItems" "$COMPACT"; then
  echo "✓ déjà appliqué (marqueur présent dans $COMPACT) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

TABLE   = "apps/web/src/features/finder-core/components/FinderTableRow.tsx"
COMPACT = "apps/web/src/features/finder-core/components/FinderCompactRow.tsx"

# Blocs communs aux deux fichiers — écrits une fois, injectés deux fois.

STATE_AND_MENU = """
  // Les dossiers de statut n'ont pas d'actions : ni menu, ni renommage, ni
  // déplacement. Même règle que dans la grille (cf. utils/statusFolders.ts).
  const isStatus = isStatusFolder(node.path);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode, moveNodes } =
    useNodeActions();

  // L'action porte sur la sélection effective quand le node visé en fait
  // partie, sur lui seul sinon — la sémantique du DnD, reprise telle quelle.
  function buildMenuItems(): ContextMenuItem[] {
    const targetNodes = effectiveNodesFor(node);
    return [
      {
        label: 'Renommer',
        onClick: () => {
          setRenameError(null);
          setIsRenaming(true);
        },
      },
      {
        label: 'Déplacer…',
        onClick: () => setMovingNodes(targetNodes),
      },
      {
        label: deleteLabel(targetNodes.length, targetNodes),
        destructive: true,
        onClick: () => {
          void deleteNodes(targetNodes);
        },
      },
    ];
  }
"""

CONTEXT_MENU_HANDLER = """      onContextMenu={
        isStatus
          ? undefined
          : (e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuPos({ x: e.clientX, y: e.clientY });
            }
      }
"""

def overlays(indent):
    return ("""
{i}{{movingNodes && (
{i}  <MoveDialog
{i}    title={{
{i}      movingNodes.length === 1
{i}        ? `Déplacer « ${{displayName(
{i}            movingNodes[0].name,
{i}            movingNodes[0].meta?.format,
{i}          )}} »`
{i}        : `Déplacer ${{movingNodes.length}} éléments`
{i}    }}
{i}    onClose={{() => setMovingNodes(null)}}
{i}    onConfirm={{async (destination) => {{
{i}      const message = await moveNodes(movingNodes, destination);
{i}      if (message) throw new Error(message);
{i}      setMovingNodes(null);
{i}    }}}}
{i}  />
{i})}}

{i}{{menuPos && (
{i}  <ContextMenu
{i}    x={{menuPos.x}}
{i}    y={{menuPos.y}}
{i}    items={{buildMenuItems()}}
{i}    onClose={{() => setMenuPos(null)}}
{i}  />
{i})}}
""").format(i=indent)

# ─────────────────────────────────────────────────────────────────────────────
#  1/2  FinderTableRow.tsx
# ─────────────────────────────────────────────────────────────────────────────

edit(TABLE, """import { JSX } from 'react';
import { Folder, FileText, Image as ImageIcon, FileVideo, FileAudio, FileType } from 'lucide-react';
import type { FinderNode } from '@contracts/finder';
import type { TriState } from '@features/finder-core/utils/triState';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { statusOf } from '@features/finder-core/utils/statusFolders';""",
"""import { JSX, useState } from 'react';
import { createPortal } from 'react-dom';
import { Folder, FileText, Image as ImageIcon, FileVideo, FileAudio, FileType } from 'lucide-react';
import type { FinderNode } from '@contracts/finder';
import type { TriState } from '@features/finder-core/utils/triState';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import {
  statusOf,
  isStatusFolder,
} from '@features/finder-core/utils/statusFolders';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';
import { RenameInput } from '@features/finder-core/components/RenameInput';
import { MoveDialog } from '@features/finder-core/components/MoveDialog';
import { displayName, baseNameOf } from '@features/finder-core/utils/fileType';""")

edit(TABLE, """  const longPress = useLongPress(onLongPress);
  const isFolder = node.type === 'folder';

  return (
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable
      onDragStart={onDragStart}""",
"""  const longPress = useLongPress(onLongPress);
  const isFolder = node.type === 'folder';
""" + STATE_AND_MENU + """
  return (
    <>
    <tr
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable
      onDragStart={onDragStart}
""" + CONTEXT_MENU_HANDLER.rstrip('\n'))

edit(TABLE, """      <td className="px-3 py-2 text-sm font-medium text-gray-900">
        <div className="truncate max-w-[260px]" title={node.name}>
          {node.name}
        </div>
      </td>""",
"""      <td className="px-3 py-2 text-sm font-medium text-gray-900">
        {isRenaming ? (
          <RenameInput
            initial={baseNameOf(node.name, node.meta?.format)}
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
          <div
            className="truncate max-w-[260px]"
            title={displayName(node.name, node.meta?.format)}
            onDoubleClick={(e) => {
              // Double-clic sur la CELLULE du nom : renommer. Ailleurs sur la
              // ligne : ouvrir. Le même partage que dans la grille.
              e.stopPropagation();
              if (!isStatus) {
                setRenameError(null);
                setIsRenaming(true);
              }
            }}
          >
            {displayName(node.name, node.meta?.format)}
          </div>
        )}
      </td>""")

edit(TABLE, """      <td className="px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </td>
    </tr>
  );
}""",
"""      <td className="px-3 py-2 text-sm text-gray-500 text-right whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </td>
    </tr>

    {/* Portail : un <div> frère du <tr> serait un enfant direct de <tbody>,
        nesting invalide et avertissement d'hydratation. Les overlays ne sont
        montés que sur action utilisateur — jamais pendant le rendu serveur,
        donc `document` est toujours défini quand on arrive ici. */}
    {(movingNodes || menuPos) &&
      createPortal(
        <>""" + overlays('          ').rstrip('\n') + """
        </>,
        document.body,
      )}
    </>
  );
}""")

# ─────────────────────────────────────────────────────────────────────────────
#  2/2  FinderCompactRow.tsx — DERNIER fichier écrit (marqueur de la garde)
# ─────────────────────────────────────────────────────────────────────────────

edit(COMPACT, """import { JSX } from 'react';
import { Folder, FileText, Image as ImageIcon, FileVideo, FileAudio, FileType } from 'lucide-react';
import type { FinderNode } from '@contracts/finder';
import type { TriState } from '@features/finder-core/utils/triState';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';""",
"""import { JSX, useState } from 'react';
import { Folder, FileText, Image as ImageIcon, FileVideo, FileAudio, FileType } from 'lucide-react';
import type { FinderNode } from '@contracts/finder';
import type { TriState } from '@features/finder-core/utils/triState';
import { useLongPress } from '@features/finder-core/hooks/useLongPress';
import { isStatusFolder } from '@features/finder-core/utils/statusFolders';
import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';
import ContextMenu, {
  type ContextMenuItem,
} from '@features/finder-core/components/ContextMenu';
import { RenameInput } from '@features/finder-core/components/RenameInput';
import { MoveDialog } from '@features/finder-core/components/MoveDialog';
import { displayName, baseNameOf } from '@features/finder-core/utils/fileType';""")

edit(COMPACT, """  const longPress = useLongPress(onLongPress);
  const isFolder = node.type === 'folder';

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable
      onDragStart={onDragStart}""",
"""  const longPress = useLongPress(onLongPress);
  const isFolder = node.type === 'folder';
""" + STATE_AND_MENU + """
  return (
    <>
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable
      onDragStart={onDragStart}
""" + CONTEXT_MENU_HANDLER.rstrip('\n'))

edit(COMPACT, """      <span className="text-sm font-medium text-gray-900 truncate min-w-0 flex-1" title={node.name}>
        {node.name}
      </span>""",
"""      {isRenaming ? (
        <span className="min-w-0 flex-1">
          <RenameInput
            initial={baseNameOf(node.name, node.meta?.format)}
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
        </span>
      ) : (
        <span
          className="text-sm font-medium text-gray-900 truncate min-w-0 flex-1"
          title={displayName(node.name, node.meta?.format)}
          onDoubleClick={(e) => {
            // Double-clic sur le NOM : renommer. Ailleurs sur la ligne :
            // ouvrir. Le même partage que dans la grille.
            e.stopPropagation();
            if (!isStatus) {
              setRenameError(null);
              setIsRenaming(true);
            }
          }}
        >
          {displayName(node.name, node.meta?.format)}
        </span>
      )}""")

edit(COMPACT, """      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </span>
    </div>
  );
}""",
"""      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
        {isFolder ? '—' : formatBytes(node.size)}
      </span>
    </div>
""" + overlays('    ').rstrip('\n') + """
    </>
  );
}""")
PY

echo "✓ 8 substitutions appliquées"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(finder): actions et extensions dans les vues tableau et compacte

Menu contextuel Renommer / Deplacer / Supprimer branche sur
useNodeActions, renommage en ligne au double-clic sur le nom,
MoveDialog pour le deplacement -- les memes composants partages
que la grille.

Le nom affiche passe par displayName : les assets Cloudinary
montrent enfin leur extension dans ces deux vues.

Vue tableau : les overlays passent par un portail, un <div> frere
du <tr> serait un enfant invalide de <tbody>."

echo "✓ commité"
git log -1 --oneline