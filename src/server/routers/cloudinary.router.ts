import { z } from "zod";

import { router, protectedProcedure } from "@server/trpc/core";
import { isAdmin } from "@server/routers/middleware";

import { listAuthenticatedResources } from "@server/services/cloudinary.service";
import { cloudinary } from "@/server/cloudinary/cloudinary.client";
import { moveService } from "@/server/cloudinary/services/move.service";
import { moveSchema } from "@server/cloudinary/schemas/move.schema";
import { mapCloudinaryFolderToClient } from "@server/mappers/cloudinary/tree.v1.mapper";
import { buildCloudinaryTreeV1 } from "@server/cloudinary/tree";
import { prisma } from "@server/prisma";

const PROJECT_ROOT = process.env.APP_SHORT_NAME || "my-app";

function normalizePath(path: string) {
  return path.replace(/^\/+|\/+$/g, "");
}

function assertSafePath(path: string) {
  if (!path.startsWith(PROJECT_ROOT)) throw new Error("Forbidden path");
  if (path.includes("..")) throw new Error("Invalid path");
}

/**
 * Ex: "my-app/pending/a/b/file" =>
 * folder ancestors: ["my-app/pending", "my-app/pending/a", "my-app/pending/a/b"]
 */
function folderAncestorsOfPublicId(publicId: string): string[] {
  const parts = normalizePath(publicId).split("/").filter(Boolean);
  if (parts.length < 2) return [];

  // remove last segment (file name)
  const folders = parts.slice(0, -1);

  const out: string[] = [];
  for (let i = 1; i <= folders.length; i++) {
    out.push(folders.slice(0, i).join("/"));
  }
  return out;
}

/**
 * Ex: "my-app/pending/a/b" =>
 * ["my-app/pending", "my-app/pending/a", "my-app/pending/a/b"]
 */
function folderAncestorsOfFolderPath(folderPath: string): string[] {
  const parts = normalizePath(folderPath).split("/").filter(Boolean);
  const out: string[] = [];
  for (let i = 1; i <= parts.length; i++) {
    out.push(parts.slice(0, i).join("/"));
  }
  return out;
}

function statusFromPath(path: string): "pending" | "published" | "bin" {
  // Convention actuelle: my-app/<status>/...
  const parts = normalizePath(path).split("/").filter(Boolean);
  const status = parts[1];
  if (status === "pending" || status === "published" || status === "bin") return status;
  // fallback (ne devrait pas arriver si tes paths respectent la convention)
  return "pending";
}

type CloudinaryResourceType = "image" | "video" | "raw";

/**
 * Renommer un asset Cloudinary (authenticated) de manière robuste.
 * (Cloudinary exige souvent le bon resource_type.)
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
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Rename failed (unknown error)");
}

/**
 * Renommer/migrer un préfixe de dossier sur Cloudinary:
 * - Renomme TOUS les assets sous fromPrefix/ vers toPrefix/
 * - Pour image/video/raw
 */
async function renameFolderPrefixOnCloudinary(fromPrefix: string, toPrefix: string) {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];

  for (const resource_type of resourceTypes) {
    let nextCursor: string | undefined;

    do {
      const res = await cloudinary.api.resources({
        type: "authenticated",
        resource_type,
        prefix: fromPrefix,
        max_results: 500,
        next_cursor: nextCursor,
      });

      for (const asset of res.resources ?? []) {
        const from = asset.public_id as string;
        const to = from.replace(fromPrefix, toPrefix);
        await cloudinary.uploader.rename(from, to, {
          type: "authenticated",
          resource_type,
          overwrite: true,
        });
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }
}

/**
 * Upsert un ensemble de folders (ancêtres inclus)
 */
async function upsertFolders(paths: string[]) {
  const unique = Array.from(new Set(paths)).filter(Boolean);

  await prisma.$transaction(
    unique.map((fullPath) =>
      prisma.cloudinaryFolder.upsert({
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

export const cloudinaryRouter = router({
  /**
   * ✅ Tree Finder (DB folders + Cloudinary files)
   * - Sync opportuniste: on upsert en DB les folders rencontrés via Cloudinary.
   */
  getFolderTree: protectedProcedure
    .use(isAdmin)
    .input(z.object({ path: z.string().min(1) }))
    .query(async ({ input }) => {
      const normalizedPath = normalizePath(input.path);
      assertSafePath(normalizedPath);

      // 1) Charger les resources cloudinary
      const resources = await listAuthenticatedResources(normalizedPath);

      // 2) Sync opportuniste DB: créer/assurer les dossiers ancêtres des assets
      const discoveredFolderPaths = resources.flatMap((r: typeof resources[0]) => folderAncestorsOfPublicId(r.publicId));
      await upsertFolders(discoveredFolderPaths);

      // 3) Charger les dossiers enregistrés en DB sous ce root
      const registered = await prisma.cloudinaryFolder.findMany({
        where: {
          appRoot: PROJECT_ROOT,
          fullPath: { startsWith: normalizedPath },
        },
        select: { fullPath: true },
      });

      // 4) Build tree DB+Cloudinary puis mapper vers client
      const finderTree = buildCloudinaryTreeV1(
        resources,
        registered.map((f) => f.fullPath),
        normalizedPath
      );

      const clientTree = mapCloudinaryFolderToClient(finderTree);
      return clientTree;
    }),

  // Alias pending conservé (tu peux le supprimer plus tard)
  getPendingTree: protectedProcedure.query(async () => {
    const rootPath = `${PROJECT_ROOT}/pending`;
    const resources = await listAuthenticatedResources(rootPath);
    return buildCloudinaryTreeV1(resources, [rootPath], rootPath);
  }),

  // Supprimer une image (attention: si tu as video/raw, on pourra le rendre robuste aussi)
  deletePicture: protectedProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(async ({ input }) => {
      await cloudinary.uploader.destroy(input.publicId, { type: "authenticated" });
      return { success: true };
    }),

  /**
   * ✅ Renommer un fichier (ou asset) — robuste image/video/raw
   * + Sync DB: upsert ancêtres de la destination
   */
  renamePicture: protectedProcedure
    .use(isAdmin)
    .input(z.object({ fromPublicId: z.string().min(1), toPublicId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const from = normalizePath(input.fromPublicId);
      const to = normalizePath(input.toPublicId);

      assertSafePath(from);
      assertSafePath(to);

      await renameAuthenticatedResource(from, to);

      // Sync DB: enregistrer les dossiers ancêtres du nouveau path
      await upsertFolders(folderAncestorsOfPublicId(to));

      return { success: true };
    }),

  /**
   * ✅ Créer un dossier (même vide) dans la registry DB
   * (c'est LE point qui “résout” la disparition des dossiers vides)
   */
  createFolder: protectedProcedure
    .use(isAdmin)
    .input(z.object({ fullPath: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const fullPath = normalizePath(input.fullPath);
      assertSafePath(fullPath);

      // On upsert tous les ancêtres (y compris lui-même)
      await upsertFolders(folderAncestorsOfFolderPath(fullPath));

      return { success: true };
    }),

  /**
   * ✅ Renommer / déplacer un dossier (préfixe) :
   * - Cloudinary: renomme tous les assets sous fromPrefix -> toPrefix
   * - DB: update fullPath du dossier + de tous ses descendants
   * - DB: upsert aussi les ancêtres du nouveau préfixe
   */
  renameFolderPrefix: protectedProcedure
    .use(isAdmin)
    .input(z.object({ fromPrefix: z.string().min(1), toPrefix: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const fromPrefix = normalizePath(input.fromPrefix);
      const toPrefix = normalizePath(input.toPrefix);

      assertSafePath(fromPrefix);
      assertSafePath(toPrefix);

      if (fromPrefix === toPrefix) return { success: true };

      // 1) Cloudinary: renommer les assets sous fromPrefix/
      await renameFolderPrefixOnCloudinary(fromPrefix, toPrefix);

      // 2) DB: récupérer tous les folders impactés
      const impacted = await prisma.cloudinaryFolder.findMany({
        where: {
          appRoot: PROJECT_ROOT,
          OR: [
            { fullPath: fromPrefix },
            { fullPath: { startsWith: `${fromPrefix}/` } },
          ],
        },
        select: { id: true, fullPath: true },
      });

      // Rien en DB ? On crée au moins le dossier cible + ancêtres, et on sort.
      if (impacted.length === 0) {
        await upsertFolders(folderAncestorsOfFolderPath(toPrefix));
        return { success: true };
      }

      // 3) Calcul des nouveaux paths
      const updates = impacted.map((f) => {
        const nextFullPath = f.fullPath.replace(fromPrefix, toPrefix);
        return { id: f.id, nextFullPath };
      });

      // 4) Collision check (si un folder existe déjà avec le même path cible, hors des impacted)
      const targetPaths = Array.from(new Set(updates.map((u) => u.nextFullPath)));
      const collisions = await prisma.cloudinaryFolder.findMany({
        where: {
          appRoot: PROJECT_ROOT,
          fullPath: { in: targetPaths },
          id: { notIn: impacted.map((i) => i.id) },
        },
        select: { fullPath: true },
      });

      if (collisions.length > 0) {
        throw new Error(
          `Folder rename collision: ${collisions.map((c) => c.fullPath).join(", ")}`
        );
      }

      // 5) Transaction: appliquer updates + upsert ancêtres
      await prisma.$transaction(async (tx) => {
        // upsert ancêtres du nouveau préfixe
        const ancestors = folderAncestorsOfFolderPath(toPrefix);
        for (const p of ancestors) {
          await tx.cloudinaryFolder.upsert({
            where: { appRoot_fullPath: { appRoot: PROJECT_ROOT, fullPath: p } },
            create: { appRoot: PROJECT_ROOT, fullPath: p, status: statusFromPath(p) },
            update: { status: statusFromPath(p) },
          });
        }

        // appliquer les updates sur les impacted
        for (const u of updates) {
          await tx.cloudinaryFolder.update({
            where: { id: u.id },
            data: { fullPath: u.nextFullPath, status: statusFromPath(u.nextFullPath) },
          });
        }
      });

      return { success: true };
    }),

  // Supprimer dossier (cloudinary prefix) (tu pourras plus tard faire une version "DB soft delete")
  deleteFolder: protectedProcedure
    .input(z.object({ prefix: z.string() }))
    .mutation(async ({ input }) => {
      const normalizedPrefix = normalizePath(input.prefix);
      assertSafePath(normalizedPrefix);

      await cloudinary.api.delete_resources_by_prefix(normalizedPrefix, {
        type: "authenticated",
      });

      return { success: true };
    }),

  emptyBin: protectedProcedure
    .use(isAdmin)
    .mutation(async () => {
      const binPrefix = `${PROJECT_ROOT}/bin`;
      // sécurité (optionnelle)
      assertSafePath(binPrefix);

      // Supprime par resource_type pour être sûr de vider complètement
      const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];

      for (const resource_type of resourceTypes) {
        await cloudinary.api.delete_resources_by_prefix(binPrefix, {
          type: "authenticated",
          resource_type,
        });
      }

      return { success: true };
    }),

  // Validation images (inchangé)
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
        const filename = oldPublicId.split("/").pop();
        if (!filename) continue;

        const newPublicId = `${PROJECT_ROOT}/${input.category}/${input.activity}/${filename}`;

        await cloudinary.uploader.rename(oldPublicId, newPublicId, {
          type: "authenticated",
        });

        // Sync DB: ancêtres
        await upsertFolders(folderAncestorsOfPublicId(newPublicId));
      }

      return { success: true };
    }),

  // Move (DnD + multi-select) — inchangé ici (move.service gère déjà)
  move: protectedProcedure
    .input(moveSchema)
    .mutation(async ({ input }) => {
      await moveService(input);
      return { success: true };
    }),
});