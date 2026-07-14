#!/usr/bin/env bash
###############################################################################
# G2 — Option « Général » dans le DragNDropForm (+ dossier via datalist)
#
# 6 éditions sur DragNDropForm.tsx :
#   1. formSchema : +membre general { destinationKind, generalFolder? }.
#   2. type Destination : +{ kind:'general', folder? }.
#   3. construction destination : branche general.
#   4. buildR2Path : branche general TÔT (avant l'accès categoryId).
#   5. query listGeneralFolders (+ liste generalFolders).
#   6. UI : toggle « Discipline / Général » au-dessus ; le bloc discipline est
#      masqué en général ; input dossier avec <datalist> des existants.
#
# Requiert G1.6 (general.folder optionnel + query listGeneralFolders).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

FORM="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
test -f "$FORM" || { echo "ERREUR: $FORM introuvable."; exit 1; }

if ! grep -q "listGeneralFolders" packages/backend/src/modules/storage/router.ts 2>/dev/null; then
  echo "ERREUR: G1.5/G1.6 absents (listGeneralFolders). Applique-les d'abord."; exit 1
fi
if grep -q "z.literal('general')" "$FORM" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

python3 - << 'PY'
p = "apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    return s.replace(a, b)

# 1. formSchema : membre general
a = '''      .refine((v) => /[a-zA-Z0-9]/.test(v), {
        message: 'Le nom doit contenir au moins une lettre ou un chiffre',
      }),
  }),
]);'''
b = '''      .refine((v) => /[a-zA-Z0-9]/.test(v), {
        message: 'Le nom doit contenir au moins une lettre ou un chiffre',
      }),
  }),
  z.object({
    destinationKind: z.literal('general'),
    // Sous-dossier optionnel sous « Général » (vide = racine).
    generalFolder: z.string().trim().max(120).optional(),
  }),
]);'''
s = sub(a, b, "1.formSchema")

# 2. type Destination
a = '''  | {
      kind: 'new-discipline';
      categoryId: number;
      proposedDisciplineName: string;
    };'''
b = '''  | {
      kind: 'new-discipline';
      categoryId: number;
      proposedDisciplineName: string;
    }
  | {
      kind: 'general';
      folder?: string;
    };'''
s = sub(a, b, "2.DestinationType")

# 3. construction destination
a = '''    const destination: Destination =
      values.destinationKind === 'existing-discipline'
        ? {
            kind: 'existing-discipline',
            categoryId: values.categoryId,
            disciplineId: values.disciplineId,
          }
        : {
            kind: 'new-discipline',
            categoryId: values.categoryId,
            proposedDisciplineName: values.proposedDisciplineName.trim(),
          };'''
b = '''    let destination: Destination;
    if (values.destinationKind === 'existing-discipline') {
      destination = {
        kind: 'existing-discipline',
        categoryId: values.categoryId,
        disciplineId: values.disciplineId,
      };
    } else if (values.destinationKind === 'new-discipline') {
      destination = {
        kind: 'new-discipline',
        categoryId: values.categoryId,
        proposedDisciplineName: values.proposedDisciplineName.trim(),
      };
    } else {
      const folder = values.generalFolder?.trim();
      destination = { kind: 'general', folder: folder ? folder : undefined };
    }'''
s = sub(a, b, "3.construction")

# 4. buildR2Path : general tôt
a = '''  const buildR2Path = (destination: Destination, fileName: string): string => {
    const category = categories.find((c) => c.id === destination.categoryId);
    const categorySlug = slugify(category?.type ?? `cat-${destination.categoryId}`);

    let disciplineSlug: string;
    if (destination.kind === 'existing-discipline') {
      const discipline = disciplines.find(
        (d) => d.id === destination.disciplineId
      );
      disciplineSlug = slugify(
        discipline?.name ?? `disc-${destination.disciplineId}`
      );
    } else {
      disciplineSlug = slugify(destination.proposedDisciplineName);
    }

    const dotIdx = fileName.lastIndexOf('.');
    const baseName = dotIdx === -1 ? fileName : fileName.slice(0, dotIdx);
    const ext = dotIdx === -1 ? '' : fileName.slice(dotIdx);
    const safeFileName = `${slugify(baseName)}${ext.toLowerCase()}`;

    return `${APP_ROOT}/pending/${categorySlug}/${disciplineSlug}/${safeFileName}`;
  };'''
b = '''  const buildR2Path = (destination: Destination, fileName: string): string => {
    const dotIdx = fileName.lastIndexOf('.');
    const baseName = dotIdx === -1 ? fileName : fileName.slice(0, dotIdx);
    const ext = dotIdx === -1 ? '' : fileName.slice(dotIdx);
    const safeFileName = `${slugify(baseName)}${ext.toLowerCase()}`;

    if (destination.kind === 'general') {
      const folderSlug = destination.folder ? slugify(destination.folder) : '';
      return folderSlug
        ? `${APP_ROOT}/pending/general/${folderSlug}/${safeFileName}`
        : `${APP_ROOT}/pending/general/${safeFileName}`;
    }

    const category = categories.find((c) => c.id === destination.categoryId);
    const categorySlug = slugify(category?.type ?? `cat-${destination.categoryId}`);

    let disciplineSlug: string;
    if (destination.kind === 'existing-discipline') {
      const discipline = disciplines.find(
        (d) => d.id === destination.disciplineId
      );
      disciplineSlug = slugify(
        discipline?.name ?? `disc-${destination.disciplineId}`
      );
    } else {
      disciplineSlug = slugify(destination.proposedDisciplineName);
    }

    return `${APP_ROOT}/pending/${categorySlug}/${disciplineSlug}/${safeFileName}`;
  };'''
s = sub(a, b, "4.buildR2Path")

# 5. query listGeneralFolders
a = "  const disciplines = disciplinesQuery.data ?? [];"
b = '''  const disciplines = disciplinesQuery.data ?? [];

  const generalFoldersQuery = trpc.storage.listGeneralFolders.useQuery(
    undefined,
    { enabled: destinationKind === 'general' },
  );
  const generalFolders = generalFoldersQuery.data ?? [];'''
s = sub(a, b, "5.query")

# 6a. UI : toggle + wrap start
a = "      {/* Catégorie */}"
b = '''      {/* Destination : discipline ou « Général » */}
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

      {destinationKind !== 'general' && (
        <>
          {/* Catégorie */}'''
s = sub(a, b, "6a.toggle")

# 6b. UI : wrap end + bloc général
a = '''        </>
      )}

      {/* Dropzone */}'''
b = '''        </>
      )}
        </>
      )}

      {destinationKind === 'general' && (
        <div>
          <label className="block font-semibold mb-1">Dossier (optionnel)</label>
          <input
            type="text"
            list="akfc-general-folders"
            {...register('generalFolder')}
            className="border rounded p-2 w-full"
            placeholder="Vide = racine de « Général »"
          />
          <datalist id="akfc-general-folders">
            {generalFolders.map((folder) => (
              <option key={folder} value={folder} />
            ))}
          </datalist>
          <p className="text-xs text-gray-500 mt-1">
            Choisis un dossier existant, tape un nouveau nom, ou laisse vide.
          </p>
        </div>
      )}

      {/* Dropzone */}'''
s = sub(a, b, "6b.generalBlock")

open(p, "w", encoding="utf-8").write(s)
print("  DragNDropForm.tsx : 6 éditions general OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(upload): add general destination (root/existing/new folder) to library uploader"
echo "OK — G2 commité. (rm -rf apps/web/.next si HMR récalcitrant)"