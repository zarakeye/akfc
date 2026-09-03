#!/usr/bin/env bash
#
# AKFC — Dépôt commun, A5 (backend) : exposer l'expéditeur dans les métadonnées.
#
# `StorageMetadata` a déjà `createdAt`. On ajoute `uploaderName` : `enrichStatus`
# (qui requête déjà MediaAsset par fichier) sélectionne `uploaderUserId`, résout
# les noms en un lookup batché (User.findMany), et pose `meta.uploaderName`.
#
#   - contracts/storage.types.ts : + uploaderName?: string
#   - enrichStatus.service.ts     : select uploaderUserId + résolution + pose meta
#
# Le FRONT (afficher expéditeur + date dans le finder) = étape suivante.
# Backend/contract seul, typecheck backend + web.
#
# Usage : bash apply-depot-commun-a5-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-a5-backend.sh   (clone)
#
set -euo pipefail

TYPES="packages/contracts/src/storage/storage.types.ts"
ENRICH="packages/backend/src/modules/storage/services/enrichStatus.service.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$TYPES" "$ENRICH"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. contract : uploaderName ───────────────────────────────────────────────
python3 - "$TYPES" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "uploaderName" in s: print("— contract déjà patché"); sys.exit(0)
anchor = "  /** MIME type complet quand disponible */\n  mimeType?: string;\n"
assert anchor in s, "ancre mimeType (StorageMetadata) introuvable"
s = s.replace(
    anchor,
    anchor
    + "  /** Nom lisible de l'expéditeur (depuis MediaAsset.uploaderUserId). */\n"
    + "  uploaderName?: string;\n",
)
p.write_text(s, encoding="utf-8"); print("✓ contract : uploaderName")
PY

# ── 2. enrichStatus : résoudre + poser uploaderName ─────────────────────────
python3 - "$ENRICH" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "uploaderName" in s: print("— enrichStatus déjà patché"); sys.exit(0)

# 2a. ResolvedMeta += uploaderName
s = s.replace(
    "type ResolvedMeta = { status?: LifecycleStatus; human?: string };",
    "type ResolvedMeta = { status?: LifecycleStatus; human?: string; uploaderName?: string };",
)

# 2b. select uploaderUserId
s = s.replace(
    "      displayName: true,\n      originalFileName: true,\n    },\n  });\n",
    "      displayName: true,\n      originalFileName: true,\n      uploaderUserId: true,\n    },\n  });\n\n"
    "  // Résolution batchée des noms d'expéditeur (un lookup pour tout le lot).\n"
    "  const uploaderIds = [\n"
    "    ...new Set(rows.map((r) => r.uploaderUserId).filter(Boolean)),\n"
    "  ] as string[];\n"
    "  const users = uploaderIds.length\n"
    "    ? await prisma.user.findMany({\n"
    "        where: { id: { in: uploaderIds } },\n"
    "        select: { id: true, firstName: true, lastName: true, pseudo: true },\n"
    "      })\n"
    "    : [];\n"
    "  const nameById = new Map(\n"
    "    users.map((u) => [\n"
    "      u.id,\n"
    '      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||\n'
    '        u.pseudo ||\n'
    '        "Utilisateur",\n'
    "    ]),\n"
    "  );\n",
)

# 2c. composer uploaderName dans la boucle
s = s.replace(
    "    const status = isLifecycleStatus(row.status) ? row.status : undefined;\n"
    "    const meta: ResolvedMeta = { status, human };\n",
    "    const status = isLifecycleStatus(row.status) ? row.status : undefined;\n"
    "    const uploaderName = row.uploaderUserId\n"
    "      ? nameById.get(row.uploaderUserId)\n"
    "      : undefined;\n"
    "    const meta: ResolvedMeta = { status, human, uploaderName };\n",
)

# 2d. poser uploaderName sur le node (à côté de status)
s = s.replace(
    "        if (hit.status) {\n"
    "          file.metadata = { ...(file.metadata ?? {}), status: hit.status };\n"
    "        }\n",
    "        if (hit.status || hit.uploaderName) {\n"
    "          file.metadata = {\n"
    "            ...(file.metadata ?? {}),\n"
    "            ...(hit.status ? { status: hit.status } : {}),\n"
    "            ...(hit.uploaderName ? { uploaderName: hit.uploaderName } : {}),\n"
    "          };\n"
    "        }\n",
)

p.write_text(s, encoding="utf-8")
# vérif que les 4 remplacements ont mordu
import re
ok = all(x in s for x in ["uploaderName?", "uploaderUserId: true", "nameById.get", "hit.uploaderName"])
print("✓ enrichStatus : uploaderName résolu et posé" if ok else "⚠️ un remplacement a échoué — inspecte le fichier")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|uploaderName|uploaderUserId" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): A5 backend — expose uploaderName dans les métadonnées de fichier" \
  && echo "commit $(git rev-parse --short HEAD)"