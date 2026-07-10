import { z } from "zod";
import { slugSchema } from "@contracts/slug/slug.schema";

// 🧩 Schéma — édition d'une galerie (métadonnées). `id` via input caché.
// Mêmes conventions que la création : date/facettes en strings du DOM,
// converties par l'action ("" = null). Facettes CUMULABLES.
const facetIdString = z.string().regex(/^\d*$/, "Identifiant invalide.");

export const updateGalleryFormSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(120),
  slug: slugSchema,
  visibility: z.enum(["PUBLIC", "MEMBERS"]),
  sortOrder: z.number().int().min(0),
  date: z.string(),
  disciplineId: facetIdString,
  categoryId: facetIdString,
  stageId: facetIdString,
  eventId: facetIdString,
  originId: facetIdString,
});

export type UpdateGalleryFormSchema = z.infer<typeof updateGalleryFormSchema>;
