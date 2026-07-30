#!/usr/bin/env bash
#
# fix_instructors_width.sh
#
# Les bios d'instructeurs rendues trop étroites. Deux erreurs qui se cumulent.
#
# ─── La cascade réelle, mesurée ────────────────────────────────────────────
#
# Écran 1440px, police de base 18px, puits de page 1088px :
#
#   ACTUEL                                 CORRIGÉ
#     article           612px                article           1088px
#     puits imbriqué    514px                puits imbriqué    1038px
#     bloc texte        57 caractères        bloc texte        68 caractères
#     texte enrobant    41 caractères        texte enrobant    49 caractères
#
# ─── Erreur 1 : la mesure posée sur la CARTE ───────────────────────────────
#
# L'article portait `akfc-measure-block`, donc un plafond de 68ch. Mais la
# mesure est la largeur d'une LIGNE DE TEXTE, pas celle d'un conteneur qui
# ajoute par-dessus une bordure, 48px de rembourrage et un puits interne.
#
# Plafonner la carte à la mesure garantit donc que le texte à l'intérieur sera
# FORCÉMENT plus étroit qu'elle : 57 caractères au lieu de 68. La mesure
# appartient au texte, et le texte se la donne déjà lui-même — chaque bloc
# porte `akfc-prose` ou `akfc-measure-block`.
#
# La carte prend donc le puits, et le texte se cadre tout seul dedans. Pour
# que l'en-tête portrait + nom reste aligné sur la colonne de texte plutôt que
# de fuir vers le bord gauche d'une carte devenue large, c'est LUI qui reçoit
# la mesure.
#
# ─── Erreur 2 : la marge d'écran retirée deux fois ─────────────────────────
#
# `.akfc-page` vaut `min(100% - marge d'écran, 68rem)`. Or `PageRenderer` pose
# lui-même un `.akfc-page` autour de ses blocs, et il est presque toujours
# rendu À L'INTÉRIEUR d'une page qui en porte déjà un — ici l'article, mais
# aussi `/about` et les fiches discipline.
#
# La marge d'écran était donc soustraite à chaque niveau. Elle n'a de sens
# qu'une fois, au puits le plus extérieur : c'est une marge d'ÉCRAN, pas une
# marge de conteneur. Un puits imbriqué prend désormais toute la largeur de
# son parent.
#
# Ce correctif-là vaut pour toute l'application, pas seulement cette page.
#
# Usage :
#   bash fix_instructors_width.sh
#   AKFC_APPLY_ONLY=1 bash fix_instructors_width.sh
#
set -euo pipefail

globals_file="apps/web/src/app/globals.css"
instructors_page="apps/web/src/app/(public)/about/instructeurs/page.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "akfc-measure-block mb-4" "$instructors_page" 2>/dev/null; then
  echo "✓ déjà appliqué (largeurs corrigées) — rien à faire"
  exit 0
fi

for f in "$globals_file" "$instructors_page"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

globals_file     = "apps/web/src/app/globals.css"
instructors_page = "apps/web/src/app/(public)/about/instructeurs/page.tsx"

# ── 1/3 la marge d'écran ne s'applique qu'une fois ────────────────────────
edit(globals_file, """/* akfc-float-scope-width-fix */""",
"""/* Un puits IMBRIQUÉ prend toute la largeur de son parent.

   `.akfc-page` vaut `min(100% - marge d'écran, 68rem)`. Or `PageRenderer`
   pose lui-même un `.akfc-page` autour de ses blocs, et il est presque
   toujours rendu à l'intérieur d'une page qui en porte déjà un : fiche
   discipline, page « L'association », carte d'instructeur. La marge était
   donc soustraite à CHAQUE niveau.

   Elle n'a de sens qu'une fois, au puits le plus extérieur : c'est une marge
   d'ÉCRAN, destinée à éloigner le contenu du bord de la fenêtre, pas une
   marge de conteneur. Sur la page des instructeurs, elle coûtait 48px pris
   sur une carte déjà trop étroite. */
.akfc-page .akfc-page {
  width: 100%;
}

/* akfc-float-scope-width-fix */""")

# ── 2/3 la carte prend le puits ───────────────────────────────────────────
edit(instructors_page, """              // `akfc-measure-block` cadre chaque bio a la meme largeur de
              // lecture, quel que soit le contenu que l'instructeur y a mis.
              // La carte l'annonce (portrait + nom) et la separe de la
              // suivante par l'ecart entre blocs du systeme.
              <article
                key={instructor.id}
                className="akfc-measure-block rounded-lg border border-border p-6"
              >""",
"""              // La carte prend le PUITS, pas la mesure.
              //
              // `akfc-measure-block` etait pose ici, ce qui plafonnait la
              // carte a 68ch. Mais la mesure est la largeur d'une LIGNE DE
              // TEXTE, pas celle d'un conteneur qui ajoute par-dessus une
              // bordure, 48px de rembourrage et un puits interne : le texte
              // a l'interieur etait donc forcement plus etroit qu'elle,
              // 57 caracteres au lieu de 68.
              //
              // La mesure appartient au texte, et le texte se la donne deja
              // lui-meme — chaque bloc porte `akfc-prose` ou
              // `akfc-measure-block`.
              <article
                key={instructor.id}
                className="rounded-lg border border-border p-6"
              >""")

# ── 3/3 l'en-tête reçoit la mesure, pour rester aligné sur le texte ───────
edit(instructors_page, """                <header className="mb-4 flex items-center gap-3">""",
"""                {/* La mesure passe ICI : sans elle, portrait et nom
                    fuiraient vers le bord gauche d'une carte devenue large
                    pendant que le texte resterait centre a 68ch. */}
                <header className="akfc-measure-block mb-4 flex items-center gap-3">""")
PY

echo "✓ largeurs corrigées"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "fix(layout): la mesure appartient au texte, pas au conteneur

Bios d'instructeurs rendues trop etroites. Deux erreurs cumulees,
mesurees sur un ecran de 1440px avec un puits de 1088px :

  avant : carte 612px, puits imbrique 514px, texte 57 caracteres,
          texte enrobant 41 caracteres
  apres : carte 1088px, puits imbrique 1038px, texte 68 caracteres,
          texte enrobant 49 caracteres

ERREUR 1 — la mesure posee sur la CARTE. L'article portait
akfc-measure-block, donc un plafond de 68ch. Mais la mesure est la
largeur d'une LIGNE DE TEXTE, pas celle d'un conteneur qui ajoute une
bordure, 48px de rembourrage et un puits interne : le texte a
l'interieur etait forcement plus etroit qu'elle. La carte prend donc le
puits, et le texte se cadre lui-meme — chaque bloc porte deja
akfc-prose ou akfc-measure-block. L'en-tete portrait + nom recoit la
mesure pour rester aligne sur la colonne de texte.

ERREUR 2 — la marge d'ecran retiree a chaque niveau. .akfc-page vaut
min(100% - marge, 68rem), et PageRenderer pose lui-meme un .akfc-page
autour de ses blocs, presque toujours a l'interieur d'une page qui en
porte deja un. Une marge d'ECRAN n'a de sens qu'au puits le plus
exterieur : un puits imbrique prend desormais toute la largeur de son
parent. Ce correctif vaut pour toute l'application."

echo "✓ commité"
git log -1 --oneline