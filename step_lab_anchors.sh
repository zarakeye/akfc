#!/usr/bin/env bash
#
# step_lab_anchors.sh
#
# ─── Vérification demandée, et ce qu'elle a donné ──────────────────────────
#
# Oui, l'échantillon contient bien TROIS blocs superposés, séparés par
# `gap: var(--akfc-block-gap)` : le bloc media-text, les collections, puis le
# bloc pleine largeur. Le curseur avait donc déjà prise sur quelque chose.
#
# Mais il ne se LISAIT pas, pour deux raisons :
#
#   1. les deux blocs suivants portaient `akfc-rule-h`, dont le rembourrage
#      valait `--akfc-heading-gap`. L'espace visible entre deux blocs était
#      donc la somme de deux variables, et le curseur « écart avant un
#      titre » déplaçait lui aussi les blocs — ce que rien n'annonçait.
#      Le rembourrage du filet dérive désormais de l'écart entre blocs : une
#      seule variable gouverne ce rythme.
#
#   2. AUCUNE frontière n'était nue. Le deuxième bloc perd son filet, ce qui
#      donne un intervalle où l'on voit l'écart seul, et un autre où on le
#      voit avec son filet.
#
# Trois curseurs manquaient par ailleurs : rien ne pilotait les blocs de
# collection, alors qu'ils figurent dans l'aperçu depuis qu'on les y a mis.
#
# ─── Les ancres ────────────────────────────────────────────────────────────
#
# Chaque réglage sait quelle partie de l'aperçu il modifie. Cliquer son
# libellé y amène la colonne de droite.
#
# `scrollIntoView` et non un calcul de position : il remonte de lui-même
# jusqu'au premier ancêtre défilant — la colonne d'aperçu — sans qu'on ait
# besoin de lui passer une référence, ni de recalculer quoi que ce soit quand
# la mise en page change. `block: "center"` plutôt que `"start"` : la cible
# arrive au milieu, avec son contexte au-dessus et en dessous, ce qui est le
# point du geste — comparer.
#
# Usage :
#   bash step_lab_anchors.sh
#   AKFC_APPLY_ONLY=1 bash step_lab_anchors.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GLOBALS" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "akfc-list-gap" "$LAB" || {
  echo "✗ step_list_and_block_gaps.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "scrollToAnchor" "$LAB"; then
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
LAB     = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/9 : le filet cesse de brouiller l'écart entre blocs ────────────────
edit(GLOBALS, """.akfc-rule-h {
  border-top: max(1px, var(--akfc-rule-width)) solid var(--akfc-rule-color);
  padding-top: var(--akfc-heading-gap);
}""",
"""/* Le rembourrage dérive de l'ÉCART ENTRE BLOCS, pas de l'écart avant un
   titre. Avec `--akfc-heading-gap`, l'espace visible entre deux blocs était
   la somme de deux variables : le curseur des titres déplaçait les blocs
   sans que rien ne l'annonce, et celui des blocs ne rendait qu'une partie de
   son effet. Une seule variable gouverne ce rythme. */
.akfc-rule-h {
  border-top: max(1px, var(--akfc-rule-width)) solid var(--akfc-rule-color);
  padding-top: calc(var(--akfc-block-gap) / 2);
}""")

# ── 2/9 : le type Knob porte son ancre ───────────────────────────────────
edit(LAB, """type Knob = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  initial: number;
};""",
"""type Knob = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  initial: number;
  /**
   * Identifiant de la zone d'aperçu que ce réglage modifie. Cliquer le
   * libellé y amène la colonne de droite — un réglage dont on ne voit pas
   * l'effet ne se règle pas.
   */
  anchor: string;
};

/**
 * Amène une zone de l'aperçu à l'écran.
 *
 * `scrollIntoView` remonte de lui-même jusqu'au premier ancêtre défilant —
 * la colonne d'aperçu — sans référence à lui passer ni position à
 * recalculer quand la mise en page change.
 * `center` et non `start` : la cible arrive au milieu, avec son contexte
 * au-dessus et en dessous. C'est le point du geste — comparer.
 */
function scrollToAnchor(id: string): void {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}""")

# ── 3/9 : les curseurs reçoivent leur ancre, et trois manquants arrivent ─
edit(LAB, """  { key: "--akfc-leading", label: "Interlignage", min: 1, max: 2.4, step: 0.05, unit: "", initial: 1.65 },
  { key: "--akfc-para-gap", label: "Écart entre paragraphes", min: 0, max: 3, step: 0.05, unit: "em", initial: 1 },
  { key: "--akfc-heading-gap", label: "Écart avant un titre", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.8 },
  { key: "--akfc-list-gap", label: "Écart entre puces", min: 0, max: 1.5, step: 0.05, unit: "em", initial: 0.35 },
  { key: "--akfc-list-indent", label: "Retrait des puces", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.5 },
  { key: "--akfc-block-gap-max", label: "Écart entre blocs (max)", min: 1, max: 8, step: 0.25, unit: "rem", initial: 4 },
  { key: "--akfc-h1", label: "Taille h1", min: 1, max: 4, step: 0.05, unit: "em", initial: 2 },
  { key: "--akfc-h2", label: "Taille h2", min: 1, max: 3, step: 0.05, unit: "em", initial: 1.5 },
  { key: "--akfc-h3", label: "Taille h3", min: 0.9, max: 2.5, step: 0.05, unit: "em", initial: 1.25 },
  { key: "--akfc-h4", label: "Taille h4", min: 0.8, max: 2, step: 0.05, unit: "em", initial: 1.05 },
  { key: "--akfc-h5", label: "Taille h5", min: 0.7, max: 1.6, step: 0.05, unit: "em", initial: 1 },
  { key: "--akfc-h6", label: "Taille h6", min: 0.6, max: 1.4, step: 0.05, unit: "em", initial: 0.875 },
  { key: "--akfc-page-max-width", label: "Largeur maximale de page", min: 48, max: 96, step: 1, unit: "rem", initial: 68 },
  { key: "--akfc-base-max", label: "Taille du texte (grand écran)", min: 1, max: 1.5, step: 0.05, unit: "rem", initial: 1.25 },
  { key: "--akfc-measure", label: "Justification (caractères)", min: 45, max: 90, step: 1, unit: "ch", initial: 68 },
  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5 },
  { key: "--akfc-rule-width", label: "Épaisseur des filets", min: 0, max: 6, step: 1, unit: "px", initial: 0 },""",
"""  { key: "--akfc-leading", label: "Interlignage", min: 1, max: 2.4, step: 0.05, unit: "", initial: 1.65, anchor: "lab-texte" },
  { key: "--akfc-para-gap", label: "Écart entre paragraphes", min: 0, max: 3, step: 0.05, unit: "em", initial: 1, anchor: "lab-texte" },
  { key: "--akfc-heading-gap", label: "Écart avant un titre", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.8, anchor: "lab-titres" },
  { key: "--akfc-list-gap", label: "Écart entre puces", min: 0, max: 1.5, step: 0.05, unit: "em", initial: 0.35, anchor: "lab-listes" },
  { key: "--akfc-list-indent", label: "Retrait des puces", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.5, anchor: "lab-listes" },
  { key: "--akfc-block-gap-max", label: "Écart entre blocs (max)", min: 1, max: 8, step: 0.25, unit: "rem", initial: 4, anchor: "lab-blocs" },
  { key: "--akfc-h1", label: "Taille h1", min: 1, max: 4, step: 0.05, unit: "em", initial: 2, anchor: "lab-titres" },
  { key: "--akfc-h2", label: "Taille h2", min: 1, max: 3, step: 0.05, unit: "em", initial: 1.5, anchor: "lab-titres" },
  { key: "--akfc-h3", label: "Taille h3", min: 0.9, max: 2.5, step: 0.05, unit: "em", initial: 1.25, anchor: "lab-titres" },
  { key: "--akfc-h4", label: "Taille h4", min: 0.8, max: 2, step: 0.05, unit: "em", initial: 1.05, anchor: "lab-titres-bas" },
  { key: "--akfc-h5", label: "Taille h5", min: 0.7, max: 1.6, step: 0.05, unit: "em", initial: 1, anchor: "lab-titres-bas" },
  { key: "--akfc-h6", label: "Taille h6", min: 0.6, max: 1.4, step: 0.05, unit: "em", initial: 0.875, anchor: "lab-titres-bas" },
  { key: "--akfc-page-max-width", label: "Largeur maximale de page", min: 48, max: 96, step: 1, unit: "rem", initial: 68, anchor: "lab-colonnes" },
  { key: "--akfc-base-max", label: "Taille du texte (grand écran)", min: 1, max: 1.5, step: 0.05, unit: "rem", initial: 1.25, anchor: "lab-texte" },
  { key: "--akfc-measure", label: "Justification (caractères)", min: 45, max: 90, step: 1, unit: "ch", initial: 68, anchor: "lab-pleine-largeur" },
  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5, anchor: "lab-colonnes" },
  { key: "--akfc-rule-width", label: "Épaisseur des filets", min: 0, max: 6, step: 1, unit: "px", initial: 0, anchor: "lab-blocs" },
  // Ces trois-là manquaient : les blocs de collection figuraient dans
  // l'aperçu sans qu'aucun curseur ne les atteigne.
  { key: "--akfc-item-gap", label: "Écart entre éléments (collections)", min: 0, max: 3, step: 0.05, unit: "rem", initial: 0.75, anchor: "lab-collections" },
  { key: "--akfc-card-padding", label: "Rembourrage des cartes", min: 0, max: 2.5, step: 0.05, unit: "rem", initial: 0.75, anchor: "lab-collections" },
  { key: "--akfc-caption-size", label: "Taille des légendes", min: 0.6, max: 1.2, step: 0.025, unit: "rem", initial: 0.875, anchor: "lab-collections" },""")

# ── 4/9 : le libellé devient le bouton d'ancre ───────────────────────────
edit(LAB, """            <span className="flex justify-between text-xs">
              <span className="text-muted-foreground">{k.label}</span>
              <span className="font-mono">
                {values[k.key]}
                {k.unit}
              </span>
            </span>""",
"""            <span className="flex justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => scrollToAnchor(k.anchor)}
                title="Aller à l'endroit où ce réglage se voit"
                className="truncate text-left text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
              >
                {k.label}
              </button>
              <span className="shrink-0 font-mono">
                {values[k.key]}
                {k.unit}
              </span>
            </span>""")

# ── 5/9 : le ratio a son ancre aussi ─────────────────────────────────────
edit(LAB, """            <span className="text-muted-foreground">Ratio média / texte</span>""",
"""            <button
              type="button"
              onClick={() => scrollToAnchor("lab-colonnes")}
              title="Aller à l'endroit où ce réglage se voit"
              className="text-left text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
            >
              Ratio média / texte
            </button>""")

# ── 6/9 : les zones d'aperçu portent leur identifiant ────────────────────
edit(LAB, """        <section className="akfc-block-scope">""",
"""        <section id="lab-colonnes" className="akfc-block-scope">""")

edit(LAB, """        <section className="akfc-rule-h space-y-6">""",
"""        {/* Ce bloc PERD son filet, volontairement : il faut au moins une
            frontière nue pour lire l'écart entre blocs seul. Le suivant
            garde le sien, et montre l'autre cas. */}
        <section id="lab-blocs" className="space-y-6">""")

edit(LAB, """        <section className="akfc-rule-h">
          <article className="akfc-prose prose max-w-none">
            <h2>Bloc pleine largeur</h2>""",
"""        <section id="lab-pleine-largeur" className="akfc-rule-h">
          <article className="akfc-prose prose max-w-none">
            <h2>Bloc pleine largeur</h2>""")

edit(LAB, """            <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Galerie d&apos;images
            </h3>""",
"""            <h3
              id="lab-collections"
              className="mb-2 text-xs uppercase tracking-wide text-muted-foreground"
            >
              Galerie d&apos;images
            </h3>""")

# ── 7/9 : ancres dans l'échantillon de texte ─────────────────────────────
edit(LAB, """      <h1>Titre de niveau 1</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec""",
"""      <h1 id="lab-titres">Titre de niveau 1</h1>
      <p id="lab-texte">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec""")

edit(LAB, """      <ul>
        <li>Premier élément de liste</li>""",
"""      <ul id="lab-listes">
        <li>Premier élément de liste</li>""")

# ── 8/9 : ancre des petits titres ────────────────────────────────────────
edit(LAB, """      <h4>Titre de niveau 4</h4>""",
"""      <h4 id="lab-titres-bas">Titre de niveau 4</h4>""")

# ── 9/9 : le rappel en tête de colonne (DERNIER écrit) ───────────────────
edit(LAB, """        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Côté du média</span>""",
"""        <p className="text-[10px] leading-snug text-muted-foreground">
          Cliquez le nom d&apos;un réglage pour amener l&apos;aperçu à
          l&apos;endroit où il se voit.
        </p>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Côté du média</span>""")
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
git commit -m "feat(design-lab): ancres de reglage et ecart entre blocs lisible

Cliquer le nom d'un reglage amene la colonne d'apercu a l'endroit ou
il se voit.

L'ecart entre blocs etait gouverne mais illisible : les deux blocs
suivants portaient akfc-rule-h, dont le rembourrage valait
--akfc-heading-gap. L'espace visible etait la somme de deux variables,
et le curseur des titres deplacait les blocs sans que rien ne
l'annonce. Le rembourrage derive desormais de l'ecart entre blocs, et
un des blocs perd son filet pour offrir une frontiere nue.

Ajoute trois curseurs manquants : les blocs de collection figuraient
dans l'apercu sans qu'aucun reglage ne les atteigne."

echo "✓ commité"
git log -1 --oneline