1. Installe les dépendances dans l'app web :
   pnpm add next-mdx-remote gray-matter --filter web

2. Garde déjà en place :
   pnpm add @next/mdx @mdx-js/react --filter web
   pnpm add -D @types/mdx --filter web

3. Décompresse cette archive à la racine du repo.

4. Vérifie que apps/web/next.config.ts contient bien la config MDX.

5. Lance :
   pnpm dev

6. Ouvre :
   /docs
   /docs/roadmap
   /docs/domain-model
   /docs/architecture/project-architecture
