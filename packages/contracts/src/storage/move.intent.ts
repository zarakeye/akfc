import { z } from 'zod';

/**
 * Intention de déplacement, niveau utilisateur — couche 3 du pipeline de move.
 *
 * ─── Le pipeline en trois couches ──────────────────────────────────────────
 *
 *   Couche 3 — INTENTION (ce fichier)
 *     "déplace cette sélection vers le dossier de statut `published`"
 *     Concepts riches : selection, status-folder, lifecycle status
 *
 *   Couche 2 — RÉSOLUTION (service `resolveMoveIntent`, côté backend)
 *     Expanse la sélection en N items concrets, traduit le status-folder en
 *     path concret, produit N `StorageMoveOperation` atomiques.
 *
 *   Couche 1 — OPÉRATION (`StorageMoveOperation`, cf. storage.types.ts)
 *     "rename `appRoot/pending/cours/12/photo.jpg`
 *      vers `appRoot/published/cours/12/photo.jpg`"
 *     Exécuté par l'adapter de stockage approprié (Cloudinary, R2, FS…).
 *
 * ─── Pourquoi cette intention vit dans le contrat agnostique ───────────────
 *
 * À première vue, les concepts de "sélection" et de "statut applicatif"
 * pourraient sembler appartenir à la UI ou à un domaine métier au-dessus
 * du stockage. C'est faux dans ce projet, et la raison est importante :
 *
 *   - Le cycle de vie `pending → published → bin` est une philosophie
 *     applicative que le projet impose à TOUS ses stockages, présents
 *     et futurs. Ce n'est pas une convention Cloudinary — c'est une
 *     décision d'architecture qui s'applique aussi à R2, S3, FS local.
 *
 *   - La multi-sélection avec roots+excluded est une primitive
 *     d'expression d'intention dont l'orchestration métier a besoin,
 *     pas un détail UI. On veut pouvoir dire "déplace tout sous ces
 *     racines sauf ces exclusions" depuis n'importe quel point du
 *     système — y compris des futurs scripts, jobs, ou APIs.
 *
 * Ces concepts sont donc agnostiques par construction : ils n'ont rien
 * de provider-spécifique. Cloudinary les comprend aujourd'hui, R2 devra
 * les comprendre demain, et c'est précisément ce que ce contrat garantit.
 *
 * ─── Note importante sur `status-folder` ──────────────────────────────────
 *
 * Le discriminator `status-folder` désigne un dossier identifié par son
 * statut applicatif (`pending`/`published`/`bin`), par opposition à
 * `folder` qui désigne un dossier identifié par un path concret.
 *
 * `status-folder` n'a rien à voir avec la notion de "dossier virtuel au
 * sens stockage" :
 *   - Avec un provider qui a des dossiers réels (FS local, R2 avec
 *     convention de prefix, etc.), `pending/`, `published/`, `bin/` sont
 *     des dossiers concrets en stockage. La virtualité de la cible est
 *     purement intentionnelle (on identifie le dossier par son rôle
 *     applicatif au lieu d'un path complet).
 *   - Avec un provider sans dossiers physiques (Cloudinary), ces mêmes
 *     dossiers sont aussi virtuels au sens stockage — mais c'est un
 *     détail d'implémentation provider, pas une propriété du contrat.
 *
 * Le contrat agnostique ne se prononce QUE sur la signification
 * intentionnelle. C'est aux adapters de gérer la matérialisation.
 */

/* -------------------------------------------------------------------------- */
/*  Statuts applicatifs                                                       */
/* -------------------------------------------------------------------------- */

export const lifecycleStatusSchema = z.enum(['pending', 'published', 'bin']);

/**
 * Les trois étapes du cycle de vie d'un asset dans le projet.
 *
 *   - `pending`   : asset uploadé, en attente de validation admin.
 *   - `published` : asset validé, visible publiquement.
 *   - `bin`       : asset envoyé à la corbeille, restaurable ou
 *                   définitivement supprimable.
 *
 * Cette palette est volontairement fermée : enrichir le cycle de vie
 * (ajouter un statut `archived` par exemple) doit rester un acte
 * délibéré qui passe par une mise à jour explicite de ce schema.
 */
export type LifecycleStatus = z.infer<typeof lifecycleStatusSchema>;

/* -------------------------------------------------------------------------- */
/*  Sources possibles d'un move                                               */
/* -------------------------------------------------------------------------- */

const fileSourceSchema = z.object({
  type: z.literal('file'),
  /** Path concret du fichier source. */
  path: z.string().min(1),
});

const folderSourceSchema = z.object({
  type: z.literal('folder'),
  /** Path concret du dossier source. */
  path: z.string().min(1),
});

/**
 * Sélection multi-items.
 *
 * `roots` désigne les paths inclus dans la sélection (au moins un).
 * `excluded` permet d'exclure des sous-paths spécifiques d'une racine
 * englobante — par exemple "tout sous `cours/12/` sauf `cours/12/draft/`".
 *
 * La résolution (couche 2) expanse cette sélection en N opérations
 * atomiques en s'appuyant sur l'adapter pour lister les enfants des
 * roots et filtrer les exclus.
 */
const selectionSourceSchema = z.object({
  type: z.literal('selection'),
  roots: z.array(z.string().min(1)).min(1),
  excluded: z.array(z.string().min(1)).optional(),
});

const moveSourceSchema = z.discriminatedUnion('type', [
  fileSourceSchema,
  folderSourceSchema,
  selectionSourceSchema,
]);

export type StorageMoveSource = z.infer<typeof moveSourceSchema>;

/* -------------------------------------------------------------------------- */
/*  Cibles possibles d'un move                                                */
/* -------------------------------------------------------------------------- */

/**
 * Cible exprimée par un path concret.
 * Exemple : `target: { type: 'folder', path: 'AKFC/published/cours/12' }`.
 */
const concreteFolderTargetSchema = z.object({
  type: z.literal('folder'),
  path: z.string().min(1),
});

/**
 * Cible exprimée par un statut applicatif.
 * Le path concret est calculé par la résolution (couche 2) en respectant
 * la convention `${appRoot}/${status}/${suffixePréservéDeLaSource}`.
 *
 * Exemple : `target: { type: 'status-folder', status: 'published' }`
 *   appliqué à une source `AKFC/pending/cours/12/photo.jpg`
 *   produit l'opération `target: { path: 'AKFC/published/cours/12/photo.jpg' }`.
 *
 * Voir le commentaire en tête de fichier pour la nuance importante entre
 * `status-folder` (cible logique par statut) et "dossier virtuel" (notion
 * provider-spécifique sans rapport).
 */
const statusFolderTargetSchema = z.object({
  type: z.literal('status-folder'),
  status: lifecycleStatusSchema,
});

const moveTargetSchema = z.discriminatedUnion('type', [
  concreteFolderTargetSchema,
  statusFolderTargetSchema,
]);

export type StorageMoveTarget = z.infer<typeof moveTargetSchema>;

/* -------------------------------------------------------------------------- */
/*  L'intention complète                                                      */
/* -------------------------------------------------------------------------- */

export const storageMoveIntentSchema = z.object({
  source: moveSourceSchema,
  target: moveTargetSchema,
});

/**
 * Intention de move, agnostique au provider.
 *
 * Forme à privilégier dans tout l'arbre d'appels qui touche au move :
 * APIs publiques (procédures tRPC), commandes CLI, jobs, etc. La
 * conversion vers les `StorageMoveOperation` bas-niveau est faite par
 * `resolveMoveIntent` une fois et une seule, au plus près de l'adapter.
 */
export type StorageMoveIntent = z.infer<typeof storageMoveIntentSchema>;
