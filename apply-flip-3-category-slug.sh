#!/usr/bin/env bash
#
# AKFC — FLIP inc 3 : slug physique EN des catégories (Cours → courses).
#
# Le dossier d'une catégorie = `${appRoot}/${slug(category.type)}` = `cours`.
# On veut `courses` (physique EN) tout en gardant « Cours » à l'affichage
# (FolderLabel). Comme il n'y a qu'UNE catégorie, on passe par un petit module
# d'override partagé — pas de colonne/migration (upgrade `Category.slug` possible
# plus tard, même patron que Stage.slug/Event.slug).
#
# Touche : nouveau categoryStorageSegment.ts + resolvePendingUploadFolder +
# ensureCategoryFolderLabels. Pur code, tsc seul.
#
# Périmètre : BACKEND. Un aller-retour = un typecheck.
# Usage : bash apply-flip-3-category-slug.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
NEW="packages/backend/src/modules/cloudinary/services/categoryStorageSegment.ts"
if [ -f "$NEW" ]; then echo "— déjà appliqué (categoryStorageSegment.ts existe)"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

cat > "$NEW" <<'EOF'
import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

/**
 * Segment de STOCKAGE physique d'une catégorie.
 *
 * Le physique doit être stable et anglais ; `Category.type` reste l'AFFICHAGE
 * (résolu en FolderLabel). Quand le `type` n'est pas déjà l'anglais voulu, on
 * mappe explicitement — ex. « Cours » → dossier `courses`. Sinon, slug du type.
 *
 * Source unique partagée par le résolveur d'upload, le semis de FolderLabel et
 * l'injection des racines visibles. À terme (si les catégories se multiplient),
 * remplacer par une colonne `Category.slug` — même patron que Stage.slug.
 */
const CATEGORY_PHYSICAL_SLUG: Record<string, string> = {
  Cours: "courses",
};

export function categoryStorageSegment(type: string): string {
  return CATEGORY_PHYSICAL_SLUG[type] ?? slugify(type, SLUG_OPTIONS);
}
EOF
echo "  créé  $NEW"

python3 - <<'PY'
import pathlib

RESOLVER = "packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
LABELS   = "packages/backend/src/modules/cloudinary/services/ensureCategoryFolderLabels.service.ts"

EDITS = [
  (RESOLVER,
   'import slugify from "slugify";',
   'import slugify from "slugify";\n'
   'import { categoryStorageSegment } from "@backend/modules/cloudinary/services/categoryStorageSegment";', 1),
  (RESOLVER,
   "  const categorySegment = slug(category.type);",
   "  const categorySegment = categoryStorageSegment(category.type);", 1),

  (LABELS,
   'import slugify from "slugify";',
   'import slugify from "slugify";\n'
   'import { categoryStorageSegment } from "@backend/modules/cloudinary/services/categoryStorageSegment";', 1),
  (LABELS,
   "    const path = `${appRoot}/${slugify(c.type, SLUG_OPTIONS)}`;",
   "    const path = `${appRoot}/${categoryStorageSegment(c.type)}`;", 1),
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
print("Inc 3 appliqué.")
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
if git commit -m "refactor(storage): slug physique EN des catégories (Cours -> courses), affichage via FolderLabel" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi