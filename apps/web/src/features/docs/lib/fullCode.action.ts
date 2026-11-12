"use server"

import { z } from "zod"

import { loadFullCodeFor, type FullCode } from "./fullCode.server"

/**
 * Une server action est un point d'accès public : n'importe quel navigateur peut l'appeler.
 * La requête est donc validée ici, et `loadFullCodeFor` refait les contrôles de la page.
 */
const lines = z.array(z.number().int().positive().max(100_000)).max(5_000)

const requestSchema = z.object({
  pathname: z.string().min(1).max(500),
  filepath: z.string().min(1).max(300),
  kind: z.enum(["example", "fence"]),
  language: z.string().regex(/^[\w+#-]{1,24}$/),
  scope: lines,
  highlight: lines,
})

export async function loadFullCode(input: unknown): Promise<FullCode | null> {
  const parsed = requestSchema.safeParse(input)
  if (!parsed.success) return null
  return loadFullCodeFor(parsed.data)
}
