#!/usr/bin/env bash
#
# AKFC — « Renommer » sur une racine de CONTENU édite le FolderLabel (pas de
# rename physique). Sans reste : front (routage) ET back (garde + source unique).
#
# Problème : le backend `rename` refuse les dossiers-entité protégés, mais PAS
# les racines de catégorie/stages/events → elles tombaient dans le rename
# PHYSIQUE (déplacement de binaires + casse du lien catégorie↔dossier). Or leur
# nom d'affichage doit s'éditer via FolderLabel (chemin physique EN immuable).
#
# Fix (source unique = requiredRootPaths du Lot C) :
#   - back : export de requiredRootPaths ; `rename` refuse le rename physique de
#            ces racines ; query `storage.contentRootPaths` ;
#   - front : renameNode route ces racines vers setFolderLabel (comme les
#            conteneurs d'espace).
#
# PRÉREQUIS : Lot C (ensureContentRoots.service.ts). Périmètre : back + front.
# Usage : bash apply-finder-content-roots-rename-label.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
SVC="packages/backend/src/modules/storage/ensureContentRoots.service.ts"
[ -f "$SVC" ] || { echo "ERREUR: Lot C requis d'abord (ensureContentRoots.service.ts absent)." >&2; exit 1; }
if grep -q 'contentRootPaths: protectedProcedure' packages/backend/src/modules/storage/router.ts 2>/dev/null; then
  echo "— déjà appliqué (query contentRootPaths présente)"; exit 0
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib

SVC = "packages/backend/src/modules/storage/ensureContentRoots.service.ts"
ROUTER = "packages/backend/src/modules/storage/router.ts"
HOOK = "apps/web/src/features/finder-core/hooks/useNodeActions.ts"

EDITS = [
  # 1) Exporter requiredRootPaths (source unique).
  (SVC,
   "async function requiredRootPaths(",
   "export async function requiredRootPaths(", 1),

  # 2) Router : importer requiredRootPaths.
  (ROUTER,
   'import {\n'
   '  ensureContentRootsInTree,\n'
   '  missingContentRootFolders,\n'
   '} from "@backend/modules/storage/ensureContentRoots.service";',
   'import {\n'
   '  ensureContentRootsInTree,\n'
   '  missingContentRootFolders,\n'
   '  requiredRootPaths,\n'
   '} from "@backend/modules/storage/ensureContentRoots.service";', 1),

  # 3) Router rename : refuser le rename physique des racines de contenu.
  (ROUTER,
   '      if (input.type === "folder" && isProtectedEntityFolderPath(input.path)) {\n'
   '        throw new TRPCError({\n'
   '          code: "FORBIDDEN",\n'
   '          message: "Ce dossier système ne peut pas être renommé.",\n'
   '        });\n'
   '      }',
   '      if (input.type === "folder" && isProtectedEntityFolderPath(input.path)) {\n'
   '        throw new TRPCError({\n'
   '          code: "FORBIDDEN",\n'
   '          message: "Ce dossier système ne peut pas être renommé.",\n'
   '        });\n'
   '      }\n'
   '\n'
   '      // Racine de contenu (catégorie / stages / events / espaces / dépôt) :\n'
   '      // nom PHYSIQUE immuable aussi. Son « Renommer » édite le FolderLabel\n'
   '      // côté client ; un rename physique casserait le lien catégorie↔dossier\n'
   '      // et les gardes. Refusé ici (défense en profondeur).\n'
   '      if (input.type === "folder") {\n'
   '        const roots = await requiredRootPaths(ctx.prisma, ctx.appRoot);\n'
   '        if (roots.includes(input.path)) {\n'
   '          throw new TRPCError({\n'
   '            code: "FORBIDDEN",\n'
   '            message:\n'
   '              "Cette racine ne se renomme pas physiquement (libellé éditable).",\n'
   '          });\n'
   '        }\n'
   '      }', 1),

  # 4) Router : query contentRootPaths (pour le front).
  (ROUTER,
   '  folderLabels: protectedProcedure.query(({ ctx }) =>\n'
   '    ctx.prisma.folderLabel.findMany({\n'
   '      select: { path: true, displayName: true },\n'
   '    }),\n'
   '  ),',
   '  folderLabels: protectedProcedure.query(({ ctx }) =>\n'
   '    ctx.prisma.folderLabel.findMany({\n'
   '      select: { path: true, displayName: true },\n'
   '    }),\n'
   '  ),\n'
   '\n'
   '  // Racines de contenu (label-only) : le front y route « Renommer » vers\n'
   '  // l\'édition du FolderLabel plutôt que le rename physique.\n'
   '  contentRootPaths: protectedProcedure.query(({ ctx }) =>\n'
   '    requiredRootPaths(ctx.prisma, ctx.appRoot),\n'
   '  ),', 1),

  # 5) Front : query des racines de contenu.
  (HOOK,
   "  const renameMutation = trpc.storage.rename.useMutation();\n"
   "  const setFolderLabelMutation = trpc.storage.setFolderLabel.useMutation();",
   "  const renameMutation = trpc.storage.rename.useMutation();\n"
   "  const setFolderLabelMutation = trpc.storage.setFolderLabel.useMutation();\n"
   "  const { data: contentRootPaths } = trpc.storage.contentRootPaths.useQuery();", 1),

  # 6) Front : router les racines de contenu vers setFolderLabel.
  (HOOK,
   "      if (node.type === 'folder' && isProtectedEntityFolder(node.path)) {",
   "      if (\n"
   "        node.type === 'folder' &&\n"
   "        (isProtectedEntityFolder(node.path) ||\n"
   "          (contentRootPaths ?? []).includes(node.path))\n"
   "      ) {", 1),

  # 7) Front : dépendance du useCallback renameNode.
  (HOOK,
   "    [renameMutation, setFolderLabelMutation, reloadFolderContent],",
   "    [renameMutation, setFolderLabelMutation, reloadFolderContent, contentRootPaths],", 1),
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
        assert found == cnt, f"{p}: attendu {cnt}, trouvé {found} pour : {old[:55]!r}"
        s = s.replace(old, new)
    fp.write_text(s, encoding="utf-8")
    print(f"  ok  {p}  ({len(lst)} édition(s))")
print("Racines de contenu label-only appliqué.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "fix(finder): Renommer une racine de contenu édite le FolderLabel (plus de rename physique)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi