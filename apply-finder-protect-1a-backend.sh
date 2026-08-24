#!/usr/bin/env bash
#
# AKFC — Sécurisation finder — INCRÉMENT 1a : gate BACKEND (entités à préfixe fixe).
#
# Empêche la suppression (trashToBin) des dossiers adossés à une ENTITÉ à
# préfixe fixe : espaces de GROUPE (groups/<slug>-<cuid>), espaces PERSO
# (persos/<slug>-<cuid>), dossiers AVATAR (avatars/<userId>), et les conteneurs
# groups / persos / avatars. Leur suppression ne doit passer QUE par le
# gestionnaire de l'entité (chantier suivant). Les FICHIERS à l'intérieur
# restent supprimables.
#
# NB : disciplines/catégories (slug dynamique) = gate DB-aware, incrément 1c.
# Ce gate BACKEND est la vraie protection (couvre menu, bouton ET DnD-corbeille).
# L'UX front (masquer « Supprimer ») = incrément 1b.
#
# Crée protectedEntityFolder.ts + garde dans trashToBin.service.
# Usage : bash apply-finder-protect-1a-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-finder-protect-1a-backend.sh   (clone)
#
set -euo pipefail
HELPER="packages/backend/src/modules/storage/protectedEntityFolder.ts"
SVC="packages/backend/src/modules/trash/services/trashToBin.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$SVC" ] || { echo "ERREUR: $SVC introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

cat > "$HELPER" <<'TS'
/**
 * Dossiers adossés à une ENTITÉ, non supprimables depuis le finder — détection
 * par MOTIF DE CHEMIN (préfixe fixe, aucune query). Leur cycle de vie est celui
 * de leur entité : on ne les supprime que via le gestionnaire correspondant.
 *
 *   - conteneurs : `${appRoot}/groups`, `${appRoot}/persos`, `${appRoot}/avatars`
 *   - espace de GROUPE : `${appRoot}/groups/<slug>-<cuid>`
 *   - espace PERSO     : `${appRoot}/persos/<slug>-<cuid>`
 *   - dossier AVATAR   : `${appRoot}/avatars/<userId>`
 *
 * ⚠️ Les disciplines/catégories ont un slug DYNAMIQUE (`<catégorie>/<discipline>`)
 * → leur protection est DB-aware et vit ailleurs (incrément 1c). Ce module ne
 * couvre QUE les entités à préfixe fixe.
 */
const GROUPS_CONTAINER = /^[^/]+\/groups$/;
const PERSOS_CONTAINER = /^[^/]+\/persos$/;
const AVATARS_CONTAINER = /^[^/]+\/avatars$/;
const GROUP_SPACE = /\/groups\/[^/]+-c[a-z0-9]{24}$/;
const PERSO_SPACE = /\/persos\/[^/]+-c[a-z0-9]{24}$/;
const AVATAR_FOLDER = /\/avatars\/[^/]+$/;

/** True si `path` désigne un dossier-entité à préfixe fixe (protégé). */
export function isProtectedEntityFolderPath(path: string): boolean {
  return (
    GROUPS_CONTAINER.test(path) ||
    PERSOS_CONTAINER.test(path) ||
    AVATARS_CONTAINER.test(path) ||
    GROUP_SPACE.test(path) ||
    PERSO_SPACE.test(path) ||
    AVATAR_FOLDER.test(path)
  );
}
TS
echo "créé : $HELPER"

python3 - "$SVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isProtectedEntityFolderPath" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# import du helper (après l'import stable invalidateResourcesCache)
s = sub(
'import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";\n',
'import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";\n'
'import { isProtectedEntityFolderPath } from "@backend/modules/storage/protectedEntityFolder";\n',
"import helper")

# garde après normalizeSources, avant la boucle
s = sub(
'  const sources = await normalizeSources({ prisma, input });\n'
'\n'
'  const results: TrashEntryDTO[] = [];\n',
'  const sources = await normalizeSources({ prisma, input });\n'
'\n'
'  // 🔒 Protection : les dossiers adossés à une ENTITÉ (espaces de groupe/perso,\n'
'  // avatars, et les conteneurs groups/persos/avatars) ne se suppriment PAS\n'
'  // depuis le finder — uniquement via le gestionnaire de l\'entité. On refuse\n'
'  // AVANT tout déplacement (rien n\'est déplacé si un seul est protégé).\n'
'  for (const source of sources) {\n'
'    if (\n'
'      source.kind === "folder" &&\n'
'      isProtectedEntityFolderPath(normalizePath(source.fullPath))\n'
'    ) {\n'
'      throw new Error(\n'
'        `Dossier protégé : « ${lastSegment(normalizePath(source.fullPath))} » est géré par une entité (groupe, espace perso, avatars) et ne peut pas être supprimé depuis le finder. Supprimez l\'entité correspondante dans son gestionnaire.`,\n'
'      );\n'
'    }\n'
'  }\n'
'\n'
'  const results: TrashEntryDTO[] = [];\n',
"garde entité")

p.write_text(s, encoding="utf-8")
print("garde entité posée dans trashToBin")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(finder): protège les dossiers-entités à préfixe fixe de la suppression (incrément 1a backend)" && echo "commit $(git rev-parse --short HEAD)"