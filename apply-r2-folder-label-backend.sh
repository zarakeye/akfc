#!/usr/bin/env bash
#
# AKFC — Découplage nom/libellé, R2 : modèle `FolderLabel` + query + mutation.
#
# But : un dossier a un NOM PHYSIQUE immuable (identité de stockage) et un
# DISPLAYNAME éditable rangé à côté. Même principe que SiteSettings et que le
# nom de groupe : on ne touche jamais au chemin, on édite un libellé.
#
# CE QUE FAIT R2 (backend seul, rien de branché encore) :
#   1. prisma/schema.prisma        — modèle `FolderLabel { path @id, displayName }`.
#   2. migration 20261024000000     — CREATE TABLE (table neuve, pas de corvée owner).
#   3. storage router               — `folderLabels` (liste des libellés) +
#                                     `setFolderLabel{path, displayName}` (upsert ;
#                                     displayName vide = suppression → retour au repli).
#
# La clé est le chemin canonique (ex. "AKFC/groups", "AKFC/groups/<slug>-<cuid>").
# R3 fera la résolution dans le listing (FolderLabel > nom de groupe > repli),
# R4 câblera « Renommer » d'un dossier-entité sur setFolderLabel.
#
# NOTE perm : `setFolderLabel` est protectedProcedure (comme rename/move). Si tu
# veux le réserver aux ADMIN (assertAdmin), dis-le — durcissement d'une ligne.
#
# APRÈS application : le script lance `prisma generate` (hors APPLY_ONLY) ; toi
# ensuite `pnpm prisma migrate deploy` (local PUIS serveur).
#
# Usage : bash apply-r2-folder-label-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-r2-folder-label-backend.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/storage/router.ts"
MIG_DIR="prisma/migrations/20261024000000_folder_label"
MIG="$MIG_DIR/migration.sql"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SCHEMA" ]      || { echo "ERREUR: $SCHEMA introuvable." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Modèle Prisma (inséré après SiteSettings) ────────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "model FolderLabel" in s:
    print("déjà présent (FolderLabel)"); sys.exit(0)

# ancre : fin du modèle SiteSettings (posé à l'inc. site-settings-1)
anchor = (
    "  logoAssetId   String?\n"
    "  updatedAt     DateTime @updatedAt\n"
    "}\n"
)
assert s.count(anchor) == 1, "ancre fin de SiteSettings introuvable/multiple"
model = (
    "\n"
    "/// Libellé d'AFFICHAGE d'un dossier du finder, découplé du chemin physique.\n"
    "/// Clé = chemin canonique (ex. \"AKFC/groups\", \"AKFC/groups/<slug>-<cuid>\").\n"
    "/// Permet de « renommer » un dossier — y compris les dossiers-entité — sans\n"
    "/// toucher au stockage : on édite ce libellé, le chemin reste l'identité.\n"
    "model FolderLabel {\n"
    "  path        String   @id\n"
    "  displayName String\n"
    "  updatedAt   DateTime @updatedAt\n"
    "}\n"
)
s = s.replace(anchor, anchor + model)
p.write_text(s, encoding="utf-8")
print("schema patché (FolderLabel)")
PY

# ── 2. Migration ─────────────────────────────────────────────────────────────
mkdir -p "$MIG_DIR"
cat > "$MIG" <<'SQL'
-- CreateTable
CREATE TABLE "FolderLabel" (
    "path" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FolderLabel_pkey" PRIMARY KEY ("path")
);
SQL
echo "écrit  $MIG"

# ── 3. Procédures router (insérées avant getNode) ───────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "setFolderLabel" in s:
    print("router déjà doté (folderLabels/setFolderLabel)"); sys.exit(0)

anchor = "  getNode: protectedProcedure\n"
assert s.count(anchor) == 1, "ancre getNode introuvable/multiple"
procs = (
    "  // Libellés d'affichage des dossiers (découplés du chemin physique).\n"
    "  folderLabels: protectedProcedure.query(({ ctx }) =>\n"
    "    ctx.prisma.folderLabel.findMany({\n"
    "      select: { path: true, displayName: true },\n"
    "    }),\n"
    "  ),\n"
    "\n"
    "  setFolderLabel: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        path: z.string().min(1),\n"
    "        displayName: z.string().trim().max(255),\n"
    "      }),\n"
    "    )\n"
    "    .mutation(async ({ ctx, input }) => {\n"
    "      const name = input.displayName.trim();\n"
    "      // Libellé vide = on retire l'override (retour au repli du listing).\n"
    "      if (name === \"\") {\n"
    "        await ctx.prisma.folderLabel.deleteMany({ where: { path: input.path } });\n"
    "        return { path: input.path, displayName: null as string | null };\n"
    "      }\n"
    "      const row = await ctx.prisma.folderLabel.upsert({\n"
    "        where: { path: input.path },\n"
    "        create: { path: input.path, displayName: name },\n"
    "        update: { displayName: name },\n"
    "      });\n"
    "      return { path: row.path, displayName: row.displayName as string | null };\n"
    "    }),\n"
    "\n"
)
s = s.replace(anchor, procs + anchor)
p.write_text(s, encoding="utf-8")
print("router doté (folderLabels + setFolderLabel)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de generate/typecheck/commit"; exit 0
fi

echo "prisma generate…"
if ! pnpm prisma generate > /tmp/akfc_gen.log 2>&1; then
  echo "generate KO :"; tail -8 /tmp/akfc_gen.log; exit 1
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(storage): modèle FolderLabel + folderLabels/setFolderLabel (libellé de dossier éditable, découplé du chemin)" \
  && echo "commit $(git rev-parse --short HEAD)"

echo
echo "⚠️  Ensuite : pnpm prisma migrate deploy (local PUIS serveur)."