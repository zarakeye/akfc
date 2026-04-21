import { NextRequest } from "next/server";
import { fetchAuthenticatedAsset } from "@workspace/backend/modules/cloudinary/services/cloudinary.service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Variant = "thumb" | "small" | "medium" | "large" | "original";

function parseVariant(value: string | null): Variant {
  if (value === "thumb") return "thumb";
  if (value === "small") return "small";
  if (value === "medium") return "medium";
  if (value === "large") return "large";
  if (value === "original") return "original";
  return "large";
}

/* -------------------------------------------------------------------------- */
/*                               FALLBACK IMAGE                               */
/* -------------------------------------------------------------------------- */

// 👉 à remplacer par un vrai asset public (Cloudinary ou local)
const FALLBACK_URL =
  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

/* -------------------------------------------------------------------------- */
/*                                    GET                                     */
/* -------------------------------------------------------------------------- */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string[] }> }
) {
  try {
    const { publicId } = await params;

    const id = publicId?.join("/");

    if (!id) {
      return new Response("Missing publicId", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const variant = parseVariant(searchParams.get("variant"));

    const asset = await fetchAuthenticatedAsset(id, variant);

    /* ---------------------------------------------------------------------- */
    /*                               NOT FOUND                                */
    /* ---------------------------------------------------------------------- */

    if (!asset || !asset.ok || !asset.body) {
      console.warn(`[media] asset not found → fallback`, { id, variant });

      const fallback = await fetch(FALLBACK_URL);

      if (!fallback.ok || !fallback.body) {
        return new Response("Fallback failed", { status: 500 });
      }

      return new Response(fallback.body, {
        status: 200,
        headers: buildHeaders(fallback, true),
      });
    }

    /* ---------------------------------------------------------------------- */
    /*                                SUCCESS                                 */
    /* ---------------------------------------------------------------------- */

    return new Response(asset.body, {
      status: 200,
      headers: buildHeaders(asset),
    });
  } catch (error) {
    console.error("[media] unexpected error", error);

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                                HEADERS BUILDER                             */
/* -------------------------------------------------------------------------- */

function buildHeaders(res: Response, isFallback = false): HeadersInit {
  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";

  return {
    "Content-Type": contentType,

    // 🔥 CDN / navigateur cache
    "Cache-Control": isFallback
      ? "public, max-age=60" // fallback → court
      : "public, max-age=31536000, immutable",

    // 🔥 optionnel mais utile (debug / observabilité)
    "X-Asset-Source": isFallback ? "fallback" : "cloudinary",
  };
}