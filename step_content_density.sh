#!/usr/bin/env bash
#
# step_content_density.sh
#
# Rééquilibrer le blanc et le contenu. Le constat est juste : sur un écran
# large, le contenu occupait moins de la moitié de la surface.
#
# ─── D'où venait le vide ───────────────────────────────────────────────────
#
# Le corps de texte restait à 16px quelle que soit la taille de l'écran. Or
# la justification est plafonnée en `ch`, une unité qui suit la taille de
# police : à 16px, 68ch valent ~545px. Dans un puits de 1216px, la colonne
# ressemblait à un ruban, et le blanc n'était pas un choix de composition
# mais un résidu.
#
# Le remède n'est PAS d'allonger la ligne — 68 caractères restent la bonne
# mesure, et l'élargir dégraderait la lecture. C'est de faire GRANDIR le
# texte avec l'écran. À 20px, ces mêmes 68 caractères occupent ~680px : la
# ligne se lit toujours aussi bien, et le vide se referme.
#
# Trois leviers, dans l'ordre de leur effet :
#
#   1. corps de texte fluide, 16px → 20px selon la largeur ;
#   2. puits ramené de 76rem à 68rem — il était calibré sur les blocs à
#      deux colonnes, pas sur le texte, qui est pourtant le cas courant ;
#   3. marge d'écran fluide, plus étroite sur téléphone qu'elle ne l'était.
#
# ─── Une incohérence corrigée au passage ──────────────────────────────────
#
# Le bloc tiptap seul n'avait jamais reçu `akfc-prose` : il s'étalait sur
# toute la largeur du puits, soit ~150 caractères par ligne, pendant qu'un
# bloc media-text réduit à son texte se limitait à 68. Deux blocs de texte
# voisins sur la même page ne se lisaient donc pas à la même largeur.
#
# Et `.akfc-prose` était plafonné SANS être centré : tout le blanc tombait à
# droite. Symétrique désormais.
#
# ─── Réglable ──────────────────────────────────────────────────────────────
#
# Le puits et la taille maximale du corps deviennent deux curseurs du
# laboratoire. C'est un arbitrage de goût autant que de lisibilité : à
# vérifier à l'œil, sur un vrai contenu, à plusieurs largeurs.
#
# Usage :
#   bash step_content_density.sh
#   AKFC_APPLY_ONLY=1 bash step_content_density.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"
TIPTAP="apps/web/src/features/page-builder/blocks/tiptap/view.server.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GLOBALS" "$TIPTAP" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "akfc-page-max" "$GLOBALS" || {
  echo "✗ step_responsive_measure.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "akfc-base-max" "$LAB"; then
  echo "✓ déjà appliqué (marqueur présent dans $LAB) — rien à faire"
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

GLOBALS = "apps/web/src/app/globals.css"
TIPTAP  = "apps/web/src/features/page-builder/blocks/tiptap/view.server.tsx"
LAB     = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/6 : corps fluide + puits resserré ───────────────────────────────────
edit(GLOBALS, """  --akfc-page-max: min(100% - 2rem, 76rem);""",
"""  /* Taille du corps de texte, fluide.
     C'est LE levier contre le vide. La justification étant plafonnée en
     `ch`, elle suit la taille de police : à 16px, 68ch valent ~545px et la
     colonne fait ruban dans un puits large ; à 20px, les mêmes 68
     caractères occupent ~680px. On ne rallonge pas la ligne — on grossit le
     texte, ce qui referme le blanc SANS dégrader la lecture. */
  --akfc-base-max: 1.25rem;
  --akfc-base-size: clamp(1rem, 0.9rem + 0.5vw, var(--akfc-base-max));

  /* Plafond du puits. Ramené de 76rem à 68rem : 76rem était calibré sur les
     blocs à deux colonnes, alors que le texte — le cas courant — laissait
     alors la moitié de la surface vide.
     La marge d'écran est fluide elle aussi : 1rem suffit sur téléphone, où
     2rem mangeaient une part notable d'une largeur déjà courte. */
  --akfc-page-max-width: 68rem;
  --akfc-page-max: min(
    100% - clamp(1rem, 4vw, 3rem),
    var(--akfc-page-max-width)
  );""")

# ── 2/6 : le corps s'applique, et le texte se centre ──────────────────────
edit(GLOBALS, """.akfc-prose {
  line-height: var(--akfc-leading);
}""",
""".akfc-prose {
  font-size: var(--akfc-base-size);
  line-height: var(--akfc-leading);
}""")

edit(GLOBALS, """/* Plafond de justification. `prose max-w-none` retire le plafond de 65ch de
   @tailwindcss/typography ; sans rien en échange, le texte s'étirait sur
   toute la largeur disponible. On le remet, à notre valeur.
   `max-width` et non `width` : dans une colonne plus étroite que la mesure,
   le texte occupe la colonne — le plafond ne mord que quand il y a trop de
   place. */
.akfc-prose {
  max-width: var(--akfc-measure);
}""",
"""/* Plafond de justification. `prose max-w-none` retire le plafond de 65ch de
   @tailwindcss/typography ; sans rien en échange, le texte s'étirait sur
   toute la largeur disponible. On le remet, à notre valeur.
   `max-width` et non `width` : dans une colonne plus étroite que la mesure,
   le texte occupe la colonne — le plafond ne mord que quand il y a trop de
   place.
   `margin-inline: auto` : sans lui, le plafond laissait TOUT le blanc à
   droite. Le vide était non seulement trop grand, il était de travers. */
.akfc-prose {
  max-width: var(--akfc-measure);
  margin-inline: auto;
}""")

# ── 3/6 : le bloc tiptap rejoint le même régime ───────────────────────────
edit(TIPTAP, """      className="tiptap-rendered prose max-w-none\"""",
"""      // `akfc-prose` manquait ici : ce bloc s'étalait sur toute la largeur
      // du puits — environ 150 caractères par ligne — pendant qu'un bloc
      // media-text réduit à son texte se limitait à 68. Deux blocs de texte
      // voisins ne se lisaient pas à la même largeur.
      className="akfc-prose tiptap-rendered prose max-w-none\"""")

# ── 4/6 : le laboratoire règle le puits ───────────────────────────────────
edit(LAB, """  { key: "--akfc-measure", label: "Justification (caractères)", min: 45, max: 90, step: 1, unit: "ch", initial: 68 },""",
"""  { key: "--akfc-page-max-width", label: "Largeur maximale de page", min: 48, max: 96, step: 1, unit: "rem", initial: 68 },
  { key: "--akfc-base-max", label: "Taille du texte (grand écran)", min: 1, max: 1.5, step: 0.05, unit: "rem", initial: 1.25 },
  { key: "--akfc-measure", label: "Justification (caractères)", min: 45, max: 90, step: 1, unit: "ch", initial: 68 },""")

# ── 5/6 : l'aperçu du labo montre aussi le puits ──────────────────────────
edit(LAB, """        <div
          style={{ ...styleOverrides, maxWidth: previewWidth }}
          className="space-y-8 border-l border-dashed border-border pl-3 transition-[max-width]"
        >""",
"""        {/* `akfc-page` sur le cadre d'aperçu : le laboratoire montre le
            puits AVEC ses marges, sinon on réglerait leur largeur sans
            jamais les voir. */}
        <div
          style={{ ...styleOverrides, maxWidth: previewWidth }}
          className="border-l border-dashed border-border pl-3 transition-[max-width]"
        >
          <div className="akfc-page space-y-8">""")

# ── 6/6 : refermer le div ajouté (DERNIER fichier écrit) ──────────────────
edit(LAB, """          </article>
        </section>
        </div>
      </div>
    </div>
  );
}""",
"""          </article>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}""")
PY

echo "✓ 6 substitutions appliquées"

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
git commit -m "style(page-builder): rendre au contenu la place que le blanc prenait

Le corps restait a 16px quelle que soit la largeur d'ecran. La
justification etant plafonnee en ch, elle suit la taille de police :
a 16px, 68ch valent ~545px et la colonne faisait ruban dans un puits
de 1216px. Le texte grossit desormais jusqu'a 20px avec l'ecran, ou
les memes 68 caracteres occupent ~680px -- la ligne se lit toujours
aussi bien et le vide se referme.

Puits ramene de 76rem a 68rem : il etait calibre sur les blocs a deux
colonnes, pas sur le texte. Marge d'ecran fluide.

Le bloc tiptap seul n'avait jamais recu akfc-prose : il s'etalait sur
~150 caracteres par ligne quand un media-text texte seul s'arretait a
68. Et akfc-prose etait plafonne sans etre centre -- tout le blanc
tombait a droite."

echo "✓ commité"
git log -1 --oneline