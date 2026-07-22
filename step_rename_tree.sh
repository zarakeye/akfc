#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# RENOMMER — extension à l'ARBRE.
#
#   1) `RenameInput` était local à GridItem. On l'EXTRAIT dans son propre
#      fichier pour que l'arbre le réutilise — plutôt que de le recopier, ce
#      qui recréerait la divergence silencieuse qu'on traque depuis le début
#      de ce chantier.
#
#   2) `FinderTreeFile` gagne « Renommer » dans son menu contextuel et
#      l'édition en ligne au double-clic sur le nom. Le hook `renameNode`
#      existe déjà : rien à ajouter côté logique.
#
# Les vues Tableau et Compacte restent à faire : elles n'ont NI menu contextuel
# NI `useNodeActions`, et affichent `node.name` brut (donc sans extension).
# Les y brancher est un incrément distinct, plus large.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

GRID="apps/web/src/features/finder-core/components/GridItem.tsx"
TREE="apps/web/src/features/finder-core/components/FinderTreeFile.tsx"
COMP="apps/web/src/features/finder-core/components/RenameInput.tsx"

test -f "$GRID" || { echo "✗ $GRID introuvable — lance depuis la racine."; exit 1; }
test -f "$TREE" || { echo "✗ $TREE introuvable."; exit 1; }
grep -q "RenameInput" "$GRID" || { echo "✗ le renommage grille n'est pas en place."; exit 1; }

# Garde sur le DERNIER élément écrit (l'arbre).
if grep -q "RenameInput" "$TREE"; then
  echo "→ déjà appliqué (renommage dans l'arbre), rien à faire."
  exit 0
fi

# ── 1) Composant partagé ────────────────────────────────────────────────────
cat > "$COMP" <<'TSEOF'
'use client';

import { JSX, useState } from 'react';

/**
 * Champ d'édition en ligne d'un nom de fichier ou de dossier.
 *
 * Partagé par la grille et l'arbre : une seule implémentation du
 * comportement (Entrée valide, Échap annule, la perte de focus valide).
 *
 * En cas d'erreur — collision de nom, nom invalide — le champ RESTE ouvert
 * avec le message dessous, pour corriger sans tout ressaisir. Le projet n'a
 * pas de système de toast : l'affichage est inline, comme ailleurs.
 *
 * On n'édite jamais que la BASE du nom. L'extension affichée est reconstruite
 * par `displayName` et n'appartient pas toujours au chemin réel (un public_id
 * Cloudinary d'image n'en porte pas) : c'est le backend qui réapplique celle
 * de la source.
 */
export function RenameInput({
  initial,
  error,
  onCommit,
  onCancel,
  className,
}: {
  initial: string;
  error: string | null;
  onCommit: (value: string) => void | Promise<void>;
  onCancel: () => void;
  className?: string;
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
          // Empêche les raccourcis du finder (suppression, navigation…)
          // de se déclencher pendant la saisie.
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
        className={
          className ??
          'w-full rounded border border-blue-400 bg-white px-1 py-0.5 text-xs text-gray-800 outline-none'
        }
      />
      {error && (
        <p className="mt-0.5 rounded bg-red-50 px-1 text-[10px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
TSEOF
echo "✓ $COMP créé (composant partagé)"

python3 - <<'PYEOF'
import pathlib, re

def edit(path, old, new, label, count=1):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

GRID = "apps/web/src/features/finder-core/components/GridItem.tsx"
TREE = "apps/web/src/features/finder-core/components/FinderTreeFile.tsx"

# ── 2) GridItem : retirer la copie locale, importer le partagé ──────────────
g = pathlib.Path(GRID)
src = g.read_text(encoding="utf-8")
before = src
src = re.sub(
    r"\n/\*\*\n \* Champ d'édition en ligne du nom\..*?\n\}\n",
    "\n", src, flags=re.S, count=1)
assert src != before, "[GridItem] definition locale de RenameInput introuvable"
lines = src.split("\n")
li = max(i for i, l in enumerate(lines[:50]) if l.startswith("import "))
lines.insert(li + 1,
    "import { RenameInput } from '@features/finder-core/components/RenameInput';")
src = "\n".join(lines)
g.write_text(src, encoding="utf-8")
print("  ✓ GridItem : utilise le composant partagé")

# ── 3) FinderTreeFile : import, état, menu, libellé éditable ────────────────
edit(TREE,
     "import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';",
     "import { useNodeActions } from '@features/finder-core/hooks/useNodeActions';\nimport { RenameInput } from '@features/finder-core/components/RenameInput';\nimport { baseNameOf } from '@features/finder-core/utils/fileType';",
     "arbre : imports")

edit(TREE,
     "  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();",
     "  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode } =\n    useNodeActions();",
     "arbre : renameNode du hook")

edit(TREE,
     "  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);",
     """  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);""",
     "arbre : état d'édition")

edit(TREE,
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
     "arbre : item de menu Renommer")

edit(TREE,
     '<span className="truncate">{displayName(node.name, node.meta?.format)}</span>',
     """{isRenaming ? (
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
            className="truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setRenameError(null);
              setIsRenaming(true);
            }}
          >
            {displayName(node.name, node.meta?.format)}
          </span>
        )}""",
     "arbre : libellé éditable")
PYEOF

echo
echo "→ contrôle"
grep -q "export function RenameInput" "$COMP" && echo "  ✓ composant partagé exporté" || { echo "  ✗"; exit 1; }
grep -q "from '@features/finder-core/components/RenameInput'" "$GRID" && echo "  ✓ grille importe le partagé" || { echo "  ✗"; exit 1; }
grep -q "RenameInput" "$TREE" && echo "  ✓ arbre branché" || { echo "  ✗"; exit 1; }
test "$(grep -c 'function RenameInput' "$GRID")" = "0" && echo "  ✓ plus de copie locale" || { echo "  ✗ copie locale subsistante"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): renommage dans l'arbre, RenameInput partage"
echo "✓ commité."