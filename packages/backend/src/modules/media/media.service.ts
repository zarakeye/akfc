import { fetchAuthenticatedAsset } from "../cloudinary/services/cloudinary.service";

export type Variant = "thumb" | "medium" | "large" | "original";

function parseVariant(value: string | null): Variant {
  if (value === "thumb") return "thumb";
  if (value === "medium") return "medium";
  if (value === "large") return "large";
  if (value === "original") return "original";
  return "large";
}

export async function getMediaByPublicId(
  id: string,
  rawVariant: string | null
) {
  const variant = parseVariant(rawVariant);

  const response = await fetchAuthenticatedAsset(id, variant);

  if (!response || !response.ok) {
    return null;
  }

  const buffer = await response.arrayBuffer();
  const contentType =
    response.headers.get("content-type") || "image/jpeg";

  return {
    buffer,
    contentType,
  };
}