#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# DIAGNOSTIC (LECTURE SEULE — aucun écrit, aucun commit)
#
# `buildR2Path` (front, DragNDropForm) et `resolvePendingUploadFolder` (backend)
# slugifient avec DEUX implémentations différentes. Elles divergent sur les
# caractères que le paquet npm `slugify` translittère et que la version maison
# efface : & → "and", % → "percent", etc.
#
# Conséquence : une photo (Cloudinary, chemin backend) et un PDF (R2, chemin
# front) déposés dans la MÊME discipline peuvent atterrir dans deux dossiers.
#
# Ce script répond à : est-ce que ça t'est déjà arrivé ?
#
# À lancer depuis la RACINE du repo.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

test -f .env || { echo "✗ .env introuvable — lance depuis la racine du repo."; exit 1; }

URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d "\"'" | sed 's/?.*$//')"
test -n "$URL" || { echo "✗ DATABASE_URL absente de .env"; exit 1; }

echo "═══ 1. Noms qui FONT diverger les deux slugify ═══"
echo "    (tout ce qui contient & % \$ < > | ou des caracteres non-latins)"
psql "$URL" -X -q -P pager=off <<'SQL'
SELECT 'Discipline' AS source, id::text, name AS nom
FROM "Discipline" WHERE name ~ '[&%$<>|@#*]'
UNION ALL
SELECT 'Category', id::text, type FROM "Category" WHERE type ~ '[&%$<>|@#*]'
UNION ALL
SELECT 'Event', id::text, coalesce(slug, label) FROM "Event"
WHERE coalesce(slug, label) ~ '[&%$<>|@#*]'
ORDER BY 1, 2
LIMIT 30;
SQL

echo
echo "═══ 2. Dossiers FRERES qui ne different que par un slug ═══"
echo "    (deux dossiers pour une meme discipline = la divergence a mordu)"
psql "$URL" -X -q -P pager=off <<'SQL'
WITH dossiers AS (
  SELECT DISTINCT
    regexp_replace("fullPath", '/[^/]+$', '') AS dossier,
    ("publicId" IS NULL) AS est_r2
  FROM "MediaAsset"
),
paires AS (
  SELECT a.dossier AS d1, b.dossier AS d2
  FROM dossiers a JOIN dossiers b ON a.dossier < b.dossier
  WHERE a.est_r2 <> b.est_r2
    AND replace(replace(a.dossier, '-and-', '-'), '-percent', '')
      = replace(replace(b.dossier, '-and-', '-'), '-percent', '')
)
SELECT d1 AS dossier_1, d2 AS dossier_2 FROM paires LIMIT 20;
SQL

echo
echo "═══ 3. Repartition des assets R2 par dossier ═══"
psql "$URL" -X -q -P pager=off <<'SQL'
SELECT regexp_replace("fullPath", '/[^/]+$', '') AS dossier,
       count(*) AS n_fichiers
FROM "MediaAsset"
WHERE "publicId" IS NULL
GROUP BY 1 ORDER BY 1;
SQL

echo
echo "→ Section 1 vide = aucun nom ne fait diverger les deux regles AUJOURD'HUI."
echo "  La bombe est amorcee mais pas partie : elle attend une discipline"
echo "  nommee avec un & ou un %. 4b la desamorce."
echo "→ Section 2 non vide = elle a deja explose, et il y a des dossiers a fusionner."