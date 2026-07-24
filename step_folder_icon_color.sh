#!/usr/bin/env bash
#
# step_folder_icon_color.sh
#
# Les icônes de dossier sont bleues dans le panneau principal et neutres dans
# l'arbre. On aligne le panneau sur l'arbre.
#
# La couleur de l'arbre n'est pas un noir littéral mais le token
# `text-muted-foreground` (`oklch(0.551 …)` en clair, `oklch(0.707 …)` en
# sombre). C'est LUI qu'on reprend, et pas un `text-black` ou un
# `text-gray-900` : le token suit le thème, une valeur en dur ne le suivrait
# pas et rouvrirait l'écart au premier passage en mode sombre.
#
# Trois vues, pas une : la demande vise la grille, mais les vues Tableau et
# Compacte partagent le même panneau et le même bleu. Les corriger seules
# aurait déplacé l'incohérence d'un cran.
#
# NON touché, délibérément : `SearchResultsView`. Son bleu n'est pas
# décoratif, il fait partie d'une paire avec `group-hover:text-blue-600` qui
# signale la ligne survolée. Le neutraliser demanderait de repenser
# l'affordance de survol — autre sujet, à décider à l'œil.
#
# Usage :
#   bash step_folder_icon_color.sh
#   AKFC_APPLY_ONLY=1 bash step_folder_icon_color.sh
#
set -euo pipefail

C="apps/web/src/features/finder-core/components"
GRID="$C/GridItem.tsx"
TABLE="$C/FinderTableRow.tsx"
COMPACT="$C/FinderCompactRow.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GRID" "$TABLE" "$COMPACT"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "text-muted-foreground" "$COMPACT"; then
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

C       = "apps/web/src/features/finder-core/components"
GRID    = "%s/GridItem.tsx" % C
TABLE   = "%s/FinderTableRow.tsx" % C
COMPACT = "%s/FinderCompactRow.tsx" % C

# ── 1/3 grille : la grande icône centrale ──────────────────────────────────
edit(GRID, """      <div className="w-full h-full flex items-center justify-center pb-6 text-blue-400">
        <Folder className="w-16 h-16" strokeWidth={1.5} />""",
"""      {/* Même token que l'arbre (`FinderTreeFolder`) : les dossiers ont la
          même couleur d'une vue à l'autre, et suivent le thème. */}
      <div className="w-full h-full flex items-center justify-center pb-6 text-muted-foreground">
        <Folder className="w-16 h-16" strokeWidth={1.5} />""")

# ── 2/3 vue tableau ────────────────────────────────────────────────────────
edit(TABLE, """          `h-4 w-4 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,""",
"""          `h-4 w-4 ${isFolder ? 'text-muted-foreground' : 'text-gray-500'}`,""")

# ── 3/3 vue compacte : DERNIER fichier écrit (marqueur de la garde) ────────
edit(COMPACT, """        `h-4 w-4 shrink-0 ${isFolder ? 'text-blue-500' : 'text-gray-500'}`,""",
"""        `h-4 w-4 shrink-0 ${isFolder ? 'text-muted-foreground' : 'text-gray-500'}`,""")
PY

echo "✓ 3 substitutions appliquées"

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
git commit -m "style(finder): les dossiers prennent la couleur de l'arbre

Les icones de dossier du panneau principal passent de text-blue-400 /
text-blue-500 a text-muted-foreground, le token deja utilise par
FinderTreeFolder. Un token plutot qu'une valeur en dur : la couleur
suit le theme clair/sombre.

Les trois vues du panneau sont alignees (grille, tableau, compacte).
SearchResultsView garde son bleu, qui participe a son affordance de
survol."

echo "✓ commité"
git log -1 --oneline