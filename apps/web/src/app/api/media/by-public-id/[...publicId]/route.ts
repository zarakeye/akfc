import { NextRequest } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getR2Client,
  getR2Bucket,
} from "@backend/modules/storage/adapters/r2/client";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import {
  fetchAuthenticatedAsset,
  fetchVideoPoster,
} from "@backend/modules/cloudinary/services/cloudinary.service";

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
  { params }: { params: Promise<{ publicId: string[] }> },
) {
  try {
    // Cette route sert des assets `authenticated` (dont des documents
    // personnels). Elle exige donc une session, comme la route R2.
    const session = await getSessionFromRequest(req);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { publicId } = await params;

    const id = publicId?.join("/");

    if (!id) {
      return new Response("Missing publicId", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const variant = parseVariant(searchParams.get("variant"));
    const asPoster = searchParams.get("as") === "poster";
    // `v` = version Cloudinary du binaire (transmise par le store d'avatar).
    // Passée à Cloudinary, elle garantit le bon fichier malgré un publicId
    // fixe écrasé (sinon l'ancien binaire caché sur le CDN).
    const vParam = searchParams.get("v");
    const version = vParam ? Number(vParam) : undefined;
    const safeVersion =
      version && Number.isFinite(version) ? version : undefined;

    const asset = asPoster
      ? await fetchVideoPoster(id, variant)
      : await fetchAuthenticatedAsset(id, variant, safeVersion);

    /* ---------------------------------------------------------------------- */
    /*                               NOT FOUND                                */
    /* ---------------------------------------------------------------------- */

    if (!asset || !asset.ok || !asset.body) {
      // Pas chez Cloudinary : le binaire vit peut-être dans R2 (documents,
      // PDF…). Le chemin sert directement de clé d'objet.
      const r2 = await fetchR2Asset(id);
      if (r2 && r2.body) {
        return new Response(r2.body, {
          status: 200,
          headers: { ...buildHeaders(r2), "X-Asset-Source": "r2" },
        });
      }

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


/**
 * Tente de récupérer un binaire depuis R2. La clé d'objet est le chemin tel
 * quel (même convention que /api/media/r2/[...path]). Retourne null si absent
 * ou en cas d'erreur — l'appelant rendra alors l'image de secours.
 */
async function fetchR2Asset(key: string): Promise<Response | null> {
  try {
    const signedUrl = await getSignedUrl(
      getR2Client(),
      new GetObjectCommand({ Bucket: getR2Bucket(), Key: key }),
      { expiresIn: 300 },
    );
    const res = await fetch(signedUrl, { cache: "no-store" });
    if (!res.ok || !res.body) return null;
    return res;
  } catch {
    return null;
  }
}
