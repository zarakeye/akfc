#!/usr/bin/env bash
#
# AKFC — Corriger le tap sur dossier en vue GRILLE.
#
# Cause exacte : `handleClick` (parent) ouvre déjà un dossier au clic/tap
# simple (`setPath`) — c'est ce qu'appellent directement les vues tableau et
# liste, qui répondent donc au tap. Mais la grille interceptait le tap tactile
# pour appeler `onDoubleClick()`, lequel pointe sur `handleDoubleClick` qui
# fait `if (!multiSelectActive) return;`. Hors multi-sélection, le tap en
# grille appelait donc une fonction NO-OP → le dossier ne s'ouvrait pas.
#
# Correctif : la grille appelle `onClick` comme les deux autres vues. On retire
# le détour tactile devenu inutile, ainsi que `pointerTypeRef`, son
# `onPointerDown`, et l'import `useRef` (plus aucun autre usage).
# Le `onDoubleClick={onDoubleClick}` sur la div reste (navigation dans un
# dossier en cours de multi-sélection).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-finder-grid-tap-open.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-finder-grid-tap-open.sh
#
set -euo pipefail

SVC="apps/web/src/features/finder-core/components/GridItem.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "pointerTypeRef" not in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) import : retirer useRef ──────────────────────────────────────────────
I_OLD = '''import { JSX, useRef, useState } from 'react';'''
I_NEW = '''import { JSX, useState } from 'react';'''
assert s.count(I_OLD) == 1, "ancre import react introuvable/multiple — abandon"
s = s.replace(I_OLD, I_NEW)

# ── 2) commentaire + déclaration pointerTypeRef ─────────────────────────────
D_OLD = '''  // Type de pointeur du geste EN COURS, relevé au premier contact.
  //
  // Une `ref` et non un état : cette valeur ne doit provoquer aucun rendu, et
  // elle est lue dans le gestionnaire de clic qui suit immédiatement.
  //
  // On l'interroge à chaque geste plutôt que de détecter une fois pour toutes
  // « est-ce un mobile ». Un portable tactile a les deux périphériques, et
  // l'utilisateur alterne : la seule réponse juste est celle du geste courant.
  const pointerTypeRef = useRef<string>("mouse");

'''
assert s.count(D_OLD) == 1, "ancre declaration pointerTypeRef introuvable/multiple — abandon"
s = s.replace(D_OLD, "")

# ── 3) onPointerDown (ne servait qu'à alimenter la ref) ─────────────────────
P_OLD = '''        onPointerDown={(e) => {
          pointerTypeRef.current = e.pointerType;
        }}
'''
assert s.count(P_OLD) == 1, "ancre onPointerDown introuvable/multiple — abandon"
s = s.replace(P_OLD, "")

# ── 4) onClick : retirer le détour tactile, appeler onClick comme les autres ─
C_OLD = '''        onClick={(e) => {
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
        }}'''
C_NEW = '''        onClick={(e) => {
          // Avale le click parasite qui suit immédiatement un longpress
          // (cf. doc dans useLongPress.ts). Sans ce skip, le toggle dans
          // le handler `onClick` du parent défait la sélection que le
          // longpress vient juste d'ajouter.
          if (longPress.consumeJustFired()) return;
          e.stopPropagation();

          // Ouvrir un dossier = clic/tap simple, comme en tableau et liste :
          // `handleClick` (parent) fait déjà `setPath` sur un dossier. La
          // grille appelait avant `onDoubleClick()` sur tactile, qui pointe
          // sur `handleDoubleClick` (no-op hors multi-sélection) — d'où le
          // dossier qui ne s'ouvrait pas au doigt dans cette seule vue.
          onClick(e);
        }}'''
assert s.count(C_OLD) == 1, "ancre onClick grille introuvable/multiple — abandon"
s = s.replace(C_OLD, C_NEW)

p.write_text(s, encoding="utf-8")
print("patch GridItem OK (tap ouvre le dossier en grille)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "fix(finder): ouvrir un dossier au tap en vue grille (appelait un handler no-op hors multi-sélection)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi