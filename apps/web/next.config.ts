import type { NextConfig } from "next"
import path from "node:path"

/**
 * Construction des tests de bout en bout (`pnpm e2e`, AKFC_E2E=1) : un dossier à part, pour ne
 * pas écraser le `.next` de `pnpm dev`, et un serveur `next start` ordinaire (sans sortie autonome).
 */
const e2e = process.env.AKFC_E2E === "1"

const nextConfig: NextConfig = {
  distDir: e2e ? ".next-e2e" : ".next",

  /**
   * Sortie AUTONOME : Next produit un dossier contenant son propre serveur et
   * uniquement les dépendances que le code atteint réellement. Sans elle,
   * l'image Docker embarque tout `node_modules` du monorepo.
   */
  output: e2e ? undefined : "standalone",

  /**
   * React Compiler : au build, chaque composant et chaque hook du projet est
   * réécrit pour mémoïser lui-même ses calculs, ses fonctions et son JSX ; plus
   * besoin de useMemo / useCallback / React.memo écrits à la main. Il ne touche
   * qu'au code qui respecte les règles de React, celles que vérifie
   * `pnpm lint` (eslint-plugin-react-hooks) : le reste est laissé tel quel.
   * Nécessite le paquet babel-plugin-react-compiler (devDependency de web).
   */
  reactCompiler: true,

  /**
   * Racine de traçage des fichiers.
   *
   * Indispensable en monorepo, et souvent oublié : par défaut Next trace
   * depuis `apps/web` et manque donc `packages/backend` et
   * `packages/contracts`, qui vivent AU-DESSUS. Le serveur démarre alors
   * normalement puis s'effondre au premier import.
   */
  outputFileTracingRoot: path.join(process.cwd(), "../../"),

  /**
   * Le traceur du build `standalone` rate les fichiers atteints par des
   * `await import()` DYNAMIQUES (instrumentation.ts → services backend, résolus
   * via l'alias `@backend/*` vers la source) et les assets NON-JS (schéma
   * Prisma, migrations). Sans eux dans l'image, le boot crashe en « Code file
   * not found » et le self-heal ne tourne jamais. On force donc leur inclusion.
   * Globs relatifs au dossier du projet (apps/web) ; clé `**` = toutes entrées.
   */
  outputFileTracingIncludes: {
    "**": [
      "../../packages/backend/**/*",
      "../../packages/contracts/**/*",
      "../../prisma/**/*",
      // sharp (déclinaisons d'images R2) : binaires natifs chargés dynamiquement.
      "../../node_modules/sharp/**/*",
      "../../node_modules/.pnpm/sharp@*/**/*",
      "../../node_modules/.pnpm/@img+sharp-linux-x64@*/**/*",
      "../../node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/**/*",
    ],
  },

  /**
   * Les listes `/stages` et `/events` ont fusionné dans `/agenda`.
   *
   * Redirection plutôt que 404 : ces adresses ont pu être envoyées par
   * message, mises en favori ou indexées, et l'agenda contient ce qu'on y
   * cherchait.
   *
   * TEMPORAIRES (307) et non permanentes (308) : un 308 est mis en cache
   * durablement par les navigateurs et resterait actif si une liste dédiée
   * était rétablie un jour. Le coût d'un 307 est nul, celui d'un 308 qu'on
   * regrette se compte en « vide ton cache ».
   *
   * Les deux listes sont des chemins EXACTS. Une fiche `/stages/mon-stage`
   * suit sa propre règle : elle mène à `/seminars/mon-stage`, et cette fois
   * de façon PERMANENTE (308), car la fiche a définitivement changé d'adresse.
   */
  async redirects() {
    return [
      { source: "/stages/:slug", destination: "/seminars/:slug", permanent: true },
      { source: "/stages", destination: "/agenda", permanent: false },
      { source: "/events", destination: "/agenda", permanent: false },
    ]
  },
  // 🚀 Empêche Next/Turbopack de bundler `@prisma/client`. Le package est
  // traité comme un module Node externe, donc require() le résout une seule
  // fois → `globalThis.prisma` partage bien la même instance entre tous les
  // chunks (Server Components, Route Handlers, Server Actions, etc.).
  // Sans ça, chaque chunk a son propre module Prisma → multiples
  // PrismaClient instanciés → cold start + DEALLOCATE ALL à chaque requête.
  serverExternalPackages: ["@prisma/client", "imapflow", "mailparser", "sharp"],
  /**
   * Seuls les fichiers .ts et .tsx de `app/` peuvent être des pages, des
   * layouts ou des routes. La documentation (.mdx) n'en fait pas partie : elle
   * vit dans `content/` et `docs/[...slug]/page.tsx` la compile à la demande.
   */
  pageExtensions: ["ts", "tsx"],
}

export default nextConfig