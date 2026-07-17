#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# AUDIT (LECTURE SEULE — aucun écrit, aucun commit)
#
# Question : si on retire le segment de statut des chemins physiques (étape 5),
# est-ce que deux MediaAsset se retrouvent sur le même `fullPath` ?
# `fullPath` est @@unique — chaque collision est un blocage de migration.
#
# Pour les DOSSIERS, une collision est la fusion VOULUE (c'est ce que le
# pliage montre déjà). Pour les FICHIERS, c'est un arbitrage à faire à la main.
#
# À lancer depuis la RACINE du repo.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

test -f .env || { echo "✗ .env introuvable — lance depuis la racine du repo."; exit 1; }

# `?schema=public` est un paramètre Prisma ; psql le rejette.
URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d "\"'" | sed 's/?.*$//')"
test -n "$URL" || { echo "✗ DATABASE_URL absente de .env"; exit 1; }

echo "═══ 1. FICHIERS qui collisionneraient (chaque ligne = un blocage) ═══"
psql "$URL" -X -q -P pager=off <<'SQL'
SELECT
  regexp_replace("fullPath", '^([^/]+)/(pending|published)/', '\1/') AS chemin_aplati,
  count(*) AS n,
  string_agg(status, ' + ' ORDER BY status) AS statuts
FROM "MediaAsset"
WHERE "fullPath" ~ '^[^/]+/(pending|published)/'
GROUP BY 1
HAVING count(*) > 1
ORDER BY n DESC, 1
LIMIT 40;
SQL

echo
echo "═══ 2. Décompte global ═══"
psql "$URL" -X -q -t -P pager=off <<'SQL'
SELECT
  'assets sous une strate      : ' || count(*) FILTER (WHERE "fullPath" ~ '^[^/]+/(pending|published)/')
FROM "MediaAsset"
UNION ALL
SELECT
  'assets deja a plat          : ' || count(*) FILTER (WHERE "fullPath" !~ '^[^/]+/(pending|published|bin)/')
FROM "MediaAsset"
UNION ALL
SELECT
  'assets R2 (publicId IS NULL): ' || count(*) FILTER (WHERE "publicId" IS NULL)
FROM "MediaAsset"
UNION ALL
SELECT
  'fichiers en collision       : ' || coalesce(sum(n), 0) FROM (
    SELECT count(*) AS n FROM "MediaAsset"
    WHERE "fullPath" ~ '^[^/]+/(pending|published)/'
    GROUP BY regexp_replace("fullPath", '^([^/]+)/(pending|published)/', '\1/')
    HAVING count(*) > 1
  ) c;
SQL

echo
echo "═══ 3. Incoherences status <-> chemin (le cache a-t-il deja decroche ?) ═══"
psql "$URL" -X -q -P pager=off <<'SQL'
SELECT status AS status_en_base,
       split_part("fullPath", '/', 2) AS strate_du_chemin,
       count(*) AS n
FROM "MediaAsset"
WHERE "fullPath" ~ '^[^/]+/(pending|published|bin)/'
  AND status IS DISTINCT FROM split_part("fullPath", '/', 2)
GROUP BY 1, 2
ORDER BY n DESC
LIMIT 20;
SQL

echo
echo "→ Section 1 vide  = aucune collision, l'etape 5 passe sur les fichiers."
echo "→ Section 3 vide  = status et chemin sont encore d'accord partout."
echo "  (Section 3 NON vide = le cache a deja decroche quelque part : a lire avant de migrer.)"