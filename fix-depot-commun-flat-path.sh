#!/usr/bin/env bash
#
# AKFC — Dépôt commun : chemin APLATI en un seul segment.
#
# Avant (2a) : common_repository/{prenom-nom-cuid}/{sujet}   (2 niveaux)
# Après      : common_repository/{slug(sujet)}_{slug(prenom-nom)}-{cuid}
#              (1 niveau — le sujet en tête, lisible sans déplier)
#   - sans sujet : common_repository/depot_{slug(prenom-nom)}-{cuid}
#
# Chaque partie est slugifiée séparément puis jointe par un `_` littéral (que
# slug() ne touche pas). Regroupement par (sujet + personne) conservé : deux
# dépôts au même sujet par la même personne → même dossier.
#
# Modif ciblée : la branche common_repository de resolvePendingUploadFolder.
# Backend seul, typecheck backend + web.
#
# Usage : bash fix-depot-commun-flat-path.sh
#         AKFC_APPLY_ONLY=1 bash fix-depot-commun-flat-path.sh   (clone)
#
set -euo pipefail

F="packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = (
    "    const base = `${appRoot}/common_repository/${personSlug}-${userId}`;\n"
    "\n"
    "    // Intitulé fourni → conteneur slugifié ; vide → conteneur horodaté unique.\n"
    "    const containerSlug = destination.containerName\n"
    "      ? slug(destination.containerName)\n"
    '      : "";\n'
    "    if (containerSlug) {\n"
    "      return `${base}/${containerSlug}`;\n"
    "    }\n"
    "    const stamp = new Date()\n"
    "      .toISOString()\n"
    '      .replace(/[:.]/g, "-")\n'
    '      .replace("T", "_")\n'
    "      .slice(0, 19);\n"
    "    return `${base}/depot-${stamp}`;\n"
)
new = (
    "    // Un SEUL segment : `{sujet}_{personne}-{cuid}` — le sujet en tête, lisible\n"
    "    // sans déplier. Regroupement par (sujet + personne) : deux dépôts au même\n"
    "    // sujet par la même personne retombent dans le même dossier. Sujet vide →\n"
    "    // fourre-tout `depot_{personne}-{cuid}`. Chaque partie slugifiée à part,\n"
    "    // jointe par un `_` littéral (préservé par slug()).\n"
    "    const person = `${personSlug}-${userId}`;\n"
    "    const subjectSlug = destination.containerName\n"
    "      ? slug(destination.containerName)\n"
    '      : "";\n'
    "    const segment = subjectSlug\n"
    "      ? `${subjectSlug}_${person}`\n"
    "      : `depot_${person}`;\n"
    "    return `${appRoot}/common_repository/${segment}`;\n"
)
if new.strip()[:30] in s and old not in s:
    print("— déjà aplati"); sys.exit(0)
assert old in s, "ancre branche common_repository (2a) introuvable — colle-moi le bloc actuel"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("resolvePendingUploadFolder : chemin aplati {sujet}_{personne}-{cuid}")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|personSlug|subjectSlug" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(depot-commun): chemin aplati {sujet}_{personne}-{cuid} (sujet lisible sans déplier)" \
  && echo "commit $(git rev-parse --short HEAD)"