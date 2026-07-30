#!/usr/bin/env bash
#
# step_qui_sommes_nous.sh
#
# Dernier morceau : la page « L'association », son éditeur au centre de
# contrôle, et le menu déroulant « Qui sommes-nous ? ».
#
# ─── L'éditeur est générique, la page ne l'est pas ─────────────────────────
#
# L'éditeur vit sur `/dashboard/site-pages/[slug]` : il édite n'importe quelle
# page de contenu, pas seulement « L'association ». Le socle `SitePage` étant
# générique, un éditeur spécialisé aurait été à réécrire au premier ajout —
# « L'histoire du club », « Le règlement », « Nous rejoindre ».
#
# La page PUBLIQUE, elle, reste à `/about` en dur. Une route générique
# `/pages/[slug]` aurait produit des URLs impersonnelles là où l'adresse fait
# partie de la vitrine.
#
# ─── Ce que fait la page quand rien n'est rédigé ───────────────────────────
#
# Elle s'affiche avec son titre et le dit franchement, au lieu de rendre un
# 404. Le menu y mène dès maintenant : une entrée de navigation qui tombe sur
# une erreur est bien pire qu'une page qui s'annonce vide, et cela te laisse
# créer le lien avant le contenu.
#
# ─── Le menu ───────────────────────────────────────────────────────────────
#
# « À propos » devient « Qui sommes-nous ? », déroulant sur « L'association »
# et « Nos instructeurs ». Le patron est celui de ton menu « Documentation »,
# repris à l'identique — mêmes états de survol, même chevron, mêmes classes.
# Un second modèle de menu déroulant dans la même barre aurait fini par
# diverger du premier.
#
# Usage :
#   bash step_qui_sommes_nous.sh
#   AKFC_APPLY_ONLY=1 bash step_qui_sommes_nous.sh
#
set -euo pipefail

about_page="apps/web/src/app/(public)/about/page.tsx"
editor_component="apps/web/src/features/admin/site-pages/SitePageEditor.tsx"
editor_route="apps/web/src/app/(admin)/dashboard/site-pages/[slug]/page.tsx"
header_file="apps/web/src/features/app-shell/Header.tsx"
sidebar_file="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "site-pages" "$sidebar_file" 2>/dev/null; then
  echo "✓ déjà appliqué (entrée dans la barre latérale) — rien à faire"
  exit 0
fi

for f in "$header_file" "$sidebar_file"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "model SitePage" prisma/schema.prisma || {
  echo "✗ le socle des pages de contenu doit être appliqué d'abord"; exit 1; }

mkdir -p "$(dirname "$about_page")" "$(dirname "$editor_component")" \
         "$(dirname "$editor_route")"

# ─────────────────────────────────────────────────────────────────────────
#  1 — La page publique
# ─────────────────────────────────────────────────────────────────────────

cat > "$about_page" <<'TSX'
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { parsePageContentV1 } from "@contracts/page";

import { PageRenderer } from "@features/page-builder/PageRenderer";

/**
 * « L'association » — présentation du club.
 *
 * Route en dur plutôt que `/pages/[slug]` générique : l'adresse fait partie
 * de la vitrine, et `/about` se retient. Le SOCLE est générique (`SitePage`),
 * l'URL ne l'est pas — les deux choix sont indépendants.
 *
 * Quand la page n'a pas encore été rédigée, elle s'affiche et le dit, au lieu
 * de rendre un 404 : le menu y mène dès maintenant, et une entrée de
 * navigation qui tombe sur une erreur est bien pire qu'une page qui s'annonce
 * vide.
 */
export default async function AboutPage(): Promise<JSX.Element> {
  const page = await prisma.sitePage.findUnique({
    where: { slug: "association" },
  });
  const content = parsePageContentV1(page?.content);

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">
        {page?.title ?? "L'association"}
      </h1>

      {content.blocks.length > 0 ? (
        <PageRenderer content={content} />
      ) : (
        <p className="akfc-measure-block text-muted-foreground">
          Cette page n&apos;a pas encore été rédigée.
        </p>
      )}
    </div>
  );
}
TSX
echo "  + (public)/about/page.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  2 — L'éditeur, générique
# ─────────────────────────────────────────────────────────────────────────

cat > "$editor_component" <<'TSX'
"use client";

import { useState, type JSX } from "react";

import { trpc } from "@/core/trpc/trpcClient";
import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@contracts/page";
import { PageBuilder } from "@features/page-builder";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

/**
 * Éditeur d'une page de contenu, quelle qu'elle soit.
 *
 * Générique par slug plutôt que spécialisé « association » : le socle
 * `SitePage` couvre toute une famille de pages, et un éditeur par page aurait
 * été à réécrire à chaque ajout.
 *
 * Le builder est COMPLET ici, contrairement à la présentation synthétique
 * d'une discipline : une page de club est un contenu long, où galeries et
 * colonnes ont leur place.
 */
export function SitePageEditor({
  slug,
  fallbackTitle,
}: {
  slug: string;
  fallbackTitle: string;
}): JSX.Element {
  const existing = trpc.sitePage.get.useQuery({ slug });
  const utils = trpc.useUtils();
  const save = trpc.sitePage.save.useMutation({
    onSuccess: () => {
      void utils.sitePage.get.invalidate({ slug });
    },
  });

  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState<PageContentV1 | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  if (existing.isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  const persistedTitle = existing.data?.title ?? fallbackTitle;
  const persistedContent = existing.data
    ? parsePageContentV1(existing.data.content)
    : emptyPageContentV1();

  const title = titleDraft ?? persistedTitle;
  const content = contentDraft ?? persistedContent;

  // Comparaison sur le contenu sérialisé plutôt qu'un simple drapeau :
  // défaire une modification redonne « à jour » au lieu de laisser un faux
  // positif collé jusqu'au rechargement.
  const baseline =
    savedSnapshot ?? JSON.stringify({ title: persistedTitle, content: persistedContent });
  const dirty = JSON.stringify({ title, content }) !== baseline;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Titre de la page
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitleDraft(e.target.value)}
            className="w-full max-w-md rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>

        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs font-medium text-amber-600">
              Modifications non enregistrées
            </span>
          )}
          <button
            type="button"
            disabled={save.isPending || !dirty || title.trim() === ""}
            onClick={() => {
              // L'instantané est pris AVANT l'appel et posé seulement au
              // succès : un enregistrement qui échoue ne doit pas faire
              // croire que le contenu est à jour.
              const snapshot = JSON.stringify({ title, content });
              save.mutate(
                { slug, title: title.trim(), content },
                { onSuccess: () => setSavedSnapshot(snapshot) },
              );
            }}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <PageBuilder
        value={content}
        onChange={setContentDraft}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
      />

      {save.isError && (
        <p className="text-xs text-destructive">
          Échec de l&apos;enregistrement : {save.error.message}
        </p>
      )}
    </div>
  );
}
TSX
echo "  + SitePageEditor.tsx"

cat > "$editor_route" <<'TSX'
import type { JSX } from "react";

import { SitePageEditor } from "@features/admin/site-pages/SitePageEditor";

/**
 * Titres proposés par défaut pour les pages connues, tant qu'aucune n'a été
 * enregistrée. Une page inconnue reçoit son slug — l'éditeur fonctionne quand
 * même, et le titre se corrige au premier enregistrement.
 */
const DEFAULT_TITLES: Record<string, string> = {
  association: "L'association",
  histoire: "L'histoire du club",
};

export default async function SitePageEditorRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Page « {DEFAULT_TITLES[slug] ?? slug} »
      </h1>
      <SitePageEditor slug={slug} fallbackTitle={DEFAULT_TITLES[slug] ?? slug} />
    </div>
  );
}
TSX
echo "  + dashboard/site-pages/[slug]/page.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  3 — Le menu et la barre latérale
# ─────────────────────────────────────────────────────────────────────────

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

header_file  = "apps/web/src/features/app-shell/Header.tsx"
sidebar_file = "apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

# ── état de survol du nouveau menu ────────────────────────────────────────
edit(header_file,
"""  const [documentationHover, setDocumentationHover] = useState<boolean>(false);""",
"""  const [documentationHover, setDocumentationHover] = useState<boolean>(false);
  const [aboutHover, setAboutHover] = useState<boolean>(false);""")

# ── « À propos » devient un menu déroulant ────────────────────────────────
# Patron repris à l'identique de « Documentation » : mêmes classes, même
# chevron, mêmes états de survol. Un second modèle de menu dans la même barre
# aurait fini par diverger du premier.
edit(header_file,
"""        <Link 
          href="/about" 
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/about" ? "text-[20px]" : ""}`}
        >
          À propos
        </Link>""",
"""        <div
          onMouseEnter={() => setAboutHover(true)}
          onMouseLeave={() => setAboutHover(false)}
          className={`relative flex text-white items-center transition duration-700 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname.startsWith("/about") ? "text-[20px]" : ""}`}
        >
          <span>Qui sommes-nous&nbsp;?</span>
          <Image
            src="/chevron-white.svg"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className={`transition-transform duration-300 ${aboutHover ? 'rotate-180' : ''}`}
          />
          <div className={`${aboutHover ? 'block' : 'hidden'} absolute z-20 top-full left-1/2 transform -translate-x-1/2 w-44 bg-gray-300 border-4 rounded shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300`}>
            <Link
              href="/about"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              L&apos;association
            </Link>
            <Link
              href="/about/instructeurs"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Nos instructeurs
            </Link>
          </div>
        </div>""")

# ── entrée dans la barre latérale du centre de contrôle ───────────────────
edit(sidebar_file, """            {/* Familles de disciplines */}""",
"""            {/* Pages du site */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/site-pages/association");
                  }}
                >
                  Page « L&apos;association »
                </button>
              </div>
            </li>

            {/* Familles de disciplines */}""")
PY

echo "✓ page, éditeur et menu posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(site-pages): page L'association, son editeur et le menu

L'editeur vit sur /dashboard/site-pages/[slug] : il edite n'importe
quelle page de contenu. Le socle SitePage etant generique, un editeur
specialise aurait ete a reecrire au premier ajout — histoire du club,
reglement, nous rejoindre.

La page PUBLIQUE reste a /about en dur : l'adresse fait partie de la
vitrine, et une route generique /pages/[slug] aurait produit des URLs
impersonnelles. Socle generique et URL nommee sont deux choix
independants.

Tant que rien n'est redige, la page s'affiche et le dit au lieu de
rendre un 404 : le menu y mene des maintenant, et une entree de
navigation qui tombe sur une erreur est pire qu'une page qui s'annonce
vide.

« A propos » devient « Qui sommes-nous ? », deroulant sur
« L'association » et « Nos instructeurs ». Patron repris a l'identique
du menu Documentation — memes classes, meme chevron, memes etats de
survol : un second modele de menu deroulant dans la meme barre aurait
fini par diverger du premier."

echo "✓ commité"
git log -1 --oneline