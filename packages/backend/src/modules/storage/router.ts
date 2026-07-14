import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc";

import {
  storageProviderSchema,
  storageMoveIntentSchema,
  createR2UploadAuthorizationSchema,
} from "@contracts/storage";

import {
  createUploadSignaturesSchema,
  registerUploadedAssetsSchema,
} from "@contracts/cloudinary/upload.schema";

import { getAdapter } from "@backend/modules/storage/providerRegistry";
import { VirtualStorage } from "@backend/modules/storage/virtualStorage";
import {
  planMoveOperations,
  executeMoveOperations,
} from "@backend/modules/storage/resolveMoveIntent.service";
import { assertOperationsDontUnpublishReferencedAssets } from "@backend/modules/media/services/assertOperationsDontUnpublishReferencedAssets.service";
import { countPersoImages } from "@backend/modules/media/services/countPersoImages.service";
import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";
import { listGeneralFolders } from "@backend/modules/media/services/listGeneralFolders.service";

/**
 * storageRouter — Phase 2 update
 *
 * Le seul changement par rapport à la version précédente est le schema
 * d'input de `registerR2Upload`, qui doit maintenant transporter la
 * destination métier (categoryId, disciplineId) et l'originalFileName
 * pour créer la row MediaAsset côté adapter R2.
 *
 * Le schema legacy `registerR2UploadedAssetSchema` n'avait que
 * `{ path, expectedBytes, expectedMimeType }` — insuffisant pour le
 * tracking DB. On le redéfinit en inline dans ce router pour ne pas
 * forcer une modif côté contracts (le contract est à jour côté Cloudinary
 * via `registerUploadedAssetsSchema.destination`, on reproduit la même
 * forme ici).
 *
 * ⚠️ NOTE : si un autre endroit du code utilise `registerR2UploadedAssetSchema`
 * importé depuis `@contracts/storage`, il faudra aussi l'aligner. À ce jour,
 * seul ce router le consomme.
 */

/* -------------------------------------------------------------------------- */
/*  Schema R2 Phase 2 — inline                                                */
/* -------------------------------------------------------------------------- */

/**
 * Destination metier — discriminée pour gérer les deux cas :
 *   - existing-discipline : on a categoryId + disciplineId direct
 *   - new-discipline : on a categoryId + proposedDisciplineName (admin validera plus tard)
 *
 * Forme identique à ce que `DragNDropForm` construit déjà côté frontend
 * pour Cloudinary — on réutilise.
 */
const r2UploadDestinationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('existing-discipline'),
    categoryId: z.number().int().positive(),
    disciplineId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('new-discipline'),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().min(1).max(120),
  }),
  // Espace club partagé, sans discipline ni catégorie.
  z.object({
    kind: z.literal('general'),
    folder: z.string().trim().min(1).max(120),
  }),
]);

const registerR2UploadInputSchema = z.object({
  path: z.string().min(1),
  expectedBytes: z.number().int().positive(),
  expectedMimeType: z.string().min(1),
  // Phase 2 — nouveaux champs requis pour créer la row MediaAsset
  destination: r2UploadDestinationSchema,
  originalFileName: z.string().min(1).max(255),
});

/* -------------------------------------------------------------------------- */
/*  Router                                                                    */
/* -------------------------------------------------------------------------- */

export const storageRouter = router({
  /* ====================================================================== */
  /*  Lecture (inchangé)                                                    */
  /* ====================================================================== */

  /**
   * Compteurs « à traiter » de la bibliothèque, pour la cloche du header :
   * assets en attente de classement (MediaAsset.status "pending") et
   * entrées de corbeille (TrashEntry IN_BIN). protectedProcedure simple,
   * comme le reste du router — la cloche est de plus gatée côté client
   * sur la présence d'au moins une permission.
   */
  getAttentionCounts: protectedProcedure.query(async ({ ctx }) => {
    const [pending, bin] = await Promise.all([
      ctx.prisma.mediaAsset.count({ where: { status: "pending" } }),
      ctx.prisma.trashEntry.count({ where: { status: "IN_BIN" } }),
    ]);
    return { pending, bin };
  }),

  /**
   * Statut du quota d'images de l'espace perso de l'admin courant (lecture
   * seule). Le dossier perso est dérivé de `ctx.user.id`, jamais d'un input.
   */
  getPersoPhotoQuota: protectedProcedure.query(async ({ ctx }) => {
    const counts = await countPersoImages({
      prisma: ctx.prisma,
      appRoot: ctx.appRoot,
      userId: ctx.user.id,
    });
    const remaining = Math.max(0, PERSO_PHOTO_QUOTA - counts.total);
    return {
      quota: PERSO_PHOTO_QUOTA,
      pending: counts.pending,
      published: counts.published,
      total: counts.total,
      remaining,
    };
  }),

  /**
   * Sous-dossiers existants sous `general/` (pending + published), pour peupler
   * le select « dossier existant » de l'uploader général.
   */
  listGeneralFolders: protectedProcedure.query(async ({ ctx }) => {
    return listGeneralFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });
  }),

  list: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        cursor: z.string().optional(),
        limit: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      return reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
    }),

  getTree: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        depth: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      return reader.getTree({ path: input.path, depth: input.depth });
    }),

  getNode: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      if (!reader.getNode) {
        throw new Error(
          `Provider "${input.provider ?? "virtual"}" does not support getNode().`
        );
      }
      return reader.getNode(input.path);
    }),

  getMetadata: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      if (!reader.getMetadata) {
        throw new Error(
          `Provider "${input.provider ?? "virtual"}" does not support getMetadata().`
        );
      }
      return reader.getMetadata(input.path);
    }),

  move: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        intent: storageMoveIntentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      const operations = await planMoveOperations({
        adapter,
        appRoot: ctx.appRoot,
        intent: input.intent,
      });

      await assertOperationsDontUnpublishReferencedAssets(
        ctx.prisma,
        operations,
        ctx.appRoot,
      );

      await executeMoveOperations(adapter, operations);

      return { operations };
    }),

  /* ====================================================================== */
  /*  Upload Cloudinary (inchangé)                                          */
  /* ====================================================================== */

  createUploadAuthorization: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...createUploadSignaturesSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      switch (input.provider) {
        case "cloudinary": {
          const adapter = getAdapter("cloudinary", deps);
          return adapter.createUploadAuthorization({
            userId: ctx.user.id,
            destination: input.destination,
            assets: input.assets,
            allowOverwrite: input.allowOverwrite,
          });
        }
        case "r2": {
          throw new Error(
            "R2 uploads not supported via this procedure. " +
              "Use storage.createR2Upload / storage.registerR2Upload instead."
          );
        }
      }
    }),

  registerUploadedAsset: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...registerUploadedAssetsSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      switch (input.provider) {
        case "cloudinary": {
          const adapter = getAdapter("cloudinary", deps);
          return adapter.registerUploadedAsset({
            destination: input.destination,
            assets: input.assets,
            eventDate: input.eventDate,
            userId: ctx.user.id,
          });
        }
        case "r2": {
          throw new Error(
            "R2 register-uploaded-asset not supported via this procedure. " +
              "Use storage.createR2Upload / storage.registerR2Upload instead."
          );
        }
      }
    }),

  /* ====================================================================== */
  /*  Upload R2 — Phase 2 (enrichi avec destination + originalFileName)     */
  /* ====================================================================== */

  createR2Upload: protectedProcedure
    .input(createR2UploadAuthorizationSchema)
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter("r2", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      return adapter.createUploadAuthorization({
        path: input.path,
        mimeType: input.mimeType,
        maxBytes: input.maxBytes,
      });
    }),

  /**
   * Phase 2 — l'input transporte maintenant `destination` + `originalFileName`
   * pour permettre à l'adapter R2 de créer la row MediaAsset après HeadObject.
   */
  registerR2Upload: protectedProcedure
    .input(registerR2UploadInputSchema)
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter("r2", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      return adapter.registerUploadedAsset({
        path: input.path,
        userId: ctx.user.id,
        expectedBytes: input.expectedBytes,
        expectedMimeType: input.expectedMimeType,
        destination: input.destination,
        originalFileName: input.originalFileName,
      });
    }),
});
