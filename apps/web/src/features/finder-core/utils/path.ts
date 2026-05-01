import { PartSegment } from "@features/finder-core/types";

export function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function buildPathSegments(path: string): PartSegment[] {
  const parts = splitPath(path);

  return parts.map((_, index) => {
    const fullPath = parts.slice(0, index + 1).join('/');

    return {
      name: parts[index],
      path: fullPath,
    };
  });
}