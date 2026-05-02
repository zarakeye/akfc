'use client';

import { JSX, useEffect, useMemo } from 'react';
import type { FileAdapter } from '@features/finder-core/types';
import { useFinderData } from '@features/finder-core/hooks/useFinderData';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

import Breadcrumb from '@/features/finder-core/components/Breadcrumb';
import PreviewPanel from '@features/finder-core/components/PreviewPanel';

import { getTriState } from '@features/finder-core/utils/triState';

type Props = {
  adapter: FileAdapter;
};

export default function Finder({ adapter }: Props): JSX.Element {
  const {
    folders,
    files,
    currentPath,
    setPath,
    selection,
    toggleSelect,
    selectOnly,
    selectRange,
  } = useFinderStore();

  const { loading, error } = useFinderData(adapter);

  /**
   * 🔹 Flat list pour calcul tri-state + range
   */
  const allItems = useMemo(
    () => [
      ...folders.map((f) => ({ id: f.id, path: f.path })),
      ...files.map((f) => ({ id: f.id, path: f.path })),
    ],
    [folders, files]
  );

  /**
   * 🔹 Debug propre
   */
  useEffect(() => {
    console.log('[Finder]', {
      currentPath,
      folders,
      files,
      roots: Array.from(selection.roots),
      excluded: Array.from(selection.excluded),
    });
  }, [currentPath, folders, files, selection]);

  /**
   * 🔹 Gestion clic (multi / shift / simple)
   */
  function handleClick(
    id: string,
    e: React.MouseEvent
  ) {
    const isMeta = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // SHIFT → range selection
    if (isShift && selection.anchorId) {
      const ids = allItems.map((i) => i.id);

      const start = ids.indexOf(selection.anchorId);
      const end = ids.indexOf(id);

      if (start !== -1 && end !== -1) {
        const [from, to] =
          start < end ? [start, end] : [end, start];

        const rangeIds = ids.slice(from, to + 1);
        selectRange(rangeIds);
        return;
      }
    }

    // CMD / CTRL → toggle
    if (isMeta) {
      toggleSelect(id);
      return;
    }

    // clic simple
    selectOnly(id);
  }

  return (
    <div className="flex flex-col gap-4 border rounded h-full">

      {/* 🔝 Breadcrumb */}
      <div className="p-2 border-b text-sm">
        <Breadcrumb />
      </div>

      {/* ⚠️ états */}
      {loading && <div className="p-4">Loading...</div>}
      {error && <div className="p-4 text-red-500">Error: {error}</div>}

      {/* 🧱 Layout */}
      <div className="flex flex-1 min-h-0">

        {/* 📁 LIST */}
        <div className="w-2/3 border-r overflow-auto p-4">

          {/* ---------- FOLDERS ---------- */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Folders</h3>

            <ul className="space-y-1">
              {folders.map((folder) => {
                const state = getTriState({
                  item: folder,
                  allItems,
                  roots: selection.roots,
                  excluded: selection.excluded,
                });

                return (
                  <li
                    key={folder.id}
                    className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(folder.id, e);
                    }}
                    onDoubleClick={() => setPath(folder.path)}
                  >
                    {/* checkbox tri-state */}
                    <input
                      type="checkbox"
                      checked={state === 'checked'}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            state === 'indeterminate';
                        }
                      }}
                      readOnly
                    />

                    📁 {folder.name}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ---------- FILES ---------- */}
          <div>
            <h3 className="font-semibold mb-2">Files</h3>

            <ul className="space-y-1">
              {files.map((file) => {
                const checked =
                  selection.roots.has(file.id);

                return (
                  <li
                    key={file.id}
                    className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(file.id, e);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                    />

                    📄 {file.name}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 👁️ PREVIEW */}
        <div className="w-1/3">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}