'use client';

import { JSX, useEffect } from 'react';
import type { FileAdapter } from '@features/finder-core/types';
import { useFinderData } from '@features/finder-core/hooks/useFinderData';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

type Props = {
  adapter: FileAdapter;
};

export default function Finder({ adapter }: Props): JSX.Element {
  const { folders, files, currentPath, setPath } = useFinderStore();

  const { loading, error } = useFinderData(adapter);

  // debug simple
  useEffect(() => {
    console.log('[Finder]', { currentPath, folders, files });
  }, [currentPath, folders, files]);

  return (
    <div className='flex flex-col gap-4 border rounded'>
      {/* 🔝 Navigation */}
      <div className='flex items-center gap-2 text-sm'>
        <span className='font-mono'>{currentPath}</span>
      </div>

      {/* ⚠️ états */}
      {loading && <div>Loading...</div>}
      {error && <div className='text-red-500'>Error: {error}</div>}

      {/* 📁 Folders */}
      <div>
        <h3 className='font-semibold mb-2'>Folders</h3>
        <ul className='space-y-1'>
          {folders.map((folder) => (
            <li
              key={folder.id}
              className='cursor-pointer hover:underline'
              onClick={() => setPath(folder.path)}
            >
              📁 {folder.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 📄 Files */}
      <div>
        <h3 className='font-semibold mb-2'>Files</h3>
        <ul className='space-y-1'>
          {files.map((file) => (
            <li
              key={file.id}
              className='cursor-pointer hover:underline'
            >
              📄 {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}