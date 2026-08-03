#!/usr/bin/env bash
#
# step_toolbar_order_and_gallery_container.sh
#
# Deux corrections : la barre de recherche dépliée cesse de pousser ses
# voisins, et les galeries cessent de déborder.
#
# ─── 1. La barre dépliée passait AVANT les boutons d'état ──────────────────
#
# `FinderSearchControl` est monté avant `StatusFilterBar`, le sélecteur de vue
# et le bouton de suppression. Sa ligne pleine largeur poussait donc TOUT ce
# qui la suit sur la ligne du dessous — pas seulement les trois boutons
# d'état.
#
# `order-last` la place en dernier au rendu, sans déplacer trente lignes de
# JSX pour un problème d'affichage.
#
# Contrepartie honnête : `order` ne change que l'ordre VISUEL. Au clavier, la
# tabulation suit toujours l'ordre du code, donc le champ de recherche est
# atteint avant les boutons d'état alors qu'il s'affiche après. Léger, mais
# réel — je le note plutôt que de le taire.
#
# ─── 2. Les galeries se dimensionnaient sur la FENÊTRE ─────────────────────
#
# `sm:grid-cols-2 lg:grid-cols-3` interroge la largeur de la FENÊTRE. Une
# galerie posée dans un conteneur étroit — panneau d'édition, carte, colonne
# de page — affichait donc trois colonnes dans un espace qui n'en tient pas
# une : d'où le débordement.
#
# C'est exactement la limite que j'avais signalée en posant les aperçus de
# blocs, et le même remède que pour le média-texte : des CONTAINER QUERIES.
#
# ─── Le piège des container queries, déjà rencontré ici ────────────────────
#
# Une container query interroge les ANCÊTRES. Poser `@container` sur la grille
# ET y écrire `@md:grid-cols-2` ne déclencherait donc jamais rien — c'est
# l'erreur exacte commise sur le média-texte plus tôt dans ce projet, où
# `container-type` et la règle visaient le même sélecteur, et où le bloc est
# resté sur une colonne à toutes les largeurs.
#
# Chaque disposition reçoit donc une ENVELOPPE `@container`, et les variantes
# vivent à l'intérieur.
#
# Une colonne par défaut, deux à partir de 28rem de conteneur, trois à partir
# de 48rem. Ta suggestion — deux colonnes plutôt qu'une — est tenue dès qu'il
# y a la place, et abandonnée quand il n'y en a pas.
#
# Le CARROUSEL garde son débordement horizontal : c'est sa raison d'être. Ses
# vignettes rétrécissent seulement, de 18rem à 16rem sous 28rem de conteneur.
#
# Usage :
#   bash step_toolbar_order_and_gallery_container.sh
#   AKFC_APPLY_ONLY=1 bash step_toolbar_order_and_gallery_container.sh
#
set -euo pipefail

control="apps/web/src/features/finder-core/components/FinderSearchControl.tsx"
gallery_view="apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx"
gallery_preview="apps/web/src/features/page-builder/blocks/image-gallery/ImageGalleryPreview.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

if grep -q "@3xl:columns-3" "$gallery_preview" 2>/dev/null; then
  echo "✓ déjà appliqué (galeries en container queries) — rien à faire"
  exit 0
fi

for f in "$control" "$gallery_view" "$gallery_preview"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

python3 - <<'PY'
import io

def edit(path, marker, old, new, label):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    if marker in src:
        print("  = %s (déjà présent)" % label)
        return
    n = src.count(old)
    assert n == 1, "ancre %d fois pour « %s » :\n%s" % (n, label, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % label)

control         = "apps/web/src/features/finder-core/components/FinderSearchControl.tsx"
gallery_view    = "apps/web/src/features/page-builder/blocks/image-gallery/view.server.tsx"
gallery_preview = "apps/web/src/features/page-builder/blocks/image-gallery/ImageGalleryPreview.tsx"

# ── 1 — la ligne dépliée s'affiche en dernier ─────────────────────────────
edit(control, "order-last",
"""        <div className="flex basis-full items-center gap-2 pt-1">""",
"""        // `order-last` : cette recherche est montée AVANT les boutons
        // d'état, le sélecteur de vue et le bouton de suppression. Sans lui,
        // sa ligne pleine largeur pousserait tout cela sur la ligne du
        // dessous. Il la place en dernier au RENDU, sans déplacer trente
        // lignes de JSX pour un problème d'affichage.
        //
        // Contrepartie : `order` ne change que l'ordre visuel. Au clavier, la
        // tabulation suit l'ordre du code, donc ce champ est atteint avant
        // les boutons d'état alors qu'il s'affiche après.
        <div className="order-last flex basis-full items-center gap-2 pt-1">""",
"barre dépliée en dernier")

# ── 2 — vue publique : une enveloppe @container par disposition ───────────
edit(gallery_view, "@container",
"""    case "grid":
      return (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3\"""",
"""    case "grid":
      return (
        // `@container` sur une ENVELOPPE, jamais sur la grille elle-même :
        // une container query interroge les ANCÊTRES, donc la poser sur
        // l'élément qu'elle doit régir ne déclencherait rien. C'est l'erreur
        // exacte commise sur le média-texte plus tôt dans ce projet.
        <div className="@container">
        <div
          className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3\"""",
"grille publique : enveloppe")

edit(gallery_view, '</div>\n        </div>\n      );\n\n    case "carousel":',
"""        </div>
      );

    case "carousel":""",
"""        </div>
        </div>
      );

    case "carousel":""",
"grille publique : fermeture")

edit(gallery_view, "@container\">\n        <div\n          className=\"-mx-4",
"""        <div
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-2\"""",
"""        <div className="@container">
        <div
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-2\"""",
"carrousel public : enveloppe")

edit(gallery_view, "w-64 @md:w-72",
"""              className="w-72 flex-shrink-0 snap-start\"""",
"""              className="w-64 @md:w-72 flex-shrink-0 snap-start\"""",
"carrousel public : largeur des vignettes")

edit(gallery_view, '</div>\n        </div>\n      );\n\n    case "masonry":',
"""        </div>
      );

    case "masonry":""",
"""        </div>
        </div>
      );

    case "masonry":""",
"carrousel public : fermeture")

edit(gallery_view, "@md:columns-2",
"""        <div
          className="columns-1 sm:columns-2 lg:columns-3\"""",
"""        <div className="@container">
        <div
          className="columns-1 @md:columns-2 @3xl:columns-3\"""",
"mosaïque publique : enveloppe")

edit(gallery_view, "</div>\n        </div>\n      );\n  }",
"""        </div>
      );
  }""",
"""        </div>
        </div>
      );
  }""",
"mosaïque publique : fermeture")

# ── 3 — l'aperçu a déjà une enveloppe commune : une seule suffit ──────────
# Un aperçu qui diverge du rendu public n'est plus un aperçu.
edit(gallery_preview, "@container",
"""  return (
    <div>""",
"""  return (
    // `@container` ici plutôt que sur chaque disposition : ce composant a
    // déjà une enveloppe commune, et une container query régit ses
    // DESCENDANTS.
    <div className="@container">""",
"aperçu : enveloppe commune")

edit(gallery_preview, "@md:grid-cols-2",
"""          className="grid sm:grid-cols-2 lg:grid-cols-3\"""",
"""          className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3\"""",
"aperçu : grille")

edit(gallery_preview, "w-64 @md:w-72",
"""            <div key={item.mediaId} className="w-72 flex-shrink-0 snap-start">""",
"""            <div key={item.mediaId} className="w-64 @md:w-72 flex-shrink-0 snap-start">""",
"aperçu : carrousel")

edit(gallery_preview, "@3xl:columns-3",
"""          className="columns-1 sm:columns-2 lg:columns-3\"""",
"""          className="columns-1 @md:columns-2 @3xl:columns-3\"""",
"aperçu : mosaïque")
PY

echo "✓ ordre de la barre et galeries corrigés"

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
git commit -m "fix(finder,gallery): ordre de la barre depliee et galeries en container queries

1. FinderSearchControl est monte AVANT les boutons d'etat, le selecteur
   de vue et le bouton de suppression : sa ligne pleine largeur poussait
   tout cela sur la ligne du dessous. order-last la place en dernier au
   rendu. Contrepartie notee : order ne change que l'ordre visuel, la
   tabulation suit toujours l'ordre du code.

2. Les galeries se dimensionnaient sur la FENETRE
   (sm:grid-cols-2 lg:grid-cols-3). Posee dans un conteneur etroit —
   panneau d'edition, carte, colonne de page — une galerie affichait
   trois colonnes dans un espace qui n'en tient pas une, d'ou le
   debordement. C'est la limite signalee en posant les apercus de blocs.

   Piege evite : une container query interroge les ANCETRES. Poser
   @container sur la grille et y ecrire @md:grid-cols-2 ne declencherait
   rien — erreur exacte commise sur le media-texte plus tot dans ce
   projet, ou le bloc etait reste sur une colonne a toutes les largeurs.
   Chaque disposition recoit donc une ENVELOPPE.

   Une colonne par defaut, deux a partir de 28rem de conteneur, trois a
   partir de 48rem. Applique a la vue publique ET a l'apercu : deux
   rendus qui divergent ne sont plus un apercu.

   Le carrousel garde son debordement horizontal, qui est sa raison
   d'etre ; ses vignettes retrecissent seulement sous 28rem."

echo "✓ commité"
git log -1 --oneline