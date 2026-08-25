#!/usr/bin/env bash
#
# AKFC — Point 2 — UX suppression de DISCIPLINE (v2, ancre courte).
#
# Zone dangereuse en bas de `(admin)/dashboard/disciplines/[id]/edit` :
# « Supprimer la discipline » → confirmation → message backend en rouge au
# refus → redirection liste au succès. Prérequis : cascade discipline backend.
#
# Usage : bash apply-discipline-delete-ux.sh
#
set -euo pipefail
F="apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "discipline.delete.useMutation" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# import useRouter
s = sub(
'import Link from "next/link";\n',
'import Link from "next/link";\n'
'import { useRouter } from "next/navigation";\n',
"import useRouter")

# mutation delete + state (après done)
s = sub(
'  const utils = trpc.useUtils();\n'
'  const updateMutation = trpc.discipline.update.useMutation();\n'
'  const [done, setDone] = useState(false);\n',
'  const utils = trpc.useUtils();\n'
'  const updateMutation = trpc.discipline.update.useMutation();\n'
'  const [done, setDone] = useState(false);\n'
'\n'
'  const router = useRouter();\n'
'  const [confirmingDelete, setConfirmingDelete] = useState(false);\n'
'  const del = trpc.discipline.delete.useMutation({\n'
'    onSuccess: async () => {\n'
'      await utils.discipline.getAll.invalidate();\n'
'      router.push("/dashboard/disciplines");\n'
'    },\n'
'  });\n',
"mutation delete")

# zone dangereuse — ANCRE COURTE : )} + </div> + );  (indépendante de la fin de fichier)
s = sub(
'      )}\n'
'    </div>\n'
'  );\n',
'      )}\n'
'\n'
'      {!done && (\n'
'        <div className="mt-8 border-t border-red-200 pt-4">\n'
'          <p className="mb-2 text-sm font-medium text-red-700">Zone dangereuse</p>\n'
'          {!confirmingDelete ? (\n'
'            <button\n'
'              type="button"\n'
'              onClick={() => setConfirmingDelete(true)}\n'
'              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"\n'
'            >\n'
'              Supprimer la discipline\n'
'            </button>\n'
'          ) : (\n'
'            <div className="space-y-2">\n'
'              <p className="text-sm text-muted-foreground">\n'
'                Supprimer «\u00a0{discipline.name}\u00a0» ? Son dossier doit être vide.\n'
'              </p>\n'
'              <div className="flex items-center gap-2">\n'
'                <button\n'
'                  type="button"\n'
'                  disabled={del.isPending}\n'
'                  onClick={() => del.mutate({ id: disciplineId })}\n'
'                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"\n'
'                >\n'
'                  Confirmer la suppression\n'
'                </button>\n'
'                <button\n'
'                  type="button"\n'
'                  onClick={() => setConfirmingDelete(false)}\n'
'                  className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"\n'
'                >\n'
'                  Annuler\n'
'                </button>\n'
'              </div>\n'
'            </div>\n'
'          )}\n'
'          {del.error && (\n'
'            <p className="mt-2 text-sm text-red-600">{del.error.message}</p>\n'
'          )}\n'
'        </div>\n'
'      )}\n'
'    </div>\n'
'  );\n',
"zone dangereuse")

p.write_text(s, encoding="utf-8")
print("UX suppression discipline ajoutée")
PY

echo "typecheck web…"
pnpm --filter web typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(disciplines): UX suppression (zone dangereuse + message backend) (point 2)" && echo "commit $(git rev-parse --short HEAD)"