import type { NextConfig } from "next"
import createMDX from "@next/mdx"
import path from "node:path"

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Turbopack exige des options sérialisables (JSON) — donc on passe
    // le plugin comme un chemin absolu (string), pas comme une référence
    // de fonction. @next/mdx résout le chemin lui-même à la compilation.
    //
    // process.cwd() est utilisé plutôt que import.meta.url parce que
    // next.config.ts est compilé en CommonJS, où import.meta n'existe pas.
    // process.cwd() pointe vers apps/web quand on lance `pnpm dev`.
    remarkPlugins: [
      path.join(process.cwd(), "src/../mdx/remark-flatten-mdx-attrs.mjs"),
    ],
  },
})

const nextConfig: NextConfig = {
  /**
   * Sortie AUTONOME : Next produit un dossier contenant son propre serveur et
   * uniquement les dépendances que le code atteint réellement. Sans elle,
   * l'image Docker embarque tout `node_modules` du monorepo.
   */
  output: "standalone",

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
   * Le chemin source est EXACT : les fiches `/stages/mon-stage` ne sont pas
   * concernées, et c'est bien elles que l'agenda cible.
   */
  async redirects() {
    return [
      { source: "/stages", destination: "/agenda", permanent: false },
      { source: "/events", destination: "/agenda", permanent: false },
    ]
  },
  transpilePackages: ["@workspace/backend", "@workspace/contracts"],
  // 🚀 Empêche Next/Turbopack de bundler `@prisma/client`. Le package est
  // traité comme un module Node externe, donc require() le résout une seule
  // fois → `globalThis.prisma` partage bien la même instance entre tous les
  // chunks (Server Components, Route Handlers, Server Actions, etc.).
  // Sans ça, chaque chunk a son propre module Prisma → multiples
  // PrismaClient instanciés → cold start + DEALLOCATE ALL à chaque requête.
  serverExternalPackages: ["@prisma/client", "cloudinary", "cloudinary-core"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    localPatterns: [
      {
        pathname: '/api/media/by-public-id/**',
        // ⚠️ pas de "search" → accepte tous les query params
      },
    ],
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
}

export default withMDX(nextConfig)