import { z } from "zod";

/**
 * updateUserRoleById.schema.ts
 *
 * Schéma dédié à l'administration du rôle d'un utilisateur.
 *
 * Pourquoi un schéma séparé ?
 * - Le changement de rôle est une action sensible.
 * - On évite de mélanger ça avec "UpdateMe" (profil du user connecté).
 * - Ça réduit le risque de régression / de surface d'attaque.
 */

export const updateUserRoleByIdSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  roleId: z.number().int().positive("roleId must be a positive integer"),
});

export type UpdateUserRoleByIdInput = z.infer<typeof updateUserRoleByIdSchema>;
