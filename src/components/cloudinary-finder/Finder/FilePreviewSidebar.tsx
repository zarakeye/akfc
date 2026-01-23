'use client';

import Image from 'next/image';
import { FileNode } from '../types';

type Props = {
  file: FileNode;
  onClose: () => void;
};

export function FilePreviewSidebar({ file, onClose }: Props) {
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