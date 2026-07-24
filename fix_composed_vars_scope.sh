#!/usr/bin/env bash
#
# fix_composed_vars_scope.sh
#
# Trois curseurs du laboratoire n'ont aucun effet — écart entre blocs, taille
# du texte, largeur maximale de page — et c'est la même cause pour les trois.
#
# ─── La règle CSS en jeu ───────────────────────────────────────────────────
#
# La valeur calculée d'une propriété personnalisée est sa valeur déclarée AVEC
# LES `var()` DÉJÀ SUBSTITUÉS, et cette substitution a lieu sur l'élément où
# la propriété est DÉCLARÉE. Les descendants héritent du résultat, pas de
# l'expression.
#
# Or ces trois variables sont composées à partir d'une autre :
#
#     :root {
#       --akfc-block-gap-max: 4rem;
#       --akfc-block-gap: clamp(1.5rem, 5vw, var(--akfc-block-gap-max));
#     }
#
# `--akfc-block-gap` est donc figée à `clamp(1.5rem, 5vw, 4rem)` dès `:root`.
# Le laboratoire, qui pose `--akfc-block-gap-max` en style inline sur un
# conteneur d'aperçu — un DESCENDANT — arrive trop tard : la composition a
# déjà eu lieu au-dessus de lui. Le curseur bouge, la variable change, et rien
# ne la relit.
#
# ⚠️ Le réglage ENREGISTRÉ, lui, fonctionnait : il s'injecte sur `html:root`,
# c'est-à-dire sur l'élément même où la composition s'opère. La panne était
# donc invisible en production et cantonnée au laboratoire — ce qui la rendait
# d'autant plus déroutante, puisque l'outil censé montrer l'effet était le
# seul endroit où il ne se produisait pas.
#
# ─── Le correctif ──────────────────────────────────────────────────────────
#
# Chaque composition descend sur la classe qui la CONSOMME. Déclarée là, elle
# se substitue sur cet élément, qui hérite bien de la surcharge du
# laboratoire. Les valeurs de repli restent sur `:root`, où elles n'ont plus
# qu'un rôle de repli.
#
# Règle à retenir pour la suite : une variable qui en compose une autre ne se
# déclare jamais sur `:root` si l'on veut pouvoir la surcharger plus bas.
#
# Usage :
#   bash fix_composed_vars_scope.sh
#   AKFC_APPLY_ONLY=1 bash fix_composed_vars_scope.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$GLOBALS" ] || { echo "✗ introuvable : $GLOBALS"; exit 1; }
grep -q "akfc-block-gap-max" "$GLOBALS" || {
  echo "✗ step_list_and_block_gaps.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "composition descend sur la classe" "$GLOBALS"; then
  echo "✓ déjà appliqué (marqueur présent dans $GLOBALS) — rien à faire"
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

# ── 1/6 : l'écart entre blocs quitte :root ───────────────────────────────
edit(GLOBALS, """  --akfc-block-gap-max: 4rem;
  --akfc-block-gap: clamp(1.5rem, 5vw, var(--akfc-block-gap-max));""",
"""  --akfc-block-gap-max: 4rem;
  /* La composition descend sur la classe qui consomme (voir plus bas) : une
     variable composée à partir d'une autre se fige sur l'élément où elle est
     DÉCLARÉE, et une surcharge posée plus bas arrive trop tard. */""")

# ── 2/6 : la taille du corps aussi ───────────────────────────────────────
edit(GLOBALS, """  --akfc-base-max: 1.25rem;
  --akfc-base-size: clamp(1rem, 0.9rem + 0.5vw, var(--akfc-base-max));""",
"""  --akfc-base-max: 1.25rem;
  /* Composition portée par `.akfc-prose`, même raison. */""")

# ── 3/6 : le puits aussi ─────────────────────────────────────────────────
edit(GLOBALS, """  --akfc-page-max-width: 68rem;
  --akfc-page-max: min(
    100% - clamp(1rem, 4vw, 3rem),
    var(--akfc-page-max-width)
  );""",
"""  --akfc-page-max-width: 68rem;
  /* Composition portée par `.akfc-page`, même raison. */""")

# ── 4/6 : `.akfc-prose` compose sa taille ────────────────────────────────
edit(GLOBALS, """.akfc-prose {
  font-size: var(--akfc-base-size);
  line-height: var(--akfc-leading);
}""",
"""/* La composition est DÉCLARÉE ici, sur l'élément qui l'utilise : elle se
   substitue donc sur cet élément, qui hérite bien de toute surcharge de
   `--akfc-base-max` posée au-dessus de lui — celle du laboratoire comprise.
   Déclarée sur `:root`, elle se figeait avant que la surcharge n'existe. */
.akfc-prose {
  --akfc-base-size: clamp(1rem, 0.9rem + 0.5vw, var(--akfc-base-max));
  font-size: var(--akfc-base-size);
  line-height: var(--akfc-leading);
}""")

# ── 5/6 : `.akfc-page` compose son plafond ET l'écart entre blocs ────────
edit(GLOBALS, """.akfc-page {
  width: var(--akfc-page-max);
  margin-inline: auto;
}""",
"""/* Deux compositions déclarées ici pour la même raison que ci-dessus.
   `--akfc-block-gap` est posée sur `.akfc-page` plutôt que sur ses
   consommateurs directs : `PageRenderer` et `.akfc-rule-h` sont tous deux
   à l'intérieur du puits et en héritent, ce qui évite de répéter le
   `clamp` à trois endroits. */
.akfc-page {
  --akfc-page-max: min(
    100% - clamp(1rem, 4vw, 3rem),
    var(--akfc-page-max-width)
  );
  --akfc-block-gap: clamp(1.5rem, 5vw, var(--akfc-block-gap-max));
  width: var(--akfc-page-max);
  margin-inline: auto;
}""")

# ── 6/6 : repli pour un bloc rendu hors du puits ─────────────────────────
edit(GLOBALS, """.akfc-rule-h {
  border-top: max(1px, var(--akfc-rule-width)) solid var(--akfc-rule-color);
  padding-top: calc(var(--akfc-block-gap) / 2);
}""",
"""/* `--akfc-block-gap` vient normalement de `.akfc-page`. Ce repli couvre le
   cas d'un bloc rendu hors du puits — l'aperçu du builder, par exemple —
   où la variable n'aurait sinon aucune valeur et le rembourrage
   s'effondrerait à zéro. */
.akfc-rule-h {
  --akfc-block-gap: clamp(1.5rem, 5vw, var(--akfc-block-gap-max));
  border-top: max(1px, var(--akfc-rule-width)) solid var(--akfc-rule-color);
  padding-top: calc(var(--akfc-block-gap) / 2);
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
git commit -m "fix(design-lab): les variables composees se declarent chez leur consommateur

Trois curseurs restaient sans effet -- ecart entre blocs, taille du
texte, largeur de page -- pour la meme raison : la valeur calculee
d'une propriete personnalisee substitue ses var() sur l'element ou
elle est DECLAREE. Composees sur :root, ces trois variables etaient
figees avant que le laboratoire ne pose sa surcharge sur un
descendant.

Chaque composition descend sur la classe qui la consomme
(.akfc-prose, .akfc-page), ou elle se substitue sur un element qui
herite bien de la surcharge.

Le reglage enregistre, lui, fonctionnait deja : il s'injecte sur
html:root, la ou la composition s'operait."

echo "✓ commité"
git log -1 --oneline