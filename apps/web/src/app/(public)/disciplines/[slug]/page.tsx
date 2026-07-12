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
      {/*
      <!--
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
      -->
      */}
      
      <section>
        <PageRenderer content={description} />
      </section>
    </article>
  );
}
