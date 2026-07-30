#!/usr/bin/env bash
#
# fix_float_width_scale.sh
#
# L'enrobage était illisible. Cause calculée, pas supposée.
#
# ─── La géométrie, en chiffres ─────────────────────────────────────────────
#
# Le conteneur du bloc float fait la MESURE du texte : `--akfc-measure` =
# 68ch, soit 544px à 16px de base et 680px à 20px. L'image en prend
# `--akfc-float-width`, la gouttière 1.5rem, le reste revient au texte qui la
# longe :
#
#   image 20 %  →  51 caractères par ligne
#   image 24 %  →  49 caractères
#   image 30 %  →  45 caractères
#   image 38 %  →  39 caractères     ← l'ancien défaut
#   image 50 %  →  31 caractères
#   image 60 %  →  24 caractères     ← l'ancien maximum du curseur
#
# La plage confortable admise est 45–75 caractères, et le commentaire de
# `--akfc-measure` vise explicitement cet optimum. À 38 %, la colonne
# enrobante tombe donc SOUS le seuil de lisibilité ; au maximum du curseur,
# elle donne deux mots par ligne.
#
# ─── Mon erreur ────────────────────────────────────────────────────────────
#
# J'ai choisi 38 % par analogie avec les ratios du média-texte, où l'image
# occupe une COLONNE à part et ne prend rien au texte. Dans un enrobage,
# chaque point de pourcentage est retiré à la ligne de lecture. Les deux
# réglages n'ont pas la même conséquence et ne pouvaient pas partager la même
# échelle.
#
# ─── Ce que le correctif fait ──────────────────────────────────────────────
#
# Le défaut passe à 24 %, qui laisse 49 caractères — dans la plage. Le curseur
# est borné à 12–32 %, de sorte que les réglages illisibles ne soient
# simplement plus atteignables. Un curseur qui permet de casser la page n'est
# pas un réglage, c'est un piège.
#
# ─── Ce que ça implique, et qu'il vaut mieux savoir ────────────────────────
#
# Une image flottante est une VIGNETTE : un portrait, un logo, un schéma qui
# accompagne le texte. À 24 % de la mesure elle fait environ 130 à 160 pixels
# de large.
#
# Si tu veux une grande image avec du texte à côté, ce n'est pas ce bloc — le
# média-texte le fait, en deux colonnes, parce que là l'image ne mange pas la
# ligne de lecture. Les deux blocs ne sont pas deux tailles du même outil.
#
# ─── Note sur les valeurs déjà enregistrées ────────────────────────────────
#
# Si tu as bougé le curseur, ta valeur est en base et prime sur ce défaut :
# rouvre le laboratoire et ramène-la dans la nouvelle plage, sinon rien ne
# changera à l'écran.
#
# Usage :
#   bash fix_float_width_scale.sh
#   AKFC_APPLY_ONLY=1 bash fix_float_width_scale.sh
#
set -euo pipefail

globals_file="apps/web/src/app/globals.css"
lab_file="apps/web/src/features/design-lab/BlockStyleLab.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q 'max: 32, step: 1, unit: "%"' "$lab_file" 2>/dev/null; then
  echo "✓ déjà appliqué (échelle du curseur corrigée) — rien à faire"
  exit 0
fi

for f in "$globals_file" "$lab_file"; do
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

globals_file = "apps/web/src/app/globals.css"
lab_file     = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/2 le défaut ─────────────────────────────────────────────────────────
edit(globals_file, """  /* Bloc float : largeur de l'image enrobée et gouttière autour. */
  --akfc-float-width: 38%;""",
"""  /* Bloc float : largeur de l'image enrobée et gouttière autour.

     24 % et non 38 % : le conteneur du bloc fait la MESURE du texte (68ch),
     donc chaque point pris par l'image est retiré à la ligne de lecture.

       image 24 %  →  49 caractères par ligne   (plage confortable 45–75)
       image 38 %  →  39 caractères             (sous le seuil)
       image 60 %  →  24 caractères             (deux mots par ligne)

     L'ancien 38 % venait des ratios du média-texte, où l'image occupe une
     COLONNE à part et ne prend rien au texte. Les deux réglages n'ont pas la
     même conséquence et ne peuvent pas partager la même échelle.

     À cette taille l'image est une VIGNETTE — portrait, logo, schéma. Pour
     une grande image avec du texte à côté, c'est le média-texte qu'il faut. */
  --akfc-float-width: 24%;""")

# ── 2/2 le curseur (DERNIER fichier écrit : la garde le teste) ────────────
edit(lab_file, """  { key: "--akfc-float-width", label: "Largeur image enrobée", min: 20, max: 60, step: 1, unit: "%", initial: 38, anchor: "lab-float" },""",
"""  // Plage 12–32 % et non 20–60 % : au-delà de 32 %, la colonne enrobante
  // passe sous 45 caractères et devient illisible. Un curseur qui permet de
  // casser la page n'est pas un réglage, c'est un piège.
  { key: "--akfc-float-width", label: "Largeur image enrobée", min: 12, max: 32, step: 1, unit: "%", initial: 24, anchor: "lab-float" },""")
PY

echo "✓ échelle de l'image flottante corrigée"

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
git commit -m "fix(float-text): ramener l'image flottante a une echelle lisible

Le conteneur du bloc fait la MESURE du texte (68ch), donc chaque point
pris par l'image est retire a la ligne de lecture :

  image 20 %  ->  51 caracteres par ligne
  image 24 %  ->  49 caracteres
  image 30 %  ->  45 caracteres
  image 38 %  ->  39 caracteres     (ancien defaut)
  image 60 %  ->  24 caracteres     (ancien maximum du curseur)

La plage confortable est 45-75, et le commentaire de --akfc-measure
vise explicitement cet optimum. L'ancien defaut tombait donc SOUS le
seuil, et le maximum du curseur donnait deux mots par ligne.

L'erreur venait d'une analogie avec les ratios du media-texte, ou
l'image occupe une COLONNE a part et ne prend rien au texte. Dans un
enrobage la consequence est inverse : les deux reglages ne peuvent pas
partager la meme echelle.

Defaut a 24 % (49 caracteres), curseur borne a 12-32 % pour que les
reglages illisibles ne soient plus atteignables.

A cette taille l'image est une vignette — portrait, logo, schema. Pour
une grande image avec du texte a cote, c'est le media-texte : la, elle
ne mange pas la ligne de lecture."

echo "✓ commité"
git log -1 --oneline