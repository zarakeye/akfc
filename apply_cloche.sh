#!/bin/bash
# Cloche de notifications bibliothèque : compteur pending+corbeille,
# secousse, tooltip singulier/pluriel, lien vers la bibliothèque.
# À lancer depuis la RACINE du monorepo : bash apply_cloche.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> packages/backend/src/modules/storage/router.ts"
cat > 'packages/backend/src/modules/storage/router.ts' << 'FILE_EOF'
import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc";

import {
  storageProviderSchema,
  storageMoveIntentSchema,
  createR2UploadAuthorizationSchema,
} from "@contracts/storage";

import {
  createUploadSignaturesSchema,
  registerUploadedAssetsSchema,
} from "@contracts/cloudinary/upload.schema";

import { getAdapter } from "@backend/modules/storage/providerRegistry";
import { VirtualStorage } from "@backend/modules/storage/virtualStorage";
import {
  planMoveOperations,
  executeMoveOperations,
} from "@backend/modules/storage/resolveMoveIntent.service";
import { assertOperationsDontUnpublishReferencedAssets } from "@backend/modules/media/services/assertOperationsDontUnpublishReferencedAssets.service";

/**
 * storageRouter — Phase 2 update
 *
 * Le seul changement par rapport à la version précédente est le schema
 * d'input de `registerR2Upload`, qui doit maintenant transporter la
 * destination métier (categoryId, disciplineId) et l'originalFileName
 * pour créer la row MediaAsset côté adapter R2.
 *
 * Le schema legacy `registerR2UploadedAssetSchema` n'avait que
 * `{ path, expectedBytes, expectedMimeType }` — insuffisant pour le
 * tracking DB. On le redéfinit en inline dans ce router pour ne pas
 * forcer une modif côté contracts (le contract est à jour côté Cloudinary
 * via `registerUploadedAssetsSchema.destination`, on reproduit la même
 * forme ici).
 *
 * ⚠️ NOTE : si un autre endroit du code utilise `registerR2UploadedAssetSchema`
 * importé depuis `@contracts/storage`, il faudra aussi l'aligner. À ce jour,
 * seul ce router le consomme.
 */

/* -------------------------------------------------------------------------- */
/*  Schema R2 Phase 2 — inline                                                */
/* -------------------------------------------------------------------------- */

/**
 * Destination metier — discriminée pour gérer les deux cas :
 *   - existing-discipline : on a categoryId + disciplineId direct
 *   - new-discipline : on a categoryId + proposedDisciplineName (admin validera plus tard)
 *
 * Forme identique à ce que `DragNDropForm` construit déjà côté frontend
 * pour Cloudinary — on réutilise.
 */
const r2UploadDestinationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('existing-discipline'),
    categoryId: z.number().int().positive(),
    disciplineId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('new-discipline'),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().min(1).max(120),
  }),
]);

const registerR2UploadInputSchema = z.object({
  path: z.string().min(1),
  expectedBytes: z.number().int().positive(),
  expectedMimeType: z.string().min(1),
  // Phase 2 — nouveaux champs requis pour créer la row MediaAsset
  destination: r2UploadDestinationSchema,
  originalFileName: z.string().min(1).max(255),
});

/* -------------------------------------------------------------------------- */
/*  Router                                                                    */
/* -------------------------------------------------------------------------- */

export const storageRouter = router({
  /* ====================================================================== */
  /*  Lecture (inchangé)                                                    */
  /* ====================================================================== */

  /**
   * Compteurs « à traiter » de la bibliothèque, pour la cloche du header :
   * assets en attente de classement (MediaAsset.status "pending") et
   * entrées de corbeille (TrashEntry IN_BIN). protectedProcedure simple,
   * comme le reste du router — la cloche est de plus gatée côté client
   * sur la présence d'au moins une permission.
   */
  getAttentionCounts: protectedProcedure.query(async ({ ctx }) => {
    const [pending, bin] = await Promise.all([
      ctx.prisma.mediaAsset.count({ where: { status: "pending" } }),
      ctx.prisma.trashEntry.count({ where: { status: "IN_BIN" } }),
    ]);
    return { pending, bin };
  }),

  list: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        cursor: z.string().optional(),
        limit: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      return reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
    }),

  getTree: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        depth: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      return reader.getTree({ path: input.path, depth: input.depth });
    }),

  getNode: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      if (!reader.getNode) {
        throw new Error(
          `Provider "${input.provider ?? "virtual"}" does not support getNode().`
        );
      }
      return reader.getNode(input.path);
    }),

  getMetadata: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      if (!reader.getMetadata) {
        throw new Error(
          `Provider "${input.provider ?? "virtual"}" does not support getMetadata().`
        );
      }
      return reader.getMetadata(input.path);
    }),

  move: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        intent: storageMoveIntentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      const operations = await planMoveOperations({
        adapter,
        appRoot: ctx.appRoot,
        intent: input.intent,
      });

      await assertOperationsDontUnpublishReferencedAssets(
        ctx.prisma,
        operations,
        ctx.appRoot,
      );

      await executeMoveOperations(adapter, operations);

      return { operations };
    }),

  /* ====================================================================== */
  /*  Upload Cloudinary (inchangé)                                          */
  /* ====================================================================== */

  createUploadAuthorization: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...createUploadSignaturesSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      switch (input.provider) {
        case "cloudinary": {
          const adapter = getAdapter("cloudinary", deps);
          return adapter.createUploadAuthorization({
            destination: input.destination,
            assets: input.assets,
            allowOverwrite: input.allowOverwrite,
          });
        }
        case "r2": {
          throw new Error(
            "R2 uploads not supported via this procedure. " +
              "Use storage.createR2Upload / storage.registerR2Upload instead."
          );
        }
      }
    }),

  registerUploadedAsset: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema,
        ...registerUploadedAssetsSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      switch (input.provider) {
        case "cloudinary": {
          const adapter = getAdapter("cloudinary", deps);
          return adapter.registerUploadedAsset({
            destination: input.destination,
            assets: input.assets,
            eventDate: input.eventDate,
            userId: ctx.user.id,
          });
        }
        case "r2": {
          throw new Error(
            "R2 register-uploaded-asset not supported via this procedure. " +
              "Use storage.createR2Upload / storage.registerR2Upload instead."
          );
        }
      }
    }),

  /* ====================================================================== */
  /*  Upload R2 — Phase 2 (enrichi avec destination + originalFileName)     */
  /* ====================================================================== */

  createR2Upload: protectedProcedure
    .input(createR2UploadAuthorizationSchema)
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter("r2", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      return adapter.createUploadAuthorization({
        path: input.path,
        mimeType: input.mimeType,
        maxBytes: input.maxBytes,
      });
    }),

  /**
   * Phase 2 — l'input transporte maintenant `destination` + `originalFileName`
   * pour permettre à l'adapter R2 de créer la row MediaAsset après HeadObject.
   */
  registerR2Upload: protectedProcedure
    .input(registerR2UploadInputSchema)
    .mutation(async ({ ctx, input }) => {
      const adapter = getAdapter("r2", {
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
      });
      return adapter.registerUploadedAsset({
        path: input.path,
        userId: ctx.user.id,
        expectedBytes: input.expectedBytes,
        expectedMimeType: input.expectedMimeType,
        destination: input.destination,
        originalFileName: input.originalFileName,
      });
    }),
});
FILE_EOF

echo "-> apps/web/src/features/app-shell/NotificationBell.tsx"
cat > 'apps/web/src/features/app-shell/NotificationBell.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Cloche de notifications de la bibliothèque — à gauche de l'avatar.
 *
 * Badge = assets « pending » + entrées de corbeille. Tooltip au survol
 * avec la formulation adaptée (les deux / attente seule / corbeille
 * seule, singulier/pluriel géré). La cloche entière est un LIEN vers la
 * bibliothèque ; si la variante dropdown (liens pending/corbeille
 * séparés) est retenue plus tard, seule la partie basse du composant
 * change — les données et le message sont déjà isolés.
 *
 * Gating : visible uniquement pour les utilisateurs ayant AU MOINS UNE
 * permission (tout gestionnaire de contenu) — pas de permission
 * bibliothèque dédiée à ce jour, et un membre simple n'a rien à faire
 * de ces compteurs.
 *
 * Secousse : uniquement quand il y a du contenu à traiter — un wiggle
 * bref toutes les ~6 s (les 15 premiers % de l'animation), désactivé
 * par prefers-reduced-motion.
 */

function buildMessage(pending: number, bin: number): string {
  const s = (n: number) => (n > 1 ? "s" : "");
  if (pending > 0 && bin > 0) {
    return `Vous avez ${pending} contenu${s(pending)} en attente et ${bin} dans la corbeille`;
  }
  if (pending > 0)
    return `Vous avez ${pending} contenu${s(pending)} en attente`;
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}

export function NotificationBell(): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const [counts, setCounts] = useState<{ pending: number; bin: number } | null>(
    null,
  );

  const canSee = (user?.role?.permissions.length ?? 0) > 0;

  useEffect(() => {
    if (!canSee) return;
    let cancelled = false;
    void trpcClient.storage.getAttentionCounts.query().then((data) => {
      if (!cancelled) setCounts(data);
    });
    return () => {
      cancelled = true;
    };
  }, [canSee]);

  if (!canSee) return null;

  const total = (counts?.pending ?? 0) + (counts?.bin ?? 0);

  return (
    <div className="group relative">
      <style>{`
        @keyframes akfc-bell-shake {
          0%, 15%, 100% { transform: rotate(0deg); }
          2%  { transform: rotate(14deg); }
          5%  { transform: rotate(-12deg); }
          8%  { transform: rotate(9deg); }
          11% { transform: rotate(-6deg); }
          13% { transform: rotate(3deg); }
        }
        .akfc-bell-shaking {
          animation: akfc-bell-shake 6s ease-in-out infinite;
          transform-origin: top center;
        }
        @media (prefers-reduced-motion: reduce) {
          .akfc-bell-shaking { animation: none; }
        }
      `}</style>

      <Link
        href="/dashboard/library"
        aria-label={
          total > 0
            ? buildMessage(counts!.pending, counts!.bin)
            : "Bibliothèque"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <Bell
          className={`h-5 w-5 ${total > 0 ? "akfc-bell-shaking" : ""}`}
          aria-hidden
        />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {total}
          </span>
        )}
      </Link>

      {total > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden w-max max-w-64 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block"
        >
          {buildMessage(counts!.pending, counts!.bin)}
        </div>
      )}
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/app-shell/Header.tsx"
cat > 'apps/web/src/features/app-shell/Header.tsx' << 'FILE_EOF'
'use client';

import Link from "next/link";
import LoginForm from "@features/auth/components/LoginForm";
import UserMenu from "@features/app-shell/UserMenu";
import { NotificationBell } from "@features/app-shell/NotificationBell";
import { Suspense, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@lib/stores/useSessionStore";
import OurActivitiesMenu from "@features/app-shell/OurActivitiesMenu";

/**
 * Header component of the application.
 * It displays the logo, navbar, user menu and login form.
 * The navbar is only visible when the user is connected.
 * The user menu is only visible when the user is connected.
 * The login form is only visible when the user is not connected.
 */
export default function Header() {
  const user = useSessionStore(state => state.session?.user);
  const pathname = usePathname();
  const [activitiesHover, setActivitiesHover] = useState<boolean>(false);
  const [kunfuHover, setKungFuHover] = useState<boolean>(false);
  const [documentationHover, setDocumentationHover] = useState<boolean>(false);

  return (
    <header className="flex justify-between items-center bg-black shadow-md">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center px-20 py-10">
            <Image
              src="/AKFC_logo.svg"
              alt="AKFC logo"
              // className="dark:invert"
              width={100}
              height={100}
              priority
            />
          </div>
      </Link>

      {/* Navbar */}
      <nav className="flex gap-4 w-[60%] justify-center items-center">
        <Link
          href="/"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/" ? "text-[40px] text-bold" : "text-[20px]"}`}
        >
          Accueil
        </Link>

        {user &&
          <Link
            href="/dashboard"
            className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/dashboard" ? "text-[40px]" : "text-[20px]"}`}
          >
            Dashboard
          </Link>
        }

        <OurActivitiesMenu />

        <Link
          href="/gallery"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/gallery" ? "text-[20px]" : ""}`}
        >
          Galerie
        </Link>
        <Link 
          href="/about" 
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/about" ? "text-[20px]" : ""}`}
        >
          À propos
        </Link>
        <Link
          href="/contacts"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/contacts" ? "active" : ""}`}
        >
          Contacts
        </Link>

        <div
          onMouseEnter={() => setDocumentationHover(true)}
          onMouseLeave={() => setDocumentationHover(false)}
          className={`relative flex text-white items-center transition duration-700 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/activities" ? "active" : ""}`}
        >
          <span>Documentation</span>
          <Image
            src="/chevron-white.svg"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className={`transition-transform duration-300 ${documentationHover ? 'rotate-180' : ''}`}
          />
          <div className={`${documentationHover ? 'block' : 'hidden'} absolute z-20 top-full left-1/2 transform -translate-x-1/2 w-40 bg-gray-300 border-4 rounded shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300`}>
            {/* <div
              onMouseEnter={() => setDocumentationHover(true)}
              onMouseLeave={() => setDocumentationHover(false)}
              className="relative block px-4 py-2 text-gray-800 hover:bg-gray-100"
            > */}
            <Link
              href="/docs"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Doc utilisateur
            </Link>
            <Link
              href="/docs/admin"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Doc admin
            </Link>
            <Link
              href="/docs/dev"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Dev doc
            </Link>
            {/* </div> */}
          </div>
        </div>
      </nav>

      <Suspense fallback={<div>Chargement...</div>}>
        {user
          ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserMenu />
            </div>
          )
          : <LoginForm />
        }
      </Suspense>
    </header>
  );
}
FILE_EOF

echo
pnpm --filter backend typecheck && pnpm --filter web typecheck