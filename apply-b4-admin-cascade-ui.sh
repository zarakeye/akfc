#!/usr/bin/env bash
#
# AKFC — Chantier B, B4 : UI de destination admin → cascade (type → entité).
#
# Remplace le bloc de sélection de destination (radios + catégorie + existing/new
# + event + common_repository) par une CASCADE alignée sur le membre :
#   niveau 1 : Discipline / Stage / Event / Dépôt commun
#   niveau 2 : l'entité existante (discipline via getAllByCategory, stage via
#              listForUpload, event via listForUpload)
# Conserve : le multiselect `disciplineIds` d'enrichissement des events, la
# datalist des dépôts communs. Retire : new-discipline + le select catégorie
# (une seule catégorie Cours → categoryId dérivé de la discipline choisie).
#
# ⚠ Dépend de variables déjà présentes dans le composant :
#   - `categories`, `disciplines`, `disciplinesQuery`, `categoryId`,
#     `eventsForUpload`, `eventsQuery`, `allDisciplines`, `eventDisciplineIds`,
#     `toggleEventDiscipline`, `containerFolders`, `control`, `register`,
#     `setValue`, `errors`.
#   - AJOUTE le besoin de `stagesForUpload` (liste des stages) → le script vérifie
#     sa présence et te dit s'il faut l'ajouter (petit hook useQuery).
#
# Front seul. typecheck web (doit devenir VERT — B3 + B4 = cascade complète).
#
# Usage : bash apply-B4-admin-cascade-ui.sh
#         AKFC_APPLY_ONLY=1 bash apply-B4-admin-cascade-ui.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
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

# ── 0. hook stagesForUpload : l'ajouter s'il manque, à côté de eventsQuery ──
if "stagesForUpload" not in s:
    anchor_hook = None
    for cand in [
        "  const eventsQuery = trpc.event.listForUpload.useQuery(undefined, {\n",
        "const eventsQuery = trpc.event.listForUpload.useQuery",
    ]:
        if cand in s:
            anchor_hook = cand; break
    if anchor_hook and anchor_hook.endswith("{\n"):
        # insérer un hook stages juste avant le hook events
        hook = (
            "  const stagesQuery = trpc.stage.listForUpload.useQuery(undefined, {\n"
            "    enabled: destinationKind === 'stage',\n"
            "  });\n"
            "  const stagesForUpload = stagesQuery.data ?? [];\n"
        )
        s = s.replace(anchor_hook, hook + anchor_hook, 1)
        print("✓ hook stagesForUpload ajouté")
    else:
        print("!! impossible d'ancrer le hook stages — ajoute à la main :")
        print("   const stagesQuery = trpc.stage.listForUpload.useQuery(undefined, { enabled: destinationKind === 'stage' });")
        print("   const stagesForUpload = stagesQuery.data ?? [];")

# ── 1. le bloc UI de destination (radios de tête → juste avant la Dropzone) ──
start_marker = '      <div className="flex flex-wrap gap-4">\n'
end_marker = "      {/* Dropzone */}\n"
i = s.find(start_marker)
j = s.find(end_marker)
assert i != -1 and j != -1 and i < j, "bornes du bloc destination introuvables"

new_ui = '''      {/* Niveau 1 : type de destination */}
      <div className="flex flex-wrap gap-4">
        {([
          ['existing-discipline', 'Vers une discipline'],
          ['stage', 'Vers un stage'],
          ['event', 'Vers un évènement'],
          ['common_repository', 'Vers « Dépôt commun »'],
        ] as const).map(([kind, label]) => (
          <label key={kind} className="flex items-center gap-2">
            <input
              type="radio"
              checked={destinationKind === kind}
              onChange={() => setValue('destinationKind', kind)}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Niveau 2 : discipline existante */}
      {destinationKind === 'existing-discipline' && (
        <div>
          <label className="block font-semibold mb-1">Discipline</label>
          <Controller
            name="disciplineId"
            control={control}
            render={({ field }) => (
              <select
                value={field.value ?? ''}
                onChange={(e) => {
                  const id =
                    e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(id);
                  // categoryId dérivé de la discipline choisie (une seule
                  // catégorie « Cours » — plus de select catégorie).
                  const d = disciplines.find((x) => x.id === id);
                  if (d) setValue('categoryId', d.categoryId);
                }}
                onBlur={field.onBlur}
                className="border rounded p-2 w-full"
                disabled={disciplinesQuery.isLoading}
              >
                <option value="">— Choisir une discipline —</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          />
          {disciplinesQuery.isLoading && (
            <p className="text-sm text-gray-500 mt-1">Chargement…</p>
          )}
          {'disciplineId' in errors && errors.disciplineId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.disciplineId.message}
            </p>
          )}
        </div>
      )}

      {/* Niveau 2 : stage existant */}
      {destinationKind === 'stage' && (
        <div>
          <label className="block font-semibold mb-1">Stage</label>
          {stagesQuery.isLoading ? (
            <p className="text-sm text-gray-500">Chargement…</p>
          ) : stagesForUpload.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun stage. Les stages sont créés par les admins.
            </p>
          ) : (
            <select
              {...register('stageId', { valueAsNumber: true })}
              defaultValue=""
              className="border rounded p-2 w-full"
            >
              <option value="" disabled>
                — Choisir un stage —
              </option>
              {stagesForUpload.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          )}
          {'stageId' in errors && errors.stageId && (
            <p className="text-sm text-red-600 mt-1">{errors.stageId.message}</p>
          )}
        </div>
      )}

      {/* Niveau 2 : évènement + disciplines d'enrichissement (admin) */}
      {destinationKind === 'event' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block font-semibold mb-1">Évènement</label>
            {eventsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Chargement…</p>
            ) : eventsForUpload.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucun évènement. Les évènements sont créés par les admins.
              </p>
            ) : (
              <select
                {...register('eventId', { valueAsNumber: true })}
                defaultValue=""
                className="border rounded p-2 w-full"
              >
                <option value="" disabled>
                  — Choisir un évènement —
                </option>
                {eventsForUpload.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            )}
            {'eventId' in errors && errors.eventId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.eventId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Disciplines présentées (optionnel)
            </label>
            {allDisciplines.length === 0 ? (
              <p className="text-sm text-gray-500">Chargement…</p>
            ) : (
              <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded border p-2">
                {allDisciplines.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={eventDisciplineIds.includes(d.id)}
                      onChange={() => toggleEventDiscipline(d.id)}
                    />
                    <span>{d.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Elles décrivent l&apos;ÉVÈNEMENT (pas chaque fichier) et
              s&apos;ajoutent aux disciplines déjà enregistrées sur lui.
            </p>
          </div>
        </div>
      )}

      {/* Niveau 2 : Dépôt commun (fallback) */}
      {destinationKind === 'common_repository' && (
        <div>
          <label className="block font-semibold mb-1">Nom du dossier de dépôt</label>
          <input
            type="text"
            list="akfc-common-repository-folders"
            {...register('containerName')}
            className="border rounded p-2 w-full"
            placeholder="Nom du dossier de dépôt"
          />
          <datalist id="akfc-common-repository-folders">
            {containerFolders.map((folder) => (
              <option key={folder} value={folder} />
            ))}
          </datalist>
          <p className="text-xs text-gray-500 mt-1">
            Choisis un dossier existant, tape un nouveau nom, ou laisse vide.
          </p>
        </div>
      )}

'''

s = s[:i] + new_ui + s[j:]
p.write_text(s, encoding="utf-8")
print("✓ B4 : UI de destination refondue en cascade (new-discipline + catégorie retirés)")

# rapport résidus
resid = [f"{k}:{ln.strip()}" for k, ln in enumerate(s.splitlines(),1)
         if "new-discipline" in ln or "proposedDisciplineName" in ln]
print("résidus new-discipline:", resid if resid else "(aucun)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|stage|categoryId|disciplineId|Controller|stagesForUpload" /tmp/akfc_tc.log | head -30; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(B3+B4): uploader admin en cascade (discipline/stage/event/dépôt commun), new-discipline retiré" \
  && echo "commit $(git rev-parse --short HEAD)"