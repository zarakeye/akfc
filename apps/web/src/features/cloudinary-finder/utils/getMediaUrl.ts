import type { FileNode } from "@workspace/contracts/src/cloudinary/finder.types";

type Variant = "thumb" | "large" | "original";

export function getMediaUrl(file: FileNode, variant: Variant = "thumb") {
  const encoded = file.publicId
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `/api/media/by-public-id/${encoded}?variant=${variant}`;
}