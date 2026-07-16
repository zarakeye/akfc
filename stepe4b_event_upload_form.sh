#!/usr/bin/env bash
###############################################################################
# E4b — Destination « Vers un évènement » dans le DragNDropForm (FRONT)
#
#   1. formSchema      : + membre event { destinationKind, eventId }
#   2. type Destination : + { kind:'event', eventId, disciplineIds }
#   3. queries          : event.listForUpload + discipline.getAll (toutes, la
#                         query existante est filtrée par catégorie)
#   4. état local       : eventDisciplineIds (hors schéma → pas de douleur de
#                         typage RHF sur une union discriminée)
#   5. construction     : branche event
#   6. buildR2Path      : branche event (slug aligné sur le backend)
#   7. UI               : 3e radio + select d'évènement + cases disciplines
#
# Requiert E4a (backend) appliqué.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q "listForUpload" packages/backend/src/modules/events/router.ts 2>/dev/null; then
  echo "ERREUR: E4a absent. Applique stepE4a_event_upload_backend.sh d'abord."; exit 1
fi
FORM="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
if grep -q "z.literal('event')" "$FORM" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

python3 - << 'PY'
p = "apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

# --- 1. formSchema : membre event ----------------------------------------- #
sub('''    destinationKind: z.literal('general'),
    // Sous-dossier optionnel sous « Général » (vide = racine).
    generalFolder: z.string().trim().max(120).optional(),
  }),
]);''',
'''    destinationKind: z.literal('general'),
    // Sous-dossier optionnel sous « Général » (vide = racine).
    generalFolder: z.string().trim().max(120).optional(),
  }),
  z.object({
    destinationKind: z.literal('event'),
    // Les évènements sont créés par les admins ; on en choisit un existant.
    eventId: z
      .number({ message: 'Sélectionne un évènement.' })
      .int()
      .positive('Sélectionne un évènement.'),
  }),
]);''',
"1.formSchema")

# --- 2. type Destination --------------------------------------------------- #
sub('''      kind: 'general';
      folder?: string;
    };''',
'''      kind: 'general';
      folder?: string;
    }
  | {
      kind: 'event';
      eventId: number;
      /** Disciplines présentées lors de l'évènement (enrichissent l'évènement). */
      disciplineIds: number[];
    };''',
"2.DestinationType")

# --- 3. queries + 4. état local -------------------------------------------- #
sub('''  const generalFoldersQuery = trpc.storage.listGeneralFolders.useQuery(
    undefined,
    { enabled: destinationKind === 'general' },
  );
  const generalFolders = generalFoldersQuery.data ?? [];''',
'''  const generalFoldersQuery = trpc.storage.listGeneralFolders.useQuery(
    undefined,
    { enabled: destinationKind === 'general' },
  );
  const generalFolders = generalFoldersQuery.data ?? [];

  // Évènements existants (créés par les admins) pour le picker.
  const eventsQuery = trpc.event.listForUpload.useQuery(undefined, {
    enabled: destinationKind === 'event',
  });
  const eventsForUpload = eventsQuery.data ?? [];

  // TOUTES les disciplines : `disciplinesQuery` ci-dessus est filtrée par
  // catégorie, or un évènement n'a pas de catégorie.
  const allDisciplinesQuery = trpc.discipline.getAll.useQuery(undefined, {
    enabled: destinationKind === 'event',
  });
  const allDisciplines = allDisciplinesQuery.data ?? [];

  // Hors schéma RHF (évite le typage d'un tableau dans une union discriminée) —
  // fusionné à la destination au moment de la soumission.
  const [eventDisciplineIds, setEventDisciplineIds] = useState<number[]>([]);

  const toggleEventDiscipline = (id: number) => {
    setEventDisciplineIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };''',
"3.queries")

# --- 5. construction : branche event --------------------------------------- #
sub('''    } else {
      const folder = values.generalFolder?.trim();
      destination = { kind: 'general', folder: folder ? folder : undefined };
    }''',
'''    } else if (values.destinationKind === 'event') {
      destination = {
        kind: 'event',
        eventId: values.eventId,
        disciplineIds: eventDisciplineIds,
      };
    } else {
      const folder = values.generalFolder?.trim();
      destination = { kind: 'general', folder: folder ? folder : undefined };
    }''',
"5.construction")

# --- 6. buildR2Path : branche event ---------------------------------------- #
sub('''    if (destination.kind === 'general') {
      const folderSlug = destination.folder ? slugify(destination.folder) : '';
      return folderSlug
        ? `${APP_ROOT}/pending/general/${folderSlug}/${safeFileName}`
        : `${APP_ROOT}/pending/general/${safeFileName}`;
    }''',
'''    if (destination.kind === 'general') {
      const folderSlug = destination.folder ? slugify(destination.folder) : '';
      return folderSlug
        ? `${APP_ROOT}/pending/general/${folderSlug}/${safeFileName}`
        : `${APP_ROOT}/pending/general/${safeFileName}`;
    }

    if (destination.kind === 'event') {
      // Même règle que le backend (`resolvePendingUploadFolder`) : slug de
      // l'évènement, fallback `event-<id>` car `Event.slug` est nullable.
      const ev = eventsForUpload.find((e) => e.id === destination.eventId);
      const eventSlug = ev?.slug
        ? slugify(ev.slug)
        : `event-${destination.eventId}`;
      return `${APP_ROOT}/pending/events/${eventSlug}/${safeFileName}`;
    }''',
"6.buildR2Path")

# --- 7. UI : radios ------------------------------------------------------- #
sub('''      {/* Destination : discipline ou « Général » */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={destinationKind !== 'general'}
            onChange={() => setValue('destinationKind', 'existing-discipline')}
          />
          Vers une discipline
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={destinationKind === 'general'}
            onChange={() => setValue('destinationKind', 'general')}
          />
          Vers « Général »
        </label>
      </div>

      {destinationKind !== 'general' && (''',
'''      {/* Destination : discipline, « Général » ou évènement */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={
              destinationKind === 'existing-discipline' ||
              destinationKind === 'new-discipline'
            }
            onChange={() => setValue('destinationKind', 'existing-discipline')}
          />
          Vers une discipline
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={destinationKind === 'general'}
            onChange={() => setValue('destinationKind', 'general')}
          />
          Vers « Général »
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={destinationKind === 'event'}
            onChange={() => setValue('destinationKind', 'event')}
          />
          Vers un évènement
        </label>
      </div>

      {(destinationKind === 'existing-discipline' ||
        destinationKind === 'new-discipline') && (''',
"7.radios")

# --- 8. UI : bloc évènement (avant le bloc général) ------------------------ #
sub('''      {destinationKind === 'general' && (
        <div>
          <label className="block font-semibold mb-1">Dossier (optionnel)</label>''',
'''      {destinationKind === 'event' && (
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

      {destinationKind === 'general' && (
        <div>
          <label className="block font-semibold mb-1">Dossier (optionnel)</label>''',
"8.eventBlock")

open(p, "w", encoding="utf-8").write(s)
print("  DragNDropForm.tsx : 8 éditions event OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck web (serveur arrêté + .next vidé recommandé) =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(upload): add event destination (event picker + 0..N disciplines) to uploader"
echo "OK — E4b commité."