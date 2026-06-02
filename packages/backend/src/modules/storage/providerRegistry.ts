import type { PrismaClient } from "@prisma/client";

import type { StorageProvider } from "@contracts/storage";

import {
  createCloudinaryStorageAdapter,
  type CloudinaryStorageAdapter,
} from "@backend/modules/storage/adapters/cloudinary";
import {
  createR2StorageAdapter,
  type R2StorageAdapter,
} from "@backend/modules/storage/adapters/r2";

/**
 * providerRegistry.ts
 *
 * Résolution centralisée des adapters de stockage par provider.
 *
 * ─── La philosophie ───────────────────────────────────────────────────────
 *
 * Ce fichier est le SEUL endroit du backend qui connaît la correspondance
 * `provider → factory d'adapter`. Tous les consommateurs (router storage,
 * services métier qui veulent toucher au stockage) passent par lui.
 *
 * Ajouter un nouveau provider (S3, FS local pour les tests) consiste à :
 *   1) Implémenter sa factory dans `adapters/<provider>/`
 *      (objet satisfaisant `StorageAdapter`, optionnellement
 *       `UploadCapableAdapter<...>`)
 *   2) L'importer ici et ajouter un cas au switch
 *   3) Étendre `storageProviderSchema` dans `@contracts/storage`
 *
 * Aucun autre fichier du backend n'a besoin d'être modifié — c'est ce qui
 * fait la valeur du registry.
 *
 * ─── Pourquoi un switch et pas un map ? ────────────────────────────────────
 *
 * Un map `Record<StorageProvider, Factory>` aurait été élégant, mais il
 * demanderait que toutes les factories aient la MÊME signature de retour
 * (le type le moins spécifique commun). On perdrait alors le typage
 * concret de chaque adapter — par exemple, on n'aurait plus accès aux
 * inputs/outputs upload spécifiques à Cloudinary.
 *
 * Un switch préserve le **typage discriminé par provider** : si tu appelles
 * `getAdapter('cloudinary', deps)`, TypeScript te rend le type concret
 * `CloudinaryStorageAdapter` avec ses génériques d'upload concrétisés.
 * `getAdapter('r2', deps)` rend `R2StorageAdapter` avec ses propres
 * génériques. Le retour est une union discriminée naturelle dont chaque
 * branche a son typage propre.
 */

export type StorageAdapterDeps = {
  prisma: PrismaClient;
  appRoot: string;
};

/**
 * Type concret d'adapter pour un provider donné.
 *
 * Union discriminée : selon le provider littéral demandé à l'appel, le
 * type de retour est précisément l'adapter correspondant avec son
 * vocabulaire upload spécifique.
 */
export type AdapterFor<P extends StorageProvider> = P extends "cloudinary"
  ? CloudinaryStorageAdapter
  : P extends "r2"
    ? R2StorageAdapter
    : never;

/**
 * Résout l'adapter concret pour un provider donné.
 *
 * Le typage `AdapterFor<P>` permet au caller de bénéficier du type concret
 * sans avoir à narrower lui-même : `getAdapter('cloudinary', deps)` est
 * directement typé comme `CloudinaryStorageAdapter`, `getAdapter('r2', deps)`
 * comme `R2StorageAdapter`.
 */
export function getAdapter<P extends StorageProvider>(
  provider: P,
  deps: StorageAdapterDeps
): AdapterFor<P> {
  switch (provider) {
    case "cloudinary":
      // `as AdapterFor<P>` est nécessaire ici parce que TypeScript ne peut
      // pas inférer la corrélation entre la valeur littérale du discriminant
      // et le générique `P` à l'intérieur du switch. Le cast est sûr parce
      // que le case ne s'exécute que pour P === 'cloudinary'.
      return createCloudinaryStorageAdapter(deps) as AdapterFor<P>;

    case "r2":
      // R2 — stub pour l'instant (sous-chantier 3.B). Implémentation réelle
      // au sous-chantier 6.A. Le contrat de la factory ne changera pas, donc
      // ce callsite restera valide.
      return createR2StorageAdapter(deps) as AdapterFor<P>;

    default:
      // Le typecheck nous garantit que ce default est inatteignable tant
      // que tous les cas de l'enum sont couverts. Si tu ajoutes un provider
      // sans l'enregistrer ici, tu auras un type error de cohérence.
      throw new Error(`Unknown storage provider: ${String(provider)}`);
  }
}
