#!/usr/bin/env bash
#
# step_tiptap_leading_tailwind.sh
#
# Reprend le réglage du rythme vertical de l'éditeur Tiptap, en Tailwind.
#
# ─── Pourquoi le passage précédent n'a presque rien donné ──────────────────
#
# Deux raisons, indépendantes :
#
#   1. Les valeurs étaient trop timides. 1.6 → 1.5 sur l'interlignage, c'est
#      moins d'un pixel par ligne. On descend cette fois à 1.375
#      (`leading-snug`) et l'écart entre paragraphes de 20px à 8px.
#
#   2. Le SCSS impose ses règles à Tailwind. `.tiptap.ProseMirror p:not(…)`
#      pèse 0,2,1 — deux classes et un élément — là où une utilitaire
#      Tailwind pèse 0,1,0. TOUTE déclaration d'interlignage ou de marge
#      laissée dans le SCSS l'emporterait silencieusement sur la classe.
#      C'est le point qui compte : sans retirer ces déclarations, un réglage
#      Tailwind reste sans effet, quelle que soit sa valeur.
#
# Le réglage vit donc désormais dans `editorProps.attributes.class`, sur
# l'élément ProseMirror lui-même — deux classes, à retoucher là et nulle part
# ailleurs. Le SCSS ne garde que ce qui ne concerne pas l'espacement.
#
# `line-height` s'hérite : posé sur l'éditeur, il descend aux paragraphes,
# aux titres et aux items de liste sans qu'on ait à les viser un par un.
#
# ─── Compatible avec les deux états du dépôt ───────────────────────────────
#
# Que `step_tiptap_leading.sh` ait été appliqué ou non, les ancres sont
# reconnues : le script accepte les deux formes et vérifie qu'une seule
# correspond.
#
# Usage :
#   bash step_tiptap_leading_tailwind.sh
#   AKFC_APPLY_ONLY=1 bash step_tiptap_leading_tailwind.sh
#
set -euo pipefail

N="apps/web/src/features/editor-tiptap/node"
PARA="$N/paragraph-node/paragraph-node.scss"
LIST="$N/list-node/list-node.scss"
EDITOR="apps/web/src/features/page-builder/blocks/tiptap/builder-tiptap-editor.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$PARA" "$LIST" "$EDITOR"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "leading-snug" "$EDITOR"; then
  echo "✓ déjà appliqué (marqueur présent dans $EDITOR) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def read(path):
    with io.open(path, encoding='utf-8') as fh:
        return fh.read()

def write(path, src):
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src)

def edit(path, old, new):
    src = read(path)
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    write(path, src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

def edit_any(path, alternatives, new):
    """Accepte plusieurs formes de la même ancre — le dépôt peut être avant
    ou après step_tiptap_leading.sh. Exactement UNE doit correspondre."""
    src = read(path)
    found = [a for a in alternatives if src.count(a) == 1]
    assert len(found) == 1, (
        "%d forme(s) reconnue(s) dans %s — état inattendu, on s'arrête"
        % (len(found), path)
    )
    write(path, src.replace(found[0], new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

def drop_if_present(path, text):
    """Retire un bloc devenu inutile s'il est là. Son absence est normale."""
    src = read(path)
    if src.count(text) != 1:
        return
    write(path, src.replace(text, ""))
    print("  ~ %s (bloc obsolète retiré)" % path.rsplit('/', 1)[-1])

N      = "apps/web/src/features/editor-tiptap/node"
PARA   = "%s/paragraph-node/paragraph-node.scss" % N
LIST   = "%s/list-node/list-node.scss" % N
EDITOR = "apps/web/src/features/page-builder/blocks/tiptap/builder-tiptap-editor.tsx"

# ── 1/4 : les variables du passage précédent n'ont plus d'emploi ───────────
drop_if_present(PARA, """

  // Rythme vertical du texte. Les deux seuls leviers à toucher pour
  // resserrer ou aérer l'éditeur — ils sont repris par les paragraphes
  // (ci-dessous) et par les paragraphes de liste (list-node.scss).
  //
  // `--tt-paragraph-gap` en `em` et non en px : l'écart suit la taille du
  // texte au lieu de rester figé à une valeur d'écran.
  --tt-leading: 1.5;
  --tt-paragraph-gap: 0.75em;""")

# ── 2/4 : le SCSS abandonne l'espacement ──────────────────────────────────
PARA_NEW = """  // Rythme vertical : réglé en Tailwind, sur l'élément ProseMirror
  // (`builder-tiptap-editor.tsx`, `editorProps.attributes.class`).
  //
  // Aucune règle d'interlignage ni de marge ICI, délibérément : ce sélecteur
  // pèse 0,2,1 quand une utilitaire Tailwind pèse 0,1,0. La moindre
  // déclaration laissée à cet endroit l'emporterait sur la classe, et le
  // réglage Tailwind serait sans effet — silencieusement.
  p:not(td p):not(th p) {
    font-size: 1rem;
    font-weight: normal;
  }"""

edit_any(PARA, [
    # État d'origine
    """  // Paragraph spacing
  p:not(:first-child):not(td p):not(th p) {
    font-size: 1rem;
    line-height: 1.6;
    font-weight: normal;
    margin-top: 20px;
  }""",
    # État après step_tiptap_leading.sh
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
  }""",
], PARA_NEW)

# ── 3/4 : les listes héritent au lieu d'imposer ───────────────────────────
LIST_NEW = """  li {
    p {
      margin-top: 0;
      // Pas de `line-height` ici : la propriété s'hérite depuis l'éditeur,
      // où Tailwind la pose. En la fixant, cette règle gagnerait en
      // spécificité et les listes se liraient plus aérées que le texte.
    }
  }"""

edit_any(LIST, [
    """  li {
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
  }""",
], LIST_NEW)

# ── 4/4 : le réglage Tailwind (DERNIER fichier écrit) ─────────────────────
edit(EDITOR, """        "aria-label": "Contenu du bloc texte.",
        class: "simple-editor",""",
"""        "aria-label": "Contenu du bloc texte.",
        // Rythme vertical de l'éditeur — les deux seules classes à toucher.
        //
        //   leading-snug                interlignage 1.375 (avant : 1.6)
        //   [&_p:not(:first-child)]:mt-2  écart entre paragraphes, 8px
        //                                 (avant : 20px)
        //
        // `line-height` s'hérite : posé ici, il descend aux paragraphes, aux
        // titres et aux items de liste sans qu'on les vise un par un.
        //
        // Les déclarations correspondantes ont été retirées de
        // `paragraph-node.scss` et `list-node.scss` : leurs sélecteurs
        // pesaient plus lourd que ces utilitaires et les auraient annulées.
        class: "simple-editor leading-snug [&_p:not(:first-child)]:mt-2",""")
PY

echo "✓ 4 substitutions appliquées"

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
git commit -m "style(tiptap): rythme vertical de l'editeur regle en Tailwind

Interlignage 1.6 -> 1.375 (leading-snug) et ecart entre paragraphes
20px -> 8px, poses sur l'element ProseMirror via
editorProps.attributes.class.

Les declarations equivalentes sont retirees du SCSS : leur selecteur
pesait 0,2,1 la ou une utilitaire Tailwind pese 0,1,0 -- elles
auraient annule le reglage sans rien signaler."

echo "✓ commité"
git log -1 --oneline
echo
echo "→ serveur arrêté, puis : rm -rf apps/web/.next node_modules/.cache"