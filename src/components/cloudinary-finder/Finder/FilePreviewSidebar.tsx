'use client';

import { JSX } from 'react';
import Image from 'next/image';
import { FileNode } from '@/components/cloudinary-finder/types';

type Props = {
  file: FileNode;
  onClose: () => void;
};

/**
 * A sidebar component that displays a preview of a file.
 *
 * @param {FileNode} file - The file to be previewed.
 * @param {() => void} onClose - A callback function to be called when the sidebar is closed.
 * @returns A JSX element representing the sidebar component.
 */
export function FilePreviewSidebar({ file, onClose }: Props): JSX.Element {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium truncate">{file.name}</h3>
        <button onClick={onClose} className="text-xl">×</button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Image
          src={file.url}
          alt={file.name}
          width={1200}
          height={1200}
          className="object-contain max-h-full"
        />
      </div>
    </div>
  );
}