#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 2a : façade média (déplacement + passthrough).
#
# On prépare l'abstraction sans toucher aux ~25 consommateurs :
#   1. `git mv` du service Cloudinary tel quel → backends/cloudinaryBackend.ts
#      (contenu + historique préservés, imports en alias @backend/… intacts) ;
#   2. nouvelle façade `services/cloudinary.service.ts` qui re-exporte TOUT le
#      backend Cloudinary → les consommateurs importent exactement les mêmes noms
#      depuis le même chemin. Passthrough pur = ZÉRO changement de comportement.
#
# La sélection STORAGE_DRIVER + l'interface MediaBackend arrivent en Phase 2b ;
# le backend local en Phase 3.
#
# Backend seul, typecheck backend.
#
# Usage : bash sandbox-phase2a-facade.sh
#         AKFC_APPLY_ONLY=1 bash sandbox-phase2a-facade.sh   (clone)
#
set -euo pipefail

DIR="packages/backend/src/modules/cloudinary"
SVC="$DIR/services/cloudinary.service.ts"
BACKENDS="$DIR/backends"
BACKEND_FILE="$BACKENDS/cloudinaryBackend.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SVC" ]         || { echo "ERREUR: $SVC introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

if [ -f "$BACKEND_FILE" ]; then
  echo "cloudinaryBackend.ts existe déjà — Phase 2a déjà appliquée ?"; exit 1
fi

# ── 1. Déplacement (git mv préserve contenu + historique) ────────────────────
mkdir -p "$BACKENDS"
git mv "$SVC" "$BACKEND_FILE"
echo "déplacé : services/cloudinary.service.ts → backends/cloudinaryBackend.ts"

# ── 2. Nouvelle façade passthrough ───────────────────────────────────────────
cat > "$SVC" <<'TS'
/**
 * Façade média — point d'import unique des ~25 consommateurs.
 *
 * Phase 2a : passthrough pur vers le backend Cloudinary (le service historique,
 * déplacé dans `backends/cloudinaryBackend.ts`). Aucun changement de
 * comportement. En Phase 2b, ce fichier deviendra un SÉLECTEUR qui re-exporte
 * soit le backend Cloudinary soit un backend local, selon `STORAGE_DRIVER` —
 * sans que les consommateurs changent quoi que ce soit.
 */
export * from "@backend/modules/cloudinary/backends/cloudinaryBackend";
TS
echo "façade créée : services/cloudinary.service.ts (re-exporte cloudinaryBackend)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(media): phase 2a — façade cloudinary.service passthrough vers cloudinaryBackend" \
  && echo "commit $(git rev-parse --short HEAD)"