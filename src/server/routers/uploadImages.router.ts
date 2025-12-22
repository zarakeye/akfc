import { z } from "zod";
import { router, protectedProcedure } from "@server/trpc/core";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

// import { uploadImageSchema } from "../validation/uploadImage.schema";
// import { get } from "http";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function generateSignature(params: Record<string, string | number>) {
  const signed = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&") + process.env.CLOUDINARY_API_SECRET;

  return crypto.createHash("sha1").update(signed).digest("hex");
}

export const uploadImagesRouter = router({
  uploadImage: protectedProcedure
    .input(
      z.object({
        activityType: z.string().nullable().optional(),
        activityId: z.string().nullable().optional(),
        newActivityName: z.string().optional(),
        userId: z.string(),
        pictures: z.array(
          z.object({
            base64: z.string(), // base64 encoded image
            name: z.string(),
          }),
        )
      })
    )
    .mutation(async ({ input }) => {
      let folder = "";

      if (input.activityType && input.activityId) {
        folder = `${input.activityType}/${input.activityId}`;
      } else if (input.newActivityName) {
        folder = `new/${input.newActivityName}`;
      } else {
        throw new Error("Impossible de déterminer le dossier de destination");
      }

      const results = [];

      for (const picture of input.pictures) {
        const timestamp = Math.floor(Date.now() / 1000);

        const params = {
          folder,
          timestamp: timestamp,
          public_id: picture.name.replace(/\.[^/.]+$/, ""), // remove file extension
        };

        const signature = generateSignature(params);

        const uploadResult = await cloudinary.uploader.upload(picture.base64, {
          ...params,
          api_key: process.env.CLOUDINARY_API_KEY!,
          signature,
        });

        results.push({ url: uploadResult.secure_url });
      }

      return {
        success: true,
        uploadResults: results,
      };
    }), 
});
