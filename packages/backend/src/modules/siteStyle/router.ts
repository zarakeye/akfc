import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";

/**
 * Réglage typographique du rendu des blocs.
 *
 * Une seule ligne, `id = 1`. La lecture est PUBLIQUE parce que le layout
 * racine l'injecte pour tout visiteur : le réglage gouverne l'apparence du
 * site, pas des données privées. L'écriture reste protégée.
 */

/**
 * Le nom d'une propriété personnalisée CSS, contraint au préfixe du projet.
 *
 * Cette valeur finit dans une balise `<style>` : sans contrainte, un nom
 * arbitraire permettrait d'y écrire n'importe quoi. On n'accepte donc que
 * `--akfc-` suivi de minuscules et de tirets, et une valeur sans caractère
 * capable de refermer la déclaration ou la balise.
 */
const variableName = z
  .string()
  .regex(/^--akfc-[a-z0-9-]{1,40}$/, "Nom de variable non conforme");

const variableValue = z
  .string()
  .max(64)
  .regex(/^[a-zA-Z0-9 .,%()#/_-]*$/, "Valeur de variable non conforme");

export const siteStyleRouter = router({
  /** Le réglage courant, ou `null` si rien n'a jamais été enregistré. */
  get: publicProcedure.query(async ({ ctx }) => {
    const row = await ctx.prisma.siteStyle.findUnique({ where: { id: 1 } });
    return row ? (row.variables as Record<string, string>) : null;
  }),

  /**
   * Enregistre le réglage. Remplace la ligne entière plutôt que de fusionner :
   * le laboratoire envoie toujours le jeu complet, et une fusion laisserait
   * traîner des variables retirées d'une version à l'autre.
   */
  save: protectedProcedure
    .input(z.object({ variables: z.record(variableName, variableValue) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.siteStyle.upsert({
        where: { id: 1 },
        create: { id: 1, variables: input.variables },
        update: { variables: input.variables },
      });
      return { success: true };
    }),
});
