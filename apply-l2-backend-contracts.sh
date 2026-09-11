#!/usr/bin/env bash
#
# AKFC — Refactor Stage → Seminar, LOT L2b (finir BACKEND + CONTRATS).
#
# - Champ contrat + DB : stageId → seminarId (upload, gallery, session).
# - Kind d'upload : "stage" → "seminar" (PUR code — jamais persisté ;
#   TrashEntry.kind ne vaut que file/folder).
# - Méthode : getAllByStage → getAllBySeminar.
# - Deux fichiers 100% backend (aucune chaîne FR d'affichage) renommés en
#   file-scoped : seminarSessions/router.ts, resolvePendingUploadFolder.service.ts.
#
# Le FRONT dit encore trpc.stage/kind 'stage' → web KO (c'est L3). Après L2b,
# `pnpm --filter backend typecheck` doit passer.
#
# Usage : bash apply-L2b-backend-contracts.sh   (sur la branche)
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "refactor/stage-to-seminar" ] || {
  echo "ERREUR: branche refactor/stage-to-seminar attendue." >&2; exit 1; }

python3 - <<'PY'
import pathlib

def read(p): return pathlib.Path(p).read_text(encoding="utf-8")
def write(p, s): pathlib.Path(p).write_text(s, encoding="utf-8")
def one(p, old, new):
    s = read(p); assert s.count(old) == 1, f"{p}: ancre « {old[:50]} » ×{s.count(old)}"
    write(p, s.replace(old, new)); print(f"  ok  {p}")
def scoped(p, pairs):
    s = read(p); tot = 0
    for old, new in pairs:
        n = s.count(old); tot += n; s = s.replace(old, new)
    write(p, s); print(f"  ok  {p}  (file-scoped, {tot} remplacements)")

# ── Contrats ──
UP = "packages/contracts/src/cloudinary/upload.schema.ts"
one(UP, "  // par le chemin `stages/…` (MediaAsset n'a pas de stageId).",
       "  // par le chemin `seminars/…` (MediaAsset n'a pas de seminarId).")
one(UP, '    kind: z.literal("stage"),', '    kind: z.literal("seminar"),')
one(UP, "    stageId: z.number().int().positive(),", "    seminarId: z.number().int().positive(),")
one("packages/contracts/src/forms/createGalleryForm.schema.ts",
    "  stageId: facetIdString,", "  seminarId: facetIdString,")
one("packages/contracts/src/forms/updateGalleryForm.schema.ts",
    "  stageId: facetIdString,", "  seminarId: facetIdString,")

# ── Backend : fichiers 100% "seminar" → file-scoped ──
scoped("packages/backend/src/modules/seminarSessions/router.ts",
       [("stage", "seminar"), ("Stage", "Seminar")])
scoped("packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts",
       [("stage", "seminar"), ("Stage", "Seminar")])

# ── r2 adapter : case + commentaire (ciblé, le fichier a d'autres cases) ──
R2 = "packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
one(R2, '        case "stage":', '        case "seminar":')
one(R2, "          // Contenus d'un stage : rattachement par le chemin (`stages/…`),\n          // sans catégorie ni discipline (MediaAsset n'a pas de stageId).",
       "          // Contenus d'un séminaire : rattachement par le chemin (`seminars/…`),\n          // sans catégorie ni discipline (MediaAsset n'a pas de seminarId).")

# ── galleries router : champ d'entrée ──
one("packages/backend/src/modules/galleries/router.ts",
    "  stageId: z.number().int().positive().nullable().optional(),",
    "  seminarId: z.number().int().positive().nullable().optional(),")

print("L2b appliqué.")
PY

echo ""
echo "→ Suite : pnpm prisma generate ; pnpm check 2>&1 | tee /tmp/tc.log"
echo "  Backend attendu VERT. Colle-moi les erreurs FRONT restantes → L3."