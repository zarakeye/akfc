#!/usr/bin/env bash
#
# AKFC — FLIP inc 4 : libellés FR des racines + clés de fichier lisibles.
#
# 1) ensureRootFolders : pose les FolderLabel FR aux racines EN
#      seminars                    → « Stages »
#      events                      → « Événements »
#      personal-spaces             → « Espaces personnels »
#      collaborative-group-spaces  → « Espaces de groupes collaboratifs »
#    (bin « Corbeille » et common-repository « Dépôt commun » déjà posés ;
#     courses « Cours » via ensureCategoryFolderLabels.)
# 2) buildUploadFileName : `_` (et séparateurs) → `-` au lieu d'être SUPPRIMÉS
#    par slugify strict (qui collait les tokens). Clés lisibles, parité upload.
#
# Périmètre : BACKEND. Pur code + upserts de libellé au boot. Un typecheck.
# Usage : bash apply-flip-4-root-labels-filenames.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
GUARD="packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts"
if grep -q 'Espaces personnels' "$GUARD" 2>/dev/null; then
  echo "— déjà appliqué (Espaces personnels présent)"; exit 0
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib

ROOTS = "packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts"
BUILD = "packages/backend/src/modules/storage/services/buildUploadFileName.service.ts"

EDITS = [
  # 1) Libellés FR des autres racines, juste avant le return.
  (ROOTS,
   "  return { created, total: ROOT_FOLDER_STATUSES.length };",
   "  // Libellés FR des autres racines : chemins EN, affichage humain via\n"
   "  // FolderLabel (forcés → auto-cicatrisation, comme bin/common-repository).\n"
   "  const ROOT_LABELS: Array<{ segment: string; label: string }> = [\n"
   "    { segment: \"personal-spaces\", label: \"Espaces personnels\" },\n"
   "    { segment: \"collaborative-group-spaces\", label: \"Espaces de groupes collaboratifs\" },\n"
   "    { segment: \"seminars\", label: \"Stages\" },\n"
   "    { segment: \"events\", label: \"Événements\" },\n"
   "  ];\n"
   "  for (const { segment, label } of ROOT_LABELS) {\n"
   "    const path = `${appRoot}/${segment}`;\n"
   "    await prisma.folderLabel.upsert({\n"
   "      where: { path },\n"
   "      update: { displayName: label },\n"
   "      create: { path, displayName: label },\n"
   "    });\n"
   "  }\n\n"
   "  return { created, total: ROOT_FOLDER_STATUSES.length };", 1),

  # 2) buildUploadFileName : underscores/séparateurs → tirets.
  (BUILD,
   "  const safeBase =\n"
   "    slugify(baseName, { lower: true, strict: true }) || 'fichier';",
   "  // Underscores et séparateurs → tirets AVANT slugify (sinon strict les\n"
   "  // SUPPRIME et colle les tokens : baccalaureat_stephane → baccalaureatstephane).\n"
   "  const safeBase =\n"
   "    slugify(baseName.replace(/_+/g, ' '), { lower: true, strict: true }) ||\n"
   "    'fichier';", 1),
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
print("Inc 4 appliqué.")
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
if git commit -m "feat(finder): libellés FR des racines EN + clés de fichier lisibles (_ -> -)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi