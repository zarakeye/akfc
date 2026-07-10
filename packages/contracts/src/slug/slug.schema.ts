import { z } from "zod";

/**
 * slugSchema — validation d'un slug URL-safe : minuscules + chiffres +
 * tirets simples, sans tiret en tête/queue. Identique à la regex du
 * router Origin. Utilisé par les `createInput`/`updateInput` des routers.
 */
export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Slug must be lowercase alphanumeric with single hyphens (no leading/trailing hyphen).",
  });