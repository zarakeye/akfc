#!/bin/bash
# Chantier BreakingNews — B.3 : CRUD admin (liste, création, édition,
# suppression) + entrée « Actualités » dans la nav du dashboard.
# À lancer depuis la RACINE du monorepo : bash apply_b3_admin.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

mkdir -p apps/web/src/features/admin/breaking-news/components
mkdir -p apps/web/src/features/admin/breaking-news/forms
mkdir -p 'apps/web/src/app/(admin)/dashboard/breaking-news/create'
mkdir -p 'apps/web/src/app/(admin)/dashboard/breaking-news/[id]/edit'

echo "-> apps/web/src/features/admin/breaking-news/forms/BreakingNewsForm.tsx"
cat > 'apps/web/src/features/admin/breaking-news/forms/BreakingNewsForm.tsx' << 'FILE_EOF'
"use client";

import { useState, type JSX } from "react";
import type { BreakingNews } from "@prisma/client";

/**
 * Formulaire BreakingNews (create + edit via `initial?`) — patron PostForm :
 * état contrôlé, dates en <input type="datetime-local">.
 *
 * NOTE : `toDatetimeLocalValue` est dupliqué de PostForm/EventForm — le
 * chantier « PublicationDateField partagé » (pending du handoff) absorbera
 * les trois occurrences.
 */

export interface BreakingNewsFormInput {
  title: string;
  body: string;
  href: string | null;
  publicationDate: Date | null;
  expiresAt: Date | null;
}

interface BreakingNewsFormProps {
  initial?: BreakingNews;
  onSubmit: (input: BreakingNewsFormInput) => Promise<void>;
  submitLabel?: string;
}

/** Date → valeur `datetime-local` (YYYY-MM-DDTHH:mm, heure locale). "" si null. */
function toDatetimeLocalValue(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function BreakingNewsForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: BreakingNewsFormProps): JSX.Element {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [publicationDateValue, setPublicationDateValue] = useState(
    toDatetimeLocalValue(initial?.publicationDate ?? null),
  );
  const [expiresAtValue, setExpiresAtValue] = useState(
    toDatetimeLocalValue(initial?.expiresAt ?? null),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (title.trim() === "" || body.trim() === "") {
      setError("Le titre et le corps sont obligatoires.");
      return;
    }
    const publicationDate =
      publicationDateValue === "" ? null : new Date(publicationDateValue);
    const expiresAt = expiresAtValue === "" ? null : new Date(expiresAtValue);
    if (publicationDate && expiresAt && expiresAt <= publicationDate) {
      setError("L'expiration doit être postérieure à la publication.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        href: href.trim() === "" ? null : href.trim(),
        publicationDate,
        expiresAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Titre</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Fermeture exceptionnelle, Résultats du vote…"
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Corps</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={600}
          rows={4}
          placeholder="Texte court de l'actualité (600 caractères max)."
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Lien (optionnel)</span>
        <input
          type="text"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/#post-12 (interne) ou https://… (externe)"
          className="rounded border border-input bg-background px-2 py-1"
        />
        <span className="text-xs text-muted-foreground">
          CTA de la fiche dans la sidebar — vers un post du mur, une page du
          site ou un lien externe.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Date de publication</span>
        <input
          type="datetime-local"
          value={publicationDateValue}
          onChange={(e) => setPublicationDateValue(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
        <span className="text-xs text-muted-foreground">
          Laisser vide = brouillon (non visible publiquement). Une date future
          programme la publication.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Date d&apos;expiration</span>
        <input
          type="datetime-local"
          value={expiresAtValue}
          onChange={(e) => setExpiresAtValue(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
        <span className="text-xs text-muted-foreground">
          Passée cette date, l&apos;actualité disparaît du ruban et de la
          sidebar. Laisser vide = sans expiration.
        </span>
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/admin/breaking-news/components/BreakingNewsTable.tsx"
cat > 'apps/web/src/features/admin/breaking-news/components/BreakingNewsTable.tsx' << 'FILE_EOF'
"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { Table, type Column } from "react-ts-tab-lib";
import { trpc } from "@trpc/trpcClient";

type NewsRow = {
  id: number;
  title: string;
  statut: string;
  expiration: string;
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR");
}

/** Statut lisible — l'expiration prime sur la publication. */
function statut(publicationDate: Date | null, expiresAt: Date | null): string {
  const now = new Date();
  if (expiresAt && new Date(expiresAt) <= now) return "Expirée";
  if (!publicationDate) return "Brouillon";
  return new Date(publicationDate) > now
    ? `Programmée le ${formatDate(publicationDate)}`
    : `Publiée le ${formatDate(publicationDate)}`;
}

/** Liste des actualités — clic → édition directe (pas de fiche dédiée). */
export default function BreakingNewsTable(): JSX.Element {
  const router = useRouter();
  const { data, isLoading, isError } = trpc.breakingNews.getAllAdmin.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des actualités.</div>;

  const rows: NewsRow[] = (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    statut: statut(n.publicationDate, n.expiresAt),
    expiration: n.expiresAt ? formatDate(n.expiresAt) : "—",
  }));

  const columns: Column<NewsRow>[] = [
    { property: "title", displayName: "Titre", type: "string" },
    { property: "statut", displayName: "Statut", type: "string" },
    { property: "expiration", displayName: "Expire le", type: "string" },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: NewsRow | null) => {
        if (row) router.push(`/dashboard/breaking-news/${row.id}/edit`);
      }}
    />
  );
}
FILE_EOF

echo "-> apps/web/src/features/admin/breaking-news/components/CreateBreakingNews.tsx"
cat > 'apps/web/src/features/admin/breaking-news/components/CreateBreakingNews.tsx' << 'FILE_EOF'
"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@trpc/trpcClient";

import {
  BreakingNewsForm,
  type BreakingNewsFormInput,
} from "@features/admin/breaking-news/forms/BreakingNewsForm";

export function CreateBreakingNews(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.breakingNews.create.useMutation();

  const handleSubmit = async (input: BreakingNewsFormInput) => {
    await create.mutateAsync(input);
    await utils.breakingNews.getAllAdmin.invalidate();
    router.push("/dashboard/breaking-news");
  };

  return <BreakingNewsForm onSubmit={handleSubmit} submitLabel="Créer" />;
}
FILE_EOF

echo "-> apps/web/src/features/admin/breaking-news/components/EditBreakingNews.tsx"
cat > 'apps/web/src/features/admin/breaking-news/components/EditBreakingNews.tsx' << 'FILE_EOF'
"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@trpc/trpcClient";

import {
  BreakingNewsForm,
  type BreakingNewsFormInput,
} from "@features/admin/breaking-news/forms/BreakingNewsForm";

/** Édition + suppression (pas de fiche de présentation : tout est ici). */
export function EditBreakingNews({ id }: { id: number }): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.breakingNews.getByIdAdmin.useQuery({
    id,
  });
  const update = trpc.breakingNews.update.useMutation();
  const remove = trpc.breakingNews.delete.useMutation();

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !data)
    return <div>Erreur lors du chargement de l&apos;actualité.</div>;

  const handleSubmit = async (input: BreakingNewsFormInput) => {
    await update.mutateAsync({ id, ...input });
    await utils.breakingNews.invalidate();
    router.push("/dashboard/breaking-news");
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cette actualité ?")) return;
    await remove.mutateAsync({ id });
    await utils.breakingNews.getAllAdmin.invalidate();
    router.push("/dashboard/breaking-news");
  };

  return (
    <div className="flex flex-col gap-6">
      <BreakingNewsForm initial={data} onSubmit={handleSubmit} />
      <div>
        <button
          type="button"
          onClick={handleDelete}
          className="text-sm text-destructive transition-colors hover:underline"
        >
          Supprimer cette actualité
        </button>
      </div>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/breaking-news/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/breaking-news/page.tsx' << 'FILE_EOF'
import { JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import BreakingNewsTable from "@features/admin/breaking-news/components/BreakingNewsTable";

/** Liste des actualités — `/(admin)/dashboard/breaking-news`. */
export default function BreakingNewsPage(): JSX.Element {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Actualités</h2>
        <Link
          href="/dashboard/breaking-news/create"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une actualité
        </Link>
      </div>
      <BreakingNewsTable />
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/breaking-news/create/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/breaking-news/create/page.tsx' << 'FILE_EOF'
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateBreakingNews } from "@features/admin/breaking-news/components/CreateBreakingNews";

/** Création — `/(admin)/dashboard/breaking-news/create`. */
export default function CreateBreakingNewsPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/breaking-news"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une actualité</h2>
      <CreateBreakingNews />
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(admin)/dashboard/breaking-news/[id]/edit/page.tsx"
cat > 'apps/web/src/app/(admin)/dashboard/breaking-news/[id]/edit/page.tsx' << 'FILE_EOF'
import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { EditBreakingNews } from "@features/admin/breaking-news/components/EditBreakingNews";

/** Édition — `/(admin)/dashboard/breaking-news/[id]/edit`. */
export default async function EditBreakingNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const newsId = Number(id);
  if (!Number.isFinite(newsId) || newsId <= 0) notFound();

  return (
    <div>
      <Link
        href="/dashboard/breaking-news"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer l&apos;actualité</h2>
      <EditBreakingNews id={newsId} />
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/app-shell/ControlPanelSidebar.tsx"
cat > 'apps/web/src/features/app-shell/ControlPanelSidebar.tsx' << 'FILE_EOF'
'use client';

import { JSX } from "react";
import { useSessionStore } from "@lib/stores/useSessionStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Composant du barre latéral de l'application.
 * Il permet d'accéder à l'ensemble des fonctionnalités de l'application.
 * Il est conditionnellement affiché en fonction du rôle de l'utilisateur.
 */
export default function ControlPanelSidebar(): JSX.Element {
  const router = useRouter();
  const role = useSessionStore(state => state.session?.user?.role);

  return (
    role && role.name === 'ADMIN'
    ? (
      <aside className='w-60 bg-gray-800 text-white p-5'>
        <h2 className="font-bold text-lg mb-4">Centre de contrôle</h2>

        <ul className="space-y-2">

        {['ADMIN', 'COACH'].includes(role.name) && (
          <>
            <li>
              <div className="flex">
                <p className="w-full text-center">Listes</p>
                <p className="w-full text-center">Ajout</p>
              </div>
            </li>

            {/* Utilisateurs */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/users');
                  }}
                >
                  Utilisateurs
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/users/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Ajouter un utilisateur"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
            
            {/* Rôles */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/roles');
                  }}
                >
                  Rôles
                </button>
              
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/roles/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un nouveau rôle"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
            
            {/* Permissions */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => router.push('/dashboard/permissions')}
                >
                  Permissions
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/permissions/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une permission"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Disciplines */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/disciplines');
                  }}
                >
                  Disciplines
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/disciplines/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une discipline"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Familles de disciplines */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/discipline-families');
                  }}
                >
                  Familles
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/discipline-families/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une famille de disciplines"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Catégories d'activités */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/categories');
                  }}
                >
                  <span>Catégories d&apos;activités</span>
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/categories/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un type d'activité"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Origines culturelles */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/origins');
                  }}
                >
                  Origines
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/origins/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une origine culturelle"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
            
            {/* Cours */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/courses');
                  }}
                >
                  Cours
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/courses/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un cours"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Évènements */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/events');
                  }}
                >
                  Évènements
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/events/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un nouvel évènement"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Stages */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/stages');
                  }}
                >
                  Stages
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/stages/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un nouveau stage"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Posts */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/posts');
                  }}
                >
                  Posts
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/posts/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un post"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Actualités (BreakingNews) */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/breaking-news');
                  }}
                >
                  Actualités
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/breaking-news/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une actualité"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Bibliothèque */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/library');
                  }}
                >
                  Bibliothèque
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/library/add');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Ajouter une image ou une vidéo"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Galeries */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/galleries');
                  }}
                >
                  Galeries
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/dashboard/galleries/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une galerie"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
          </>
        )}

          <li>
            <button
              className="w-full text-center mt-5"
              onClick={() => {
                router.push('/dashboard');
              }}
            >
              Mon profil
            </button>
          </li>
        </ul>
      </aside>
    )
    : (
      <aside className='w-60 bg-gray-800 text-white p-5'>
      </aside>
    )
  );
}
FILE_EOF

echo
echo "8 fichiers ecrits. Validation :"
pnpm --filter web typecheck