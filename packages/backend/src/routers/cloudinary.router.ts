import { z } from "zod";

import { router, protectedProcedure } from "packages/backend/src/trpc/core";
import { isAdmin } from "packages/backend/src/routers/middleware";

import { listAuthenticatedResources } from "packages/backend/src/services/cloudinary.service";
import { cloudinary } from "packages/backend/src/cloudinary/cloudinary.client";
import { moveService } from "packages/backend/src/cloudinary/services/move.service";
import { moveSchema } from "packages/contracts/schemas/cloudinary/move.schema";
import { mapCloudinaryFolderToClient } from "packages/backend/src/mappers/cloudinary/tree.v1.mapper";
import { buildCloudinaryTreeV1 } from "packages/backend/src/cloudinary/tree";
import { prisma } from "packages/backend/src/prisma";
import { replaceStatusSegment } from "packages/backend/src/cloudinary/utils/cloudinary.utils";

const PROJECT_ROOT = process.env.APP_SHORT_NAME || "my-app";

function normalizePath(path: string) {
  return path.replace(/^\/+|\/+$/g, "");
}

function assertSafePath(path: string) {
  if (!path.startsWith(PROJECT_ROOT)) throw new Error("Forbidden path");
  if (path.includes("..")) throw new Error("Invalid path");
}

/**
 * Interdit toute opération "cloudinaryRouter" sur le storage caché du bin.
 *
 * Pourquoi :
 * - Un contenu placé en corbeille est immuable (lecture / restore / deleteForever uniquement).
 * - Toute mutation sur `.trash` doit passer par `trashRouter`.
 */
function assertNotInTrashStorage(path: string) {
  const p = normalizePath(path);
  if (p.startsWith(`${PROJECT_ROOT}/bin/.trash/`)) {
    throw new Error("Forbidden operation on trash storage. Use trashRouter.");
  }
}

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
  if (status === "pending" || status === "published" || status === "bin") return status;
  // fallback (ne devrait pas arriver si les paths respectent la convention)
  return "pending";
}

type CloudinaryResourceType = "image" | "video" | "raw";

/**
 * Renommer un asset Cloudinary (authenticated) de manière robuste.
 * Cloudinary exige souvent le bon resource_type.
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
 * Détruire un asset Cloudinary (authenticated) de manière robuste.
 * Les typings Cloudinary exigent parfois resource_type => on teste image/video/raw.
 */
async function destroyAuthenticatedResource(publicId: string) {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];
  let lastError: unknown = null;

  for (const resource_type of resourceTypes) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        type: "authenticated",
        resource_type,
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Destroy failed (unknown error)");
}

/**
 * Supprimer par préfixe en authenticated (robuste).
 *
 * Pourquoi :
 * - Les typings Cloudinary pour `api.delete_resources_by_prefix` varient selon version.
 * - Sur certains projets TS, `type:"authenticated"` n'est pas accepté par les types.
 * - On centralise ici avec un cast minimal pour rester compatible.
 */
async function deleteAuthenticatedByPrefix(prefix: string) {
  const resourceTypes: CloudinaryResourceType[] = ["image", "video", "raw"];

  for (const resource_type of resourceTypes) {
    // cast minimal pour supporter les variations de typings
    await (cloudinary.api).delete_resources_by_prefix(prefix, {
      type: "authenticated",
      resource_type,
    });
  }
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
 * Upsert un ensemble de folders (ancêtres inclus).
 * Important pour “matérialiser” en DB des dossiers rencontrés via Cloudinary.
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

/**
 * ✅ DB SYNC: déplacer/renommer des dossiers “DB-only” sous un préfixe.
 *
 * Pourquoi :
 * - Cloudinary n'a pas de dossiers réels.
 * - Un dossier vide (placeholder DB) n'a pas d'assets => moveService ne “voit” rien.
 * - Donc si on glisse ce dossier vers /bin (ou autre status), la DB doit être renommée.
 *
 * Comment :
 * - on récupère tous les CloudinaryFolder sous fromPrefix (lui-même + descendants)
 * - on calcule le newFullPath sous toPrefix
 * - on upsert la destination (au cas où elle existe déjà)
 * - on supprime l'ancien en transaction
 */
async function moveDbFoldersPrefix(params: {
  fromPrefix: string;
  toPrefix: string;
  nextStatus: "pending" | "published" | "bin";
}) {
  const { fromPrefix, toPrefix, nextStatus } = params;

  const rows = await prisma.cloudinaryFolder.findMany({
    where: {
      appRoot: PROJECT_ROOT,
      OR: [{ fullPath: fromPrefix }, { fullPath: { startsWith: `${fromPrefix}/` } }],
    },
    select: { id: true, fullPath: true },
  });

  if (!rows.length) return;

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const newFullPath =
        row.fullPath === fromPrefix
          ? toPrefix
          : `${toPrefix}${row.fullPath.slice(fromPrefix.length)}`;

      await tx.cloudinaryFolder.upsert({
        where: { appRoot_fullPath: { appRoot: PROJECT_ROOT, fullPath: newFullPath } },
        create: { appRoot: PROJECT_ROOT, fullPath: newFullPath, status: nextStatus },
        update: { status: nextStatus },
      });

      await tx.cloudinaryFolder.delete({ where: { id: row.id } });
    }
  });
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
      const discoveredFolderPaths = resources.flatMap((r: { publicId: string }) => folderAncestorsOfPublicId(r.publicId));
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

  // Alias pending conservé
  getPendingTree: protectedProcedure.query(async () => {
    const rootPath = `${PROJECT_ROOT}/pending`;
    const resources = await listAuthenticatedResources(rootPath);
    return buildCloudinaryTreeV1(resources, [rootPath], rootPath);
  }),

  deletePicture: protectedProcedure
    .use(isAdmin)
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
  renamePicture: protectedProcedure
    .use(isAdmin)
    .input(z.object({ fromPublicId: z.string().min(1), toPublicId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const from = normalizePath(input.fromPublicId);
      const to = normalizePath(input.toPublicId);

      assertSafePath(from);
      assertSafePath(to);
      assertNotInTrashStorage(from);
      assertNotInTrashStorage(to);

      await renameAuthenticatedResource(from, to);

      // Sync DB: enregistrer les dossiers ancêtres du nouveau path
      await upsertFolders(folderAncestorsOfPublicId(to));

      return { success: true };
    }),

  /**
   * ✅ Créer un dossier (même vide) dans la registry DB.
   */
  createFolder: protectedProcedure
    .use(isAdmin)
    .input(z.object({ fullPath: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const fullPath = normalizePath(input.fullPath);
      assertSafePath(fullPath);
      assertNotInTrashStorage(fullPath);

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
      assertNotInTrashStorage(fromPrefix);
      assertNotInTrashStorage(toPrefix);

      if (fromPrefix === toPrefix) return { success: true };

      // 1) Cloudinary: renommer les assets sous fromPrefix/
      await renameFolderPrefixOnCloudinary(fromPrefix, toPrefix);

      // 2) DB: récupérer tous les folders impactés
      const impacted = await prisma.cloudinaryFolder.findMany({
        where: {
          appRoot: PROJECT_ROOT,
          OR: [{ fullPath: fromPrefix }, { fullPath: { startsWith: `${fromPrefix}/` } }],
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

      // 4) Collision check (si un folder existe déjà avec le même path cible, hors impacted)
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
        throw new Error(`Folder rename collision: ${collisions.map((c) => c.fullPath).join(", ")}`);
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

  // Supprimer dossier (cloudinary prefix)
  deleteFolder: protectedProcedure
    .input(z.object({ prefix: z.string() }))
    .mutation(async ({ input }) => {
      const normalizedPrefix = normalizePath(input.prefix);
      assertSafePath(normalizedPrefix);
      assertNotInTrashStorage(normalizedPrefix);

      await deleteAuthenticatedByPrefix(normalizedPrefix);
      return { success: true };
    }),

  emptyBin: protectedProcedure
    .use(isAdmin)
    .mutation(async () => {
      // IMPORTANT : depuis l'introduction de TrashEntry, vider le bin doit passer
      // par `trash.deleteForever` (ou un futur `trash.emptyBin`).
      throw new Error("Deprecated. Use trash.deleteForever (or trash.emptyBin).");
    }),

  deleteSelectionInBin: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        roots: z.array(z.string().min(1)).min(1),
        excluded: z.array(z.string().min(1)).optional(),
      })
    )
    .mutation(async () => {
      // IMPORTANT : depuis l'introduction de TrashEntry, supprimer en bin doit passer
      // par `trash.deleteForever` (sélection = trashIds).
      throw new Error("Deprecated. Use trash.deleteForever (by trashIds).");
    }),

  // Validation images (inchangé, mais on sécurise le rename + trash guard)
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

        // Sync DB: ancêtres
        await upsertFolders(folderAncestorsOfPublicId(newId));
      }

      return { success: true };
    }),

  /**
   * ✅ Move (DnD + multi-select)
   * IMPORTANT : move -> bin est interdit ici (trash.trashToBin).
   */
  move: protectedProcedure.input(moveSchema).mutation(async ({ input }) => {
    if (input.target.type === "virtual-folder" && input.target.status === "bin") {
      throw new Error("Move to bin is not allowed here. Use trash.trashToBin.");
    }

    await moveService(input);

    const { source, target } = input;

    // DB sync seulement quand on change de "status" (virtual-folder)
    if (target.type === "virtual-folder") {
      // 1) Source = dossier unique
      if (source.type === "folder") {
        const fromPrefix = normalizePath(source.fullPath);
        assertSafePath(fromPrefix);
        assertNotInTrashStorage(fromPrefix);

        const toPrefix = replaceStatusSegment(fromPrefix, target.status);
        assertSafePath(toPrefix);
        assertNotInTrashStorage(toPrefix);

        await moveDbFoldersPrefix({
          fromPrefix,
          toPrefix,
          nextStatus: target.status,
        });
      }

      // 2) Source = multi-selection
      if (source.type === "selection") {
        for (const root of source.roots) {
          const fromPrefix = normalizePath(root);
          assertSafePath(fromPrefix);
          assertNotInTrashStorage(fromPrefix);

          const toPrefix = replaceStatusSegment(fromPrefix, target.status);
          assertSafePath(toPrefix);
          assertNotInTrashStorage(toPrefix);

          await moveDbFoldersPrefix({
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