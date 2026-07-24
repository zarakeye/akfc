#!/usr/bin/env bash
#
# step_list_and_block_gaps.sh
#
# Deux réglages manquaient, et le constat est exact : aucun curseur ne les
# atteignait.
#
# ─── L'écart entre puces ───────────────────────────────────────────────────
#
# Aucune règle ne visait `li`. L'espacement venait donc de
# @tailwindcss/typography, hors de portée de nos variables.
#
# Et un défaut plus gênant se cachait derrière. Tiptap enveloppe le contenu
# de chaque puce dans un `<p>` :
#
#     <li><p>Premier élément</p></li>
#
# Or notre règle d'écart entre paragraphes vise `p` sans distinction : chaque
# puce recevait donc l'écart d'un paragraphe — 1em — À L'INTÉRIEUR d'elle-
# même. Les listes s'aéraient nettement plus que le texte qui les entoure,
# sans que rien ne l'explique à la lecture du CSS. Remis à zéro sur le
# premier paragraphe d'une puce ; les suivants gardent leur écart, une puce
# ayant le droit de contenir plusieurs paragraphes.
#
# Les sous-listes suivent l'écart de liste et non celui des paragraphes —
# elles font partie de la liste, pas de la prose.
#
# ─── L'écart entre blocs ───────────────────────────────────────────────────
#
# Il était écrit en dur dans `PageRenderer` (`clamp(2rem, 5vw, 4rem)`), donc
# invisible au laboratoire. Il passe en variable. Le curseur règle la BORNE
# HAUTE du `clamp`, pas une valeur sèche : l'écart doit rester fluide, sinon
# on perdrait l'adaptation aux petits écrans en gagnant le réglage.
#
# Le laboratoire cesse aussi d'espacer son aperçu avec `space-y-8`, qui
# ignorait la variable — le curseur aurait bougé sans rien changer à l'écran.
#
# Usage :
#   bash step_list_and_block_gaps.sh
#   AKFC_APPLY_ONLY=1 bash step_list_and_block_gaps.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"
RENDERER="apps/web/src/features/page-builder/PageRenderer.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GLOBALS" "$RENDERER" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "akfc-base-max" "$GLOBALS" || {
  echo "✗ step_content_density.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "akfc-list-gap" "$LAB"; then
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
LAB      = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/6 : les deux variables ──────────────────────────────────────────────
edit(GLOBALS, """  --akfc-heading-gap: 1.8em;""",
"""  --akfc-heading-gap: 1.8em;

  /* Écart entre deux puces. En `em` : il suit la taille du texte, comme
     l'écart entre paragraphes. */
  --akfc-list-gap: 0.35em;
  /* Retrait de la puce par rapport au texte courant. */
  --akfc-list-indent: 1.5em;

  /* Écart entre deux blocs successifs de la page. Le curseur du laboratoire
     règle la BORNE HAUTE du `clamp`, pas une valeur sèche : l'écart doit
     rester fluide, sinon on gagnerait le réglage en perdant l'adaptation aux
     petits écrans. */
  --akfc-block-gap-max: 4rem;
  --akfc-block-gap: clamp(1.5rem, 5vw, var(--akfc-block-gap-max));""")

# ── 2/6 : les règles de liste ─────────────────────────────────────────────
edit(GLOBALS, """/* Le premier élément ne pousse rien : un bloc commence au ras de son
   conteneur, sans quoi le média et le texte cesseraient de partager leur
   ligne de tête. */
.akfc-prose > :first-child {
  margin-top: 0;
}""",
"""/* Le premier élément ne pousse rien : un bloc commence au ras de son
   conteneur, sans quoi le média et le texte cesseraient de partager leur
   ligne de tête. */
.akfc-prose > :first-child {
  margin-top: 0;
}

/* ── Listes ──────────────────────────────────────────────────────────────
   Rien ne visait `li` : l'espacement venait de @tailwindcss/typography,
   donc hors d'atteinte de nos variables. */
.akfc-prose :is(ul, ol) > li + li {
  margin-top: var(--akfc-list-gap);
}

.akfc-prose :is(ul, ol) {
  padding-inline-start: var(--akfc-list-indent);
}

/* Tiptap enveloppe le contenu d'une puce dans un `<p>` :
       <li><p>Premier élément</p></li>
   Ce paragraphe recevait l'écart entre paragraphes — 1em À L'INTÉRIEUR de
   chaque puce — et les listes s'aéraient bien plus que le texte autour,
   sans que le CSS ne le laisse deviner.
   `:first-child` seulement : une puce a le droit de contenir plusieurs
   paragraphes, et ceux-là gardent leur écart. */
.akfc-prose li > p:first-child {
  margin-top: 0;
}

/* Une sous-liste appartient à la liste, pas à la prose : elle suit l'écart
   de liste et non celui des paragraphes. */
.akfc-prose li > :is(ul, ol) {
  margin-top: var(--akfc-list-gap);
}""")

# ── 3/6 : PageRenderer lit la variable ────────────────────────────────────
edit(RENDERER, """      style={{ gap: "clamp(2rem, 5vw, 4rem)" }}""",
"""      // L'écart entre blocs était écrit en dur ici, donc invisible au
      // laboratoire. En variable, il devient réglable — et reste fluide.
      style={{ gap: "var(--akfc-block-gap)" }}""")

# ── 4/6 : les curseurs ────────────────────────────────────────────────────
edit(LAB, """  { key: "--akfc-heading-gap", label: "Écart avant un titre", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.8 },""",
"""  { key: "--akfc-heading-gap", label: "Écart avant un titre", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.8 },
  { key: "--akfc-list-gap", label: "Écart entre puces", min: 0, max: 1.5, step: 0.05, unit: "em", initial: 0.35 },
  { key: "--akfc-list-indent", label: "Retrait des puces", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.5 },
  { key: "--akfc-block-gap-max", label: "Écart entre blocs (max)", min: 1, max: 8, step: 0.25, unit: "rem", initial: 4 },""")

# ── 5/6 : l'aperçu du labo espace ses blocs par la variable ───────────────
edit(LAB, """          <div className="akfc-page space-y-8">""",
"""          {/* `space-y-8` ignorait la variable : le curseur d'écart entre
              blocs aurait bougé sans rien changer à l'écran. */}
          <div
            className="akfc-page flex flex-col"
            style={{ gap: "var(--akfc-block-gap)" }}
          >""")

# ── 6/6 : une sous-liste dans l'échantillon (DERNIER fichier écrit) ───────
edit(LAB, """      <ul>
        <li>Premier élément de liste</li>
        <li>Deuxième élément, un peu plus long pour voir le retour à la ligne</li>
        <li>Troisième élément</li>
      </ul>""",
"""      <ul>
        <li>Premier élément de liste</li>
        <li>
          Deuxième élément, un peu plus long pour voir le retour à la ligne
          {/* Une sous-liste : c'est là qu'on voit si le retrait et l'écart
              se composent proprement sur deux niveaux. */}
          <ul>
            <li>Sous-élément</li>
            <li>Autre sous-élément</li>
          </ul>
        </li>
        <li>Troisième élément</li>
      </ul>
      <ol>
        <li>Élément numéroté</li>
        <li>Deuxième élément numéroté</li>
      </ol>""")
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
git commit -m "feat(design-lab): reglages des listes et de l'ecart entre blocs

Rien ne visait li : l'espacement venait de @tailwindcss/typography,
hors d'atteinte des variables. Ajout de --akfc-list-gap et
--akfc-list-indent.

Corrige au passage un defaut invisible dans le CSS : Tiptap enveloppe
le contenu d'une puce dans un <p>, qui recevait donc l'ecart entre
paragraphes -- 1em a l'interieur de chaque puce. Les listes s'aeraient
bien plus que le texte autour.

L'ecart entre blocs etait ecrit en dur dans PageRenderer, donc absent
du laboratoire. Il passe en variable et reste fluide : le curseur regle
la borne haute du clamp."

echo "✓ commité"
git log -1 --oneline