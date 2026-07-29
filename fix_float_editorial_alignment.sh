#!/usr/bin/env bash
#
# fix_float_editorial_alignment.sh
#
# L'image flottante dépassait à gauche de la colonne de texte. Correction, et
# retrait de l'échafaudage de diagnostic devenu inutile.
#
# ─── La cause, et c'est une erreur de raisonnement de ma part ──────────────
#
# `.akfc-prose` est plafonnée à `--akfc-measure` ET centrée
# (`margin-inline: auto`). Quand j'ai élargi le conteneur du float au puits de
# page, le texte s'est retrouvé centré dans un box de 68ch au milieu de 68rem,
# pendant que l'image flottante restait collée au bord gauche du CONTENEUR.
# Deux bords gauches différents : l'image dépassait d'environ 200px à gauche
# de la colonne de texte.
#
# Le raisonnement fautif était celui-ci : j'ai voulu que le texte ENROBANT
# fasse la mesure, et j'ai donc élargi le conteneur pour compenser la place
# prise par l'image. C'est l'inverse de la convention éditoriale.
#
# ─── Ce que fait la typographie imprimée ───────────────────────────────────
#
# L'image se pose DANS la colonne de texte. La colonne garde sa mesure, et les
# quelques lignes qui longent l'image sont plus courtes — c'est normal, admis,
# et c'est même ce qui donne au procédé son allure. Ce qui ne se fait pas, en
# revanche, c'est de laisser l'image sortir de la colonne : le bord gauche du
# bloc doit être une ligne unique et franche, image et texte confondus.
#
# Donc : le conteneur du float REPREND la mesure, et les deux bords gauches
# se confondent à nouveau.
#
# ─── Et pour que ça reste vrai ─────────────────────────────────────────────
#
# Une règle rend l'alignement structurel plutôt qu'accidentel : dans un bloc
# float, la prose remplit exactement son conteneur (`max-width: none`,
# `margin-inline: 0`) au lieu de se re-brider et se re-centrer toute seule.
# C'est le CONTENEUR qui porte la mesure ; le texte n'a plus son mot à dire.
#
# Sans cette règle, l'alignement ne tiendrait que par l'égalité fortuite de
# deux largeurs, et se romprait au premier réglage de la mesure ou du puits.
#
# Note : les lignes qui longent l'image font alors environ 42 caractères pour
# une image à 38 % de la mesure. Si tu les trouves courtes, le curseur
# « Largeur image enrobée » du laboratoire les rallonge en réduisant l'image.
#
# ─── Retrait de l'échafaudage ──────────────────────────────────────────────
#
# La ligne « État du bloc » a fait son travail : le sélecteur d'avatar exige
# un clic, il n'y a pas de sélection par défaut. Elle disparaît.
#
# Usage :
#   bash fix_float_editorial_alignment.sh
#   AKFC_APPLY_ONLY=1 bash fix_float_editorial_alignment.sh
#
set -euo pipefail

VIEW="apps/web/src/features/page-builder/blocks/float-text/view.server.tsx"
PREVIEW="apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"
EDITOR="apps/web/src/features/page-builder/blocks/float-text/editor.client.tsx"
GLOBALS="apps/web/src/app/globals.css"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "akfc-float > .akfc-prose\|\.akfc-float \.akfc-prose" "$GLOBALS" 2>/dev/null; then
  echo "✓ déjà appliqué (prose du float alignée) — rien à faire"
  exit 0
fi

for f in "$VIEW" "$PREVIEW" "$EDITOR" "$GLOBALS"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

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

VIEW    = "apps/web/src/features/page-builder/blocks/float-text/view.server.tsx"
PREVIEW = "apps/web/src/features/page-builder/blocks/float-text/FloatTextPreview.tsx"
EDITOR  = "apps/web/src/features/page-builder/blocks/float-text/editor.client.tsx"
GLOBALS = "apps/web/src/app/globals.css"

# ── 1/4 retrait de l'échafaudage de diagnostic ────────────────────────────
edit(EDITOR, """
        {/* DIAGNOSTIC — échafaudage temporaire, à retirer.
            Affiche l'état réel de `block.media`, celui-là même que l'aperçu
            reçoit. Permet de distinguer « le clic n'écrit rien » de « le clic
            écrit mais l'aperçu ne le voit pas », deux causes qui appellent
            des correctifs opposés. */}
        <p className="text-[11px] text-muted-foreground">
          État du bloc :{" "}
          {block.media
            ? block.media.kind === "avatar"
              ? `avatar (${block.media.userId})`
              : `bibliothèque (${block.media.mediaId})`
            : "aucune image"}
        </p>
""", "")

# ── 2/4 vue publique : le conteneur reprend la mesure ─────────────────────
edit(VIEW, """  //
  // PAS de `akfc-measure-block` ici, contrairement aux cas dégénérés. Avec un
  // float, la largeur du texte vaut « conteneur moins image » : brider le
  // conteneur à la mesure ne laisserait au texte que 62 % de 68ch, une
  // quarantaine de caractères. Le conteneur prend donc le puits de page, et
  // le texte enrobant retombe sur la mesure de lui-même (68rem × 62 % ≈ 68ch).
  // La mesure n'est pas imposée au bloc : elle est le résultat de sa géométrie.
  return (
    <div className="akfc-float-scope">""",
"""  //
  // Le conteneur porte la MESURE, comme les cas dégénérés. La convention
  // éditoriale veut que l'image se pose DANS la colonne de texte : la colonne
  // garde sa largeur de lecture et les quelques lignes qui longent l'image
  // sont plus courtes — c'est normal, et c'est ce qui donne au procédé son
  // allure. Ce qui ne se fait pas, c'est de laisser l'image sortir de la
  // colonne : le bord gauche du bloc doit être une ligne unique, image et
  // texte confondus.
  return (
    <div className="akfc-float-scope akfc-measure-block">""")

# ── 3/4 aperçu : même largeur que la vue publique ─────────────────────────
edit(PREVIEW, """  return (
    <div className="akfc-float-scope">""",
"""  return (
    <div className="akfc-float-scope akfc-measure-block">""")

# ── 4/4 la prose remplit son conteneur (DERNIER fichier écrit) ────────────
edit(GLOBALS, """/* Referme le flottant : la coulée de texte reprend toute la largeur après. */""",
"""/* Dans un bloc float, la prose REMPLIT son conteneur au lieu de se re-brider
   et se re-centrer toute seule (`.akfc-prose` porte `max-width: measure` et
   `margin-inline: auto`). Sans cette règle, le texte serait centré dans un
   box plus étroit que le conteneur pendant que l'image resterait collée au
   bord gauche de celui-ci : deux bords gauches distincts, et l'image qui
   dépasse de la colonne.

   C'est le CONTENEUR qui porte la mesure ; le texte n'a plus son mot à dire.
   L'alignement devient structurel au lieu de tenir à l'égalité fortuite de
   deux largeurs, qui se romprait au premier réglage de la mesure. */
.akfc-float .akfc-prose {
  max-width: none;
  margin-inline: 0;
}

/* Referme le flottant : la coulée de texte reprend toute la largeur après. */""")
PY

echo "✓ alignement éditorial rétabli, échafaudage retiré"

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
git commit -m "fix(float-text): l'image ne sort plus de la colonne de texte

.akfc-prose est plafonnee a --akfc-measure ET centree. En elargissant
le conteneur du float au puits de page, le texte se retrouvait centre
dans un box de 68ch au milieu de 68rem pendant que l'image restait
collee au bord gauche du conteneur : deux bords gauches distincts, et
l'image qui depassait d'environ 200px a gauche de la colonne.

Le raisonnement fautif etait de vouloir que le texte ENROBANT fasse la
mesure, en elargissant le conteneur pour compenser la place de l'image.
C'est l'inverse de la convention editoriale : l'image se pose DANS la
colonne, qui garde sa largeur de lecture, et les lignes qui la longent
sont plus courtes — c'est admis et c'est l'allure du procede. Ce qui ne
se fait pas, c'est de laisser l'image sortir de la colonne.

Le conteneur reprend donc la mesure, et une regle rend l'alignement
structurel : dans un bloc float la prose remplit son conteneur au lieu
de se re-brider et se re-centrer. C'est le conteneur qui porte la
mesure. Sans cela l'alignement ne tiendrait que par l'egalite fortuite
de deux largeurs.

Retrait de la ligne de diagnostic temporaire : le selecteur d'avatar
exige un clic, il n'y a pas de selection par defaut."

echo "✓ commité"
git log -1 --oneline