'use client';

import { JSX } from 'react';
import { buildPathSegments } from '@features/finder-core/utils/path';
import { useFinderStore } from '@features/finder-core/state/useFinderStore';

export default function Breadcrumb(): JSX.Element {
  const { currentPath, setPath } = useFinderStore();

  const segments = buildPathSegments(currentPath);

  return (
    <div className='flex items-center gap-2 text-sm flex-wrap'>
      {segments.map((segment, index) => (
        <span
          key={segment.path}
          className='flex items-center gap-1'
          >
            <button
              onClick={() => setPath(segment.path)}
              className='hover:underline'
            >
              {segment.name}
            </button>

            {index < segments.length - 1 && <span>/</span>}
          </span>
      ))}
    </div>
  );
}