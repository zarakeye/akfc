import { JSX } from 'react';
import Finder from '@features/finder-core/components/Finder';
import { Modal } from '@components/ui/Modal';
import { resolveSelection } from '@features/finder-core/utils/resolveSelection';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { FileAdapter } from '@contracts/finder';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedPaths: string[]) => void;
  adapter: FileAdapter;
  /**
   * Chemin racine de l'arbre du finder embarqué dans le picker.
   *
   * Propagé tel quel au composant `<Finder>` pour alimenter sa TreeView.
   * Pour AKFC, c'est typiquement l'`appRoot` du projet (ex: "AKFC").
   */
  rootPath: string;
};

export function MediaPicker({
  open,
  onClose,
  onSubmit,
  adapter,
  rootPath,
}: Props): JSX.Element {
  const { selection, folders, files } = useFinderStore();

  function handleSubmit() {
    const allItems = [
      ...folders.map((f) => ({ id: f.id, path: f.path })),
      ...files.map((f) => ({ id: f.id, path: f.path })),
    ];

    const selected = resolveSelection({
      items: allItems,
      roots: selection.roots,
      excluded: selection.excluded,
    });

    onSubmit(Array.from(selected));
    onClose();
  }

  const count = selection.roots.size;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4 border-b font-medium">
        Sélectionner des médias
      </div>

      <div className="flex-1 overflow-auto">
        <Finder adapter={adapter} rootPath={rootPath} />
      </div>

      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {count} sélection(s) racine
        </span>

        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={count === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Valider
          </button>
        </div>
      </div>
    </Modal>
  );
}