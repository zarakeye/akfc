import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc";

import {
  storageProviderSchema,
  storageMoveIntentSchema,
} from "@contracts/storage";

import {
  createUploadSignaturesSchema,
  registerUploadedAssetsSchema,
} from "@contracts/cloudinary/upload.schema";

import { getAdapter } from "@backend/modules/storage/providerRegistry";
import { resolveMoveIntent } from "@backend/modules/storage/resolveMoveIntent.service";

/**
 * storageRouter
 *
 * Router tRPC qui expose le contrat agnostique `StorageAdapter` au client.
 *
 * ─── Le pattern "registry + délégation" ────────────────────────────────────
 *
 * Chaque procédure suit le même squelette :
 *
 *   1. Valider l'input (provider + payload).
 *   2. Résoudre l'adapter via `getAdapter(provider, deps)`.
 *   3. Déléguer à la méthode du contrat agnostique.
 *
 * Aucun `if (provider === 'cloudinary')` ici. Ajouter R2 demain consiste
 * à étendre `storageProviderSchema` côté contrat et à enregistrer une
 * factory dans `providerRegistry` — le router ne change pas.
 *
 * ─── Inputs upload spécifiques au provider ─────────────────────────────────
 *
 * Pour `createUploadAuthorization` et `registerUploadedAsset`, les schemas
 * d'input sont actuellement ceux de Cloudinary (le seul provider câblé).
 * Quand R2 sera ajouté, il faudra transformer ces inputs en
 * discriminated unions par provider :
 *
 *   z.discriminatedUnion('provider', [
 *     z.object({ provider: z.literal('cloudinary'), ...cloudinaryInput }),
 *     z.object({ provider: z.literal('r2'), ...r2Input }),
 *   ])
 *
 * Pour aujourd'hui, on garde la forme la plus simple — un seul provider,
 * un seul schema. La dette est documentée et limitée à ce fichier.
 *
 * ─── Compatibilité avec le router historique `cloudinary.*` ────────────────
 *
 * Le router cloudinary historique conserve ses procédures `createUploadSignatures`,
 * `registerUploadedAssets`, `move`, etc. Elles sont **dépréciées** au profit
 * de leurs équivalents `storage.*` (statut B2 du chantier 1). La suppression
 * effective viendra dans un sous-chantier de migration des callsites front.
 */

export const storageRouter = router({
  /* ====================================================================== */
  /*  Lecture (couche 1 du contrat StorageAdapter)                          */
  /* ====================================================================== */

  list: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        path: z.string().min(1),
        cursor: z.string().optional(),
        limit: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const adapter = getAdapter(input.provider, {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });

      return adapter.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
    }),

  getTree: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        path: z.string().min(1),
        depth: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const adapter = getAdapter(input.provider, {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });

      return adapter.getTree({
        path: input.path,
        depth: input.depth,
      });
    }),

  getNode: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const adapter = getAdapter(input.provider, {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });

      if (!adapter.getNode) {
        throw new Error(
          `Provider "${input.provider}" does not support getNode().`
        );
      }

      return adapter.getNode(input.path);
    }),

  getMetadata: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const adapter = getAdapter(input.provider, {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });

      if (!adapter.getMetadata) {
        throw new Error(
          `Provider "${input.provider}" does not support getMetadata().`
        );
      }

      return adapter.getMetadata(input.path);
    }),

  /* ====================================================================== */
  /*  Move (couches 1 + 2 + 3)                                              */
  /* ====================================================================== */

  /**
   * Déplace un asset (file ou folder) ou une sélection.
   *
   * Le client envoie une `StorageMoveIntent` riche (avec `selection`,
   * `status-folder`, etc.). Le router :
   *   1) résout l'adapter du provider
   *   2) appelle `resolveMoveIntent` qui expanse l'intent en N opérations
   *      atomiques et les exécute via `adapter.move()`
   *
   * Cette procédure remplace l'ancienne `cloudinary.move`. Le frontend
   * doit migrer ses callsites vers `storage.move` avec un `provider` explicite.
   */
  move: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        intent: storageMoveIntentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter(input.provider, {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });

      const operations = await resolveMoveIntent({
        adapter,
        appRoot: ctx.appRoot,
        intent: input.intent,
      });

      return { operations };
    }),

  /* ====================================================================== */
  /*  Upload (capability — input/output provider-spécifiques)               */
  /* ====================================================================== */

  /**
   * Délivre une autorisation d'upload bornée.
   *
   * Pour Cloudinary : un lot de signatures SHA1 prêtes à être présentées
   * à l'API d'upload Cloudinary. Pour R2 (à venir) : presigned URLs.
   *
   * L'output est provider-spécifique — le client doit savoir quel
   * provider il manipule pour interpréter la réponse (ce qui est attendu :
   * la mécanique d'upload qui suit dépend du provider).
   */
  createUploadAuthorization: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...createUploadSignaturesSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter(input.provider, {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });

      // Capability d'upload obligatoire pour cette procédure — on échoue
      // proprement si un provider non upload-capable est demandé.
      if (typeof adapter.createUploadAuthorization !== "function") {
        throw new Error(
          `Provider "${input.provider}" does not support uploads ` +
            `(no createUploadAuthorization method).`
        );
      }

      return adapter.createUploadAuthorization({
        destination: input.destination,
        assets: input.assets,
      });
    }),

  /**
   * Persiste les assets uploadés en base, après revérification serveur.
   *
   * `userId` est lu depuis `ctx.user.id` — jamais depuis l'input client.
   * C'est l'auth tRPC (`protectedProcedure`) qui garantit qu'un userId
   * authentifié est présent.
   */
  registerUploadedAsset: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...registerUploadedAssetsSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter(input.provider, {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });

      if (typeof adapter.registerUploadedAsset !== "function") {
        throw new Error(
          `Provider "${input.provider}" does not support uploads ` +
            `(no registerUploadedAsset method).`
        );
      }

      return adapter.registerUploadedAsset({
        destination: input.destination,
        assets: input.assets,
        eventDate: input.eventDate,
        userId: ctx.user.id,
      });
    }),
});