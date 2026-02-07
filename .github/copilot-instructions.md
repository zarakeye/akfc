# Copilot / AI-Agent Instructions for akfc_2 🔧

## Quick summary

- This is a Next.js (App Router) monolith using TypeScript, tRPC for RPC APIs, Prisma (Postgres) for DB, Cloudinary for image handling, and server-side JWT sessions stored in the DB. The app uses Next Server Actions and a few cron jobs (session cleanup).

## Local dev & common commands ✅

- Install deps: `pnpm install` (project `packageManager` is pnpm)
- Run dev server: `pnpm dev` (runs `next dev`) — dev server on http://localhost:3000
- Build: `pnpm build` → `pnpm start` for production
- Lint: `pnpm lint` (ESLint using Next config)

## Database & Prisma 🛠️

- Schema: `prisma/schema.prisma`
- Prisma client is exported at `src/server/prisma.ts` (use this rather than instantiating new clients)
- Seed: `pnpm prisma db seed` (runs `prisma/seed.js` via `package.json` `prisma.seed` config)
- Generate client / reset guidance: Use `./reset-prisma.sh` to regenerate `@prisma/client` binary-safe client. Useful when changing engine type.
- Migrate: `pnpm prisma migrate dev` (standard workflow to create/apply migrations)

## Environment variables (important ones) ⚠️

- DB: `DATABASE_URL`
- JWT: `JWT_SECRET` (used to sign session tokens)
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_APP_PREFIX` (prefix used in paths)
- Email/SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NOREPLY`, `APP_DOLMAIN` (used in `src/server/welcomeEmailWithPassword.ts`)
- App metadata: `APP_SHORT_NAME`, `APP_FULL_NAME`, `APP_SUPPORT_EMAIL`, `NEXTAUTH_URL`

Put values in `.env.local` for local development.

## Architecture & where to look 🧩

- tRPC: `src/server/trpc/*` and `src/server/trpc/index.ts` (register new routers here). Client hooks: `src/lib/trpcClient.ts`. Server caller: `src/server/trpc/trpcCaller.ts`.
- Routers: `src/server/routers/*.router.ts` (each router grouped by domain: `auth`, `user`, `role`, `cloudinary`, `upload`...)
- Server actions: `src/server/actions/*.action.ts` — Next server actions that operate with `FormData` and use `"use server"`. Follow existing patterns for validation and prisma writes (see `createCourseFormAction`).
- Validation: Zod schemas in `src/server/schemas/*.schema.ts` (used server-side for form parsing/validation).
- Prisma access: use the exported `prisma` from `src/server/prisma.ts`.
- Cloudinary: `src/server/cloudinary/*` (client, services, tree mappers). Signed upload endpoints at `src/server/routers/uploadImages.router.ts` and API routes under `src/app/api/uploads`.
- Sessions & auth: JWT cookie named `__session` (see `src/lib/constants.ts`) + DB sessions in `prisma.session`. Utilities in `src/server/lib/session/session.server.ts`. tRPC context (`createContext`) uses `getSessionFromRequest()` so most server calls get session via context.
- Cron: session cleanup started in `src/server/trpc/index.ts` (`startSessionCleanupCron`).

## Naming & coding conventions to follow ✍️

- TypeScript strict mode; prefer explicit types where helpful.
- Import aliases configured in `tsconfig.json`: `@/*`, `@server/*`, `@lib/*`, `@components/*`.
- File suffixes: `.router.ts` for routers, `.service.ts` for service logic, `.schema.ts` for zod validation, `.action.ts` for server actions.
- Use `"use client"` / `"use server"` correctly in components and actions.
- For new backend logic, add services in `src/server/*` and route via a router; register the router in `src/server/trpc/index.ts`.

## How to add a new API / endpoint (example) 🧭

1. Add business logic in a new service (e.g., `src/server/services/*Service.ts`).
2. Create a TRPC router `src/server/routers/foo.router.ts` (export a router using `router()` or `publicProcedure`/`protectedProcedure`).
3. Register it in `src/server/trpc/index.ts` (add `foo: fooRouter` to `appRouter`).
4. Update any client code to call `trpc.foo.myMethod.useQuery()` or use `trpcClient.createCaller()` from server places.

## Error handling & auth patterns

- `protectedProcedure` throws a simple `Error('UNAUTHORIZED')` if session/user missing (see `src/server/trpc/core.ts`). Callers should handle thrown errors.
- Session creation sets a JWT cookie and a DB session row (`createSessionJWT` in `src/server/lib/session/session.server.ts`). When changing session behavior, update both cookie and DB code.

## Integrations / External services

- Cloudinary: use the in-repo client & services (`src/server/cloudinary/*`). When testing Cloudinary flows, set cloudinary env vars and use the signed upload flow (see `uploadImages.router.ts`).
- SMTP: `src/server/welcomeEmailWithPassword.ts` (uses `nodemailer`).

## Tests & pipeline

- There are currently no unit tests. Use `pnpm lint` and TypeScript (compile-time checks) before PRs.

## Helpful files to inspect for examples

- `src/server/prisma.ts` — prisma client
- `src/server/trpc/index.ts` — appRouter + context + session cron
- `src/server/routers/uploadImages.router.ts` and `src/app/api/uploads/*` — Cloudinary signed upload flow
- `src/server/actions/*` — Next server actions (form handling + zod + prisma)
- `src/lib/constants.ts` — session cookie name & duration
- `reset-prisma.sh` — regenerate `@prisma/client` with binary engine

---

If anything is unclear or you want more details about a specific area (Cloudinary flows, session lifecycle, adding background jobs, or standard code examples), tell me which section to expand and I will iterate. ✅
