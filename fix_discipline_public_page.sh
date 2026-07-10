#!/bin/bash
# Fix page blanche sur /disciplines/[slug] : le fichier contenait par erreur
# le code d une page STAGE (prisma.stage.findUnique -> notFound sur un slug
# discipline). Reconstruit la VRAIE page Discipline : charge la discipline
# par slug, entete (famille, origine, ecole, classification) + PageRenderer
# sur `description` (le composite du builder, dont le bloc media-text).
# À lancer depuis la RACINE du monorepo : bash fix_discipline_public_page.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }
echo "-> apps/web/src/app/(public)/disciplines/[slug]/page.tsx"
cat > 'apps/web/src/app/(public)/disciplines/[slug]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { parsePageContentV1 } from "@contracts/page";

/**
 * Page publique d'une Discipline par slug — `/disciplines/[slug]`.
 *
 * Entête de métadonnées (école, classification, famille, origine) puis le
 * composite `description` rendu via PageRenderer (blocs du builder, dont le
 * bloc media-text). Accessible depuis le menu « Nos activités » du header.
 */
export default async function PublicDisciplinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  const discipline = await prisma.discipline.findUnique({
    where: { slug },
    include: {
      family: { select: { name: true } },
      origin: { select: { name: true, flag: true } },
    },
  });

  if (!discipline) notFound();

  const description = parsePageContentV1(discipline.description);

  const meta: Array<{ label: string; value: string }> = [];
  if (discipline.family?.name)
    meta.push({ label: "Famille", value: discipline.family.name });
  if (discipline.origin?.name)
    meta.push({
      label: "Origine",
      value: `${discipline.origin.flag ? `${discipline.origin.flag} ` : ""}${discipline.origin.name}`,
    });
  if (discipline.school)
    meta.push({ label: "École", value: discipline.school });
  if (discipline.classification)
    meta.push({ label: "Classification", value: discipline.classification });

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">{discipline.name}</h1>
        {meta.length > 0 && (
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="font-medium text-muted-foreground">{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <section>
        <PageRenderer content={description} />
      </section>
    </article>
  );
}
FILE_EOF

echo
echo "Typecheck web..."
pnpm --filter web typecheck

echo
echo "Typecheck OK -> commit."
git add -A
git commit -m "fix(disciplines): page publique affichait le code stage (page blanche)"
echo "Commit effectue."