import { z } from "zod";

import { router, protectedProcedure } from "@server/trpc/core";
import { isAdmin } from "./middleware";

import { listAuthenticatedResources } from "../services/cloudinary.service";
// Cloudinary tree builder — contract v1
import { buildCloudinaryTreeV1 as buildCloudinaryTree } from "../cloudinary/tree";
import { cloudinary } from "../cloudinary/cloudinary.client";

const PROJECT_ROOT = process.env.APP_SHORT_NAME || 'my-app';

function normalizePath(path: string) {
  return path.replace(/^\/+|\/+$/g, '');
}

export const cloudinaryRouter = router({
  // ─────────────────────────────────────────────
  // 1️⃣ Arborescence générique à partir d’un path
  // ─────────────────────────────────────────────
  getFolderTree: protectedProcedure
    .use(isAdmin)
    .input(
      z.object(
        {
          path: z.string().min(1)
        }
      )
    )
    .query(async ({ input }) => {
      const normalizedPath = normalizePath(input.path);
      
      // 🔐 Sécurité : empêcher de sortir du projet
      if (!normalizedPath.startsWith(PROJECT_ROOT)) {
        throw new Error("Forbidden path");
      }

      const resources = await listAuthenticatedResources(normalizedPath);
      
      const tree = buildCloudinaryTree(resources, normalizedPath);

      return tree;
    }),

  // ─────────────────────────────────────────────
  // 2️⃣ Alias : pending (raccourci pratique)
  // ─────────────────────────────────────────────
  getPendingTree: protectedProcedure.query(async () => {
    const rootPath = `${PROJECT_ROOT}/pending`;

    const resources = await listAuthenticatedResources(rootPath);

    return buildCloudinaryTree(resources, rootPath);
  }),

  // ─────────────────────────────────────────────
  // 3️⃣ Supprimer une image
  // ─────────────────────────────────────────────
  deletePicture: protectedProcedure
    .input(
      z.object({
        publicId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await cloudinary.uploader.destroy(input.publicId, {
        type: 'authenticated',
      });

      return { success: true };
    }),

  // ─────────────────────────────────────────────
  // 4️⃣ Supprimer un dossier (préfixe)
  // ─────────────────────────────────────────────
  deleteFolder: protectedProcedure
    .input(
      z.object({
        prefix: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const normalizedPrefix = normalizePath(input.prefix);

      if (!normalizedPrefix.startsWith(PROJECT_ROOT)) {
        throw new Error('Invalid Cloudinary prefix');
      }

      await cloudinary.api.delete_resources_by_prefix(
        normalizedPrefix,
        { type: 'authenticated' }
      );

      return { success: true };
    }),

  // ─────────────────────────────────────────────
  // 5️⃣ Valider des images
  // ─────────────────────────────────────────────
  validatePictures: protectedProcedure
    .input(
      z.object({
        publicIds: z.array(z.string()).min(1),
        category: z.string().min(1),
        activity: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      for (const oldPublicId of input.publicIds) {
        const filename = oldPublicId.split('/').pop();
        if (!filename) continue;

        const newPublicId =
          `${PROJECT_ROOT}/${input.category}/${input.activity}/${filename}`;

        await cloudinary.uploader.rename(
          oldPublicId,
          newPublicId,
          { type: 'authenticated' }
        );
      }

      return { success: true };
    }),
});