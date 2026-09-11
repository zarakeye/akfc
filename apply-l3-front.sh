#!/usr/bin/env bash
#
# AKFC — Refactor Stage → Seminar, LOT L3 (FRONT, final).
#
# git mv des dossiers (routes /seminars, features, store, composants), jetons
# globaux sûrs (trpc/utils/prisma, stageId, kind, StageForm/StagesTable/…),
# édits ciblés (galleries, agenda, SeminarForm), et 301 /stages/:slug→/seminars/:slug.
# Libellés FR laissés : « Stage », « Stages », « Voir le stage », placeholder.
#
# Gros lot non compilable ici → APPLY puis `pnpm check` ; on itère les résidus.
# Usage : bash apply-L3-front.sh   (sur la branche)
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)" = "refactor/stage-to-seminar" ] || {
  echo "ERREUR: branche refactor/stage-to-seminar attendue." >&2; exit 1; }
A="apps/web/src"

# ── Phase 1 : git mv dossiers + fichiers ──
mvdir(){ [ -d "$1" ] && git mv "$1" "$2" && echo "  mv $1 → $2" || true; }
mvfile(){ [ -f "$1" ] && git mv "$1" "$2" && echo "  mv $1 → $2" || true; }
mvdir "$A/app/(admin)/dashboard/stages"      "$A/app/(admin)/dashboard/seminars"
mvdir "$A/app/(public)/stages"               "$A/app/(public)/seminars"
mvdir "$A/app/api/calendar/stages"           "$A/app/api/calendar/seminars"
mvdir "$A/features/admin/stages"             "$A/features/admin/seminars"
mvfile "$A/features/admin/seminars/forms/StageForm.tsx"        "$A/features/admin/seminars/forms/SeminarForm.tsx"
mvfile "$A/features/admin/seminars/components/StagesTable.tsx"  "$A/features/admin/seminars/components/SeminarsTable.tsx"
mvfile "$A/lib/stores/useStageSessionStore.ts"                 "$A/lib/stores/useSeminarSessionStore.ts"

python3 - <<'PY'
import pathlib
A = pathlib.Path("apps/web/src")

# ── Phase 2 : jetons globaux (ordre : plus spécifique d'abord) ──
TOKENS = [
    ("useStageSessionStore", "useSeminarSessionStore"),
    ("getAllByStage", "getAllBySeminar"),
    ("fetchByStage", "fetchBySeminar"),
    ("StageSession", "SeminarSession"),
    ("stageSession", "seminarSession"),
    ("StagesTable", "SeminarsTable"),
    ("StageForm", "SeminarForm"),            # couvre StageFormInput/Props
    ("stagesAsPrimaryAnimator", "seminarsAsPrimaryAnimator"),
    ("stagesAsAnimator", "seminarsAsAnimator"),
    ("trpc.stage.", "trpc.seminar."),
    ("utils.stage.", "utils.seminar."),
    ("prisma.stage.", "prisma.seminar."),
    ("stageId", "seminarId"),
    ("/stages", "/seminars"),                # routes, hrefs, chemins d'import
    ("'stage'", "'seminar'"),                # kind
    ('"stage"', '"seminar"'),                # kind
]
counts = {}
for fp in list(A.rglob("*.ts")) + list(A.rglob("*.tsx")):
    s = fp.read_text(encoding="utf-8"); orig = s
    for old, new in TOKENS:
        if old in s:
            counts[old] = counts.get(old, 0) + s.count(old); s = s.replace(old, new)
    if s != orig: fp.write_text(s, encoding="utf-8")
for old, _ in TOKENS:
    print(f"  jeton {old:26s} ×{counts.get(old,0)}")

# ── Phase 3 : édits ciblés ──
def one(rel, old, new):
    p = A / rel; s = p.read_text(encoding="utf-8")
    assert s.count(old) == 1, f"{rel}: ancre « {old[:45]} » ×{s.count(old)}"
    p.write_text(s.replace(old, new), encoding="utf-8"); print(f"  ok  {rel}")

# agenda : var locale + segment URL (le kind "stage"→"seminar" déjà fait en phase 2)
AG = "app/(public)/agenda/page.tsx"
one(AG, "const [stages, events]", "const [seminars, events]")
one(AG, "    ...stages.map(", "    ...seminars.map(")
one(AG, '? "stages" : "events"', '? "seminars" : "events"')

# galleries : include + accès relation (.stage → .seminar)
GP = "app/(admin)/dashboard/galleries/[id]/page.tsx"
one(GP, "      stage: { select: { label: true } },", "      seminar: { select: { label: true } },")
one(GP, "gallery.stage?.label", "gallery.seminar?.label")
one("features/admin/galleries/components/GalleriesTable.tsx", "g.stage?.label,", "g.seminar?.label,")

# SeminarForm : type nu Stage → Seminar (placeholder FR "Stage Sensei…" laissé)
SF = "features/admin/seminars/forms/SeminarForm.tsx"
one(SF, "{ Stage, Audience }", "{ Seminar, Audience }")
one(SF, ": Stage &", ": Seminar &")

print("L3 phases 1-3 OK.")
PY

# ── Phase 4 : 301 /stages/:slug → /seminars/:slug ──
python3 - <<'PY'
import pathlib
p = pathlib.Path("apps/web/next.config.ts"); s = p.read_text(encoding="utf-8")
anchor = '      { source: "/stages", destination: "/agenda", permanent: false },'
assert s.count(anchor) == 1, "next.config: ancre redirects"
add = ('      { source: "/stages/:slug", destination: "/seminars/:slug", permanent: true },\n'
       + anchor)
s = s.replace(anchor, add)
p.write_text(s, encoding="utf-8"); print("  ok  next.config.ts (301 /stages/:slug→/seminars/:slug)")
PY

echo ""
echo "→ Suite : pnpm check 2>&1 | tee /tmp/tc.log"
echo "  Si vert : commit unique, migrate deploy local, pnpm dev, validation, merge, serveur."
echo "  Sinon : colle-moi les résidus, on itère (édge-cases front)."