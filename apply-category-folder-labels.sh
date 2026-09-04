#!/usr/bin/env bash
#
# AKFC — Libellés d'affichage des dossiers de catégorie (Cours/Stage/Event).
#
# /cours, /stage, /event sont pilotés par la table Category : path = slug(type)
# (`cours`), nom canonique = Category.type (« Cours »). On n'a PAS besoin de les
# renommer — il suffit d'afficher Category.type. On pose donc un FolderLabel par
# catégorie AU BOOT (auto-cicatrisant), via un nouveau service appelé depuis
# instrumentation.ts.
#
# → /cours s'affiche « Cours », /stage « Stage », etc. Le rename physique (qui
#   échouait sur la casse) devient inutile.
#
# NB : « visibles même vides » (surtout /event, encore vide) + « non-supprimables »
# = passe data-aware suivante (les catégories sont dynamiques). Ce script ne fait
# QUE l'affichage.
#
# Nouveau fichier + edit instrumentation.ts (contenu réel connu). typecheck backend + web.
#
# Usage : bash apply-category-folder-labels.sh
#         AKFC_APPLY_ONLY=1 bash apply-category-folder-labels.sh   (clone)
#
set -euo pipefail

SVC="packages/backend/src/modules/cloudinary/services/ensureCategoryFolderLabels.service.ts"
INSTR="apps/web/instrumentation.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$INSTR" ]       || { echo "ERREUR: $INSTR introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Service (nouveau, aucun ancrage) ──────────────────────────────────────
cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

// Mêmes options que resolvePendingUploadFolder → le path colle à celui des uploads.
const SLUG_OPTIONS = { lower: true, strict: true } as const;

/**
 * Pose/rafraîchit le libellé d'affichage des dossiers de CATÉGORIE.
 *
 * Le path physique d'une catégorie est `${appRoot}/${slug(Category.type)}`
 * (ex. `cours`), mais son nom canonique est `Category.type` (« Cours »). On
 * pose un FolderLabel par catégorie → le finder affiche « Cours » au lieu de
 * « cours », sans renommage physique (qui échouerait sur la casse). Forcé à
 * chaque boot (auto-cicatrisant), comme les autres racines.
 */
export async function ensureCategoryFolderLabels(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ ensured: number }> {
  const categories = await prisma.category.findMany({ select: { type: true } });
  for (const c of categories) {
    const path = `${appRoot}/${slugify(c.type, SLUG_OPTIONS)}`;
    await prisma.folderLabel.upsert({
      where: { path },
      update: { displayName: c.type },
      create: { path, displayName: c.type },
    });
  }
  return { ensured: categories.length };
}
TS
echo "créé  $SVC"

# ── 2. instrumentation.ts : import + appel (ancré sur le contenu réel) ───────
python3 - "$INSTR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "ensureCategoryFolderLabels" in s:
    print("— instrumentation déjà patchée"); sys.exit(0)

# 2a. import dynamique, après celui de ensureAdminGroup
imp_anchor = (
    '  const { ensureAdminGroup } = await import(\n'
    '    "@backend/modules/memberGroups/ensureAdminGroup.service"\n'
    "  );\n"
)
assert imp_anchor in s, "ancre import ensureAdminGroup introuvable"
s = s.replace(
    imp_anchor,
    imp_anchor
    + "  const { ensureCategoryFolderLabels } = await import(\n"
    + '    "@backend/modules/cloudinary/services/ensureCategoryFolderLabels.service"\n'
    + "  );\n",
)

# 2b. try/catch d'appel, après le bloc ensureAdminGroup
call_anchor = (
    "  try {\n"
    "    await ensureAdminGroup(prisma, APP_ROOT);\n"
    "    console.log(\n"
    '      `[instrumentation] ensureAdminGroup: groupe Administrateurs garanti pour appRoot="${APP_ROOT}"`\n'
    "    );\n"
    "  } catch (err) {\n"
    "    console.error(\n"
    '      "[instrumentation] ensureAdminGroup failed — app will still start",\n'
    "      err\n"
    "    );\n"
    "  }\n"
)
assert call_anchor in s, "ancre bloc ensureAdminGroup introuvable"
s = s.replace(
    call_anchor,
    call_anchor
    + "\n"
    + "  try {\n"
    + "    const { ensured } = await ensureCategoryFolderLabels(prisma, APP_ROOT);\n"
    + "    console.log(\n"
    + '      `[instrumentation] ensureCategoryFolderLabels: ${ensured} libellé(s) de catégorie garanti(s) pour appRoot="${APP_ROOT}"`\n'
    + "    );\n"
    + "  } catch (err) {\n"
    + "    console.error(\n"
    + '      "[instrumentation] ensureCategoryFolderLabels failed — app will still start",\n'
    + "      err\n"
    + "    );\n"
    + "  }\n",
)
p.write_text(s, encoding="utf-8")
print("✓ instrumentation : ensureCategoryFolderLabels appelé au boot")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|ensureCategory|slugify|category" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|ensureCategory" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(finder): libellés d'affichage des catégories (Cours/Stage/Event) au boot" \
  && echo "commit $(git rev-parse --short HEAD)"

cat <<'EOF'

════════ APPLIQUER ════════
Redémarre `pnpm dev` → le boot pose les FolderLabel des catégories.
/cours s'affiche « Cours », /stage « Stage », /event « Event ».
Plus besoin de « Renommer » pour la casse.

Pose immédiate sans redémarrage (optionnel, adapte APP_ROOT/les types) :
  psql -U akfc -d akfc_db -c \
    "INSERT INTO \"FolderLabel\"(path,\"displayName\",\"updatedAt\") VALUES \
     ('AKFC/cours','Cours',now()),('AKFC/stage','Stage',now()),('AKFC/event','Event',now()) \
     ON CONFLICT (path) DO UPDATE SET \"displayName\"=EXCLUDED.\"displayName\", \"updatedAt\"=now();"
EOF