import type { PrismaClient } from "@prisma/client";

import type { StorageProvider } from "@contracts/storage";

import {
  createR2StorageAdapter,
  type R2StorageAdapter,
} from "@backend/modules/storage/adapters/r2";

/**
 * providerRegistry.ts
 *
 * Résolution centralisée des adapters de stockage par provider : le SEUL
 * endroit du backend qui connaît la correspondance `provider → factory`.
 *
 * Un seul provider depuis la sortie de Cloudinary : R2. Ajouter un stockage
 * consisterait à implémenter sa factory dans `adapters/<provider>/`, l'ajouter
 * ici et étendre `storageProviderSchema` dans `@contracts/storage`.
 */

export type StorageAdapterDeps = {
  prisma: PrismaClient;
  appRoot: string;
};

/** Type concret d'adapter pour un provider donné. */
export type AdapterFor<P extends StorageProvider> = P extends "r2" ? R2StorageAdapter : never;

/** Résout l'adapter concret pour un provider donné. */
export function getAdapter<P extends StorageProvider>(
  provider: P,
  deps: StorageAdapterDeps,
): AdapterFor<P> {
  switch (provider) {
    case "r2":
      return createR2StorageAdapter(deps) as AdapterFor<P>;
    default:
      throw new Error(`Unknown storage provider: ${String(provider)}`);
  }
}
