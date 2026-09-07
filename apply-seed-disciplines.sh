#!/usr/bin/env bash
#
# AKFC — Met à jour prisma/seed.sandbox.mjs pour refléter les changements EN :
#   - capture l'id de l'admin (instructeur des disciplines) ;
#   - catégorie « Cours » (physique `courses` via categoryStorageSegment) ;
#   - crée les 4 DISCIPLINES (les « cours »), instructeur = l'admin.
#
# Le NOM d'affichage porte accents/espaces ; le DOSSIER physique est slugifié
# par le code à l'upload (`courses/<slug(name)>`), donc « Taïchi Chuan » →
# `courses/taichi-chuan`. Le seed ne crée AUCUN dossier physique (ils naissent
# propres au premier upload). L'arborescence du finder est pilotée par le code
# (ensureContentRoots injecte les racines EN visibles même vides).
#
# Périmètre : prisma/seed.sandbox.mjs. Pas de typecheck (fichier .mjs hors build).
# Usage : bash apply-seed-disciplines.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
F="prisma/seed.sandbox.mjs"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q 'DISCIPLINES' "$F" 2>/dev/null; then echo "— déjà appliqué (DISCIPLINES présent)"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre {label} : attendu 1, trouvé {n}"
    s = s.replace(old, new)

# 1) Capturer l'id de l'admin (instructeur requis des disciplines).
sub(
    '''  await ensureUser({
    email: "admin@akfc.demo",
    firstName: "Admin",
    hash,
    admin: true,
    adminGroupId,
  });''',
    '''  const adminId = await ensureUser({
    email: "admin@akfc.demo",
    firstName: "Admin",
    hash,
    admin: true,
    adminGroupId,
  });''',
    "capture adminId",
)

# 2) Catégorie (id capturé) + disciplines.
sub(
    '''  // Catégories
  for (const type of ["Cours"]) {
    await prisma.category.upsert({
      where: { type },
      update: {},
      create: { type },
    });
  }

  console.log("✅ Catégories prêtes");''',
    '''  // Catégorie « Cours » — physique `courses` via categoryStorageSegment.
  const coursCategory = await prisma.category.upsert({
    where: { type: "Cours" },
    update: {},
    create: { type: "Cours" },
    select: { id: true },
  });

  console.log("✅ Catégorie « Cours » prête");

  // Disciplines (les « cours »). Le NOM porte accents/espaces ; le dossier
  // physique est slugifié à l'upload par le code → `courses/<slug>`. Le `slug`
  // sert aux URLs publiques. Instructeur = l'admin (champ requis).
  const DISCIPLINES = [
    { name: "Kali Escrima", slug: "kali-escrima" },
    { name: "Taolu multi-styles", slug: "taolu-multi-styles" },
    { name: "Tchoy Lee Fut", slug: "tchoy-lee-fut" },
    { name: "Taïchi Chuan", slug: "taichi-chuan" },
  ];
  for (const d of DISCIPLINES) {
    await prisma.discipline.upsert({
      where: { categoryId_name: { categoryId: coursCategory.id, name: d.name } },
      update: { slug: d.slug },
      create: {
        name: d.name,
        slug: d.slug,
        type: "MARTIAL_ART",
        categoryId: coursCategory.id,
        instructorId: adminId,
      },
    });
  }

  console.log("✅ Disciplines prêtes");''',
    "catégorie + disciplines",
)

p.write_text(s, encoding="utf-8")
print("Seed mis à jour.")
PY

# .mjs hors périmètre TypeScript → on commit sans typecheck (le seed sera
# validé à l'exécution par le seeder).
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "seed(sandbox): admin instructeur + catégorie Cours + disciplines (noms EN slugifiés à l'upload)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi