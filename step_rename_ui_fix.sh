#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FIX renommage — `useNodeActions` déclare son type de retour EN LIGNE sur sa
# signature. Ajouter `renameNode` à l'objet retourné ne suffit donc pas : il
# faut aussi le déclarer dans ce type, sinon :
#     TS2353 / TS2339 : 'renameNode' does not exist on type '{...}'
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HOOK="apps/web/src/features/finder-core/hooks/useNodeActions.ts"
test -f "$HOOK" || { echo "✗ $HOOK introuvable — lance depuis la racine."; exit 1; }
grep -q "renameNode," "$HOOK" || { echo "✗ renameNode absent — applique d'abord step_rename_ui_grid.sh."; exit 1; }

if grep -q "renameNode: (" "$HOOK"; then
  echo "→ déjà appliqué (renameNode déclaré), rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("apps/web/src/features/finder-core/hooks/useNodeActions.ts")
src = p.read_text(encoding="utf-8")

OLD = """  /** Action delete sur une liste explicite de nodes. */
  deleteNodes: (nodes: FinderNode[]) => Promise<void>;"""

NEW = """  /** Action delete sur une liste explicite de nodes. */
  deleteNodes: (nodes: FinderNode[]) => Promise<void>;
  /**
   * Renomme un node (move vers le même dossier). Retourne `null` en cas de
   * succès, sinon le message d'erreur à afficher — le projet n'a pas de
   * système de toast, l'appelant l'affiche inline.
   */
  renameNode: (
    node: FinderNode,
    newBaseName: string,
  ) => Promise<string | null>;"""

n = src.count(OLD)
assert n == 1, f"ancre type de retour trouvee {n}x, attendu 1"
p.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("  ✓ renameNode déclaré dans le type de retour")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "feat(finder): renommage en ligne dans la grille (double-clic sur le nom + menu)"
echo "✓ commité."