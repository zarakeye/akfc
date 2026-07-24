#!/usr/bin/env bash
#
# fix_block_gap_range.sh
#
# Le curseur d'écart entre blocs a bien prise sur la mise en page — mais sur
# un tiers de sa course seulement, et pas celui qu'on manipule d'instinct.
#
# ─── Le calcul, sur un écran de 1920px ─────────────────────────────────────
#
#     --akfc-block-gap: clamp(1.5rem, 5vw, var(--akfc-block-gap-max))
#
#   `5vw` y vaut 96px, soit 6rem. Or `clamp(min, val, max)` rend
#   `max(min, min(val, max))` :
#
#     curseur 1rem    → 1.5rem     (le plancher mord)
#     curseur 1,5rem  → 1.5rem
#     curseur 4rem    → 4rem       ← valeur initiale
#     curseur 6rem    → 6rem
#     curseur 7rem    → 6rem       ← plus rien ne bouge
#     curseur 8rem    → 6rem
#
#   Le réflexe, quand on cherche à voir un effet, est de POUSSER le curseur
#   vers le haut. C'est justement la zone morte. En le tirant vers le bas,
#   l'écart change — mais qui pense à descendre pour vérifier qu'un réglage
#   fonctionne ?
#
# ─── Le vrai défaut de conception ──────────────────────────────────────────
#
# `vw` mesure la FENÊTRE. Tout le reste du système a migré vers les container
# queries précisément parce que la fenêtre ne dit rien de la place réellement
# disponible pour un bloc. Ce `5vw` réintroduisait cette dépendance, et il la
# réintroduisait au pire endroit : le laboratoire, où changer la largeur
# d'aperçu ne modifie pas la fenêtre. L'écart restait donc identique en mode
# « Téléphone » et en mode « Large » — un aperçu qui ment.
#
# ─── La formule de remplacement ────────────────────────────────────────────
#
#     max(1rem, min(var(--akfc-block-gap-max), 10vw))
#
#   Le curseur ne sert plus de PLAFOND à une valeur fluide : il donne la
#   valeur, et `10vw` n'intervient que pour la rabattre sur les petits
#   écrans, là où 6rem de blanc entre deux blocs serait absurde.
#
#     écran 1920px → 1 / 2 / 4 / 6 / 8 rem   (course entière utile)
#     écran 1280px → 1 / 2 / 4 / 6 / 8 rem
#     écran  768px → 1 / 2 / 4 / 4.8 / 4.8   (rabattu)
#     écran  375px → 1 / 2 / 2.3 / 2.3 / 2.3 (rabattu)
#
#   On règle sur grand écran, où la course entière répond ; les petits
#   écrans reçoivent une version resserrée sans qu'on ait à s'en occuper.
#
# ─── Si l'écart ne bouge toujours pas ──────────────────────────────────────
#
# Alors la feuille de style n'est pas rechargée, et non plus le calcul qui
# est en cause. Serveur arrêté, puis :
#     rm -rf apps/web/.next node_modules/.cache
#
# Usage :
#   bash fix_block_gap_range.sh
#   AKFC_APPLY_ONLY=1 bash fix_block_gap_range.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$GLOBALS" ] || { echo "✗ introuvable : $GLOBALS"; exit 1; }
# ── Garde anti-double-application ──────────────────────────────────────────
# AVANT le contrôle de prérequis : ce script détruit l'ancre qui sert de
# prérequis, donc une seconde passe conclurait à tort que le script
# précédent n'a pas été appliqué.
if grep -q "min(var(--akfc-block-gap-max), 10vw)" "$GLOBALS"; then
  echo "✓ déjà appliqué (marqueur présent dans $GLOBALS) — rien à faire"
  exit 0
fi

grep -q "clamp(1.5rem, 5vw, var(--akfc-block-gap-max))" "$GLOBALS" || {
  echo "✗ fix_composed_vars_scope.sh doit être appliqué d'abord"; exit 1; }

python3 - <<'PY'
import io

def edit(path, old, new, count=1):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == count, "ancre %d fois (attendu %d) dans %s" % (n, count, path)
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s (%d occurrence·s)" % (path.rsplit('/', 1)[-1], count))

GLOBALS = "apps/web/src/app/globals.css"

# Deux occurrences : `.akfc-page` et le repli de `.akfc-rule-h`. Les deux
# doivent suivre la même formule, sans quoi le filet et l'écart se
# désaccorderaient.
edit(GLOBALS,
     """  --akfc-block-gap: clamp(1.5rem, 5vw, var(--akfc-block-gap-max));""",
     """  /* Le curseur DONNE la valeur ; `10vw` ne fait que la rabattre sur les
     petits écrans. Avec l'ancienne forme — `clamp(1.5rem, 5vw, curseur)` —
     le curseur n'était qu'un plafond appliqué à `5vw`, qui vaut déjà 6rem
     sur un écran de 1920px : au-dessus de 6rem, plus rien ne bougeait, et
     c'est précisément là qu'on pousse le curseur pour voir un effet.
     `vw` mesure la fenêtre, ce que le reste du système a justement cessé de
     faire — d'où un aperçu identique en mode « Téléphone » et en mode
     « Large ». Le rôle de `vw` est ici réduit à un garde-fou pour les
     petites largeurs, où 6rem de blanc entre deux blocs n'aurait pas de
     sens. */
  --akfc-block-gap: max(1rem, min(var(--akfc-block-gap-max), 10vw));""",
     count=2)
PY

echo "✓ substitution appliquée"

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
git commit -m "fix(design-lab): le curseur d'ecart entre blocs repond sur toute sa course

clamp(1.5rem, 5vw, curseur) faisait du curseur un simple plafond
applique a 5vw -- soit 6rem sur un ecran de 1920px. Au-dela de 6rem
plus rien ne bougeait, et c'est justement vers le haut qu'on pousse
un curseur pour verifier son effet.

vw mesure la fenetre, ce que le reste du systeme a cesse de faire au
profit des container queries : l'apercu du laboratoire rendait le meme
ecart en mode Telephone et en mode Large.

Le curseur donne desormais la valeur ; 10vw ne fait que la rabattre
sur les petites largeurs."

echo "✓ commité"
git log -1 --oneline