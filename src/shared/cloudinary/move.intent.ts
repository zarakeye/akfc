// src/shared/cloudinary/move.intent.ts
import { FolderStatus } from '@/core/cloudinary/folder.types';

export type DragSource =
  | {
      type: 'file';
      fullPath: string;
    }
  | {
      type: 'folder';
      fullPath: string;
    };

export type VirtualTarget = {
  type: 'virtual';
  status: FolderStatus;
};

export type FolderTarget = {
  type: 'folder';
  fullPath: string;
};

export type MoveTarget = VirtualTarget | FolderTarget;

export type MoveIntent =
  | {
      source: { type: 'file'; fullPath: string };
      target: MoveTarget;
    }
  | {
      source: { type: 'folder'; fullPath: string };
      target: MoveTarget;
    };
