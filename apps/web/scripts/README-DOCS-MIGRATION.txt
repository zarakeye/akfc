AKFC docs migration starter

1) Make sure your filesystem docs already exist at the repo root:

   docs/
   ├─ roadmap.md
   ├─ domain-model.md
   └─ architecture/
      ├─ project-architecture.md
      ├─ backend-architecture.md
      ├─ frontend-architecture.md
      ├─ mobile-readiness.md
      └─ cloudinary-finder-architecture.md

2) Copy the script into:
   apps/web/scripts/migrate-docs-to-mdx.mjs

3) Run it from the repo root:
   node apps/web/scripts/migrate-docs-to-mdx.mjs

4) It will generate:
   apps/web/content/docs/**/*.mdx

5) Then you can point your dynamic docs engine at apps/web/content/docs.

6) Optional:
   - use CodeBlock.tsx inside MDX pages
   - use the upgraded DocsToc.tsx with ActiveTocLink.tsx for active heading highlighting
