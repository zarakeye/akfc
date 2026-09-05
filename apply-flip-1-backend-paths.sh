#!/usr/bin/env bash
#
# AKFC — FLIP slugs EN, INCRÉMENT 1 (BACKEND).
#
# Renomme les SEGMENTS PHYSIQUES de la couche stockage vers l'anglais :
#   persos            → personal-spaces
#   groups (stockage) → collaborative-group-spaces
#   common_repository → common-repository        (CHEMIN uniquement)
#   stages (upload)   → seminars
#
# NE TOUCHE PAS : les `kind` de l'union discriminée (`"common_repository"`,
# `"perso"`) — ce sont des tags de type internes, pas des chemins ; ni le
# domaine memberGroup (routeur groups, dashboard) ; ni la catégorie cours→courses
# (fait à l'incrément 3 via Category.slug) ; ni les FolderLabels/buildUploadFileName
# (incrément 4). Buckets déjà purgés → aucun binaire à déplacer, pur code.
#
# Périmètre : BACKEND uniquement. Un aller-retour = un typecheck.
#
# Usage : bash apply-flip-1-backend-paths.sh
#         AKFC_APPLY_ONLY=1 bash apply-flip-1-backend-paths.sh   (Claude sur clone)
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

GUARD="packages/backend/src/modules/media/services/resolveGroupBaseFolder.service.ts"
if grep -q 'collaborative-group-spaces' "$GUARD" 2>/dev/null; then
  echo "— déjà appliqué (collaborative-group-spaces présent)"; exit 0
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib

M = "packages/backend/src/modules"

# (relpath, old, new, expected_count).  Les lignes regex sont en r"..." pour que
# les \/ correspondent octet pour octet au fichier.
EDITS = [
  # ── resolvers de chemin ──
  (f"{M}/media/services/resolveGroupBaseFolder.service.ts",
   "  return `${appRoot}/groups/${groupSlug}-${groupId}`;",
   "  return `${appRoot}/collaborative-group-spaces/${groupSlug}-${groupId}`;", 1),

  (f"{M}/media/services/resolvePersoBaseFolder.service.ts",
   "  return `${appRoot}/persos/${personSlug}-${userId}`;",
   "  return `${appRoot}/personal-spaces/${personSlug}-${userId}`;", 1),

  (f"{M}/cloudinary/services/resolvePendingUploadFolder.service.ts",
   "    return `${appRoot}/stages/${stageSlug || `stage-${stage.id}`}`;",
   "    return `${appRoot}/seminars/${stageSlug || `stage-${stage.id}`}`;", 1),

  (f"{M}/media/services/commonRepositoryContainerPath.service.ts",
   "  return `${appRoot}/common_repository/${segment}`;",
   "  return `${appRoot}/common-repository/${segment}`;", 1),

  # ── requêtes / listings ──
  (f"{M}/media/services/countPersoImages.service.ts",
   '      fullPath: { contains: "/persos/" },',
   '      fullPath: { contains: "/personal-spaces/" },', 1),

  (f"{M}/media/services/listCommonRepositoryFolders.service.ts",
   '      fullPath: { contains: "/common_repository/" },',
   '      fullPath: { contains: "/common-repository/" },', 1),
  (f"{M}/media/services/listCommonRepositoryFolders.service.ts",
   "  const prefixes = physicalCandidates(`${appRoot}/common_repository`, appRoot).map(",
   "  const prefixes = physicalCandidates(`${appRoot}/common-repository`, appRoot).map(", 1),

  (f"{M}/media/services/listMyCommonRepositoryContainers.service.ts",
   '      fullPath: { contains: "/common_repository/" },',
   '      fullPath: { contains: "/common-repository/" },', 1),
  (f"{M}/media/services/listMyCommonRepositoryContainers.service.ts",
   "  const prefixes = physicalCandidates(`${appRoot}/common_repository`, appRoot).map(",
   "  const prefixes = physicalCandidates(`${appRoot}/common-repository`, appRoot).map(", 1),

  # ── racines / merge ──  (le token apparaît 4× : 1 commentaire + 3 usages)
  (f"{M}/cloudinary/services/ensureRootFolders.service.ts",
   "`${appRoot}/common_repository`",
   "`${appRoot}/common-repository`", 4),

  (f"{M}/storage/mergeGroupSpaceFolders.service.ts",
   "  const groupsPath = `${appRoot}/groups`;",
   "  const groupsPath = `${appRoot}/collaborative-group-spaces`;", 1),
  (f"{M}/storage/mergeGroupSpaceFolders.service.ts",
   "  const persosPath = `${appRoot}/persos`;",
   "  const persosPath = `${appRoot}/personal-spaces`;", 1),
  (f"{M}/storage/mergeGroupSpaceFolders.service.ts",
   "  const commonRepoPath = `${appRoot}/common_repository`;",
   "  const commonRepoPath = `${appRoot}/common-repository`;", 1),
  (f"{M}/storage/mergeGroupSpaceFolders.service.ts",
   'n.path.endsWith("/common_repository")',
   'n.path.endsWith("/common-repository")', 1),

  # ── routeur storage ──
  (f"{M}/storage/router.ts",
   '          fullPath: { contains: "/common_repository/" },',
   '          fullPath: { contains: "/common-repository/" },', 1),
  (f"{M}/storage/router.ts",
   "    const commonRepositoryRoot = `${ctx.appRoot}/common_repository`;",
   "    const commonRepositoryRoot = `${ctx.appRoot}/common-repository`;", 1),
  (f"{M}/storage/router.ts",
   "    const persosRoot = `${ctx.appRoot}/persos`;",
   "    const persosRoot = `${ctx.appRoot}/personal-spaces`;", 1),
  (f"{M}/storage/router.ts",
   "      if (input.path === `${ctx.appRoot}/groups`) {",
   "      if (input.path === `${ctx.appRoot}/collaborative-group-spaces`) {", 1),

  # ── regexes de détection (backend) ──
  (f"{M}/storage/protectedEntityFolder.ts",
   r"const GROUPS_CONTAINER = /^[^/]+\/groups$/;",
   r"const GROUPS_CONTAINER = /^[^/]+\/collaborative-group-spaces$/;", 1),
  (f"{M}/storage/protectedEntityFolder.ts",
   r"const PERSOS_CONTAINER = /^[^/]+\/persos$/;",
   r"const PERSOS_CONTAINER = /^[^/]+\/personal-spaces$/;", 1),
  (f"{M}/storage/protectedEntityFolder.ts",
   r"const COMMON_REPOSITORY_CONTAINER = /^[^/]+\/common_repository$/;",
   r"const COMMON_REPOSITORY_CONTAINER = /^[^/]+\/common-repository$/;", 1),
  (f"{M}/storage/protectedEntityFolder.ts",
   r"const GROUP_SPACE = /\/groups\/[^/]+-c[a-z0-9]{24}$/;",
   r"const GROUP_SPACE = /\/collaborative-group-spaces\/[^/]+-c[a-z0-9]{24}$/;", 1),
  (f"{M}/storage/protectedEntityFolder.ts",
   r"const PERSO_SPACE = /\/persos\/[^/]+-c[a-z0-9]{24}$/;",
   r"const PERSO_SPACE = /\/personal-spaces\/[^/]+-c[a-z0-9]{24}$/;", 1),

  (f"{M}/storage/applyGroupSpaceNames.service.ts",
   r"const GROUP_SPACE_RE = /\/groups\/[^/]+-(c[a-z0-9]{24})$/;",
   r"const GROUP_SPACE_RE = /\/collaborative-group-spaces\/[^/]+-(c[a-z0-9]{24})$/;", 1),
]

byfile = {}
for (p, o, n, c) in EDITS:
    byfile.setdefault(p, []).append((o, n, c))

for p, lst in byfile.items():
    fp = pathlib.Path(p)
    if not fp.exists():
        raise SystemExit(f"ERREUR: fichier introuvable : {p}")
    s = fp.read_text(encoding="utf-8")
    for (old, new, cnt) in lst:
        found = s.count(old)
        assert found == cnt, f"{p}: attendu {cnt}, trouvé {found} pour : {old[:70]!r}"
        s = s.replace(old, new)
    fp.write_text(s, encoding="utf-8")
    print(f"  ok  {p}  ({len(lst)} édition(s))")

print("Incrément 1 backend appliqué.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0
fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à committer"; exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "refactor(storage): chemins physiques EN — personal-spaces/collaborative-group-spaces/common-repository/seminars (backend)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi