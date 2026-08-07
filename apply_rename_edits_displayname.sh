#!/usr/bin/env bash
#
# AKFC — Renommer un FICHIER édite displayName, pas la clé (increment 3).
#
# Aujourd'hui `storage.rename` fait un `adapter.move` même pour un fichier :
# il déplace le binaire chez le provider ET doit deviner l'extension de la
# source (le vieux bug « CNI ... (ep. BAZZE) »). Depuis la slugification
# (increment 1), la clé est un slug stable et opaque : renommer un fichier ne
# devrait plus être qu'un UPDATE de `MediaAsset.displayName`.
#
# Ce patch ajoute une branche FICHIER dans la mutation : match logique
# tolérant à l'extension (comme `media.updateDescription`), UPDATE displayName,
# retour immédiat — aucun move provider, aucune extension à deviner. Le
# renommage de DOSSIER garde l'ancien comportement (un dossier n'a pas de
# displayName, c'est un vrai segment de chemin). Le front est inchangé : il
# affiche déjà le nom humain (increment 2a) et recharge après la mutation.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-rename-edits-displayname.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-rename-edits-displayname.sh
#
set -euo pipefail

SVC="packages/backend/src/modules/storage/router.ts"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "data: { displayName: cleanName }" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

OLD = r'''      if (!parent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible de renommer un élément racine.",
        });
      }

      // Extension de la SOURCE, réappliquée telle quelle.'''

NEW = r'''      if (!parent) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible de renommer un élément racine.",
        });
      }

      // ─── FICHIER : on n'édite QUE le nom d'affichage ───────────────────
      //
      // Depuis la slugification (increment 1), la clé de stockage est un slug
      // stable et opaque. Renommer un fichier ne déplace donc plus rien chez
      // le provider et ne devine plus d'extension (fin du bug historique) :
      // c'est un simple UPDATE de `displayName`. Match logique tolérant à
      // l'extension, comme `media.updateDescription` (fullPath DB = path UI +
      // "." + format côté Cloudinary). Deux fichiers peuvent partager un nom
      // d'affichage : pas de contrôle de collision ici, la clé reste unique.
      if (input.type === "file") {
        const result = await ctx.prisma.mediaAsset.updateMany({
          where: {
            appRoot: ctx.appRoot,
            OR: [
              { fullPath: input.path },
              { fullPath: { startsWith: `${input.path}.` } },
            ],
          },
          data: { displayName: cleanName },
        });
        if (result.count === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Aucun média trouvé pour ce fichier.",
          });
        }
        return { success: true, path: input.path };
      }

      // Extension de la SOURCE, réappliquée telle quelle.'''

assert s.count(OLD) == 1, "ancre rename introuvable/multiple — abandon avant tout commit"
p.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("patch storage.rename OK (fichier → displayName ; dossier inchangé)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(finder): renommer un fichier édite displayName (clé slug stable, fin du bug de devinette d'extension) ; renommage dossier inchangé" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi