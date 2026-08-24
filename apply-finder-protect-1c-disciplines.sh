#!/usr/bin/env bash
#
# AKFC — Sécurisation finder — INCRÉMENT 1c : disciplines/catégories (DB-aware).
#
# Empêche la suppression (trashToBin) des CONTENEURS de catégorie
# (`${appRoot}/<slug(category.type)>`), de leur sous-conteneur `new/`, et des
# DOSSIERS de discipline (`${appRoot}/<slug(cat.type)>/<slug(name)>`). Slug
# dynamique → détection par interrogation base (pas de regex fixe).
# La suppression passe par le gestionnaire de disciplines (chantier point 2).
# Le contenu À L'INTÉRIEUR d'un dossier de discipline reste supprimable.
#
# Crée protectedDisciplineFolder.ts + garde async dans trashToBin.service.
# Indépendant de 1a (les deux gardes coexistent). Prérequis : aucun.
# Usage : bash apply-finder-protect-1c-disciplines.sh
#         AKFC_APPLY_ONLY=1 bash apply-finder-protect-1c-disciplines.sh   (clone)
#
set -euo pipefail
HELPER="packages/backend/src/modules/storage/protectedDisciplineFolder.ts"
SVC="packages/backend/src/modules/trash/services/trashToBin.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$SVC" ] || { echo "ERREUR: $SVC introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

cat > "$HELPER" <<'TS'
import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

/**
 * Protège les dossiers adossés aux DISCIPLINES / CATÉGORIES. Contrairement aux
 * espaces de groupe/perso/avatars (préfixe fixe → regex), le chemin d'une
 * discipline dépend de slugs DYNAMIQUES :
 *
 *   - conteneur de catégorie : `${appRoot}/<slug(category.type)>`
 *   - conteneur des nouvelles : `${appRoot}/<slug(category.type)>/new`
 *   - dossier de discipline   : `${appRoot}/<slug(category.type)>/<slug(name)>`
 *
 * La détection interroge donc la base. Un chemin PLUS PROFOND (contenu d'un
 * dossier de discipline) n'est PAS protégé — les fichiers restent supprimables.
 *
 * Doit rester aligné avec `resolvePendingUploadFolder` (même slugify + fallback
 * `disc-<id>` quand le nom slugifie en chaîne vide).
 */
const SLUG_OPTIONS = { lower: true, strict: true } as const;
function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

export async function isProtectedDisciplineFolderPath(
  prisma: PrismaClient,
  appRoot: string,
  path: string,
): Promise<boolean> {
  const prefix = `${appRoot}/`;
  if (!path.startsWith(prefix)) return false;
  const segs = path.slice(prefix.length).split("/");

  // Conteneur de catégorie : `${appRoot}/<slug(type)>`
  if (segs.length === 1) {
    const cats = await prisma.category.findMany({ select: { type: true } });
    return cats.some((c) => slug(c.type) === segs[0]);
  }

  // `${appRoot}/<cat>/<disc>` : dossier de discipline ou conteneur `new`
  if (segs.length === 2) {
    const [catSeg, second] = segs;
    const cat = (
      await prisma.category.findMany({ select: { id: true, type: true } })
    ).find((c) => slug(c.type) === catSeg);
    if (!cat) return false;
    if (second === "new") return true;
    const discs = await prisma.discipline.findMany({
      where: { categoryId: cat.id },
      select: { id: true, name: true },
    });
    return discs.some((d) => (slug(d.name) || `disc-${d.id}`) === second);
  }

  // Plus profond = contenu d'un dossier de discipline → supprimable.
  return false;
}
TS
echo "créé : $HELPER"

python3 - "$SVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "isProtectedDisciplineFolderPath" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# import (après l'import stable invalidateResourcesCache)
s = sub(
'import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";\n',
'import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";\n'
'import { isProtectedDisciplineFolderPath } from "@backend/modules/storage/protectedDisciplineFolder";\n',
"import helper discipline")

# garde async, juste avant la boucle principale (prepend à `const results`)
s = sub(
'  const results: TrashEntryDTO[] = [];\n',
'  // 🔒 Protection disciplines/catégories (DB-aware) : conteneur de catégorie,\n'
'  // sous-conteneur `new`, ou dossier de discipline → non supprimables depuis\n'
'  // le finder (passer par le gestionnaire de disciplines).\n'
'  for (const source of sources) {\n'
'    if (source.kind !== "folder") continue;\n'
'    const path = normalizePath(source.fullPath);\n'
'    if (await isProtectedDisciplineFolderPath(prisma, appRoot, path)) {\n'
'      throw new Error(\n'
'        `Dossier protégé : « ${lastSegment(path)} » correspond à une discipline ou une catégorie et ne peut pas être supprimé depuis le finder. Supprimez-la dans le gestionnaire de disciplines.`,\n'
'      );\n'
'    }\n'
'  }\n'
'\n'
'  const results: TrashEntryDTO[] = [];\n',
"garde discipline")

p.write_text(s, encoding="utf-8")
print("garde discipline posée dans trashToBin")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(finder): protège disciplines/catégories de la suppression (incrément 1c, DB-aware)" && echo "commit $(git rev-parse --short HEAD)"