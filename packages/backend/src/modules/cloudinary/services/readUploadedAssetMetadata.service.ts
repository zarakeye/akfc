import { TRPCError } from "@trpc/server";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";

export async function readUploadedAssetMetadata(params: {
  publicId: string;
  resourceType: "image" | "video";
}) {
  const { publicId, resourceType } = params;

  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: "authenticated",
    });

    return {
      publicId: result.public_id as string,
      secureUrl: result.secure_url as string,
      resourceType,
      format: (result.format as string | undefined) ?? null,
      bytes: (result.bytes as number | undefined) ?? 0,
      width: (result.width as number | undefined) ?? null,
      height: (result.height as number | undefined) ?? null,
      duration: (result.duration as number | undefined) ?? null,
    };
  } catch {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Uploaded asset not found on Cloudinary.",
    });
  }
}