#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════
#  À lancer sur le serveur. Ajoute au compose multi-backends un service
#  « akfc-migrator » : les migrations de la base du site, lancées AVANT le
#  site à chaque « docker compose up », puis arrêtées.
#
#  Ce que le script fait, et seulement cela :
#    1. copie datée du compose (docker-compose.yml.avant-migrator-AAAAMMJJ-HHMMSS),
#       à côté de l'original — rien n'est supprimé ;
#    2. dans le service akfc : « depends_on » passe de la forme liste à la forme
#       avec conditions, et attend la fin réussie de akfc-migrator ;
#    3. ajoute le service akfc-migrator juste après le service akfc ;
#    4. valide le résultat (docker compose config -q). Invalide → l'original
#       est remis depuis la copie.
#  Il ne démarre, n'arrête et ne reconstruit aucun conteneur, ne touche à
#  aucun autre service, à aucun volume, à aucun dossier de données, et ne
#  commite rien.
#
#  Usage : bash add-akfc-migrator.sh            (dossier : ~/multi-backends)
#          bash add-akfc-migrator.sh /autre/dossier
# ══════════════════════════════════════════════════════════════════════════
set -euo pipefail
D="${1:-$HOME/multi-backends}"
cd "$D" || { echo "❌ dossier introuvable : $D"; exit 1; }
F=docker-compose.yml
[ -f "$F" ] || { echo "❌ $F introuvable dans $D"; exit 1; }
if grep -q "^  akfc-migrator:" "$F"; then echo "Déjà en place (service akfc-migrator présent). Rien à faire."; exit 0; fi

BACKUP="$F.avant-migrator-$(date +%Y%m%d-%H%M%S)"
cp -p "$F" "$BACKUP"
echo "✓ copie : $BACKUP"

if ! python3 - "$F" <<'PY'
import re, sys
p = sys.argv[1]
lines = open(p, encoding="utf-8").read().split("\n")

def fail(msg):
    print(f"❌ {msg} — rien n'a été modifié."); sys.exit(1)

starts = [i for i, l in enumerate(lines) if l.rstrip() == "  akfc:"]
if len(starts) != 1: fail(f"le service « akfc: » est trouvé {len(starts)} fois (attendu : 1)")
s = starts[0]
# fin du bloc akfc : prochaine ligne de service (2 espaces) ou de niveau racine
e = len(lines)
for i in range(s + 1, len(lines)):
    l = lines[i]
    if (re.match(r"^  [A-Za-z0-9_.\-]+:\s*$", l)) or (l and not l.startswith(" ") and not l.startswith("#")):
        e = i; break
block = lines[s:e]
# dernière ligne utile du bloc (on n'emporte pas les lignes vides ou commentaires de fin)
last = max(i for i, l in enumerate(block) if l.strip() and not l.strip().startswith("#"))

old = ["    depends_on:", "      - postgres", "      - pgbouncer"]
hits = [i for i in range(len(block) - 2) if [x.rstrip() for x in block[i:i + 3]] == old]
if len(hits) != 1: fail(f"le depends_on attendu du service akfc est trouvé {len(hits)} fois (attendu : 1)")
h = hits[0]
if h + 3 < len(block) and re.match(r"^      - ", block[h + 3]):
    fail("le depends_on du service akfc a plus d'entrées que postgres et pgbouncer")

new_dep = [
    "    depends_on:",
    "      postgres:",
    "        condition: service_started",
    "      pgbouncer:",
    "        condition: service_started",
    "      # Le site ne (re)démarre qu'une fois les migrations appliquées sans erreur.",
    "      akfc-migrator:",
    "        condition: service_completed_successfully",
]
migrator = [
    "",
    "  # Migrations de la base du site (cible « migrator » du Dockerfile) : lancé avant",
    "  # akfc à chaque « docker compose up », puis arrêté. « prisma migrate deploy »",
    "  # n'applique que les migrations manquantes ; sans migration nouvelle, il ne fait rien.",
    "  akfc-migrator:",
    "    build:",
    "      context: ./backends/akfc",
    "      target: migrator",
    "    container_name: akfc-migrator",
    "    restart: \"no\"",
    "    env_file: ./backends/akfc/.env",
    "    # internal : joindre la base ; web : l'accès sortant, si l'image doit encore télécharger pnpm.",
    "    networks:",
    "      - web",
    "      - internal",
    "    depends_on:",
    "      - postgres",
    "      - pgbouncer",
]
block = block[:h] + new_dep + block[h + 3:]
last += len(new_dep) - 3
block = block[:last + 1] + migrator + block[last + 1:]
out = lines[:s] + block + lines[e:]
open(p, "w", encoding="utf-8").write("\n".join(out))
print(f"✓ compose modifié : depends_on du site, service akfc-migrator ajouté ({len(migrator) - 1} lignes)")
PY
then
  cp -p "$BACKUP" "$F"; echo "↩ original remis (la copie reste : $BACKUP)"; exit 1
fi

if ! docker compose config -q 2>/tmp/akfc_compose_err.log; then
  echo "❌ compose invalide après modification :"; head -5 /tmp/akfc_compose_err.log
  cp -p "$BACKUP" "$F"; echo "↩ original remis (la copie reste : $BACKUP)"; exit 1
fi
echo "✓ compose valide (docker compose config)"
echo
echo "Rien n'a été démarré. Pour l'essayer (la base est à jour : la migration ne fera rien) :"
echo "  docker compose up -d --build akfc"
echo "  docker compose logs akfc-migrator | tail -5"
echo "Puis, si tout va bien : commiter docker-compose.yml dans le dépôt d'infra."