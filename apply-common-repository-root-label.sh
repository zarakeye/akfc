#!/usr/bin/env bash
#
# AKFC — « Dépôt commun » : libellé racine fixe + protection anti-rename.
#
# Ton intention (affichée depuis longtemps) : montrer « Dépôt commun » au lieu de
# « common_repository » dans le finder. La bonne façon = un FolderLabel sur le
# path racine (le path reste intact, seul l'affichage change), garanti au boot.
# Et on protège cette racine du rename physique (le trou qui a tout cassé).
#
#   - ensureRootFolders : upsert FolderLabel[${appRoot}/common_repository] =
#     « Dépôt commun », FORCÉ (auto-cicatrisation à chaque boot/seed).
#   - isRootFolder : `common_repository` devient une racine immuable
#     (assertRootFolder bloque rename/suppression, comme `bin`).
#
# ensureRootFolders tourne au boot (instrumentation) ET au seed → à l'épreuve des
# resets sandbox. Backend seul, typecheck backend + web.
#
# Usage : bash apply-common-repository-root-label.sh
#         AKFC_APPLY_ONLY=1 bash apply-common-repository-root-label.sh   (clone)
#
set -euo pipefail

F="packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts"

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

# 1. upsert du libellé racine, avant le return de ensureRootFolders
anchor = (
    "    created += 1;\n"
    "  }\n"
    "\n"
    "  return { created, total: ROOT_FOLDER_STATUSES.length };\n"
)
if "Dépôt commun" not in s:
    assert anchor in s, "ancre fin de boucle ensureRootFolders introuvable"
    inject = (
        "    created += 1;\n"
        "  }\n"
        "\n"
        "  // Libellé humain FIXE du Dépôt commun : le path reste\n"
        "  // `${appRoot}/common_repository` (racine structurelle), seul l'affichage\n"
        "  // change (le finder lit FolderLabel[path]). Forcé → auto-cicatrisation.\n"
        "  await prisma.folderLabel.upsert({\n"
        "    where: { path: `${appRoot}/common_repository` },\n"
        '    update: { displayName: "Dépôt commun" },\n'
        '    create: { path: `${appRoot}/common_repository`, displayName: "Dépôt commun" },\n'
        "  });\n"
        "\n"
        "  return { created, total: ROOT_FOLDER_STATUSES.length };\n"
    )
    s = s.replace(anchor, inject)
    print("✓ ensureRootFolders : libellé « Dépôt commun » garanti au boot")
else:
    print("— libellé déjà présent")

# 2. protéger common_repository dans isRootFolder
guard_old = (
    "  if (normalized === appRoot) return true;\n"
)
guard_new = (
    "  if (normalized === appRoot) return true;\n"
    "  // Racine structurelle du Dépôt commun : jamais renommable/supprimable\n"
    "  // (la renommer casserait resolver + query + finder + permissions).\n"
    "  if (normalized === `${appRoot}/common_repository`) return true;\n"
)
if "`${appRoot}/common_repository`) return true;" not in s:
    assert guard_old in s, "ancre isRootFolder (appRoot) introuvable"
    s = s.replace(guard_old, guard_new)
    print("✓ isRootFolder : common_repository protégé")
else:
    print("— isRootFolder déjà protégé")

p.write_text(s, encoding="utf-8")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|folderLabel|isRootFolder" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): libellé racine « Dépôt commun » (FolderLabel au boot) + racine protégée du rename" \
  && echo "commit $(git rev-parse --short HEAD)"

cat <<'EOF'

════════ APPLIQUER LE LIBELLÉ (dev local) ════════
Le libellé se pose au prochain BOOT de l'app (ensureRootFolders via
instrumentation). Redémarre ton `pnpm dev` local → le finder affichera
« Dépôt commun » sur le dossier racine.

Pour le poser TOUT DE SUITE sans redémarrer (optionnel) :
  docker exec -i akfc-postgres-1 psql -U akfc -d akfc_db -c \
    "INSERT INTO \"FolderLabel\" (path, \"displayName\", \"updatedAt\") \
     VALUES ('AKFC/common_repository', 'Dépôt commun', now()) \
     ON CONFLICT (path) DO UPDATE SET \"displayName\" = 'Dépôt commun', \"updatedAt\" = now();"
  (adapte 'AKFC' si ton APP_SHORT_NAME diffère)
EOF