import { z } from "zod";
import { slugSchema } from "@contracts/slug/slug.schema";

// 🧩 Schéma — création d'une galerie (métadonnées seulement).
// `visibility` en z.enum littéral pour garder @contracts indépendant de Prisma.
//
// `date` et les cinq facettes arrivent du DOM en STRINGS (input type="date"
// et selects) — le contrat valide la forme, l'action convertit ("" = null).
// Les facettes sont CUMULABLES (décision 2026-07-03).
const facetIdString = z.string().regex(/^\d*$/, "Identifiant invalide.");

export const createGalleryFormSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(120),
  slug: slugSchema,
  visibility: z.enum(["PUBLIC", "MEMBERS"]),
  sortOrder: z.number().int().min(0),
  /** "YYYY-MM-DD" ou "" (pas de date). */
  date: z.string(),
  disciplineId: facetIdString,
  categoryId: facetIdString,
  stageId: facetIdString,
  eventId: facetIdString,
  originId: facetIdString,
});

export type CreateGalleryFormSchema = z.infer<typeof createGalleryFormSchema>;
