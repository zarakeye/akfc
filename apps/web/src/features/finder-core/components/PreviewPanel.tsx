import { JSX } from 'react';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { resolveSelection } from '@features/finder-core/utils/resolveSelection';

export default function PreviewPanel(): JSX.Element {
  const { selection, files } = useFinderStore();

  const allItems = files.map((f) => ({ id: f.id, path: f.path }));

  const resolved = resolveSelection({
    items: allItems,
    roots: selection.roots,
    excluded: selection.excluded,
  });

  const firstId = Array.from(resolved)[0];

  if (!firstId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Aucun élément sélectionné
      </div>
    );
  }

  const file = files.find((f) => f.id === firstId);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        Aperçu indisponible
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="text-sm font-medium truncate">{file.name}</div>

      {file.url ? (
        <img
          src={file.url}
          alt={file.name}
          className="max-h-75 object-contain rounded border"
        />
      ) : (
        <div className="text-gray-400 text-sm">
          Pas de preview disponible
        </div>
      )}
    </div>
  );
}