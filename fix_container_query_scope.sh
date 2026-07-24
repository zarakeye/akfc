#!/usr/bin/env bash
#
# fix_container_query_scope.sh
#
# Réparation de MON erreur, et affinage du comportement par taille.
#
# ─── L'erreur ──────────────────────────────────────────────────────────────
#
# J'ai posé `container-type: inline-size` SUR `.akfc-block-columns`, et écrit
# la règle `@container` pour ce même sélecteur. Or une container query
# n'interroge que les conteneurs ANCÊTRES : un élément ne peut jamais être
# son propre conteneur de requête.
#
# La condition n'avait donc rien à mesurer, elle n'était jamais satisfaite,
# et `grid-template-columns` n'était jamais posé. Résultat : une seule
# colonne à toutes les largeurs — la mise en page verticale, exactement comme
# sur un téléphone. C'est une régression que j'ai introduite en remplaçant la
# media query, et elle est passée inaperçue parce que le vertical est
# précisément ce qu'on attend d'un petit écran.
#
# Correctif : le conteneur de requête devient un ENVELOPPE
# (`.akfc-block-scope`), et la grille qu'il contient est l'élément interrogé.
#
# ─── L'affinage demandé ────────────────────────────────────────────────────
#
# Deux colonnes dès 44rem, mais pas n'importe lesquelles. À 704px, un ratio
# 2/3–1/3 donnerait une colonne de texte de 235px, soit une trentaine de
# caractères par ligne — sous le seuil de lisibilité.
#
# Trois régimes, donc :
#
#   sous 44rem   une colonne, le média au-dessus du texte (ordre de lecture
#                attendu sur téléphone) ;
#   44 à 62rem   deux colonnes ÉQUILIBRÉES, quel que soit le ratio choisi :
#                à cette largeur, aucune colonne ne peut se permettre d'être
#                la petite ;
#   au-delà      le ratio réglé s'applique enfin — il y a la place pour que
#                l'asymétrie serve la composition au lieu de l'étrangler.
#
# Usage :
#   bash fix_container_query_scope.sh
#   AKFC_APPLY_ONLY=1 bash fix_container_query_scope.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"
B="apps/web/src/features/page-builder/blocks"
VIEW="$B/media-text/view.server.tsx"
PREVIEW="$B/media-text/MediaTextPreview.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GLOBALS" "$VIEW" "$PREVIEW" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "container-type" "$GLOBALS" || {
  echo "✗ step_responsive_measure.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "akfc-block-scope" "$LAB"; then
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
B       = "apps/web/src/features/page-builder/blocks"
VIEW    = "%s/media-text/view.server.tsx" % B
PREVIEW = "%s/media-text/MediaTextPreview.tsx" % B
LAB     = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/5 : le conteneur de requête sort de l'élément interrogé ─────────────
edit(GLOBALS, """/* `container-type: inline-size` fait du bloc une unité de mesure pour ses
   propres règles. Sans lui, `@container` n'aurait rien à interroger.
   Posé sur le BLOC et non sur la page : la containment ne gêne alors ni le
   collant, ni les débordements de la mise en page générale. */
.akfc-block-columns {
  container-type: inline-size;
}""",
"""/* ⚠️ Le conteneur de requête est l'ENVELOPPE, jamais la grille elle-même.
   Une container query n'interroge que les conteneurs ANCÊTRES : un élément
   ne peut pas être son propre conteneur. Déclarer `container-type` sur
   `.akfc-block-columns` et l'interroger dans la même foulée laissait la
   condition sans rien à mesurer — jamais satisfaite, donc jamais deux
   colonnes, à aucune largeur.
   Posé sur le bloc et non sur la page : la containment ne gêne alors ni le
   collant, ni les débordements de la mise en page générale. */
.akfc-block-scope {
  container-type: inline-size;
}""")

# ── 2/5 : trois régimes au lieu d'un seuil ───────────────────────────────
edit(GLOBALS, """@container (min-width: 44rem) {
  .akfc-block-columns {
    /* Le ratio vit ICI et non en style inline : un style inline ne peut pas
       porter de condition, alors qu'une variable posée en inline la traverse
       sans peine. En dessous du seuil, la règle ne s'applique pas et la
       grille reste à une seule colonne — le média passe au-dessus du texte,
       ce qui est l'ordre de lecture attendu sur téléphone. */
    grid-template-columns: var(--akfc-col-1) var(--akfc-col-2);""",
"""/* Régime intermédiaire — 44 à 62rem, en gros la tablette et le petit
   portable. Deux colonnes, mais ÉQUILIBRÉES quel que soit le ratio réglé :
   à 704px, un ratio 2/3–1/3 donnerait une colonne de texte de 235px, une
   trentaine de caractères par ligne. Aucune colonne ne peut être la petite
   à cette largeur. */
@container (min-width: 44rem) {
  .akfc-block-columns {
    /* Le ratio vit ICI et non en style inline : un style inline ne peut pas
       porter de condition, alors qu'une variable posée en inline la traverse
       sans peine. En dessous du seuil, la règle ne s'applique pas et la
       grille reste à une seule colonne — le média passe au-dessus du texte,
       ce qui est l'ordre de lecture attendu sur téléphone. */
    grid-template-columns: 1fr 1fr;""")

edit(GLOBALS, """/* Filet horizontal, à poser entre deux blocs successifs. */""",
"""/* Régime large — au-delà de 62rem, le ratio réglé s'applique enfin. Il y a
   alors la place pour que l'asymétrie serve la composition au lieu de
   l'étrangler. */
@container (min-width: 62rem) {
  .akfc-block-columns {
    grid-template-columns: var(--akfc-col-1) var(--akfc-col-2);
  }
}

/* Filet horizontal, à poser entre deux blocs successifs. */""")

# ── 3/5 : la vue publique s'enveloppe ────────────────────────────────────
edit(VIEW, """  return (
    // La gouttière passe par la variable : le laboratoire la règle, et le
    // filet vertical facultatif se peint au milieu (cf. globals.css).
    <div
      className="akfc-block-columns grid items-start\"""",
"""  return (
    // `akfc-block-scope` est le conteneur de requête ; la grille qu'il
    // enveloppe est l'élément interrogé. Les deux ne peuvent pas être le
    // même nœud (cf. globals.css).
    // La gouttière passe par la variable : le laboratoire la règle, et le
    // filet vertical facultatif se peint au milieu.
    <div className="akfc-block-scope">
    <div
      className="akfc-block-columns grid items-start\"""")

edit(VIEW, """          <div>{TextColumn}</div>
          <div>{MediaColumn}</div>
        </>
      )}
    </div>
  );
}""",
"""          <div>{TextColumn}</div>
          <div>{MediaColumn}</div>
        </>
      )}
    </div>
    </div>
  );
}""")

# ── 4/5 : l'aperçu du builder, à l'identique ─────────────────────────────
edit(PREVIEW, """  return (
    <div
      className="akfc-block-columns grid items-start\"""",
"""  return (
    <div className="akfc-block-scope">
    <div
      className="akfc-block-columns grid items-start\"""")

edit(PREVIEW, """          <div>{TextColumn}</div>
          <div>{MediaColumn}</div>
        </>
      )}
    </div>
  );
}""",
"""          <div>{TextColumn}</div>
          <div>{MediaColumn}</div>
        </>
      )}
    </div>
    </div>
  );
}""")

# ── 5/5 : le laboratoire (DERNIER fichier écrit) ─────────────────────────
edit(LAB, """        <section
          className="akfc-block-columns grid items-start\"""",
"""        <section className="akfc-block-scope">
        <div
          className="akfc-block-columns grid items-start\"""")

edit(LAB, """              <FakeMedia />
            </>
          )}
        </section>""",
"""              <FakeMedia />
            </>
          )}
        </div>
        </section>""")
PY

echo "✓ 8 substitutions appliquées"

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
git commit -m "fix(page-builder): la container query interrogeait un conteneur inexistant

container-type etait pose sur .akfc-block-columns, et la regle
@container ciblait ce meme selecteur. Une container query n'interroge
que les conteneurs ANCETRES : un element ne peut pas etre son propre
conteneur. La condition n'avait rien a mesurer, grid-template-columns
n'etait jamais pose, et le bloc restait sur une colonne a toutes les
largeurs.

Le conteneur de requete devient une enveloppe (.akfc-block-scope) et la
grille l'element interroge.

Trois regimes au lieu d'un seuil : une colonne sous 44rem, deux
colonnes equilibrees de 44 a 62rem -- a 704px un ratio 2/3-1/3
donnerait une colonne de texte de 235px --, et le ratio reglé au-dela."

echo "✓ commité"
git log -1 --oneline