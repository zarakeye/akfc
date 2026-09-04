#!/usr/bin/env bash
#
# AKFC — Chantier B, B2 : stage.listForUpload (liste des stages pour la cascade).
#
# Le niveau 2 de la cascade « Stage » a besoin de la liste des stages existants.
# On ajoute stage.listForUpload, calqué sur event.listForUpload : protectedProcedure
# (accessible aux membres → dépôt vers un stage), renvoie { id, label, slug }.
#
# Backend seul (stages/router). typecheck backend + web.
#
# Usage : bash apply-B2-stage-listforupload.sh
#         AKFC_APPLY_ONLY=1 bash apply-B2-stage-listforupload.sh   (clone)
#
set -euo pipefail

F="packages/backend/src/modules/stages/router.ts"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "listForUpload" in s:
    print("— stage.listForUpload déjà présent"); sys.exit(0)

anchor = (
    "  getAll: publicProcedure.query(async ({ ctx }) => {\n"
    "    return ctx.prisma.stage.findMany({\n"
    "      where: { publicationDate: { not: null, lte: new Date() } },\n"
    '      orderBy: [{ disciplineId: "asc" }, { label: "asc" }],\n'
    "    });\n"
    "  }),\n"
)
assert anchor in s, "ancre stage.getAll introuvable"
addition = (
    "\n"
    "  /**\n"
    "   * Liste pour l'uploader (cascade) : TOUS les stages, id + label + slug.\n"
    "   * protectedProcedure → accessible aux membres (dépôt vers un stage). La\n"
    "   * lecture du CONTENU déposé reste admin (assertCanReadPath).\n"
    "   */\n"
    "  listForUpload: protectedProcedure.query(async ({ ctx }) => {\n"
    "    return ctx.prisma.stage.findMany({\n"
    "      select: { id: true, label: true, slug: true },\n"
    "      orderBy: [\n"
    '        { publicationDate: { sort: "desc", nulls: "first" } },\n'
    '        { createdAt: "desc" },\n'
    "      ],\n"
    "    });\n"
    "  }),\n"
)
s = s.replace(anchor, anchor + addition)
p.write_text(s, encoding="utf-8")
print("✓ stage.listForUpload ajouté")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|listForUpload|stage" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(B2): stage.listForUpload (liste des stages pour la cascade d'upload)" \
  && echo "commit $(git rev-parse --short HEAD)"