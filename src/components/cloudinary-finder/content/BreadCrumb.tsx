'use client';

import { JSX } from "react";
import { buildBreadCrumb, type BreadCrumbItem } from "@/components/cloudinary-finder/utils/buildBreadCrumb";

type Props = {
  path: string
  onNavigate: (path: string) => void
}

export function BreadCrumb({ path, onNavigate }: Props): JSX.Element {
  const items: BreadCrumbItem[] = buildBreadCrumb(path);

  return (
    <nav className="mb-4 text-sm text-gray-600 flex flex-wrap items-center gap-1">
      {items.map((item, index) => (
        <span key={item.path} className="flex items-center gap-1 cursor-pointer">
          {index > 0 && (
            <span> {'>'} </span>
          )}
          <button
            onClick={() => onNavigate(item.path)}
            className="hover:underline hover:text-blue-600"
          >
            {item.label}
          </button>
        </span>
      ))}
    </nav>
  );
}