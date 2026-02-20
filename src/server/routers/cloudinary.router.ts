import { z } from "zod";

import { router, protectedProcedure } from "@server/trpc/core";
import { isAdmin } from "@server/routers/middleware";

import { listAuthenticatedResources } from "@server/services/cloudinary.service";
// Cloudinary tree builder — contract v1
import { buildCloudinaryTreeV1 as buildCloudinaryTree } from "@server/cloudinary/tree";
import { cloudinary } from "@/server/cloudinary/cloudinary.client";
import { moveFile } from "@/server/cloudinary/services/cloudinary.moveFile";
import { moveService } from "@/server/cloudinary/services/move.service";
import { moveSchema } from "@server/cloudinary/schemas/move.schema";
import { mapCloudinaryFolderToClient } from "@server/mappers/cloudinary/tree.v1.mapper";
import { emptyBinService } from "@/server/cloudinary/services/emptyBin.service";

const PROJECT_ROOT = process.env.APP_SHORT_NAME || 'my-app';

type CloudinaryResourceType = "image" | "video" | "raw";

/**
 * Renommer un asset Cloudinary (authenticated) de manière robuste.
 * On essaye image/video/raw car Cloudinary exige souvent le bon resource_type.
 */
async function renameAuthenticatedResource(fromPublicId: string, toPublicId: string) {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];
  let lastError: unknown = null;

  for (const resource_type of resourceTypes) {
    try {
      await cloudinary.uploader.rename(fromPublicId, toPublicId, {
        type: "authenticated",
        resource_type,
        overwrite: true,
      });
      return; // ✅ success
    } catch (err) {
      lastError = err;
      // continue -> try next type
    }
  }

  throw lastError ?? new Error("Rename failed (unknown error)");
}

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

      const cloudinaryTree = buildCloudinaryTree(resources, normalizedPath);

      // ✅ MAPPING ICI
      const clientTree = mapCloudinaryFolderToClient(cloudinaryTree);

      return clientTree; // 👉 FolderNode
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

  // moveFile: protectedProcedure
  //   .input(
  //     z.object({
  //       publicId: z.string().min(1),
  //       from: z.string().min(1),
  //       to: z.string().min(1),
  //     })
  //   )
  //   .mutation(async ({ input }) => {
  //     const { publicId, from, to } = input;

  //     return moveFile({
  //       publicId,
  //       from,
  //       to
  //     });
  //   }),

  move: protectedProcedure
    .input(moveSchema)
    .mutation(async ({ input }) => {
      await moveService(input);

      return { success: true };
    }),

  // ─────────────────────────────────────────────
  // 6️⃣ Vider la corbeille (bin) — suppression définitive
  // ─────────────────────────────────────────────
  emptyBin: protectedProcedure
    .use(isAdmin) // ✅ très important: action destructive => admin only
    .mutation(async () => {
      await emptyBinService(PROJECT_ROOT);
      return { success: true };
    }),

  // ─────────────────────────────────────────────
  // 3bis️⃣ Renommer une image (ou asset) ✅ NEW
  // ─────────────────────────────────────────────
  renamePicture: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        fromPublicId: z.string().min(1),
        toPublicId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const from = normalizePath(input.fromPublicId);
      const to = normalizePath(input.toPublicId);

      // 🔐 Sécurité : empêcher de sortir du projet
      if (!from.startsWith(PROJECT_ROOT) || !to.startsWith(PROJECT_ROOT)) {
        throw new Error("Forbidden path");
      }

      // ✅ (Optionnel) blocage des renames dangereux :
      // - empêcher de remonter de dossier via '..' (normalement absent dans public_id)
      if (from.includes("..") || to.includes("..")) {
        throw new Error("Invalid path");
      }

      await renameAuthenticatedResource(from, to);

      return { success: true };
    }),

});