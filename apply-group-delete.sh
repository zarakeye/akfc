#!/usr/bin/env bash
#
# AKFC — Point 2 — UX suppression de groupe (fiche + query).
#
#  - router memberGroup.list : expose `isAdminGroup` (pour masquer le bouton) ;
#  - fiche [id] : zone dangereuse « Supprimer le groupe » avec confirmation,
#    affichage du message backend en cas de refus (Administrateurs / espace non
#    vide), redirection vers la liste au succès, bouton masqué pour Administrateurs.
#
# Prérequis : cascade backend (apply-group-delete-cascade.sh).
# Non testable sur clone (module collab absent) → asserts count==1.
# Usage : bash apply-group-delete-ux.sh
#
set -euo pipefail
RT="packages/backend/src/modules/memberGroups/router.ts"
PG="apps/web/src/app/(admin)/dashboard/groups/[id]/page.tsx"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
for f in "$RT" "$PG"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

python3 - "$RT" "$PG" <<'PY'
import sys, pathlib

# ── router : isAdminGroup dans list ──
rt = pathlib.Path(sys.argv[1]); s = rt.read_text(encoding="utf-8")
if "isAdminGroup: g.isAdminGroup" not in s:
    sel = ("        parentGroupId: true,\n"
           "        _count: { select: { memberships: true } },\n")
    assert s.count(sel) == 1, "RT: ancre select"
    s = s.replace(sel,
        "        isAdminGroup: true,\n"
        "        parentGroupId: true,\n"
        "        _count: { select: { memberships: true } },\n", 1)
    mp = ("      parentGroupId: g.parentGroupId,\n"
          "      memberCount: g._count.memberships,\n")
    assert s.count(mp) == 1, "RT: ancre map"
    s = s.replace(mp,
        "      isAdminGroup: g.isAdminGroup,\n"
        "      parentGroupId: g.parentGroupId,\n"
        "      memberCount: g._count.memberships,\n", 1)
    rt.write_text(s, encoding="utf-8"); print("router: isAdminGroup exposé")
else:
    print("router déjà à jour")

# ── fiche [id] : mutation delete + zone dangereuse ──
pg = pathlib.Path(sys.argv[2]); t = pg.read_text(encoding="utf-8")
if "memberGroup.delete.useMutation" not in t:
    imp = 'import { useParams } from "next/navigation";\n'
    assert t.count(imp) == 1, "PG: import useParams"
    t = t.replace(imp, 'import { useParams, useRouter } from "next/navigation";\n', 1)

    mut = ('  const setParent = trpc.memberGroup.setParentGroup.useMutation({\n'
           '    onSuccess: () => void utils.memberGroup.list.invalidate(),\n'
           '  });\n\n  if (groupsQuery.isLoading) return <div>Chargement…</div>;\n')
    assert t.count(mut) == 1, "PG: ancre mutations"
    t = t.replace(mut,
        '  const setParent = trpc.memberGroup.setParentGroup.useMutation({\n'
        '    onSuccess: () => void utils.memberGroup.list.invalidate(),\n'
        '  });\n\n'
        '  const router = useRouter();\n'
        '  const [confirmingDelete, setConfirmingDelete] = useState(false);\n'
        '  const del = trpc.memberGroup.delete.useMutation({\n'
        '    onSuccess: () => {\n'
        '      void utils.memberGroup.list.invalidate();\n'
        '      router.push("/dashboard/groups");\n'
        '    },\n'
        '  });\n\n  if (groupsQuery.isLoading) return <div>Chargement…</div>;\n', 1)

    end = '    </div>\n  );\n}\n'
    assert t.count(end) == 1, "PG: ancre fin"
    danger = (
'      <div className="mt-8 border-t border-red-200 pt-4">\n'
'        <p className="mb-2 text-sm font-medium text-red-700">Zone dangereuse</p>\n'
'        {group.isAdminGroup ? (\n'
'          <p className="text-sm text-muted-foreground">\n'
'            Le groupe Administrateurs ne peut pas être supprimé.\n'
'          </p>\n'
'        ) : !confirmingDelete ? (\n'
'          <button\n'
'            type="button"\n'
'            onClick={() => setConfirmingDelete(true)}\n'
'            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"\n'
'          >\n'
'            Supprimer le groupe\n'
'          </button>\n'
'        ) : (\n'
'          <div className="space-y-2">\n'
'            <p className="text-sm text-muted-foreground">\n'
'              Supprimer «\u00a0{group.name}\u00a0» ? Son espace doit être vide ; les\n'
'              groupes inclus passeront sous son parent.\n'
'            </p>\n'
'            <div className="flex items-center gap-2">\n'
'              <button\n'
'                type="button"\n'
'                disabled={del.isPending}\n'
'                onClick={() => del.mutate({ id: group.id })}\n'
'                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"\n'
'              >\n'
'                Confirmer la suppression\n'
'              </button>\n'
'              <button\n'
'                type="button"\n'
'                onClick={() => setConfirmingDelete(false)}\n'
'                className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"\n'
'              >\n'
'                Annuler\n'
'              </button>\n'
'            </div>\n'
'          </div>\n'
'        )}\n'
'        {del.error && (\n'
'          <p className="mt-2 text-sm text-red-600">{del.error.message}</p>\n'
'        )}\n'
'      </div>\n'
    )
    t = t.replace(end, danger + end, 1)
    pg.write_text(t, encoding="utf-8"); print("fiche [id]: zone dangereuse ajoutée")
else:
    print("fiche [id] déjà à jour")
PY

echo "typecheck backend + web…"
pnpm --filter backend typecheck > /tmp/tcb.log 2>&1 || { echo "BACKEND KO:"; grep -nE "error TS" /tmp/tcb.log | head; tail -4 /tmp/tcb.log; exit 1; }
pnpm --filter web typecheck > /tmp/tcw.log 2>&1 || { echo "WEB KO:"; grep -nE "error TS" /tmp/tcw.log | head; tail -4 /tmp/tcw.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(groups): UX suppression de groupe (confirmation + message backend) (point 2)" && echo "commit $(git rev-parse --short HEAD)"