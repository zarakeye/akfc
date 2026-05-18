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
  transpilePackages: ["@workspace/backend", "@workspace/contracts"],
  // 🚀 Empêche Next/Turbopack de bundler `@prisma/client`. Le package est
  // traité comme un module Node externe, donc require() le résout une seule
  // fois → `globalThis.prisma` partage bien la même instance entre tous les
  // chunks (Server Components, Route Handlers, Server Actions, etc.).
  // Sans ça, chaque chunk a son propre module Prisma → multiples
  // PrismaClient instanciés → cold start + DEALLOCATE ALL à chaque requête.
  serverExternalPackages: ["@prisma/client"],
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