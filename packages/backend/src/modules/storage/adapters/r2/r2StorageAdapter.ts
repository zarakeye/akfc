import {
  ListObjectsV2Command,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  type S3Client,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { PrismaClient } from "@prisma/client";

import type {
  StorageAdapter,
  UploadCapableAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageFolderNode,
  StorageFileNode,
  StorageMetadata,
  StorageMoveOperation,
  StoragePath,
} from "@contracts/storage";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";

import { getR2Client, getR2Bucket } from "@backend/modules/storage/adapters/r2/client";
import { parsePathToDestination } from "@backend/modules/media/services/parsePathToDestination";

/**
 * r2StorageAdapter — implémentation Cloudflare R2 complète
 *
 * Phase 2 (tracking R2) : `registerUploadedAsset` crée maintenant une row
 * `MediaAsset` après le HeadObject de validation. Cela permet au finder, à
 * la searchbar et au tri par Date/Expéditeur de voir les fichiers R2 au
 * même titre que les Cloudinary.
 *
 * (Le reste de la doc d'architecture est inchangée par rapport à la v1 —
 * voir l'historique git pour les notes sur le modèle R2 sans dossiers,
 * la pagination, le presigned PUT etc.)
 */

/* -------------------------------------------------------------------------- */
/*  Types upload                                                              */
/* -------------------------------------------------------------------------- */

export type R2CreateUploadAuthorizationInput = {
  path: StoragePath;
  mimeType: string;
  maxBytes: number;
};

export type R2CreateUploadAuthorizationOutput = {
  uploadUrl: string;
  fields: Record<string, string>;
  expiresAt: string;
};

/**
 * Phase 2 : enrichi avec `destination` (categoryId + disciplineId|proposed)
 * et `originalFileName`. La destination est nécessaire pour créer la row
 * MediaAsset avec les bonnes FK. L'originalFileName aussi (sinon on devrait
 * deviner depuis le path, qui peut être slugifié et donc divergent).
 */
export type R2RegisterUploadedAssetInput = {
  path: StoragePath;
  userId: string;
  expectedBytes: number;
  expectedMimeType: string;
  destination: UploadDestination;
  originalFileName: string;
};

export type R2RegisterUploadedAssetOutput = {
  ok: true;
  path: StoragePath;
  bytes: number;
  mimeType: string;
  mediaAssetId: string;
};

/* -------------------------------------------------------------------------- */
/*  Type complet de l'adapter                                                 */
/* -------------------------------------------------------------------------- */

export type R2StorageAdapter = StorageAdapter &
  UploadCapableAdapter<
    R2CreateUploadAuthorizationInput,
    R2CreateUploadAuthorizationOutput,
    R2RegisterUploadedAssetInput,
    R2RegisterUploadedAssetOutput
  >;

export type R2StorageAdapterDeps = {
  prisma: PrismaClient;
  appRoot: string;
};

/* -------------------------------------------------------------------------- */
/*  Factory                                                                   */
/* -------------------------------------------------------------------------- */

export function createR2StorageAdapter(
  deps: R2StorageAdapterDeps
): R2StorageAdapter {
  const { prisma, appRoot } = deps;

  return {
    /* ====================================================================== */
    /*  Lecture                                                               */
    /* ====================================================================== */

    async list(options: ListOptions): Promise<ListResult> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();
      const Prefix = ensureTrailingSlash(options.path);

      const response = await s3.send(
        new ListObjectsV2Command({
          Bucket,
          Prefix,
          Delimiter: "/",
          MaxKeys: options.limit ?? 1000,
          ContinuationToken: options.cursor,
        })
      );

      const folders: StorageFolderNode[] = (response.CommonPrefixes ?? [])
        .map((cp) => cp.Prefix)
        .filter((p): p is string => Boolean(p))
        .map((fullPath) => {
          const normalizedPath = stripTrailingSlash(fullPath);
          return {
            type: "folder" as const,
            name: lastSegment(normalizedPath),
            path: normalizedPath,
            hasChildren: true,
          };
        });

      const files: StorageFileNode[] = (response.Contents ?? [])
        .filter(
          (obj): obj is S3Object & { Key: string } =>
            Boolean(obj.Key) && obj.Key !== Prefix
        )
        .map((obj) => objectToFileNode(obj));

      return {
        folders,
        files,
        nextCursor: response.NextContinuationToken ?? null,
      };
    },

    async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();
      const depth = options.depth ?? 1;

      const root = await buildSubTree(s3, Bucket, options.path, depth);
      return { root };
    },

    async getNode(path: StoragePath): Promise<StorageNode | null> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      try {
        const head = await s3.send(
          new HeadObjectCommand({ Bucket, Key: path })
        );
        return {
          type: "file" as const,
          name: lastSegment(path),
          path,
          metadata: {
            bytes: head.ContentLength,
            updatedAt: head.LastModified?.toISOString(),
            mimeType: head.ContentType ?? inferMimeFromPath(path),
            format: extensionOf(path),
          },
        };
      } catch (err) {
        if (!isNotFoundError(err)) throw err;
      }

      const Prefix = ensureTrailingSlash(path);
      const list = await s3.send(
        new ListObjectsV2Command({
          Bucket,
          Prefix,
          Delimiter: "/",
          MaxKeys: 1,
        })
      );
      const hasAny =
        (list.Contents?.length ?? 0) > 0 ||
        (list.CommonPrefixes?.length ?? 0) > 0;

      if (!hasAny) return null;

      return {
        type: "folder" as const,
        name: lastSegment(path),
        path,
        hasChildren: true,
      };
    },

    async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      try {
        const head = await s3.send(
          new HeadObjectCommand({ Bucket, Key: path })
        );
        return {
          bytes: head.ContentLength,
          updatedAt: head.LastModified?.toISOString(),
          mimeType: head.ContentType ?? inferMimeFromPath(path),
          format: extensionOf(path),
        };
      } catch (err) {
        if (isNotFoundError(err)) return null;
        throw err;
      }
    },

    /* ====================================================================== */
    /*  Écriture                                                              */
    /* ====================================================================== */

    async move(operation: StorageMoveOperation): Promise<void> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      // Statut dérivé du premier segment du chemin cible (même logique
      // que l'adapter Cloudinary — le trou était identique ici).
      // Statut = segment APRÈS l'appRoot ([1] — les paths incluent l'appRoot).
      const topSegment = operation.target.path.split("/")[1];
      const nextStatus =
        topSegment === "pending" || topSegment === "published"
          ? topSegment
          : null;

      if (operation.source.type === "file") {
        await moveFile(s3, Bucket, operation.source.path, operation.target.path);

        // Phase 2 : on update aussi la row MediaAsset pour refléter le nouveau path
        await prisma.mediaAsset.updateMany({
          where: { appRoot, fullPath: operation.source.path },
          data: {
            fullPath: operation.target.path,
            ...(nextStatus ? { status: nextStatus } : {}),
          },
        });
        return;
      }

      await moveFolder(s3, Bucket, operation.source.path, operation.target.path);

      // Pour les folders : update tous les MediaAssets sous le préfixe.
      // On fait ça en SQL raw pour profiter du UPDATE...SET en une passe
      // (Prisma ne supporte pas REPLACE/SUBSTRING dans updateMany).
      const oldPrefix = `${operation.source.path}/`;
      const newPrefix = `${operation.target.path}/`;
      await prisma.$executeRaw`
        UPDATE "MediaAsset"
        SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
            "status" = COALESCE(${nextStatus}, "status")
        WHERE "appRoot" = ${appRoot} AND "fullPath" LIKE ${oldPrefix + "%"};
      `;
    },

    async delete(path: StoragePath): Promise<void> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      await s3.send(new DeleteObjectCommand({ Bucket, Key: path }));
      await deleteAllUnderPrefix(s3, Bucket, path);

      // Phase 2 : nettoyer les MediaAssets DB correspondantes
      await prisma.mediaAsset.deleteMany({
        where: {
          appRoot,
          OR: [
            { fullPath: path },
            { fullPath: { startsWith: `${path}/` } },
          ],
        },
      });
    },

    /* ====================================================================== */
    /*  Upload                                                                */
    /* ====================================================================== */

    async createUploadAuthorization(
      input: R2CreateUploadAuthorizationInput
    ): Promise<R2CreateUploadAuthorizationOutput> {
      assertUploadPathSafe(input.path, appRoot);
      assertUploadConstraints(input);

      const s3 = getR2Client();
      const Bucket = getR2Bucket();
      const expiresInSeconds = 5 * 60;
      const expiresAtMs = Date.now() + expiresInSeconds * 1000;

      const command = new PutObjectCommand({
        Bucket,
        Key: input.path,
        ContentType: input.mimeType,
      });

      const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: expiresInSeconds,
      });

      return {
        uploadUrl,
        fields: {},
        expiresAt: new Date(expiresAtMs).toISOString(),
      };
    },

    /**
     * Phase 2 — créer la row MediaAsset après validation HeadObject.
     *
     * Pipeline :
     *   1. HeadObject pour confirmer l'existence + valider taille/mime
     *   2. Résoudre categoryId/disciplineId depuis input.destination
     *   3. Créer la row MediaAsset avec :
     *      - fullPath = input.path (clé universelle)
     *      - publicId/secureUrl/resourceType = null (concepts Cloudinary-only)
     *      - originalFileName = input.originalFileName
     *      - mimeType, bytes = depuis HeadObject (source de vérité serveur)
     *      - categoryId/disciplineId/proposedDisciplineName = depuis destination
     *      - uploaderUserId = input.userId (depuis ctx.user.id côté router)
     *      - status = 'pending' (les uploads atterrissent toujours en pending)
     */
    async registerUploadedAsset(
      input: R2RegisterUploadedAssetInput
    ): Promise<R2RegisterUploadedAssetOutput> {
      const s3 = getR2Client();
      const Bucket = getR2Bucket();

      // 1. HeadObject — confirme existence + sert de source de vérité
      const head = await s3
        .send(new HeadObjectCommand({ Bucket, Key: input.path }))
        .catch((err) => {
          if (isNotFoundError(err)) {
            throw new Error(
              `Upload introuvable sur R2 : ${input.path}. ` +
                `Le client a peut-être abandonné avant de finir l'upload.`
            );
          }
          throw err;
        });

      const actualBytes = head.ContentLength ?? 0;
      const actualMime = head.ContentType ?? "";

      if (actualBytes !== input.expectedBytes) {
        throw new Error(
          `Taille incohérente sur ${input.path} : ` +
            `attendu ${input.expectedBytes}, reçu ${actualBytes}.`
        );
      }
      if (actualMime !== input.expectedMimeType) {
        throw new Error(
          `MIME type incohérent sur ${input.path} : ` +
            `attendu "${input.expectedMimeType}", reçu "${actualMime}".`
        );
      }

      // 2. Résoudre destination → categoryId + disciplineId
      //
      // Cas existing-discipline : on a directement les FK.
      // Cas new-discipline : on garde proposedDisciplineName, disciplineId = null.
      let categoryId: number | null = null;
      let disciplineId: number | null = null;
      let proposedDisciplineName: string | null = null;

      switch (input.destination.kind) {
        case "existing-discipline":
          categoryId = input.destination.categoryId;
          disciplineId = input.destination.disciplineId;
          break;
        case "new-discipline":
          categoryId = input.destination.categoryId;
          proposedDisciplineName = input.destination.proposedDisciplineName;
          break;
        case "general":
          // Espace club partagé, sans discipline ni catégorie
          // (categoryId reste null).
          break;
        case "event":
          // Contenus d'un événement : ni catégorie ni discipline unique — le
          // rattachement se fait par `eventId` (côté Cloudinary) et par les
          // liens de disciplines de l'événement.
          break;
        case "perso":
          // R2 perso toujours reporté (photos Cloudinary d'abord).
          throw new Error(
            "La destination 'perso' n'est pas supportée pour les uploads R2.",
          );
        default:
          // Exhaustivité : un nouveau kind non traité fera échouer le build ici.
          input.destination satisfies never;
          throw new Error("Unhandled upload destination kind.");
      }

      // 3. Création de la MediaAsset.
      //
      // Idempotence : si l'user re-soumet le même fichier (même path),
      // la contrainte @unique sur fullPath bloque le create. On utilise
      // upsert pour faire évoluer la row existante plutôt que d'échouer.
      // C'est cohérent avec le comportement Cloudinary (re-upload écrase).
      const asset = await prisma.mediaAsset.upsert({
        where: { fullPath: input.path },
        create: {
          fullPath: input.path,
          publicId: null,
          secureUrl: null,
          resourceType: null,
          mimeType: actualMime,
          format: extensionOf(input.path),
          originalFileName: input.originalFileName,
          bytes: actualBytes,
          appRoot,
          status: "pending",
          categoryId,
          disciplineId,
          proposedDisciplineName,
          uploaderUserId: input.userId,
        },
        update: {
          mimeType: actualMime,
          bytes: actualBytes,
          originalFileName: input.originalFileName,
          // Pas de changement de catégorie/discipline sur re-upload (ce qui
          // serait peu intuitif — l'user qui re-soumet veut juste écraser).
          uploaderUserId: input.userId,
        },
      });

      return {
        ok: true as const,
        path: input.path,
        bytes: actualBytes,
        mimeType: actualMime,
        mediaAssetId: asset.id,
      };
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers — listing récursif                                                */
/* -------------------------------------------------------------------------- */

async function buildSubTree(
  s3: S3Client,
  Bucket: string,
  path: string,
  depth: number
): Promise<StorageFolderNode> {
  const Prefix = ensureTrailingSlash(path);
  const normalizedPath = stripTrailingSlash(path);

  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket,
      Prefix,
      Delimiter: "/",
      MaxKeys: 1000,
    })
  );

  const subPrefixes = (response.CommonPrefixes ?? [])
    .map((cp) => cp.Prefix)
    .filter((p): p is string => Boolean(p))
    .map(stripTrailingSlash);

  let subFolders: StorageFolderNode[];
  if (depth > 0) {
    subFolders = await Promise.all(
      subPrefixes.map((p) => buildSubTree(s3, Bucket, p, depth - 1))
    );
  } else {
    subFolders = subPrefixes.map((p) => ({
      type: "folder" as const,
      name: lastSegment(p),
      path: p,
      hasChildren: true,
    }));
  }

  const files: StorageFileNode[] = (response.Contents ?? [])
    .filter(
      (obj): obj is S3Object & { Key: string } =>
        Boolean(obj.Key) && obj.Key !== Prefix
    )
    .map((obj) => objectToFileNode(obj));

  const children: StorageNode[] = [...subFolders, ...files];

  return {
    type: "folder" as const,
    name: lastSegment(normalizedPath),
    path: normalizedPath,
    children,
    hasChildren: children.length > 0,
  };
}

function objectToFileNode(obj: S3Object & { Key: string }): StorageFileNode {
  return {
    type: "file" as const,
    name: lastSegment(obj.Key),
    path: obj.Key,
    metadata: {
      bytes: obj.Size,
      updatedAt: obj.LastModified?.toISOString(),
      mimeType: inferMimeFromPath(obj.Key),
      format: extensionOf(obj.Key),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers — validation upload                                               */
/* -------------------------------------------------------------------------- */

const HARD_MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

function assertUploadPathSafe(path: string, appRoot: string): void {
  if (!path) throw new Error("createUploadAuthorization: path vide");
  if (path.startsWith("/")) throw new Error(`createUploadAuthorization: path ne doit pas commencer par "/" (reçu: "${path}")`);
  if (path.endsWith("/")) throw new Error(`createUploadAuthorization: path ne doit pas se terminer par "/" (reçu: "${path}")`);
  if (path.includes("..")) throw new Error(`createUploadAuthorization: segment ".." interdit (path traversal) dans "${path}"`);
  if (path.includes("//")) throw new Error(`createUploadAuthorization: "//" consécutifs interdits dans "${path}"`);
  if (!path.startsWith(`${appRoot}/`)) {
    throw new Error(
      `createUploadAuthorization: path doit commencer par "${appRoot}/" ` +
        `(reçu: "${path}"). Aucun upload hors de la racine applicative n'est autorisé.`
    );
  }
}

function assertUploadConstraints(input: R2CreateUploadAuthorizationInput): void {
  if (!input.mimeType || input.mimeType.length === 0) {
    throw new Error("createUploadAuthorization: mimeType requis");
  }
  if (input.maxBytes <= 0) {
    throw new Error(`createUploadAuthorization: maxBytes doit être > 0 (reçu: ${input.maxBytes})`);
  }
  if (input.maxBytes > HARD_MAX_UPLOAD_BYTES) {
    throw new Error(
      `createUploadAuthorization: maxBytes ${input.maxBytes} dépasse la limite ` +
        `dure de ${HARD_MAX_UPLOAD_BYTES} octets.`
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers — écriture                                                        */
/* -------------------------------------------------------------------------- */

async function moveFile(
  s3: S3Client,
  Bucket: string,
  srcKey: string,
  dstKey: string
): Promise<void> {
  await s3.send(
    new CopyObjectCommand({
      Bucket,
      Key: dstKey,
      CopySource: buildCopySource(Bucket, srcKey),
    })
  );
  await s3.send(new DeleteObjectCommand({ Bucket, Key: srcKey }));
}

async function moveFolder(
  s3: S3Client,
  Bucket: string,
  srcPath: string,
  dstPath: string
): Promise<void> {
  const srcPrefix = ensureTrailingSlash(srcPath);
  const dstPrefix = ensureTrailingSlash(dstPath);

  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix: srcPrefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    const objects = (response.Contents ?? []).filter(
      (o): o is S3Object & { Key: string } => Boolean(o.Key)
    );

    if (objects.length > 0) {
      await Promise.all(
        objects.map((obj) => {
          const relativeKey = obj.Key.slice(srcPrefix.length);
          const newKey = dstPrefix + relativeKey;
          return s3.send(
            new CopyObjectCommand({
              Bucket,
              Key: newKey,
              CopySource: buildCopySource(Bucket, obj.Key),
            })
          );
        })
      );

      await s3.send(
        new DeleteObjectsCommand({
          Bucket,
          Delete: {
            Objects: objects.map((o) => ({ Key: o.Key })),
            Quiet: true,
          },
        })
      );
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
}

async function deleteAllUnderPrefix(
  s3: S3Client,
  Bucket: string,
  path: string
): Promise<void> {
  const Prefix = ensureTrailingSlash(path);
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    const objects = (response.Contents ?? []).filter(
      (o): o is S3Object & { Key: string } => Boolean(o.Key)
    );

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket,
          Delete: {
            Objects: objects.map((o) => ({ Key: o.Key })),
            Quiet: true,
          },
        })
      );
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
}

function buildCopySource(Bucket: string, srcKey: string): string {
  const encodedKey = srcKey.split("/").map(encodeURIComponent).join("/");
  return `${Bucket}/${encodedKey}`;
}

/* -------------------------------------------------------------------------- */
/*  Helpers — paths                                                           */
/* -------------------------------------------------------------------------- */

function lastSegment(path: string): string {
  const trimmed = stripTrailingSlash(path);
  const i = trimmed.lastIndexOf("/");
  return i === -1 ? trimmed : trimmed.slice(i + 1);
}

function stripTrailingSlash(path: string): string {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function extensionOf(path: string): string | undefined {
  const name = lastSegment(path);
  const i = name.lastIndexOf(".");
  if (i === -1 || i === name.length - 1) return undefined;
  return name.slice(i + 1).toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*  Helpers — MIME inference & error detection                                */
/* -------------------------------------------------------------------------- */

function inferMimeFromPath(path: string): string {
  const ext = extensionOf(path);
  if (!ext) return "application/octet-stream";

  switch (ext) {
    case "mp3": return "audio/mpeg";
    case "wav": return "audio/wav";
    case "ogg": return "audio/ogg";
    case "m4a": return "audio/mp4";
    case "flac": return "audio/flac";
    case "aac": return "audio/aac";
    case "opus": return "audio/opus";
    case "pdf": return "application/pdf";
    case "txt": return "text/plain";
    case "md":
    case "markdown": return "text/markdown";
    case "json": return "application/json";
    case "csv": return "text/csv";
    case "xml": return "application/xml";
    case "html": return "text/html";
    case "doc": return "application/msword";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls": return "application/vnd.ms-excel";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt": return "application/vnd.ms-powerpoint";
    case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "zip": return "application/zip";
    case "tar": return "application/x-tar";
    case "gz": return "application/gzip";
    case "rar": return "application/vnd.rar";
    case "7z": return "application/x-7z-compressed";
    default: return "application/octet-stream";
  }
}

function isNotFoundError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
  if (e.name === "NotFound" || e.name === "NoSuchKey") return true;
  if (e.$metadata?.httpStatusCode === 404) return true;
  return false;
}
