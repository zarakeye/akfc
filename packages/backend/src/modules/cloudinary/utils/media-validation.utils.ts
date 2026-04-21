import { TRPCError } from "@trpc/server";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function assertSupportedMimeType(params: {
  mimeType: string;
  mediaType: "image" | "video";
}): void {
  const { mimeType, mediaType } = params;

  if (mediaType === "image" && !ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Unsupported image mime type: ${mimeType}`,
    });
  }

  if (mediaType === "video" && !ALLOWED_VIDEO_MIME_TYPES.has(mimeType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Unsupported video mime type: ${mimeType}`,
    });
  }
}

export function assertResourceTypeMatchesMimeType(params: {
  resourceType: "image" | "video";
  mimeType: string;
}): void {
  const { resourceType, mimeType } = params;

  if (resourceType === "image" && !mimeType.startsWith("image/")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Resource type and mime type do not match.",
    });
  }

  if (resourceType === "video" && !mimeType.startsWith("video/")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Resource type and mime type do not match.",
    });
  }
}