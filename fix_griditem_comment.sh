#!/usr/bin/env bash
#
# fix_griditem_comment.sh
#
# Réparation de MON erreur dans step_folder_icon_color.sh.
#
# J'y ai posé un commentaire `{/* … */}` juste après `return (`. À cet
# endroit, les accolades n'ouvrent pas un commentaire JSX mais une expression
# — le parseur lit un littéral objet, puis trouve un `<div>` qui suit sans
# séparateur, d'où « ')' expected ». Un commentaire JSX n'est valide qu'à
# l'INTÉRIEUR d'un élément ; devant l'élément racine d'un `return`, il faut
# un commentaire de ligne ordinaire.
#
# Les deux autres substitutions du script (vues Tableau et Compacte) sont
# saines : elles portent sur des chaînes de classes, pas sur du JSX. Elles
# sont déjà dans l'arbre de travail et ce script les commite avec la
# réparation.
#
# Usage :
#   bash fix_griditem_comment.sh
#   AKFC_APPLY_ONLY=1 bash fix_griditem_comment.sh
#
set -euo pipefail

GRID="apps/web/src/features/finder-core/components/GridItem.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$GRID" ] || { echo "✗ introuvable : $GRID"; exit 1; }

# ── Garde anti-double-application (le fichier réparé n'a plus le motif) ────
if ! grep -q "{/\* Même token que l'arbre" "$GRID"; then
  echo "✓ le commentaire fautif n'est plus là — rien à réparer"
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

GRID = "apps/web/src/features/finder-core/components/GridItem.tsx"

edit(GRID, """    return (
      {/* Même token que l'arbre (`FinderTreeFolder`) : les dossiers ont la
          même couleur d'une vue à l'autre, et suivent le thème. */}
      <div className="w-full h-full flex items-center justify-center pb-6 text-muted-foreground">""",
"""    // Même token que l'arbre (`FinderTreeFolder`) : les dossiers ont la même
    // couleur d'une vue à l'autre, et suivent le thème clair/sombre.
    return (
      <div className="w-full h-full flex items-center justify-center pb-6 text-muted-foreground">""")
PY

echo "✓ 1 substitution appliquée"

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