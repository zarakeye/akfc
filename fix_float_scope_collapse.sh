#!/usr/bin/env bash
#
# fix_float_scope_collapse.sh
#
# Le bloc float s'effondrait à une largeur NULLE dans la page publique. Un mot
# par ligne, image invisible. Cause trouvée, mécanique, vérifiable.
#
# ─── L'indice décisif ──────────────────────────────────────────────────────
#
# « ça fonctionne déjà dans l'aperçu ». C'est exact, et c'est la clé : l'aperçu
# n'est pas dans un conteneur flex, la page publique si — `PageRenderer` rend
# ses blocs dans un `flex flex-col`.
#
# J'ai passé deux incréments à ajuster des pourcentages de largeur d'image.
# Ils s'appliquaient à une largeur de zéro : aucun n'avait la moindre chance
# de changer quoi que ce soit.
#
# ─── Le mécanisme ──────────────────────────────────────────────────────────
#
# La vue du float combine DEUX classes, et c'est le seul bloc à le faire :
#
#   .akfc-float-scope    → container-type: inline-size
#   .akfc-measure-block  → max-width: 68ch ; margin-inline: auto
#
# Dans un conteneur flex, ces deux propriétés se contredisent :
#
#   1. La spécification flexbox est formelle : un élément dont une marge
#      TRANSVERSALE vaut `auto` n'est PAS étiré. Il retombe donc sur sa
#      largeur intrinsèque au lieu de remplir la ligne.
#
#   2. `container-type: inline-size` établit un confinement de taille : pour
#      se dimensionner, l'élément IGNORE son contenu. Sa largeur intrinsèque
#      vaut donc zéro.
#
# Résultat : largeur nulle. Le texte tombe à un mot par ligne, et l'image
# flottante — dimensionnée en pourcentage de cette largeur — disparaît.
#
# Le média-texte échappe au piège parce qu'il n'a que `.akfc-block-scope`,
# sans marge automatique. C'était la différence à voir, et elle ne se lisait
# pas dans la CSS du float prise isolément : elle n'apparaît qu'au CROISEMENT
# des deux classes et du contexte flex.
#
# ─── Le correctif ──────────────────────────────────────────────────────────
#
# Une largeur DÉFINIE sur le conteneur de requête. `width: 100%` étant une
# valeur explicite, l'élément ne dépend plus de sa largeur intrinsèque, et le
# confinement n'a plus rien à effondrer. `max-width: 68ch` continue de le
# plafonner, `margin-inline: auto` de le centrer — les deux retrouvent le
# comportement qu'ils avaient hors flex.
#
# ─── Si l'image reste absente après ça ─────────────────────────────────────
#
# Une seconde cause POSSIBLE, indépendante, à vérifier seulement s'il le
# faut : la page publique résout ses médias en audience `public`, laquelle ne
# retient que les assets PUBLIÉS. Un média fraîchement téléversé naît
# `pending`. Si ton image n'a pas encore été validée dans le finder, elle ne
# sera pas résolue — mais elle réapparaîtra dès sa validation, sans autre
# correctif.
#
# Usage :
#   bash fix_float_scope_collapse.sh
#   AKFC_APPLY_ONLY=1 bash fix_float_scope_collapse.sh
#
set -euo pipefail

globals_file="apps/web/src/app/globals.css"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "akfc-float-scope-width-fix" "$globals_file" 2>/dev/null; then
  echo "✓ déjà appliqué (largeur définie posée) — rien à faire"
  exit 0
fi

[ -f "$globals_file" ] || { echo "✗ introuvable : $globals_file"; exit 1; }

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

edit("apps/web/src/app/globals.css",
""".akfc-float-scope {
  container-type: inline-size;
}""",
"""/* akfc-float-scope-width-fix */
.akfc-float-scope {
  container-type: inline-size;

  /* Largeur DÉFINIE, et elle est indispensable — sans elle le bloc
     s'effondre à zéro dans la page publique.

     La vue du float est le seul bloc à porter à la fois cette classe et
     `.akfc-measure-block`, qui pose `margin-inline: auto`. Dans le
     `flex flex-col` de `PageRenderer`, les deux se contredisent :

       1. Un élément flex dont une marge TRANSVERSALE vaut `auto` n'est pas
          étiré — il retombe sur sa largeur intrinsèque.
       2. `container-type: inline-size` établit un confinement de taille :
          pour se dimensionner, l'élément ignore son contenu. Sa largeur
          intrinsèque vaut donc zéro.

     D'où un texte à un mot par ligne et une image flottante invisible,
     puisqu'elle est dimensionnée en pourcentage de cette largeur. L'aperçu du
     builder n'étant PAS dans un conteneur flex, il se comportait
     normalement — ce qui rendait le défaut invisible côté édition.

     `100%` est une valeur explicite : l'élément ne dépend plus de sa largeur
     intrinsèque, et le confinement n'a plus rien à effondrer. `max-width` le
     plafonne toujours à la mesure, `margin-inline: auto` le centre toujours.

     Le média-texte échappe au piège faute de marge automatique sur son propre
     conteneur de requête (`.akfc-block-scope`). */
  width: 100%;
}""")
PY

echo "✓ largeur définie posée sur le conteneur de requête du float"

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
git commit -m "fix(float-text): le bloc s'effondrait a une largeur nulle

Un mot par ligne, image invisible, et deux increments de reglages de
largeur restes sans effet : ils s'appliquaient a une largeur de zero.

La vue du float est le seul bloc a porter a la fois .akfc-float-scope
(container-type: inline-size) et .akfc-measure-block (margin-inline:
auto). Dans le flex flex-col de PageRenderer, les deux se contredisent :

  1. La specification flexbox est formelle — un element dont une marge
     TRANSVERSALE vaut auto n'est PAS etire ; il retombe sur sa largeur
     intrinseque.
  2. container-type: inline-size etablit un confinement de taille :
     l'element ignore son contenu pour se dimensionner, donc sa largeur
     intrinseque vaut zero.

L'apercu du builder n'etant pas dans un conteneur flex, il se comportait
normalement — d'ou un defaut invisible cote edition et bien reel cote
public. C'est cette dissymetrie, signalee par l'utilisateur, qui a
permis de le trouver.

width: 100% est une valeur explicite : l'element ne depend plus de sa
largeur intrinseque et le confinement n'a plus rien a effondrer.
max-width plafonne toujours a la mesure, margin-inline: auto centre
toujours.

Le media-texte echappait au piege faute de marge automatique sur
.akfc-block-scope."

echo "✓ commité"
git log -1 --oneline