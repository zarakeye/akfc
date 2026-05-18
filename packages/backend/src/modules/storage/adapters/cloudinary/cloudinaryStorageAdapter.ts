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

import type { UploadDestination, UploadAssetRequest } from "@contracts/cloudinary/upload.types";
import type { MoveIntent as CloudinaryMoveIntent } from "@contracts/cloudinary/move.schema";

import { getCloudinaryFolderTree } from "@backend/modules/cloudinary/services/getCloudinaryFolderTree.service";
import { getAssetInfo } from "@backend/modules/cloudinary/services/cloudinary.service";
import { moveService } from "@backend/modules/cloudinary/services/move.service";
import { createUploadSignatures } from "@backend/modules/cloudinary/services/createUploadSignatures.service";
import { registerUploadedAssets } from "@backend/modules/cloudinary/services/registerUploadedAssets.service";

import { mapClientFolderTreeToStorageNode } from "@backend/modules/storage/adapters/cloudinary/mappers";

/**
 * cloudinaryStorageAdapter
 *
 * Implémentation du contrat agnostique `StorageAdapter` + `UploadCapableAdapter`
 * pour Cloudinary. Construit par factory parce que les méthodes ont besoin
 * d'un `prisma` et d'un `appRoot` issus du contexte tRPC.
 *
 * ─── Stratégie de wrapping ─────────────────────────────────────────────────
 *
 * Cet adapter ne réécrit AUCUN service Cloudinary. Il se contente de :
 *   1) traduire les inputs du contrat agnostique vers les inputs Cloudinary
 *      (ex: StorageMoveOperation → MoveIntent Cloudinary "pauvre")
 *   2) appeler le service Cloudinary correspondant
 *   3) traduire son output vers la forme du contrat agnostique
 *      (ex: FolderNode Cloudinary → StorageFolderNode agnostique)
 *
 * Cette discipline préserve les services existants (testés, stables) et
 * concentre toute la "double traduction" dans ce fichier — qui devient
 * le seul endroit à connaître à la fois le vocabulaire Cloudinary et le
 * vocabulaire agnostique.
 *
 * ─── Méthodes non implémentées à ce chantier ───────────────────────────────
 *
 * `delete` n'est pas implémenté pour l'instant. Le soft-delete dans la
 * convention AKFC passe par `trashRouter.trashToBin` qui mêle des concepts
 * de la corbeille (TrashEntry en DB) à des opérations Cloudinary. Le
 * câblage propre via `StorageAdapter.delete` viendra avec le chantier
 * "corbeille agnostique" qui décidera des responsabilités.
 *
 * Le contrat autorise `delete?` à être absent — pas de violation d'interface.
 */

export type CloudinaryStorageAdapterDeps = {
  prisma: PrismaClient;
  appRoot: string;
};

/* -------------------------------------------------------------------------- */
/*  Types des inputs/outputs Upload                                           */
/* -------------------------------------------------------------------------- */

/**
 * Input pour `createUploadAuthorization` côté Cloudinary.
 *
 * Note : `appRoot` n'est PAS dans l'input parce qu'il est fixé par la
 * factory au moment de la création de l'adapter (constant pour une
 * requête tRPC donnée).
 */
export type CloudinaryCreateUploadAuthorizationInput = {
  destination: UploadDestination;
  assets: UploadAssetRequest[];
};

export type CloudinaryCreateUploadAuthorizationOutput = Awaited<
  ReturnType<typeof createUploadSignatures>
>;

/**
 * Input pour `registerUploadedAsset` côté Cloudinary.
 *
 * `userId` EST dans l'input (et non dans la factory) parce qu'il varie
 * par requête — l'identité du déposant est une donnée de l'opération,
 * pas une propriété de l'adapter.
 */
export type CloudinaryRegisterUploadedAssetInput = {
  destination: UploadDestination;
  assets: Parameters<typeof registerUploadedAssets>[0]["assets"];
  userId: string;
  eventDate?: Date;
};

export type CloudinaryRegisterUploadedAssetOutput = Awaited<
  ReturnType<typeof registerUploadedAssets>
>;

/* -------------------------------------------------------------------------- */
/*  La factory                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Type complet de l'adapter, avec les génériques d'upload concrétisés.
 *
 * Exposé pour que les consommateurs (router storage par exemple) puissent
 * typer fortement leurs callsites quand ils savent qu'ils manipulent
 * spécifiquement un adapter Cloudinary.
 */
export type CloudinaryStorageAdapter = StorageAdapter &
  UploadCapableAdapter<
    CloudinaryCreateUploadAuthorizationInput,
    CloudinaryCreateUploadAuthorizationOutput,
    CloudinaryRegisterUploadedAssetInput,
    CloudinaryRegisterUploadedAssetOutput
  >;

export function createCloudinaryStorageAdapter(
  deps: CloudinaryStorageAdapterDeps
): CloudinaryStorageAdapter {
  const { prisma, appRoot } = deps;

  return {
    /* ====================================================================== */
    /*  list — enfants directs d'un dossier                                   */
    /* ====================================================================== */

    async list(options: ListOptions): Promise<ListResult> {
      // On s'appuie sur getCloudinaryFolderTree (qui retourne le tree complet
      // sous le préfixe) puis on extrait uniquement les enfants directs.
      // C'est sous-optimal si le tree est gros, mais ça réutilise la logique
      // canonique sans réécriture. Une optimisation cursor-based viendra
      // si nécessaire plus tard.
      const tree = await getCloudinaryFolderTree({
        prisma,
        appRoot,
        normalizedPath: options.path,
      });

      const node = mapClientFolderTreeToStorageNode(tree, /* depth */ 1);

      // Si jamais le path résolvait un fichier, pas de children — retour vide.
      if (node.type !== "folder") {
        return { folders: [], files: [], nextCursor: null };
      }

      const folders: StorageFolderNode[] = [];
      const files: StorageFileNode[] = [];

      for (const child of node.children ?? []) {
        if (child.type === "folder") {
          folders.push(child);
        } else {
          files.push(child);
        }
      }

      return {
        folders,
        files,
        // Cloudinary `getFolderTree` ne paginé pas par cursor à ce niveau —
        // la pagination se fait dans listAuthenticatedResources, mais elle
        // est consommée intégralement avant retour. Pas de page suivante.
        nextCursor: null,
      };
    },

    /* ====================================================================== */
    /*  getTree — sous-arbre jusqu'à `depth` niveaux                          */
    /* ====================================================================== */

    async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
      const depth = options.depth ?? 1;

      const tree = await getCloudinaryFolderTree({
        prisma,
        appRoot,
        normalizedPath: options.path,
      });

      const root = mapClientFolderTreeToStorageNode(tree, depth);

      // Si le path résolvait un fichier (cas marginal), on enveloppe dans un
      // folder vide pour respecter le contrat (`root: StorageFolderNode`).
      // Le caller pourra détecter ça via root.children === [] et root.path === options.path.
      if (root.type !== "folder") {
        return {
          root: {
            type: "folder",
            name: root.name,
            path: options.path,
            children: [],
            hasChildren: false,
          },
        };
      }

      return { root };
    },

    /* ====================================================================== */
    /*  getNode — lit un node précis                                          */
    /* ====================================================================== */

    async getNode(path: StoragePath): Promise<StorageNode | null> {
      // Stratégie : tenter d'abord comme fichier, puis comme dossier.
      // 1) Si Cloudinary connaît un asset à ce path → c'est un fichier.
      try {
        const info = await getAssetInfo(path);
        const name = path.split("/").pop() ?? path;
        return {
          type: "file",
          name,
          path,
          metadata: cloudinaryAssetInfoToStorageMetadata(info),
        };
      } catch {
        // continuer
      }

      // 2) Sinon, on regarde si des enfants existent sous le préfixe.
      //    On utilise getCloudinaryFolderTree qui combine assets + registre DB.
      try {
        const tree = await getCloudinaryFolderTree({
          prisma,
          appRoot,
          normalizedPath: path,
        });
        const node = mapClientFolderTreeToStorageNode(tree, /* depth */ 0);
        if (node.type === "folder") return node;
      } catch {
        // ignore
      }

      return null;
    },

    /* ====================================================================== */
    /*  getMetadata — lit les métadonnées brutes                              */
    /* ====================================================================== */

    async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
      try {
        const info = await getAssetInfo(path);
        return cloudinaryAssetInfoToStorageMetadata(info);
      } catch {
        return null;
      }
    },

    /* ====================================================================== */
    /*  move — déplace un file ou un folder atomique                          */
    /* ====================================================================== */

    async move(operation: StorageMoveOperation): Promise<void> {
      // On traduit l'opération atomique vers un MoveIntent Cloudinary
      // "pauvre" (pas de selection, pas de virtual-folder), puis on délègue
      // à moveService. Cette traduction est triviale parce que le contrat
      // agnostique a précisément été pensé comme un sous-ensemble qui
      // tient dans Cloudinary sans gymnastique.
      const intent: CloudinaryMoveIntent = {
        source:
          operation.source.type === "file"
            ? { type: "file", fullPath: operation.source.path }
            : { type: "folder", fullPath: operation.source.path },
        target: { type: "folder", fullPath: operation.target.path },
      };

      await moveService(intent);
    },

    // delete: NON IMPLÉMENTÉ (cf. doc en tête de fichier). Le contrat
    // autorise l'absence — la propriété restera `undefined` sur l'objet.

    /* ====================================================================== */
    /*  createUploadAuthorization — délivre des signatures Cloudinary         */
    /* ====================================================================== */

    async createUploadAuthorization(
      input: CloudinaryCreateUploadAuthorizationInput
    ): Promise<CloudinaryCreateUploadAuthorizationOutput> {
      return createUploadSignatures({
        prisma,
        appRoot,
        destination: input.destination,
        assets: input.assets,
      });
    },

    /* ====================================================================== */
    /*  registerUploadedAsset — persiste après revérification                 */
    /* ====================================================================== */

    async registerUploadedAsset(
      input: CloudinaryRegisterUploadedAssetInput
    ): Promise<CloudinaryRegisterUploadedAssetOutput> {
      return registerUploadedAssets({
        prisma,
        appRoot,
        userId: input.userId,
        destination: input.destination,
        assets: input.assets,
        eventDate: input.eventDate,
      });
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers privés au fichier                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Mappe la sortie de `cloudinary.api.resource()` (via `getAssetInfo`) vers
 * un `StorageMetadata` agnostique.
 *
 * Le typage de `getAssetInfo` est faible (l'API Cloudinary retourne du `any`
 * en pratique). On lit défensivement, en laissant les champs absents devenir
 * `undefined` plutôt que de propager des `null` ou des chaînes vides.
 */
function cloudinaryAssetInfoToStorageMetadata(info: {
  bytes?: number;
  format?: string;
  resource_type?: string;
  created_at?: string;
}): StorageMetadata {
  return {
    bytes: typeof info.bytes === "number" ? info.bytes : undefined,
    format: info.format,
    createdAt: info.created_at,
    // Cloudinary ne renvoie pas de mimeType complet sur cette API — on
    // pourrait le reconstituer depuis (resource_type, format) mais on
    // s'abstient pour rester strictement informatif. Si un consommateur
    // a besoin du mime, il appellera readUploadedAssetMetadata qui le
    // reconstitue déjà.
  };
}
