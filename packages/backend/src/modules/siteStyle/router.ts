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

  /**
   * Réglages ÉDITORIAUX, distincts des variables CSS.
   *
   * Procédures à part plutôt qu'un élargissement de `get` / `save` : le
   * layout racine et le laboratoire dépendent de la forme de retour de ces
   * dernières, et leur faire porter deux entiers qui ne les concernent pas
   * aurait été un risque gratuit.
   *
   * Lecture publique, comme `get` : la page d'accueil en a besoin pour
   * replier ses cartes, et un visiteur anonyme doit la rendre correctement.
   */
  getLimits: publicProcedure.query(async ({ ctx }) => {
    const row = await ctx.prisma.siteStyle.findUnique({
      where: { id: 1 },
      select: { summaryMaxChars: true, cardCollapsedHeight: true },
    });
    // Repli sur les valeurs par défaut du schéma quand aucune ligne n'existe
    // encore — le site doit s'afficher avant tout premier enregistrement.
    return {
      summaryMaxChars: row?.summaryMaxChars ?? 600,
      cardCollapsedHeight: row?.cardCollapsedHeight ?? 220,
    };
  }),

  saveLimits: protectedProcedure
    .input(
      z.object({
        // Bornes larges mais réelles : elles empêchent surtout la saisie
        // absurde (zéro, ou une valeur qui viderait la page de son sens).
        summaryMaxChars: z.number().int().min(100).max(3000),
        cardCollapsedHeight: z.number().int().min(80).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.siteStyle.upsert({
        where: { id: 1 },
        create: { id: 1, variables: {}, ...input },
        update: input,
      });
      return { success: true };
    }),
});
