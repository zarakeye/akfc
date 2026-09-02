#!/usr/bin/env bash
#
# AKFC — Correctif seed sandbox : retirer les dossiers racines fantômes.
#
# Les strates pending/published/bin n'existent plus (flattening des statuts,
# postérieur à mon snapshot). Le seed les créait par héritage de l'ancien
# seed.js → on retire ce bloc. Il ne reste que : groupe Administrateurs, admin +
# membre de démo, catégories.
#
# Usage : bash fix-sandbox-seed-drop-rootfolders.sh
#
set -euo pipefail

SEED="prisma/seed.sandbox.mjs"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$SEED" ]        || { echo "ERREUR: $SEED introuvable." >&2; exit 1; }

python3 - "$SEED" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

block = (
    "  // Dossiers racines (immuables)\n"
    "  for (const f of [\n"
    '    { fullPath: `${APP_ROOT}/pending`, status: "pending" },\n'
    '    { fullPath: `${APP_ROOT}/published`, status: "published" },\n'
    '    { fullPath: `${APP_ROOT}/bin`, status: "bin" },\n'
    "  ]) {\n"
    "    await prisma.folder.upsert({\n"
    "      where: { appRoot_fullPath: { appRoot: APP_ROOT, fullPath: f.fullPath } },\n"
    "      update: {},\n"
    "      create: { appRoot: APP_ROOT, fullPath: f.fullPath, status: f.status },\n"
    "    });\n"
    "  }\n"
    '  console.log("✅ Catégories + dossiers prêts");\n'
)
if block in s:
    s = s.replace(block, '  console.log("✅ Catégories prêtes");\n')
    # APP_ROOT devient inutilisé → on le neutralise proprement s'il n'est plus référencé
    if s.count("APP_ROOT") == 1:  # que la déclaration
        s = s.replace(
            'const APP_ROOT = process.env.APP_SHORT_NAME || "AKFC";\n', ""
        )
    p.write_text(s, encoding="utf-8")
    print("seed : dossiers racines retirés")
else:
    print("bloc dossiers racines introuvable — déjà retiré ? (rien fait)")
PY
node --check "$SEED" && echo "syntaxe OK"

cat <<'EOF'

Relance le seeder :
  docker compose -f docker-compose.sandbox.yml up -d --build seeder
  docker compose -f docker-compose.sandbox.yml logs -f seeder
EOF