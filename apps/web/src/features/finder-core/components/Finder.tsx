'use client';

import { JSX, useEffect } from 'react';
import type { FileAdapter } from '@features/finder-core/types';
import { useFinderData } from '@features/finder-core/hooks/useFinderData';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import Breadcrumb from '@/features/finder-core/components/Breadcrumb';
import PreviewPanel from '@features/finder-core/components/PreviewPanel';

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
  } = useFinderStore();

  const { loading, error } = useFinderData(adapter);

  // debug simple
  useEffect(() => {
    console.log('[Finder]', {
      currentPath,
      folders,
      files,
      selection: Array.from(selection.selectedIds)
    });
  }, [currentPath, folders, files, selection]);

  return (
    <div className='flex flex-col gap-4 border rounded'>
      {/* 🔝 Breadcrumb */}
      <div className='p-2 border-b text-sm'>
        <Breadcrumb />
      </div>

      {/* ⚠️ états */}
      {loading && <div>Loading...</div>}
      {error && <div className='text-red-500'>Error: {error}</div>}

      {/* 🧱 Layout principal */}
      <div className='flex flex-1 min-h-0'>

        {/* 📁 LISTE */}
        <div className='w-2/3 border-r overflow-auto p-4'>
      
          {/* 📁 Folders */}
          <div className='mb-4'>
            <h3 className='font-semibold mb-2'>Folders</h3>
            
            <ul className='space-y-1'>
              {folders.map((folder) => {
                const isSelected = selection.selectedIds.has(folder.id);
                
                return (
                  <li
                    key={folder.id}
                    className={`cursor-pointer px-2 py-1 rounded flex items-center gap-2 ${
                      isSelected ? 'bg-blue-200' : 'hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(folder.id);
                    }}
                    onDoubleClick={() => setPath(folder.path)}
                  >
                    📁 {folder.name}
                  </li>
                ); 
              })}
            </ul>
          </div>

          {/* 📄 Files */}
          <div>
            <h3 className='font-semibold mb-2'>Files</h3>
            <ul className='space-y-1'>
              {files.map((file) => {
                const isSelected = selection.selectedIds.has(file.id);
                
                return (
                  <li
                    key={file.id}
                    className={`cursor-pointer px-2 py-1 rounded flex items-center gap-2 ${
                      isSelected ? 'bg-blue-200' : 'hover:bg-gray-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(file.id);
                    }}
                  >
                    📄 {file.name}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 👁️ PREVIEW */}
        <div className='w-1/3'>
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}