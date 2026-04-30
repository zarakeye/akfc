import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";

import { moveSchema } from "@contracts/cloudinary/move.schema";

import { listAuthenticatedResources, deleteByPrefix } from "@backend/modules/cloudinary/services/cloudinary.service";
import { moveService } from "@backend/modules/cloudinary/services/move.service";
import { buildCloudinaryTreeV1 } from "@backend/modules/cloudinary/tree";
import { replaceStatusSegment } from "@backend/modules/cloudinary/utils/cloudinary.utils";
import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import { isRootFolder } from "@backend/modules/cloudinary/services/ensureRootFolders.service";

import { mapCloudinaryFolderToClient } from "@backend/mappers/cloudinary/tree.v1.mapper";
import { createUploadSignatures } from "@backend/modules/cloudinary/services/createUploadSignatures.service";
import { registerUploadedAssets } from "@backend/modules/cloudinary/services/registerUploadedAssets.service";
import { createUploadSignaturesSchema, registerUploadedAssetsSchema } from "@contracts/cloudinary/upload.schema";

const PROJECT_ROOT = process.env.APP_SHORT_NAME || "my-app";

const adminProcedure = protectedProcedure.use(isAdmin);

type CloudinaryResourceType = "image" | "video" | "raw";

function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function assertSafePath(path: string): void {
  if (!path.startsWith(PROJECT_ROOT)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Forbidden path.",
    });
  }

  if (path.includes("..")) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid path.",
    });
  }
}

/**
 * Interdit toute opération "cloudinaryRouter" sur le storage caché du bin.
 *
 * Pourquoi :
 * - Un contenu placé en corbeille est immuable (lecture / restore / deleteForever uniquement).
 * - Toute mutation sur `.trash` doit passer par `trashRouter`.
 */
function assertNotInTrashStorage(path: string): void {
  const p = normalizePath(path);

  if (p.startsWith(`${PROJECT_ROOT}/bin/.trash/`)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Forbidden operation on trash storage. Use trashRouter.",
    });
  }
}

/**
 * Interdit toute mutation d'un dossier racine immuable (`pending`, `published`,
 * `bin`) ou de la racine du projet elle-même.
 *
 * Pourquoi :
 * - Ces dossiers structurent l'architecture Cloudinary ; leur disparition ou
 *   renommage briserait `assertSafePath`, `statusFromPath` et le routage de
 *   tout upload.
 * - Ils sont garantis présents par `ensureRootFolders` (au boot et au seed).
 * - Leur existence étant acquise, l'UI ne doit jamais avoir besoin de les
 *   créer ni les modifier.
 */
function assertRootFolder(path: string): void {
  if (isRootFolder(PROJECT_ROOT, path)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Forbidden operation on a root folder (pending / published / bin). Root folders are immutable.",
    });
  }
}

function folderAncestorsOfPublicId(publicId: string): string[] {
  const parts = normalizePath(publicId).split("/").filter(Boolean);
  if (parts.length < 2) return [];

  const folders = parts.slice(0, -1);
  const out: string[] = [];

  for (let i = 1; i <= folders.length; i++) {
    out.push(folders.slice(0, i).join("/"));
  }

  return out;
}

function folderAncestorsOfFolderPath(folderPath: string): string[] {
  const parts = normalizePath(folderPath).split("/").filter(Boolean);
  const out: string[] = [];

  for (let i = 1; i <= parts.length; i++) {
    out.push(parts.slice(0, i).join("/"));
  }

  return out;
}

/**
 * Déduit le status à partir du path.
 * Convention: my-app/<status>/...
 */
function statusFromPath(path: string): "pending" | "published" | "bin" {
  const parts = normalizePath(path).split("/").filter(Boolean);
  const status = parts[1];

  if (status === "pending" || status === "published" || status === "bin") {
    return status;
  }

  return "pending";
}

/**
 * Renommer un asset Cloudinary (authenticated) de manière robuste.
 * Cloudinary exige souvent le bon resource_type.
 */
async function renameAuthenticatedResource(
  fromPublicId: string,
  toPublicId: string
): Promise<void> {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];
  let lastError: unknown = null;

  for (const resourceType of resourceTypes) {
    try {
      await cloudinary.uploader.rename(fromPublicId, toPublicId, {
        type: "authenticated",
        resource_type: resourceType,
        overwrite: true,
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw (
    lastError ??
    new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Rename failed.",
    })
  );
}

/**
 * Détruire un asset Cloudinary (authenticated) de manière robuste.
 * Les typings Cloudinary exigent parfois resource_type => on teste image/video/raw.
 */
async function destroyAuthenticatedResource(publicId: string): Promise<void> {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];
  let lastError: unknown = null;

  for (const resourceType of resourceTypes) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        type: "authenticated",
        resource_type: resourceType,
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw (
    lastError ??
    new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Destroy failed.",
    })
  );
}

/**
 * Renommer/migrer un préfixe de dossier sur Cloudinary :
 * - renomme TOUS les assets sous fromPrefix/ vers toPrefix/
 * - pour image/video/raw
 */
async function renameFolderPrefixOnCloudinary(
  fromPrefix: string,
  toPrefix: string
): Promise<void> {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];

  for (const resourceType of resourceTypes) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type: resourceType,
        prefix: fromPrefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources ?? []) {
        const from = asset.public_id as string;
        const to = from.replace(fromPrefix, toPrefix);

        await cloudinary.uploader.rename(from, to, {
          type: "authenticated",
          resource_type: resourceType,
          overwrite: true,
        });
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
}

/**
 * Upsert un ensemble de folders (ancêtres inclus).
 * Important pour “matérialiser” en DB des dossiers rencontrés via Cloudinary.
 */
async function upsertFolders(db: PrismaClient, paths: string[]): Promise<void> {
  const unique = Array.from(new Set(paths)).filter(Boolean);

  await db.$transaction(
    unique.map((fullPath) =>
      db.cloudinaryFolder.upsert({
        where: { appRoot_fullPath: { appRoot: PROJECT_ROOT, fullPath } },
        create: {
          appRoot: PROJECT_ROOT,
          fullPath,
          status: statusFromPath(fullPath),
        },
        update: {
          status: statusFromPath(fullPath),
        },
      })
    )
  );
}

/**
 * ✅ DB SYNC: déplacer/renommer des dossiers “DB-only” sous un préfixe.
 *
 * Pourquoi :
 * - Cloudinary n'a pas de dossiers réels.
 * - Un dossier vide (placeholder DB) n'a pas d'assets => moveService ne “voit” rien.
 * - Donc si on glisse ce dossier vers /bin (ou autre status), la DB doit être renommée.
 */
async function moveDbFoldersPrefix(params: {
  db: PrismaClient;
  fromPrefix: string;
  toPrefix: string;
  nextStatus: "pending" | "published" | "bin";
}): Promise<void> {
  const { db, fromPrefix, toPrefix, nextStatus } = params;

  const rows = await db.cloudinaryFolder.findMany({
    where: {
      appRoot: PROJECT_ROOT,
      OR: [{ fullPath: fromPrefix }, { fullPath: { startsWith: `${fromPrefix}/` } }],
    },
    select: { id: true, fullPath: true },
  });

  if (!rows.length) return;

  await db.$transaction(async (tx) => {
    for (const row of rows) {
      const newFullPath =
        row.fullPath === fromPrefix
          ? toPrefix
          : `${toPrefix}${row.fullPath.slice(fromPrefix.length)}`;

      await tx.cloudinaryFolder.upsert({
        where: { appRoot_fullPath: { appRoot: PROJECT_ROOT, fullPath: newFullPath } },
        create: {
          appRoot: PROJECT_ROOT,
          fullPath: newFullPath,
          status: nextStatus,
        },
        update: {
          status: nextStatus,
        },
      });

      await tx.cloudinaryFolder.delete({
        where: { id: row.id },
      });
    }
  });
}

export const cloudinaryRouter = router({
  /**
   * Prépare des uploads signés Cloudinary.
   *
   * Règle métier :
   * - tout user connecté peut uploader
   * - tout upload arrive obligatoirement sous `pending`
   * - la destination finale est résolue côté serveur
   */
  createUploadSignatures: protectedProcedure
    .input(createUploadSignaturesSchema)
    .mutation(async ({ ctx, input }) => {
      return createUploadSignatures({
        prisma: ctx.prisma,
        appRoot: PROJECT_ROOT,
        destination: input.destination,
        assets: input.assets,
      });
    }),

  /**
   * Enregistre côté backend les assets réellement uploadés sur Cloudinary.
   *
   * Règle métier :
   * - l'uploader réel vient toujours de la session
   * - le backend revalide la destination `pending`
   * - le backend relit les métadonnées réelles depuis Cloudinary
   * - création des MediaAsset en DB
   * - `appRoot` est résolu côté serveur (jamais fourni par le client) afin
   *   d'éviter qu'un client malveillant cible un autre projet
   */
  registerUploadedAssets: protectedProcedure
    .input(registerUploadedAssetsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;

      return registerUploadedAssets({
        prisma: ctx.prisma,
        appRoot: PROJECT_ROOT,
        userId,
        destination: input.destination,
        assets: input.assets,
        eventDate: input.eventDate,
      });
    }),

  /**
   * ✅ Tree Finder (DB folders + Cloudinary files)
   * - Sync opportuniste: on upsert en DB les folders rencontrés via Cloudinary.
   */
  getFolderTree: adminProcedure
    .input(z.object({ path: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const normalizedPath = normalizePath(input.path);
      assertSafePath(normalizedPath);

      const resources = await listAuthenticatedResources(normalizedPath);

      const discoveredFolderPaths = resources.flatMap((r: { publicId: string }) =>
        folderAncestorsOfPublicId(r.publicId)
      );

      await upsertFolders(ctx.prisma, discoveredFolderPaths);

      const registered = await ctx.prisma.cloudinaryFolder.findMany({
        where: {
          appRoot: PROJECT_ROOT,
          fullPath: { startsWith: normalizedPath },
        },
        select: { fullPath: true },
      });

      const finderTree = buildCloudinaryTreeV1(
        resources,
        registered.map((f) => f.fullPath),
        normalizedPath
      );

      return mapCloudinaryFolderToClient(finderTree);
    }),

  getPendingTree: adminProcedure.query(async () => {
    const rootPath = `${PROJECT_ROOT}/pending`;
    const resources = await listAuthenticatedResources(rootPath);

    return buildCloudinaryTreeV1(resources, [rootPath], rootPath);
  }),

  deletePicture: adminProcedure
    .input(z.object({ publicId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const publicId = normalizePath(input.publicId);

      assertSafePath(publicId);
      assertNotInTrashStorage(publicId);

      await destroyAuthenticatedResource(publicId);

      return { success: true };
    }),

  /**
   * ✅ Renommer un fichier (ou asset) — robuste image/video/raw
   * + Sync DB: upsert ancêtres de la destination
   */
  renamePicture: adminProcedure
    .input(
      z.object({
        fromPublicId: z.string().min(1),
        toPublicId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const from = normalizePath(input.fromPublicId);
      const to = normalizePath(input.toPublicId);

      assertSafePath(from);
      assertSafePath(to);
      assertNotInTrashStorage(from);
      assertNotInTrashStorage(to);

      await renameAuthenticatedResource(from, to);
      await upsertFolders(ctx.prisma, folderAncestorsOfPublicId(to));

      return { success: true };
    }),

  /**
   * ✅ Créer un dossier (même vide) dans la registry DB.
   */
  createFolder: adminProcedure
    .input(z.object({ fullPath: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const fullPath = normalizePath(input.fullPath);

      assertSafePath(fullPath);
      assertNotInTrashStorage(fullPath);
      assertRootFolder(fullPath);

      await upsertFolders(ctx.prisma, folderAncestorsOfFolderPath(fullPath));

      return { success: true };
    }),

  /**
   * ✅ Renommer / déplacer un dossier (préfixe)
   */
  renameFolderPrefix: adminProcedure
    .input(z.object({ fromPrefix: z.string().min(1), toPrefix: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const fromPrefix = normalizePath(input.fromPrefix);
      const toPrefix = normalizePath(input.toPrefix);

      assertSafePath(fromPrefix);
      assertSafePath(toPrefix);
      assertNotInTrashStorage(fromPrefix);
      assertNotInTrashStorage(toPrefix);
      assertRootFolder(fromPrefix);
      assertRootFolder(toPrefix);

      if (fromPrefix === toPrefix) {
        return { success: true };
      }

      await renameFolderPrefixOnCloudinary(fromPrefix, toPrefix);

      const impacted = await ctx.prisma.cloudinaryFolder.findMany({
        where: {
          appRoot: PROJECT_ROOT,
          OR: [{ fullPath: fromPrefix }, { fullPath: { startsWith: `${fromPrefix}/` } }],
        },
        select: { id: true, fullPath: true },
      });

      if (impacted.length === 0) {
        await upsertFolders(ctx.prisma, folderAncestorsOfFolderPath(toPrefix));
        return { success: true };
      }

      const updates = impacted.map((folder) => ({
        id: folder.id,
        nextFullPath: folder.fullPath.replace(fromPrefix, toPrefix),
      }));

      const targetPaths = Array.from(new Set(updates.map((u) => u.nextFullPath)));

      const collisions = await ctx.prisma.cloudinaryFolder.findMany({
        where: {
          appRoot: PROJECT_ROOT,
          fullPath: { in: targetPaths },
          id: { notIn: impacted.map((i) => i.id) },
        },
        select: { fullPath: true },
      });

      if (collisions.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Folder rename collision: ${collisions
            .map((c) => c.fullPath)
            .join(", ")}`,
        });
      }

      await ctx.prisma.$transaction(async (tx) => {
        const ancestors = folderAncestorsOfFolderPath(toPrefix);

        for (const fullPath of ancestors) {
          await tx.cloudinaryFolder.upsert({
            where: { appRoot_fullPath: { appRoot: PROJECT_ROOT, fullPath } },
            create: {
              appRoot: PROJECT_ROOT,
              fullPath,
              status: statusFromPath(fullPath),
            },
            update: {
              status: statusFromPath(fullPath),
            },
          });
        }

        for (const update of updates) {
          await tx.cloudinaryFolder.update({
            where: { id: update.id },
            data: {
              fullPath: update.nextFullPath,
              status: statusFromPath(update.nextFullPath),
            },
          });
        }
      });

      return { success: true };
    }),

  deleteFolder: adminProcedure
    .input(z.object({ prefix: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const normalizedPrefix = normalizePath(input.prefix);

      assertSafePath(normalizedPrefix);
      assertNotInTrashStorage(normalizedPrefix);
      assertRootFolder(normalizedPrefix);

      await deleteByPrefix(normalizedPrefix);

      return { success: true };
    }),

  emptyBin: adminProcedure.mutation(async () => {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Deprecated. Use trash.deleteForever (or trash.emptyBin).",
    });
  }),

  deleteSelectionInBin: adminProcedure
    .input(
      z.object({
        roots: z.array(z.string().min(1)).min(1),
        excluded: z.array(z.string().min(1)).optional(),
      })
    )
    .mutation(async () => {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Deprecated. Use trash.deleteForever (by trashIds).",
      });
    }),

  validatePictures: adminProcedure
    .input(
      z.object({
        publicIds: z.array(z.string()).min(1),
        category: z.string().min(1),
        activity: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      for (const oldPublicId of input.publicIds) {
        const oldId = normalizePath(oldPublicId);
        assertSafePath(oldId);
        assertNotInTrashStorage(oldId);

        const filename = oldId.split("/").pop();
        if (!filename) continue;

        const newPublicId = `${PROJECT_ROOT}/${input.category}/${input.activity}/${filename}`;
        const newId = normalizePath(newPublicId);

        assertSafePath(newId);
        assertNotInTrashStorage(newId);

        await renameAuthenticatedResource(oldId, newId);
        await upsertFolders(ctx.prisma, folderAncestorsOfPublicId(newId));
      }

      return { success: true };
    }),

  /**
   * ✅ Move (DnD + multi-select)
   * IMPORTANT : move -> bin est interdit ici (trash.trashToBin).
   */
  move: adminProcedure
    .input(moveSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.target.type === "virtual-folder" && input.target.status === "bin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Move to bin is not allowed here. Use trash.trashToBin.",
        });
      }

      await moveService(input);

      const { source, target } = input;

      if (target.type === "virtual-folder") {
        if (source.type === "folder") {
          const fromPrefix = normalizePath(source.fullPath);
          assertSafePath(fromPrefix);
          assertNotInTrashStorage(fromPrefix);

          const toPrefix = replaceStatusSegment(fromPrefix, target.status);
          assertSafePath(toPrefix);
          assertNotInTrashStorage(toPrefix);

          await moveDbFoldersPrefix({
            db: ctx.prisma,
            fromPrefix,
            toPrefix,
            nextStatus: target.status,
          });
        }

        if (source.type === "selection") {
          for (const root of source.roots) {
            const fromPrefix = normalizePath(root);
            assertSafePath(fromPrefix);
            assertNotInTrashStorage(fromPrefix);

            const toPrefix = replaceStatusSegment(fromPrefix, target.status);
            assertSafePath(toPrefix);
            assertNotInTrashStorage(toPrefix);

            await moveDbFoldersPrefix({
              db: ctx.prisma,
              fromPrefix,
              toPrefix,
              nextStatus: target.status,
            });
          }
        }
      }

      return { success: true };
    }),
});