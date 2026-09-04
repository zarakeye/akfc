#!/usr/bin/env bash
#
# AKFC — Dépôt commun, 2b-1-BIS : basculer le libellé vers FolderLabel (existant).
#
# 2b-1 avait créé une table CommonRepositoryLabel REDONDANTE (mon snapshot ne
# voyait pas FolderLabel, déjà présent ET déjà lu par le finder via
# applyGroupSpaceNamesToTree). On corrige :
#   - la mutation setCommonRepositoryLabel écrit dans `folderLabel` (displayName)
#   - listMyCommonRepositoryContainers lit `folderLabel` (displayName)
#   - le modèle CommonRepositoryLabel est retiré du schema + table DROP (vide)
#
# BONUS : 2b-2 (affichage finder) devient GRATUIT — le finder lit déjà
# FolderLabel[path]. Le libellé posé au dépôt s'affichera automatiquement sur le
# dossier conteneur, côté admin comme dans le picker.
#
# La mutation reste subject-based (front-friendly) ; setFolderLabel existant exige
# un path, moins pratique pour la page membre → on garde notre mutation.
#
# Backend seul + migration DROP. typecheck backend + web (après generate).
#
# Usage : bash apply-depot-commun-2b1-bis-folderlabel.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/storage/router.ts"
LISTSVC="packages/backend/src/modules/media/services/listMyCommonRepositoryContainers.service.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$SCHEMA" "$ROUTER" "$LISTSVC"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

# ── 1. schema : retirer le modèle redondant ─────────────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
block = (
    "model CommonRepositoryLabel {\n"
    "  // path physique du conteneur (ex. AKFC/common_repository/{sujet}_{personne}-{cuid})\n"
    "  path      String   @id\n"
    "  // libellé humain saisi par le déposant (accents/casse préservés)\n"
    "  label     String\n"
    "  updatedAt DateTime @updatedAt\n"
    "}\n"
)
if block in s:
    s = s.replace(block, "")
    # nettoie d'éventuelles lignes vides doubles laissées
    while "\n\n\n" in s:
        s = s.replace("\n\n\n", "\n\n")
    p.write_text(s.rstrip() + "\n", encoding="utf-8")
    print("✓ schema : CommonRepositoryLabel retiré")
else:
    print("— modèle déjà absent")
PY

# ── 2. router : mutation → folderLabel/displayName ──────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = (
    "      await ctx.prisma.commonRepositoryLabel.upsert({\n"
    "        where: { path },\n"
    "        update: { label: input.label },\n"
    "        create: { path, label: input.label },\n"
    "      });\n"
)
new = (
    "      await ctx.prisma.folderLabel.upsert({\n"
    "        where: { path },\n"
    "        update: { displayName: input.label },\n"
    "        create: { path, displayName: input.label },\n"
    "      });\n"
)
if new in s: print("— router déjà sur folderLabel")
else:
    assert old in s, "ancre upsert commonRepositoryLabel (router) introuvable"
    s = s.replace(old, new); p.write_text(s, encoding="utf-8")
    print("✓ router : setCommonRepositoryLabel → folderLabel")
PY

# ── 3. listSvc : lecture → folderLabel/displayName ──────────────────────────
python3 - "$LISTSVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = (
    "      const row = await prisma.commonRepositoryLabel.findUnique({\n"
    "        where: { path },\n"
    "        select: { label: true },\n"
    "      });\n"
    "      return { subject, label: row?.label };\n"
)
new = (
    "      const row = await prisma.folderLabel.findUnique({\n"
    "        where: { path },\n"
    "        select: { displayName: true },\n"
    "      });\n"
    "      return { subject, label: row?.displayName };\n"
)
if new in s: print("— listSvc déjà sur folderLabel")
else:
    assert old in s, "ancre findUnique commonRepositoryLabel (listSvc) introuvable"
    s = s.replace(old, new); p.write_text(s, encoding="utf-8")
    print("✓ listSvc : lecture folderLabel")
PY

# ── 4. migration DROP de la table redondante ─────────────────────────────────
MIGDIR="prisma/migrations/20261101130000_drop_common_repository_label"
mkdir -p "$MIGDIR"
cat > "$MIGDIR/migration.sql" <<'SQL'
DROP TABLE IF EXISTS "CommonRepositoryLabel";
SQL
echo "créé  $MIGDIR/migration.sql"

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "generate KO :"; tail -15 /tmp/akfc_gen.log; exit 1; }
echo "OK generate"

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|commonRepositoryLabel|folderLabel" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

cat <<'EOF'

════════ APPLIQUER LE DROP (table vide → sans risque) ════════
  docker exec -i $(docker ps -qf name=postgres | head -1) psql -U akfc -d akfc_db -c \
    'DROP TABLE IF EXISTS "CommonRepositoryLabel";'
  pnpm prisma migrate resolve --applied 20261101130000_drop_common_repository_label

Puis commit :
  git add -A && git commit -m "fix(depot-commun): 2b-1-bis — libellé via FolderLabel (existant), drop table redondante"

BONUS : le finder affiche déjà FolderLabel[path] (applyGroupSpaceNamesToTree) →
un dépôt avec intitulé montrera « stage bâton long » sur le dossier, côté admin
ET dans le select membre. 2b-2 = fait, gratuitement.
EOF