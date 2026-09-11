#!/usr/bin/env bash
#
# AKFC — Refactor Stage → Seminar, LOT L2 (BACKEND).
#
# Sur la branche refactor/stage-to-seminar. Corrige ce que le compilateur a
# signalé + les renommages structurels de cohérence :
#   - dossiers modules stages/→seminars/, stageSessions/→seminarSessions/ (git mv)
#   - routers stageRouter→seminarRouter, stageSessionRouter→seminarSessionRouter
#   - clés tRPC index.ts : stage→seminar, stageSession→seminarSession
#   - accès Prisma : prisma.stage.→prisma.seminar., prisma.stageSession.→…seminar…
#   - Prisma.StageUncheckedUpdateInput→Seminar…, relations stagesAs*→seminarsAs*
#   - include Gallery : stage→seminar
#
# On NE touche PAS : kind "stage" (tag interne), destination.stageId (contrat
# d'upload), les libellés/chaînes FR, les noms de variables locales `stage`.
#
# APPLY seulement (le FRONT dit encore trpc.stage → web KO) : après L2, relance
#   pnpm check 2>&1 | tee /tmp/tc.log
# le backend doit passer ; les erreurs restantes = FRONT → je livre L3.
#
# Usage : bash apply-L2-backend.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "refactor/stage-to-seminar" ] || {
  echo "ERREUR: bascule sur la branche refactor/stage-to-seminar d'abord." >&2; exit 1; }
B="packages/backend/src/modules"
[ -d "$B/stages" ] || { echo "— dossiers déjà renommés ?"; }

# 1. git mv des dossiers de module
[ -d "$B/stages" ] && git mv "$B/stages" "$B/seminars"
[ -d "$B/stageSessions" ] && git mv "$B/stageSessions" "$B/seminarSessions"
echo "→ modules renommés"

python3 - <<'PY'
import pathlib, re

ROOT = pathlib.Path("packages/backend/src")

# (a) index.ts : imports + clés tRPC (lignes exactes)
idx = ROOT / "modules/index.ts"
s = idx.read_text(encoding="utf-8")
for old, new in [
    ('import { stageRouter } from "@backend/modules/stages/router";',
     'import { seminarRouter } from "@backend/modules/seminars/router";'),
    ('import { stageSessionRouter } from "@backend/modules/stageSessions/router";',
     'import { seminarSessionRouter } from "@backend/modules/seminarSessions/router";'),
    ('  stage: stageRouter,', '  seminar: seminarRouter,'),
    ('  stageSession: stageSessionRouter,', '  seminarSession: seminarSessionRouter,'),
]:
    assert s.count(old) == 1, f"index.ts ancre: {old!r}"
    s = s.replace(old, new)
idx.write_text(s, encoding="utf-8")
print("  ok  modules/index.ts")

# (b) include Gallery
gal = ROOT / "modules/galleries/router.ts"
g = gal.read_text(encoding="utf-8")
old = "          stage: { select: { id: true, label: true } },"
assert g.count(old) == 1, "galleries include"
gal.write_text(g.replace(old, "          seminar: { select: { id: true, label: true } },"), encoding="utf-8")
print("  ok  modules/galleries/router.ts (include)")

# (d) remplacements de jetons non ambigus, tout le backend
TOKENS = [
    # routers : attrape `export const`, `export default` et tout usage
    ("stageSessionRouter", "seminarSessionRouter"),
    ("stageRouter", "seminarRouter"),
    ("prisma.stage.", "prisma.seminar."),
    ("prisma.stageSession.", "prisma.seminarSession."),
    ("tx.stage.", "tx.seminar."),
    ("Prisma.StageUncheckedUpdateInput", "Prisma.SeminarUncheckedUpdateInput"),
    ("stagesAsPrimaryAnimator", "seminarsAsPrimaryAnimator"),
    ("stagesAsAnimator", "seminarsAsAnimator"),
]
total = {}
for fp in ROOT.rglob("*.ts"):
    txt = fp.read_text(encoding="utf-8")
    orig = txt
    for old, new in TOKENS:
        if old in txt:
            total[old] = total.get(old, 0) + txt.count(old)
            txt = txt.replace(old, new)
    if txt != orig:
        fp.write_text(txt, encoding="utf-8")
for old, _ in TOKENS:
    print(f"  jeton {old:38s} ×{total.get(old,0)}")

print("L2 appliqué. Relance `pnpm check` (backend doit passer, front à faire).")
PY

echo ""
echo "════════ L2 fait. Suite : ════════"
echo "  pnpm prisma generate   # (au cas où)"
echo "  pnpm check 2>&1 | tee /tmp/tc.log"
echo "  → backend vert attendu ; colle-moi les erreurs FRONT restantes pour L3."