#!/usr/bin/env bash
#
# step_responsive_measure.sh
#
# Rendre le rendu des blocs adaptable, du smartphone au très grand écran.
#
# ─── Le défaut de fond : la page n'a aucun plafond ─────────────────────────
#
# Les pages de contenu n'ont aucune largeur maximale. Sur un écran de
# 1920px, la colonne de texte atteint 800px, soit près de 100 caractères par
# ligne — bien au-delà des 45 à 75 qui se lisent confortablement. Aucun ratio
# média/texte ne rattrape cela : il fallait plafonner d'abord.
#
# ─── Pourquoi les media queries donnaient de mauvaises réponses ───────────
#
# `@media (min-width: 768px)` interroge la FENÊTRE. Or le même bloc s'affiche
# dans le tableau de bord, derrière une barre latérale de 240px, et sur le
# site public en pleine largeur. À 1024px de fenêtre, la zone de contenu du
# tableau de bord ne fait que ~780px : la règle passait donc en deux colonnes
# alors que chacune ne recevait que 370px. Le bloc basculait au mauvais
# moment, et personne ne pouvait le voir en regardant la seule fenêtre.
#
# Une CONTAINER QUERY interroge la largeur réelle du bloc. La bascule se fait
# quand il y a vraiment la place, quel que soit le contexte — tableau de
# bord, site public, ou aperçu du builder dans son panneau étroit.
#
# ─── Fluide plutôt que par paliers ────────────────────────────────────────
#
# Les tailles et les écarts passent en `clamp()`. Un jeu de paliers laisse
# des zones mortes : à 1400px on rend comme à 1024px, et le très grand écran
# ne gagne rien. `clamp()` interpole continûment entre une borne mobile et
# une borne grand écran — chaque largeur reçoit sa juste proportion.
#
# La justification, elle, se plafonne en `ch` et non en rem : l'unité suit la
# taille de police effective, donc la ligne garde sa longueur en CARACTÈRES
# même quand le texte grossit. C'est la seule unité qui rende la mesure
# vraiment indépendante de l'écran.
#
# Usage :
#   bash step_responsive_measure.sh
#   AKFC_APPLY_ONLY=1 bash step_responsive_measure.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"
RENDERER="apps/web/src/features/page-builder/PageRenderer.tsx"
B="apps/web/src/features/page-builder/blocks"
VIEW="$B/media-text/view.server.tsx"
PREVIEW="$B/media-text/MediaTextPreview.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GLOBALS" "$RENDERER" "$VIEW" "$PREVIEW" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "akfc-col-1" "$GLOBALS" || {
  echo "✗ step_blocks_shared_vars.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "akfc-measure" "$LAB"; then
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

GLOBALS  = "apps/web/src/app/globals.css"
RENDERER = "apps/web/src/features/page-builder/PageRenderer.tsx"
B        = "apps/web/src/features/page-builder/blocks"
VIEW     = "%s/media-text/view.server.tsx" % B
PREVIEW  = "%s/media-text/MediaTextPreview.tsx" % B
LAB      = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/9 globals : mesure, plafond de page, écarts fluides ─────────────────
edit(GLOBALS, """  --akfc-column-gap: 2.5rem;""",
"""  /* Justification maximale, en `ch` et non en rem : l'unité suit la taille
     de police effective, donc la ligne garde sa longueur en CARACTÈRES quand
     le texte grossit. 68 caractères tient dans la plage confortable
     (45–75), près de l'optimum admis autour de 65. */
  --akfc-measure: 68ch;

  /* Plafond de la page. `min()` et non une valeur sèche : sur un écran
     étroit c'est la largeur disponible moins les marges qui commande, sur un
     grand écran c'est le plafond. Une seule expression pour les deux, sans
     point de rupture. */
  --akfc-page-max: min(100% - 2rem, 76rem);

  /* Écart entre colonnes, fluide. Un palier fixe est trop large quand deux
     colonnes se serrent sur une tablette, et trop étroit sur un grand
     écran ; `clamp()` interpole entre les deux au lieu de sauter. */
  --akfc-column-gap: clamp(1.25rem, 3vw, 3.5rem);

  /* Largeur en dessous de laquelle un bloc à deux colonnes repasse en une
     seule. Mesurée sur le BLOC (container query), pas sur la fenêtre. */
  --akfc-columns-min: 44rem;""")

# ── 2/9 globals : les tailles de titres deviennent fluides ────────────────
edit(GLOBALS, """  --akfc-h1: 2em;
  --akfc-h2: 1.5em;
  --akfc-h3: 1.25em;""",
"""  /* Échelle des titres, fluide. Un h1 à 2em fixes écrase un écran de
     téléphone et se perd sur un très grand écran : les bornes disent le
     minimum lisible et le maximum souhaitable, `vw` fait la transition. */
  --akfc-h1: clamp(1.6rem, 1.1rem + 2.2vw, 2.75rem);
  --akfc-h2: clamp(1.35rem, 1rem + 1.5vw, 2rem);
  --akfc-h3: clamp(1.15rem, 0.95rem + 0.9vw, 1.5rem);""")

# ── 3/9 globals : container query au lieu de media query ──────────────────
edit(GLOBALS, """@media (min-width: 768px) {
  .akfc-block-columns {
    /* Le ratio vit ICI et non en style inline : un style inline ne peut pas
       porter de point de rupture, alors qu'une variable posée en inline
       traverse sans peine une media query. En dessous de 768px, la règle ne
       s'applique pas et la grille reste à une seule colonne. */
    grid-template-columns: var(--akfc-col-1) var(--akfc-col-2);""",
"""/* `container-type: inline-size` fait du bloc une unité de mesure pour ses
   propres règles. Sans lui, `@container` n'aurait rien à interroger.
   Posé sur le BLOC et non sur la page : la containment ne gêne alors ni le
   collant, ni les débordements de la mise en page générale. */
.akfc-block-columns {
  container-type: inline-size;
}

/* On interroge la largeur du BLOC, pas celle de la fenêtre.
   Le même bloc s'affiche derrière la barre latérale du tableau de bord
   (240px de moins) et en pleine largeur sur le site : une media query
   répondait juste dans un cas et faux dans l'autre — deux colonnes de 370px
   sur une fenêtre de 1024px. */
@container (min-width: 44rem) {
  .akfc-block-columns {
    /* Le ratio vit ICI et non en style inline : un style inline ne peut pas
       porter de condition, alors qu'une variable posée en inline la traverse
       sans peine. En dessous du seuil, la règle ne s'applique pas et la
       grille reste à une seule colonne — le média passe au-dessus du texte,
       ce qui est l'ordre de lecture attendu sur téléphone. */
    grid-template-columns: var(--akfc-col-1) var(--akfc-col-2);""")

# ── 4/9 globals : la justification s'applique au texte ────────────────────
edit(GLOBALS, """.akfc-prose {
  line-height: var(--akfc-leading);
}""",
""".akfc-prose {
  line-height: var(--akfc-leading);
}

/* Plafond de justification. `prose max-w-none` retire le plafond de 65ch de
   @tailwindcss/typography ; sans rien en échange, le texte s'étirait sur
   toute la largeur disponible. On le remet, à notre valeur.
   `max-width` et non `width` : dans une colonne plus étroite que la mesure,
   le texte occupe la colonne — le plafond ne mord que quand il y a trop de
   place. */
.akfc-prose {
  max-width: var(--akfc-measure);
}

/* Une colonne de bloc à deux colonnes est déjà plafonnée par la grille :
   y remettre la mesure la rétrécirait une seconde fois et laisserait un vide
   à droite. */
.akfc-block-columns .akfc-prose {
  max-width: none;
}""")

# ── 5/9 globals : le conteneur de page ────────────────────────────────────
with io.open(GLOBALS, 'a', encoding='utf-8') as fh:
    fh.write("""
/* Conteneur des pages construites au builder.
   `margin-inline: auto` avec une largeur en `min()` : centré et plafonné en
   une seule déclaration, sans point de rupture ni marge négative. */
.akfc-page {
  width: var(--akfc-page-max);
  margin-inline: auto;
}

/* Bloc autonome — le cas d'un media-text réduit à son texte, ou d'un bloc
   tiptap seul. Sa largeur est la MESURE, pas une valeur d'écran : c'est la
   lisibilité qui commande, et elle ne dépend pas de la taille du moniteur. */
.akfc-measure-block {
  max-width: var(--akfc-measure);
  margin-inline: auto;
}
""")
print("  ~ globals.css (mesure, plafond de page, container query)")

# ── 6/9 PageRenderer : la page reçoit son plafond ─────────────────────────
edit(RENDERER, """    <div className="page-renderer flex flex-col gap-10">""",
"""    // `akfc-page` plafonne et centre. Sans lui, sur un écran de 1920px la
    // colonne de texte atteignait 800px, soit près de 100 caractères par
    // ligne — hors de la plage lisible, et qu'aucun ratio ne corrigeait.
    // L'écart entre blocs suit la même règle fluide que les gouttières.
    <div
      className="page-renderer akfc-page flex flex-col"
      style={{ gap: "clamp(2rem, 5vw, 4rem)" }}
    >""")

# ── 7/9 media-text : la branche pleine largeur suit la mesure ─────────────
edit(VIEW, """  // Une seule partie → centré, pleine largeur (impression de respiration).
  if (!hasText || !hasMedia) {
    return (
      <div className="mx-auto max-w-3xl">""",
"""  // Une seule partie → centré sur la MESURE, pas sur une largeur d'écran.
  // `max-w-3xl` valait 768px, soit ~96 caractères par ligne : au-delà de la
  // plage lisible. La mesure est en `ch`, donc elle suit la taille du texte
  // au lieu de la contredire.
  if (!hasText || !hasMedia) {
    return (
      <div className="akfc-measure-block">""")

edit(PREVIEW, """      <div className="mx-auto max-w-2xl">""",
"""      <div className="akfc-measure-block">""")

# ── 8/9 laboratoire : régler la mesure et le seuil de bascule ────────────
edit(LAB, """  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5 },""",
"""  { key: "--akfc-measure", label: "Justification (caractères)", min: 45, max: 90, step: 1, unit: "ch", initial: 68 },
  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5 },""")

# ── 9/9 laboratoire : un aperçu à largeur variable (DERNIER écrit) ────────
edit(LAB, """      {/* ─── Aperçu ───────────────────────────────────────────────── */}
      <div style={styleOverrides} className="space-y-8">""",
"""      {/* ─── Aperçu ───────────────────────────────────────────────── */}
      {/* La largeur est bridée par `maxWidth` et non par une simulation
          d'écran : les blocs réagissent à la largeur de leur CONTENEUR
          (container query), donc rétrécir ce cadre reproduit fidèlement ce
          qui se passera sur un écran de cette taille. Un iframe ou une
          fausse fenêtre n'aurait rien montré de plus. */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Largeur d&apos;aperçu</span>
          {(
            [
              { label: "Téléphone", w: "24rem" },
              { label: "Tablette", w: "48rem" },
              { label: "Portable", w: "64rem" },
              { label: "Large", w: "100%" },
            ] as const
          ).map((v) => (
            <button
              key={v.label}
              type="button"
              onClick={() => setPreviewWidth(v.w)}
              className={
                previewWidth === v.w
                  ? "rounded border border-foreground px-2 py-1"
                  : "rounded border px-2 py-1 hover:bg-muted"
              }
            >
              {v.label}
            </button>
          ))}
        </div>

        <div
          style={{ ...styleOverrides, maxWidth: previewWidth }}
          className="space-y-8 border-l border-dashed border-border pl-3 transition-[max-width]"
        >""")

edit(LAB, """  const [ratioIndex, setRatioIndex] = useState(1);""",
"""  const [ratioIndex, setRatioIndex] = useState(1);
  const [previewWidth, setPreviewWidth] = useState<string>("100%");""")

# La fermeture du cadre ajouté : on referme un div de plus qu'avant.
edit(LAB, """          </article>
        </section>
      </div>
    </div>
  );
}""",
"""          </article>
        </section>
        </div>
      </div>
    </div>
  );
}""")
PY

echo "✓ 12 substitutions appliquées"

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
git commit -m "feat(page-builder): rendu adaptable du telephone au tres grand ecran

Les pages n'avaient aucun plafond : a 1920px la colonne de texte
atteignait ~100 caracteres par ligne. Ajout d'un conteneur plafonne en
min(100% - 2rem, 76rem) et d'une mesure de 68ch, exprimee en ch pour
suivre la taille de police plutot que la taille d'ecran.

La bascule une/deux colonnes passe d'une media query a une container
query : le meme bloc s'affiche derriere une barre laterale de 240px et
en pleine largeur, une mesure de la fenetre repondait juste dans un cas
et faux dans l'autre.

Gouttieres, ecart entre blocs et echelle des titres passent en clamp()
plutot qu'en paliers : les largeurs intermediaires cessent d'etre
rendues comme le palier inferieur.

max-w-3xl (768px, ~96 caracteres) cede la place a la mesure."

echo "✓ commité"
git log -1 --oneline