import type { PrismaClient } from "@prisma/client";
import slugify from "slugify";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";

/**
 * resolvePendingUploadFolder.service.ts
 *
 * Traduit une intention d'upload (`Destination`) en chemin Cloudinary
 * `pending` absolu.
 *
 * Règles du chemin :
 *   - `${appRoot}/pending/${slug(category.type)}/${slug(discipline.name)}`
 *     pour une `existing-discipline` : discipline déjà inscrite en DB,
 *     identifiée par son id, mais on **slugifie son nom** pour
 *     construire le path (et NON son id numérique).
 *   - `${appRoot}/pending/${slug(category.type)}/new/${slug(proposedDisciplineName)}`
 *     pour une `new-discipline` : discipline non encore créée en DB. Les assets
 *     restent isolés dans un sous-dossier `new/` jusqu'à ce qu'un admin valide
 *     la création de la discipline.
 *
 * ─── ⚠️ Pourquoi slug du nom et pas l'ID numérique ──────────────────────
 *
 * **Historique** : le code utilisait `discipline.id` comme segment de path
 * pour les disciplines existantes. C'était une décision interne propre,
 * mais elle introduisait une **divergence avec deux autres composants** :
 *
 *   - **buildR2Path côté UI** : utilise `slugify(discipline.name)` pour
 *     construire le path R2 (cohérent avec la convention "humaine").
 *   - **Le finder/TreeView** : navigue avec des paths en slug. Quand
 *     l'utilisateur clique sur "Tchoy-Lee-Fut", la query backend cible
 *     `AKFC/pending/cours/tchoy-lee-fut/` — pas `AKFC/pending/cours/3/`.
 *
 * Résultat : les assets Cloudinary uploadés sous `cours/3/` étaient
 * **invisibles dans le finder** (qui cherchait sous `cours/tchoy-lee-fut/`),
 * alors que les assets R2 (sous le slug) s'affichaient correctement.
 *
 * Ce fix aligne Cloudinary sur la convention slug, qui est la convention
 * **moderne** et la seule cohérente avec la navigation UI.
 *
 * ─── 📦 Migration des données existantes ────────────────────────────────
 *
 * Les assets Cloudinary déjà uploadés sous `cours/{id}/...` restent
 * physiquement à cet emplacement après ce fix — ils deviennent orphelins
 * du finder. Pour les récupérer :
 *   - Soit les renommer manuellement via la procédure tRPC `cloudinary.renamePicture`
 *   - Soit les re-uploader (l'ancien emplacement reste, peut être nettoyé en bin plus tard)
 */
const SLUG_OPTIONS = { lower: true, strict: true } as const;

function slug(input: string): string {
  return slugify(input, SLUG_OPTIONS);
}

export async function resolvePendingUploadFolder(params: {
  prisma: PrismaClient;
  destination: UploadDestination;
  appRoot: string;
}): Promise<string> {
  const { prisma, destination, appRoot } = params;

  const category = await prisma.category.findUnique({
    where: { id: destination.categoryId },
    select: { id: true, type: true },
  });

  if (!category) {
    throw new Error(`Category not found (id=${destination.categoryId})`);
  }

  const categorySegment = slug(category.type);

  if (destination.kind === "existing-discipline") {
    const discipline = await prisma.discipline.findUnique({
      where: { id: destination.disciplineId },
      // On a maintenant besoin du `name` pour construire le slug du path.
      select: { id: true, categoryId: true, name: true },
    });

    if (!discipline) {
      throw new Error(
        `Discipline not found (id=${destination.disciplineId})`
      );
    }

    if (discipline.categoryId !== destination.categoryId) {
      throw new Error(
        `Discipline ${destination.disciplineId} does not belong to category ${destination.categoryId}`
      );
    }

    // Fallback `disc-${id}` si le nom est vide / slugify-incompatible :
    // garantit toujours un segment non-vide et évite un throw si un nom
    // de discipline est composé uniquement de caractères non-ASCII non
    // transliterables (cas très rare mais possible).
    const disciplineSlug = slug(discipline.name) || `disc-${discipline.id}`;

    return `${appRoot}/pending/${categorySegment}/${disciplineSlug}`;
  }

  // kind === "new-discipline"
  const proposedSlug = slug(destination.proposedDisciplineName);

  if (!proposedSlug) {
    throw new Error(
      "Proposed discipline name must contain at least one slug-friendly character"
    );
  }

  return `${appRoot}/pending/${categorySegment}/new/${proposedSlug}`;
}