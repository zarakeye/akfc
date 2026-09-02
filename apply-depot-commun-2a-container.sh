#!/usr/bin/env bash
#
# AKFC — Dépôt commun, PASSE 2a : conteneur par (utilisateur + intitulé).
#
#   - contract  : `folder` → `containerName` (branche common_repository, optionnel)
#   - resolver  : chemin `common_repository/{personSlug}-{userId}/{slug(containerName)}`
#                 (isolation par personne via cuid ; regroupe MES dépôts au même
#                 intitulé). Défaut si vide : `.../{personSlug}-{userId}/{horodatage}`.
#   - front     : `generalFolder`/`generalFolders*` → `containerName`/`containerFolders*`,
#                 labels « Général » → « Dépôt commun », datalist id, placeholder.
#
# Le libellé humain accentué (Tension A) = passe 2b (stockage niveau dossier).
# Ici le nom VISIBLE = le slug. Fonctionnel, zéro migration.
#
# assert count==N par ancre ; le `containerName` inféré traverse contract→back→
# front → typecheck = preuve. Backend + web.
#
# Usage : bash apply-depot-commun-2a-container.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-2a-container.sh   (clone)
#
set -euo pipefail

CONTRACT="packages/contracts/src/cloudinary/upload.schema.ts"
RESOLVE="packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
FRONT="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$CONTRACT" "$RESOLVE" "$FRONT"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. contract : folder → containerName (branche common_repository) ─────────
python3 - "$CONTRACT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = "    folder: z.string().trim().min(1).max(120).optional(),"
new = "    containerName: z.string().trim().min(1).max(120).optional(),"
if new in s: print("— contract déjà containerName"); sys.exit(0)
assert s.count(old) == 1, "ancre folder (contract common_repository) introuvable/multiple"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ contract : containerName")
PY

# ── 2. resolver : chemin groupé par personne ─────────────────────────────────
python3 - "$RESOLVE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = (
    '  if (destination.kind === "common_repository") {\n'
    "    // Pas de sous-dossier → dépôt à la racine de `general/`.\n"
    "    if (!destination.folder) {\n"
    "      return `${appRoot}/common_repository`;\n"
    "    }\n"
    "    const folderSlug = slug(destination.folder);\n"
    "    if (!folderSlug) {\n"
    "      throw new Error(\n"
    '        "General folder name must contain at least one slug-friendly character",\n'
    "      );\n"
    "    }\n"
    "    return `${appRoot}/common_repository/${folderSlug}`;\n"
    "  }\n"
)
new = (
    '  if (destination.kind === "common_repository") {\n'
    "    // Regroupement par (utilisateur + intitulé). Le segment personnel isole\n"
    "    // chaque déposant (homonymes distincts par le cuid) ; l'intitulé regroupe\n"
    "    // les dépôts successifs d'une même personne au même sujet. Le libellé\n"
    "    // humain accentué est traité séparément (passe 2b).\n"
    "    const person = await prisma.user.findUnique({\n"
    "      where: { id: userId },\n"
    "      select: { firstName: true, lastName: true, pseudo: true },\n"
    "    });\n"
    "    const personName =\n"
    "      [person?.firstName, person?.lastName].filter(Boolean).join(\" \").trim() ||\n"
    "      person?.pseudo ||\n"
    "      \"\";\n"
    "    const personSlug = slug(personName) || `user-${userId}`;\n"
    "    const base = `${appRoot}/common_repository/${personSlug}-${userId}`;\n"
    "\n"
    "    // Intitulé fourni → conteneur slugifié ; vide → conteneur horodaté unique.\n"
    "    const containerSlug = destination.containerName\n"
    "      ? slug(destination.containerName)\n"
    "      : \"\";\n"
    "    if (containerSlug) {\n"
    "      return `${base}/${containerSlug}`;\n"
    "    }\n"
    "    const stamp = new Date()\n"
    "      .toISOString()\n"
    "      .replace(/[:.]/g, \"-\")\n"
    "      .replace(\"T\", \"_\")\n"
    "      .slice(0, 19);\n"
    "    return `${base}/depot-${stamp}`;\n"
    "  }\n"
)
if new.strip()[:40] in s and old not in s:
    print("— resolver déjà migré"); sys.exit(0)
assert old in s, "ancre branche common_repository (resolver) introuvable"
s = s.replace(old, new)
p.write_text(s, encoding="utf-8"); print("✓ resolver : chemin groupé par personne")
PY

# ── 3. front : renommer le champ + relabel ───────────────────────────────────
python3 - "$FRONT" <<'PY'
import sys, pathlib, re
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# 3a. champ du schéma (optional, inchangé)
s2 = s.replace(
    "    generalFolder: z.string().trim().max(120).optional(),",
    "    containerName: z.string().trim().max(120).optional(),",
)

# 3b. tokens generalFolder / generalFolders / generalFoldersQuery → container*
s2 = re.sub(r"\bgeneralFoldersQuery\b", "containerFoldersQuery", s2)
s2 = re.sub(r"\bgeneralFolders\b", "containerFolders", s2)
s2 = re.sub(r"\bgeneralFolder\b", "containerName", s2)

# 3c. datalist id + register
s2 = s2.replace('list="akfc-general-folders"', 'list="akfc-common-repository-folders"')
s2 = s2.replace('id="akfc-general-folders"', 'id="akfc-common-repository-folders"')

# 3d. labels visibles
s2 = s2.replace("Vers « Général »", "Vers « Dépôt commun »")
s2 = s2.replace('placeholder="Vide = racine de « Général »"',
                'placeholder="Nom du dossier de dépôt"')
s2 = s2.replace("<label className=\"block font-semibold mb-1\">Dossier (optionnel)</label>",
                "<label className=\"block font-semibold mb-1\">Nom du dossier de dépôt</label>")

if s2 == s:
    print("— front déjà migré ?")
else:
    p.write_text(s2, encoding="utf-8")
    print("✓ front : containerName + labels « Dépôt commun »")

# résidus generalFolder ?
resid = [f"{i}:{ln.strip()}" for i, ln in enumerate(s2.splitlines(),1)
         if re.search(r"generalFolder", ln)]
print("résidus generalFolder:", resid if resid else "(aucun)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|containerName|folder" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|containerName|generalFolder" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): 2a — conteneur par (utilisateur + intitulé), champ containerName" \
  && echo "commit $(git rev-parse --short HEAD)"