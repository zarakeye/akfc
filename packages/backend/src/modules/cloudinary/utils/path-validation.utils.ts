import { TRPCError } from "@trpc/server";

export function sanitizeBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const sanitized = withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!sanitized) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid file name.",
    });
  }

  return sanitized;
}

export function assertSafeCloudinaryPath(path: string, appRoot: string): void {
  if (!path.startsWith(`${appRoot}/pending/`)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Uploads are only allowed under pending.",
    });
  }

  if (path.includes("..") || path.includes("/.trash/")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid asset path.",
    });
  }
}