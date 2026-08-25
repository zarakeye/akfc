#!/usr/bin/env bash
#
# AKFC — Gating publié/brouillon des disciplines (menu « Nos activités »).
#
# Modèle voulu : PUBLIÉ visible par tous ; BROUILLON visible seulement en
# session ADMIN. Deux causes réparées :
#
#  A) La page d'édition n'envoyait PAS `publicationDate` à `discipline.update`
#     (champs énumérés, oubli) → « Publier » n'écrivait jamais la date → tout
#     restait brouillon. On la transmet.
#  B) Le menu utilisait `getAllPublished` (aucune exception admin). On ajoute
#     une query SERVEUR `getAllForMenu` : publiées pour tous + brouillons si
#     admin (gating côté serveur → pas de fuite), et le menu la consomme.
#
# 3 fichiers : disciplines/router.ts, OurActivitiesMenu.tsx, [id]/edit/page.tsx.
# ⚠️ Ne PAS appliquer fix-activities-menu-criterion.sh (obsolète, montrait les
#    brouillons à tous) — ce script le remplace.
#
# Usage : bash fix-discipline-publish-gating.sh
#
set -euo pipefail
RT="packages/backend/src/modules/disciplines/router.ts"
MENU="apps/web/src/features/app-shell/OurActivitiesMenu.tsx"
EDIT="apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
for f in "$RT" "$MENU" "$EDIT"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

python3 - "$RT" "$MENU" "$EDIT" <<'PY'
import sys, pathlib

# ── 1) router : ajoute getAllForMenu après getAllPublished ──
rt = pathlib.Path(sys.argv[1]); s = rt.read_text(encoding="utf-8")
if "getAllForMenu" not in s:
    anchor = ('  getAllPublished: publicProcedure.query(async ({ ctx }) => {\n'
              '    return ctx.prisma.discipline.findMany({\n'
              '      where: { publicationDate: { not: null, lte: new Date() } },\n'
              '      orderBy: [{ categoryId: "asc" }, { name: "asc" }],\n'
              '    });\n'
              '  }),\n')
    assert s.count(anchor) == 1, "RT: ancre getAllPublished"
    add = ('\n'
           '  /**\n'
           '   * Disciplines du menu « Nos activités » : PUBLIÉES pour tous, PLUS les\n'
           '   * brouillons si la session est ADMIN. Gating SERVEUR — un visiteur\n'
           '   * non-admin ne peut pas récupérer les brouillons via cette query.\n'
           '   */\n'
           '  getAllForMenu: publicProcedure.query(async ({ ctx }) => {\n'
           '    const isAdmin = ctx.sessionClient?.user?.role?.name === "ADMIN";\n'
           '    return ctx.prisma.discipline.findMany({\n'
           '      where: isAdmin ? {} : { publicationDate: { not: null, lte: new Date() } },\n'
           '      orderBy: [{ categoryId: "asc" }, { name: "asc" }],\n'
           '    });\n'
           '  }),\n')
    s = s.replace(anchor, anchor + add, 1)
    rt.write_text(s, encoding="utf-8"); print("router: getAllForMenu ajouté")
else:
    print("router déjà à jour")

# ── 2) menu : getAllPublished → getAllForMenu ──
mn = pathlib.Path(sys.argv[2]); m = mn.read_text(encoding="utf-8")
if "getAllForMenu" not in m:
    q = '  const { data: disciplinesData } = trpc.discipline.getAllPublished.useQuery();\n'
    assert m.count(q) == 1, "MENU: ancre query"
    m = m.replace(q, '  const { data: disciplinesData } = trpc.discipline.getAllForMenu.useQuery();\n', 1)
    mn.write_text(m, encoding="utf-8"); print("menu: getAllForMenu")
else:
    print("menu déjà à jour")

# ── 3) edit : transmet publicationDate à update ──
ed = pathlib.Path(sys.argv[3]); e = ed.read_text(encoding="utf-8")
if "publicationDate: input.publicationDate" not in e:
    a = ('    await updateMutation.mutateAsync({\n'
         '      id: disciplineId,\n'
         '      name: input.name,\n')
    assert e.count(a) == 1, "EDIT: ancre mutateAsync"
    e = e.replace(a,
        '    await updateMutation.mutateAsync({\n'
        '      id: disciplineId,\n'
        '      publicationDate: input.publicationDate,\n'
        '      name: input.name,\n', 1)
    ed.write_text(e, encoding="utf-8"); print("edit: publicationDate transmis")
else:
    print("edit déjà à jour")
PY

echo "typecheck backend + web…"
pnpm --filter backend typecheck > /tmp/tcb.log 2>&1 || { echo "BACKEND KO:"; grep -nE "error TS" /tmp/tcb.log | head; tail -4 /tmp/tcb.log; exit 1; }
pnpm --filter web typecheck > /tmp/tcw.log 2>&1 || { echo "WEB KO:"; grep -nE "error TS" /tmp/tcw.log | head; tail -4 /tmp/tcw.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "fix(disciplines): gating publié/brouillon (edit transmet publicationDate + menu getAllForMenu gaté admin)" && echo "commit $(git rev-parse --short HEAD)"