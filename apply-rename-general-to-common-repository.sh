#!/usr/bin/env bash
#
# AKFC — Dépôt commun, RENOMMAGE 1 : `general` → `common_repository`.
#
# Renommage RÉEL et coordonné du chemin/kind/fonctions, interne cohérent avec le
# visuel « Dépôt commun ». Le champ `folder` → `containerName` et la logique de
# nommage (cuid-user / intitulé / libellé métadonnée) = PASSE 2, séparée.
#
# Points touchés :
#   - contracts/upload.schema.ts        : z.literal("general") → "common_repository"
#   - storage/router.ts                 : littéral inline, generalRoot,
#                                         generalPending, kind "general", import +
#                                         query listGeneralFolders
#   - media/services/resolvePendingUploadFolder : les 2 chemins ${appRoot}/general
#   - media/services/listGeneralFolders → renommé listCommonRepositoryFolders
#                                         (fichier + fonction + chemin + contains)
#   - storage/adapters/r2/r2StorageAdapter : case "general"
#   - front DragNDropForm               : littéral kind + query
#
# Chaque ancre est protégée (assert count==1). Le kind Zod traverse contracts →
# back → front : le typecheck final PROUVE la cohérence (un oubli = ça ne compile
# pas). Typecheck backend + web.
#
# NB : aucune donnée à migrer (general vidé/supprimé en dev). Les commentaires/
# schémas ASCII (statusFoldingReadView, enrichStatus) sont cosmétiques → laissés
# tels quels, hors périmètre fonctionnel.
#
# Usage : bash apply-rename-general-to-common-repository.sh
#         AKFC_APPLY_ONLY=1 bash apply-rename-general-to-common-repository.sh   (clone)
#
set -euo pipefail

CONTRACT="packages/contracts/src/cloudinary/upload.schema.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"
RESOLVE="packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
LISTSVC="packages/backend/src/modules/media/services/listGeneralFolders.service.ts"
LISTSVC_NEW="packages/backend/src/modules/media/services/listCommonRepositoryFolders.service.ts"
R2="packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
FRONT="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$CONTRACT" "$ROUTER" "$RESOLVE" "$LISTSVC" "$R2" "$FRONT"; do
  [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. contract : le littéral kind ───────────────────────────────────────────
python3 - "$CONTRACT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = 'kind: z.literal("general"),'
new = 'kind: z.literal("common_repository"),'
if new in s: print("— contract déjà renommé"); sys.exit(0)
assert s.count(old) == 1, "ancre kind literal (contract) introuvable/multiple"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ contract : kind common_repository")
PY

# ── 2. resolvePendingUploadFolder : les 2 chemins + le test kind ─────────────
python3 - "$RESOLVE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
edits = [
    ('if (destination.kind === "general") {', 'if (destination.kind === "common_repository") {'),
    ('return `${appRoot}/general`;', 'return `${appRoot}/common_repository`;'),
    ('return `${appRoot}/general/${folderSlug}`;', 'return `${appRoot}/common_repository/${folderSlug}`;'),
]
for old, new in edits:
    if new in s and old not in s: continue
    assert s.count(old) == 1, f"ancre resolve introuvable : {old[:40]}"
    s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ resolvePendingUploadFolder : chemins common_repository")
PY

# ── 3. listGeneralFolders → listCommonRepositoryFolders (fichier + contenu) ──
python3 - "$LISTSVC" "$LISTSVC_NEW" <<'PY'
import sys, pathlib
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
s = src.read_text(encoding="utf-8")
s = s.replace("listGeneralFolders", "listCommonRepositoryFolders")
s = s.replace('fullPath: { contains: "/general/" },', 'fullPath: { contains: "/common_repository/" },')
s = s.replace('`${appRoot}/general`', '`${appRoot}/common_repository`')
dst.write_text(s, encoding="utf-8")
print("✓ service renommé →", dst.name)
PY
git mv "$LISTSVC" "$LISTSVC.__removed" 2>/dev/null || rm -f "$LISTSVC"
rm -f "$LISTSVC.__removed" 2>/dev/null || true
echo "  (ancien listGeneralFolders.service.ts supprimé)"

# ── 4. storage/router : import, query, generalRoot, generalPending, kind ─────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

edits = [
    # import du service (chemin + nom)
    ('import { listGeneralFolders } from "@backend/modules/media/services/listGeneralFolders.service";',
     'import { listCommonRepositoryFolders } from "@backend/modules/media/services/listCommonRepositoryFolders.service";'),
    # littéral kind inline (destination schema du router)
    ("kind: z.literal('general'),", "kind: z.literal('common_repository'),"),
    # compteur : nom de variable + condition + retour
    ("const [pending, bin, generalPending, persoCounts] = await Promise.all([",
     "const [pending, bin, commonRepositoryPending, persoCounts] = await Promise.all(["),
    ('fullPath: { contains: "/general/" },', 'fullPath: { contains: "/common_repository/" },'),
    ("      generalPending,\n", "      commonRepositoryPending,\n"),
    # racine + kind du finder
    ("const generalRoot = `${ctx.appRoot}/general`;", "const commonRepositoryRoot = `${ctx.appRoot}/common_repository`;"),
    ('let kind: "general" | "perso" | "folder" = "folder";', 'let kind: "common_repository" | "perso" | "folder" = "folder";'),
    ("if (path === generalRoot || path.startsWith(`${generalRoot}/`)) {",
     "if (path === commonRepositoryRoot || path.startsWith(`${commonRepositoryRoot}/`)) {"),
    ('        kind = "general";', '        kind = "common_repository";'),
    # la query
    ("  listGeneralFolders: protectedProcedure.query(async ({ ctx }) => {\n    return listGeneralFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });",
     "  listCommonRepositoryFolders: protectedProcedure.query(async ({ ctx }) => {\n    return listCommonRepositoryFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });"),
]
for old, new in edits:
    if new in s and old not in s: continue
    assert s.count(old) == 1, f"ancre router introuvable : {old[:45]}"
    s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ storage/router : renommé")
PY

# ── 5. r2StorageAdapter : le case ────────────────────────────────────────────
python3 - "$R2" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = 'case "general":'
new = 'case "common_repository":'
if new in s and old not in s: print("— r2 déjà renommé"); sys.exit(0)
assert s.count(old) == 1, "ancre case general (r2) introuvable"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ r2StorageAdapter : case common_repository")
PY

# ── 6. front DragNDropForm : littéral kind + query ───────────────────────────
python3 - "$FRONT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
edits = [
    ("destinationKind: z.literal('general'),", "destinationKind: z.literal('common_repository'),"),
    ("destinationKind === 'general'", "destinationKind === 'common_repository'"),
    ("setValue('destinationKind', 'general')", "setValue('destinationKind', 'common_repository')"),
    ("kind: 'general';", "kind: 'common_repository';"),
    ("{ kind: 'general', folder:", "{ kind: 'common_repository', folder:"),
    ("trpc.storage.listGeneralFolders", "trpc.storage.listCommonRepositoryFolders"),
]
for old, new in edits:
    if old not in s:
        if new in s: continue
        print(f"!! ancre front absente (à vérifier) : {old[:45]}"); continue
    assert s.count(old) == 1, f"ancre front multiple : {old[:45]}"
    s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ front : littéral + query renommés")
PY

# garde-fou : plus de `general` fonctionnel résiduel (hors commentaires/ASCII)
echo "--- résidus 'general' (hors commentaires — à inspecter) ---"
grep -rn "general" "$CONTRACT" "$ROUTER" "$RESOLVE" "$R2" "$FRONT" "$LISTSVC_NEW" 2>/dev/null \
  | grep -vE '^\s*[0-9]+:\s*(//|\*|/\*)' | grep -iE 'literal|general[A-Z]|/general|kind = |=== .general|listGeneral' || echo "  (aucun résidu fonctionnel)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Cannot find|general" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Cannot find|general" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(storage): renomme 'general' → 'common_repository' (Dépôt commun)" \
  && echo "commit $(git rev-parse --short HEAD)"