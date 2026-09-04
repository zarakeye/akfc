#!/usr/bin/env bash
#
# AKFC — Chantier B, B0 : tuer les catégories vestiges (Stage, Event, General).
#
# Modèle cible : seule « Cours » reste une catégorie (regroupe les disciplines).
# Stage/Event deviennent des TYPES d'entités autonomes (tables Stage/Event), pas
# des catégories. General a été remplacé par common_repository. Les trois sont
# VIDES (0 discipline, 0 média — vérifié).
#
# Ce script :
#   1. met à jour le seed sandbox (ne crée plus que « Cours ») ;
#   2. repère si le seed PROD (prisma/seed.js) crée encore les vestiges ;
#   3. fournit le SQL de nettoyage GARDÉ (ne supprime que si Gallery ne les
#      référence pas) — à lancer en dev puis en prod.
#
# AUCUNE suppression auto par ce script : la donnée se nettoie via le SQL fourni,
# après la garde. Pas de commit auto (tu valides le nettoyage d'abord).
#
# Usage : bash apply-B0-kill-vestige-categories.sh
#
set -euo pipefail

SEED_SANDBOX="prisma/seed.sandbox.mjs"
SEED_PROD="prisma/seed.js"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

# ── 1. Seed sandbox : ne créer que « Cours » ─────────────────────────────────
if [ -f "$SEED_SANDBOX" ]; then
python3 - "$SEED_SANDBOX" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = 'for (const type of ["Cours", "Stage", "Event"]) {'
new = 'for (const type of ["Cours"]) {'
if new in s:
    print("— seed sandbox déjà à jour")
elif old in s:
    s = s.replace(old, new); p.write_text(s, encoding="utf-8")
    print("✓ seed sandbox : catégories = [Cours]")
else:
    print("!! boucle catégories introuvable dans le seed sandbox — vérifie à la main")
PY
else
  echo "(pas de $SEED_SANDBOX)"
fi

# ── 2. Seed prod : repérer les vestiges ──────────────────────────────────────
if [ -f "$SEED_PROD" ]; then
  echo "--- seed PROD : références aux catégories vestiges ? ---"
  grep -n '"Stage"\|"Event"\|"General"\|Cours\|category' "$SEED_PROD" | head || echo "(aucune)"
  echo "  ⚠ si le seed prod crée Stage/Event/General, dis-le-moi : je le corrige."
else
  echo "(pas de $SEED_PROD)"
fi

cat <<'EOF'

════════ NETTOYAGE DES DONNÉES (dev, puis prod) ════════

⚠ AVANT toute suppression : vérifier que Gallery ne référence pas les vestiges.

  psql -U akfc -d akfc_db -c \
    "SELECT c.type, count(g.id) AS galleries \
     FROM \"Category\" c LEFT JOIN \"Gallery\" g ON g.\"categoryId\"=c.id \
     WHERE c.type IN ('Stage','Event','General') GROUP BY c.type;"

  → Si TOUS les counts sont 0, tu peux supprimer. Sinon, STOP et dis-le-moi.

Suppression (seulement si les 3 counts sont à 0) :

  psql -U akfc -d akfc_db <<'SQL'
  -- libellés de dossier éventuels de ces catégories
  DELETE FROM "FolderLabel" WHERE path IN ('AKFC/stage','AKFC/event','AKFC/general');
  -- les catégories vestiges (vides)
  DELETE FROM "Category" WHERE type IN ('Stage','Event','General');
  SQL

Vérification :
  psql -U akfc -d akfc_db -c "SELECT id, type FROM \"Category\" ORDER BY id;"
  → il ne doit rester que « Cours ».

En PROD : mêmes commandes (recette PG_IP), APRÈS avoir confirmé les counts Gallery à 0.
En SANDBOX : rien à faire — le seed corrigé ne recrée plus les vestiges au prochain reset.

Puis commit du seed :
  git add -A && git commit -m "chore(B0): seed ne crée plus que la catégorie Cours (vestiges Stage/Event/General tués)"
EOF