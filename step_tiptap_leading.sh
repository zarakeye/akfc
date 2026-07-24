#!/usr/bin/env bash
#
# step_tiptap_leading.sh
#
# Resserre le rythme vertical de l'éditeur Tiptap.
#
# Deux réglages produisaient l'aération, et ils sont maintenant portés par
# deux variables déclarées en tête de `.tiptap.ProseMirror` — un seul endroit
# à retoucher pour ajuster au goût :
#
#     --tt-leading        1.6  →  1.5    interlignage DANS un paragraphe
#     --tt-paragraph-gap  20px →  0.75em écart ENTRE deux paragraphes
#
# L'écart entre paragraphes pesait plus lourd que l'interlignage : 20px fixes
# entre chaque bloc, soit près d'une ligne et demie de blanc à chaque appui
# sur Entrée. Il passe en `em` au passage, pour suivre la taille du texte au
# lieu de rester figé.
#
# ─── Un défaut corrigé au passage ──────────────────────────────────────────
#
# La règle d'origine était `p:not(:first-child)…` et portait TOUT : taille,
# graisse, interlignage ET marge. Le PREMIER paragraphe en était donc exclu
# et n'héritait pas du même interlignage que ses voisins — un décalage
# discret mais bien réel en haut de chaque bloc. La règle est scindée :
# l'interlignage s'applique à tous les paragraphes, seule la marge reste
# réservée à partir du deuxième.
#
# ─── Portée ────────────────────────────────────────────────────────────────
#
# Ces styles sont ceux de `.tiptap.ProseMirror`, donc de l'ÉDITEUR. Le rendu
# public passe par `.tiptap-rendered prose` (`blocks/tiptap/view.server.tsx`)
# et n'est pas touché — cette divergence préexiste, elle n'est pas introduite
# ici.
#
# Usage :
#   bash step_tiptap_leading.sh
#   AKFC_APPLY_ONLY=1 bash step_tiptap_leading.sh
#
set -euo pipefail

N="apps/web/src/features/editor-tiptap/node"
PARA="$N/paragraph-node/paragraph-node.scss"
LIST="$N/list-node/list-node.scss"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$PARA" "$LIST"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "tt-leading" "$LIST"; then
  echo "✓ déjà appliqué (marqueur présent dans $LIST) — rien à faire"
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

N    = "apps/web/src/features/editor-tiptap/node"
PARA = "%s/paragraph-node/paragraph-node.scss" % N
LIST = "%s/list-node/list-node.scss" % N

# ── 1/3 : les deux leviers, déclarés en un seul endroit ────────────────────
edit(PARA, """  --placeholder-color: var(--tt-gray-light-a-400);
  --thread-bg-color: var(--tt-color-yellow-inc-2);""",
"""  --placeholder-color: var(--tt-gray-light-a-400);
  --thread-bg-color: var(--tt-color-yellow-inc-2);

  // Rythme vertical du texte. Les deux seuls leviers à toucher pour
  // resserrer ou aérer l'éditeur — ils sont repris par les paragraphes
  // (ci-dessous) et par les paragraphes de liste (list-node.scss).
  //
  // `--tt-paragraph-gap` en `em` et non en px : l'écart suit la taille du
  // texte au lieu de rester figé à une valeur d'écran.
  --tt-leading: 1.5;
  --tt-paragraph-gap: 0.75em;""")

# ── 2/3 : scinder interlignage et marge ────────────────────────────────────
edit(PARA, """  // Paragraph spacing
  p:not(:first-child):not(td p):not(th p) {
    font-size: 1rem;
    line-height: 1.6;
    font-weight: normal;
    margin-top: 20px;
  }""",
"""  // Interlignage — sur TOUS les paragraphes.
  //
  // La règle d'origine portait aussi `:not(:first-child)` : le premier
  // paragraphe échappait donc à l'interlignage et se lisait légèrement
  // différemment de ses voisins, en haut de chaque bloc.
  p:not(td p):not(th p) {
    font-size: 1rem;
    line-height: var(--tt-leading);
    font-weight: normal;
  }

  // Écart entre paragraphes — à partir du deuxième seulement, sans quoi
  // chaque bloc s'ouvrirait sur un blanc.
  p:not(:first-child):not(td p):not(th p) {
    margin-top: var(--tt-paragraph-gap);
  }""")

# ── 3/3 : les listes suivent (DERNIER fichier écrit) ───────────────────────
edit(LIST, """  li {
    p {
      margin-top: 0;
      line-height: 1.6;
    }
  }""",
"""  li {
    p {
      margin-top: 0;
      // Même levier que les paragraphes (cf. paragraph-node.scss) : une
      // liste ne doit pas se lire plus aérée que le texte qui l'entoure.
      line-height: var(--tt-leading);
    }
  }""")
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
git commit -m "style(tiptap): resserrer le rythme vertical de l'editeur

Interlignage 1.6 -> 1.5 et ecart entre paragraphes 20px -> 0.75em,
portes par deux variables declarees en tete de .tiptap.ProseMirror :
un seul endroit a retoucher pour ajuster.

L'ecart passe en em pour suivre la taille du texte.

Corrige au passage un decalage discret : la regle d'origine portait
:not(:first-child) sur l'interlignage lui-meme, si bien que le
premier paragraphe de chaque bloc ne se lisait pas comme ses voisins."

echo "✓ commité"
git log -1 --oneline