'use client';

import { ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* content */}
      <div className="relative bg-white rounded-lg shadow-lg w-200 max-h-[80vh] flex flex-col">
        {children}
      </div>
    </div>
  );
}