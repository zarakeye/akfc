#!/usr/bin/env bash
#
# step_finder_touch_gestures.sh
#
# Les gestes du finder, revus pour un doigt. Avant la mise en page, les
# ACTIONS : un finder magnifiquement disposé mais dont on ne peut pas ouvrir
# un dossier ne sert à rien.
#
# ─── Ce qui est aujourd'hui impossible au doigt ────────────────────────────
#
# Ouvrir un dossier demande un DOUBLE-CLIC. Sur un écran tactile, le
# double-tap est un geste que le navigateur capte souvent comme un zoom, et
# aucun gestionnaire de fichiers mobile ne l'emploie — Fichiers, Drive,
# OneDrive ouvrent tous au tap simple. En l'état, un dossier ne s'ouvre pas
# sur téléphone, ou seulement par chance.
#
# ─── Le seuil n'est pas la bonne question ──────────────────────────────────
#
# La tentation serait de brancher ce comportement sur la largeur d'écran. Ce
# serait faux : ce n'est pas la taille de l'écran qui décide du geste, c'est
# le PÉRIPHÉRIQUE DE POINTAGE. Un portable tactile de 1440px mérite le tap
# simple ; une petite fenêtre sur un poste à souris garde le double-clic.
#
# Deux axes distincts, à ne pas confondre :
#   - la MISE EN PAGE dépend de la largeur → media/container queries ;
#   - les GESTES dépendent du pointeur → `event.pointerType`.
#
# `pointerType` est lu sur l'événement lui-même, donc juste au moment de
# l'action et pour CE geste précis. Un utilisateur qui alterne pavé tactile et
# écran tactile obtient à chaque fois le bon comportement, ce qu'aucune
# détection globale « est-ce un mobile » ne sait faire.
#
# ─── L'appui long durait 1,5 seconde ───────────────────────────────────────
#
# iOS déclenche à environ 500ms, Android entre 400 et 500. À 1500ms, l'usager
# a relâché bien avant et conclut que le geste n'existe pas. Le délai descend
# à 500ms.
#
# Ce hook sert AUSSI à la souris, où le geste équivalent est le clic droit :
# raccourcir ne gêne pas, un maintien d'une demi-seconde à la souris restant
# volontaire.
#
# ─── Ce que ce script NE fait pas encore ───────────────────────────────────
#
# Le menu contextuel reste sur `onContextMenu`, c'est-à-dire le clic droit :
# au doigt, il n'est atteignable qu'en passant par la sélection multiple.
# L'appui long y entre (convention Android) plutôt que d'ouvrir le menu
# (convention iOS) — les deux se défendent, et la barre d'actions de la
# sélection multiple existe déjà, donc les actions restent joignables.
#
# Le glisser-déposer restera inutilisable au doigt, et c'est sans gravité :
# `MoveDialog` couvre le déplacement par une voie explicite.
#
# Usage :
#   bash step_finder_touch_gestures.sh
#   AKFC_APPLY_ONLY=1 bash step_finder_touch_gestures.sh
#
set -euo pipefail

long_press="apps/web/src/features/finder-core/hooks/useLongPress.ts"
grid_item="apps/web/src/features/finder-core/components/GridItem.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "pointerTypeRef" "$grid_item" 2>/dev/null; then
  echo "✓ déjà appliqué (gestes tactiles posés) — rien à faire"
  exit 0
fi

for f in "$long_press" "$grid_item"; do
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

long_press = "apps/web/src/features/finder-core/hooks/useLongPress.ts"
grid_item  = "apps/web/src/features/finder-core/components/GridItem.tsx"

# ── 1/3 le délai de l'appui long ──────────────────────────────────────────
edit(long_press,
""" * @param onLongPress fonction à appeler si l'appui dure assez longtemps
 * @param delay durée requise en millisecondes (défaut : 1500ms)
 */
export function useLongPress(
  onLongPress: () => void,
  delay: number = 1500
)""",
""" * @param onLongPress fonction à appeler si l'appui dure assez longtemps
 * @param delay durée requise en millisecondes (défaut : 500ms)
 *
 * ⏱️ Pourquoi 500ms et non 1500 : iOS déclenche l'appui long vers 500ms,
 * Android entre 400 et 500. À 1500ms, l'usager a relâché bien avant et
 * conclut que le geste n'existe pas — le comportement était donc
 * inatteignable en pratique sur écran tactile.
 *
 * Le hook sert aussi à la souris, où l'équivalent est le clic droit :
 * raccourcir ne gêne pas, un maintien d'une demi-seconde restant volontaire.
 */
export function useLongPress(
  onLongPress: () => void,
  delay: number = 500
)""")

# ── 2/3 l'import manquant, puis le type de pointeur ───────────────────────
edit(grid_item, """import { JSX, useState } from 'react';""",
"""import { JSX, useRef, useState } from 'react';""")

# ── 2/3 mémoriser le type de pointeur du geste en cours ───────────────────
edit(grid_item,
"""  // État local pour détecter si la vignette image/thumbnail a échoué.""",
"""  // Type de pointeur du geste EN COURS, relevé au premier contact.
  //
  // Une `ref` et non un état : cette valeur ne doit provoquer aucun rendu, et
  // elle est lue dans le gestionnaire de clic qui suit immédiatement.
  //
  // On l'interroge à chaque geste plutôt que de détecter une fois pour toutes
  // « est-ce un mobile ». Un portable tactile a les deux périphériques, et
  // l'utilisateur alterne : la seule réponse juste est celle du geste courant.
  const pointerTypeRef = useRef<string>("mouse");

  // État local pour détecter si la vignette image/thumbnail a échoué.""")

# ── 3/3 au doigt, un tap simple ouvre ─────────────────────────────────────
edit(grid_item,
"""      <div
        draggable={!isStatus}
        onClick={(e) => {
          // Avale le click parasite qui suit immédiatement un longpress
          // (cf. doc dans useLongPress.ts). Sans ce skip, le toggle dans
          // le handler `onClick` du parent défait la sélection que le
          // longpress vient juste d'ajouter.
          if (longPress.consumeJustFired()) return;
          e.stopPropagation();
          onClick(e);
        }}""",
"""      <div
        draggable={!isStatus}
        onPointerDown={(e) => {
          pointerTypeRef.current = e.pointerType;
        }}
        onClick={(e) => {
          // Avale le click parasite qui suit immédiatement un longpress
          // (cf. doc dans useLongPress.ts). Sans ce skip, le toggle dans
          // le handler `onClick` du parent défait la sélection que le
          // longpress vient juste d'ajouter.
          if (longPress.consumeJustFired()) return;
          e.stopPropagation();

          // ─── Tap simple = ouvrir, au DOIGT seulement ─────────────────
          //
          // Ouvrir demandait un double-clic, geste que le navigateur capte
          // souvent comme un zoom sur écran tactile et qu'aucun gestionnaire
          // de fichiers mobile n'emploie : Fichiers, Drive et OneDrive
          // ouvrent tous au tap simple. Un dossier était donc pratiquement
          // impossible à ouvrir au doigt.
          //
          // Le critère est le PÉRIPHÉRIQUE, pas la largeur d'écran : un
          // portable tactile de 1440px mérite le tap simple, une fenêtre
          // étroite sur un poste à souris garde le double-clic.
          //
          // En sélection multiple, le tap coche — c'est tout l'objet du mode,
          // et ouvrir sous les doigts de quelqu'un qui coche serait hostile.
          if (
            pointerTypeRef.current !== "mouse" &&
            !multiSelectActive &&
            onDoubleClick
          ) {
            onDoubleClick();
            return;
          }

          onClick(e);
        }}""")
PY

echo "✓ gestes tactiles du finder posés"

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
git commit -m "feat(finder): gestes utilisables au doigt

Avant la mise en page, les ACTIONS : un finder bien dispose mais dont on
ne peut pas ouvrir un dossier ne sert a rien.

Ouvrir demandait un DOUBLE-CLIC. Sur ecran tactile, le double-tap est
souvent capte comme un zoom par le navigateur, et aucun gestionnaire de
fichiers mobile ne l'emploie — Fichiers, Drive et OneDrive ouvrent au
tap simple. Un dossier etait donc pratiquement impossible a ouvrir au
doigt.

Le critere retenu est le PERIPHERIQUE DE POINTAGE et non la largeur
d'ecran. Deux axes a ne pas confondre : la mise en page depend de la
largeur (media/container queries), les gestes dependent du pointeur
(event.pointerType). Un portable tactile de 1440px merite le tap
simple ; une fenetre etroite sur un poste a souris garde le
double-clic. pointerType est lu sur l'evenement lui-meme, donc pour CE
geste : un utilisateur qui alterne pave et ecran tactile obtient a
chaque fois le bon comportement, ce qu'aucune detection globale « est-ce
un mobile » ne sait faire.

L'appui long passe de 1500 a 500ms. iOS declenche vers 500, Android
entre 400 et 500 : a 1500 l'usager a relache bien avant et conclut que
le geste n'existe pas.

En selection multiple le tap coche toujours — c'est l'objet du mode, et
ouvrir sous les doigts de quelqu'un qui coche serait hostile."

echo "✓ commité"
git log -1 --oneline