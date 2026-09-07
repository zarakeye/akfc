#!/usr/bin/env bash
#
# AKFC — Bouton « Supprimer » sur les pages d'édition stage + event.
#
# Les mutations `stage.delete` / `event.delete` existent déjà (backend). On
# ajoute le bouton en édition : confirmation, mutation, invalidation de la liste,
# puis SuccessRedirect vers la liste. État local `deleting` (indépendant de la
# version React Query).
#
# Périmètre : FRONT (2 pages edit). Un aller-retour = un typecheck.
# Usage : bash apply-stage-event-delete-button.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
SP="apps/web/src/app/(admin)/dashboard/stages/[id]/edit/page.tsx"
EP="apps/web/src/app/(admin)/dashboard/events/[id]/edit/page.tsx"
[ -f "$SP" ] || { echo "ERREUR: $SP introuvable." >&2; exit 1; }
[ -f "$EP" ] || { echo "ERREUR: $EP introuvable." >&2; exit 1; }
if grep -q 'Supprimer le stage' "$SP" 2>/dev/null; then echo "— déjà appliqué"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$SP" "$EP" <<'PY'
import sys, pathlib
SP, EP = sys.argv[1], sys.argv[2]

def edit(path, subs):
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8")
    for label, old, new in subs:
        assert s.count(old) == 1, f"{path}: ancre « {label} » attendue 1, trouvée {s.count(old)}"
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")
    print(f"  ok  {path}")

# ── STAGE ──
edit(SP, [
  ("import lucide",
   'import { ArrowLeft } from "lucide-react";',
   'import { ArrowLeft, Trash2 } from "lucide-react";'),
  ("mutation+state",
   """  const updateMutation = trpc.stage.update.useMutation();
  const [done, setDone] = useState(false);""",
   """  const updateMutation = trpc.stage.update.useMutation();
  const deleteMutation = trpc.stage.delete.useMutation();
  const [done, setDone] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);"""),
  ("handleDelete",
   """    await utils.stage.getByIdAdmin.invalidate({ id: stageId });
    setDone(true);
  };""",
   """    await utils.stage.getByIdAdmin.invalidate({ id: stageId });
    setDone(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (
      !window.confirm(
        "Supprimer définitivement ce stage ? Cette action est irréversible.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: stageId });
      await utils.stage.getAllAdmin.invalidate();
      setDeleted(true);
    } finally {
      setDeleting(false);
    }
  };"""),
  ("render",
   """      {done ? (
        <SuccessRedirect
          target={`/dashboard/stages/${stageId}`}
          message="Stage mis à jour."
        />
      ) : (
        <StageForm
          initial={stage}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      )}""",
   """      {done ? (
        <SuccessRedirect
          target={`/dashboard/stages/${stageId}`}
          message="Stage mis à jour."
        />
      ) : deleted ? (
        <SuccessRedirect target="/dashboard/stages" message="Stage supprimé." />
      ) : (
        <>
          <StageForm
            initial={stage}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer"
          />
          <div className="mt-8 border-t pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Suppression…" : "Supprimer le stage"}
            </button>
          </div>
        </>
      )}"""),
])

# ── EVENT ──
edit(EP, [
  ("import lucide",
   'import { ArrowLeft } from "lucide-react";',
   'import { ArrowLeft, Trash2 } from "lucide-react";'),
  ("mutation+state",
   """  const updateMutation = trpc.event.update.useMutation();
  const [done, setDone] = useState(false);""",
   """  const updateMutation = trpc.event.update.useMutation();
  const deleteMutation = trpc.event.delete.useMutation();
  const [done, setDone] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);"""),
  ("handleDelete",
   """    await utils.event.getByIdAdmin.invalidate({ id: eventId });
    setDone(true);
  };""",
   """    await utils.event.getByIdAdmin.invalidate({ id: eventId });
    setDone(true);
  };

  const handleDelete = async (): Promise<void> => {
    if (
      !window.confirm(
        "Supprimer définitivement cet évènement ? Cette action est irréversible.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: eventId });
      await utils.event.getAllAdmin.invalidate();
      await utils.event.getAll.invalidate();
      setDeleted(true);
    } finally {
      setDeleting(false);
    }
  };"""),
  ("render",
   """      {done ? (
        <SuccessRedirect
          target={`/dashboard/events/${eventId}`}
          message="Évènement mis à jour."
        />
      ) : (
        <EventForm
          initial={event}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      )}""",
   """      {done ? (
        <SuccessRedirect
          target={`/dashboard/events/${eventId}`}
          message="Évènement mis à jour."
        />
      ) : deleted ? (
        <SuccessRedirect target="/dashboard/events" message="Évènement supprimé." />
      ) : (
        <>
          <EventForm
            initial={event}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer"
          />
          <div className="mt-8 border-t pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Suppression…" : "Supprimer l'évènement"}
            </button>
          </div>
        </>
      )}"""),
])
print("Boutons supprimer ajoutés.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "feat(admin): bouton supprimer sur l'édition stage + event" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi