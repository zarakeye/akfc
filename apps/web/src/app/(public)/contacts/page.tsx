import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import {
  isEditorialPageGated,
  UnderConstruction,
} from "@features/editorial/editorialGate";
import { parsePageContentV1 } from "@contracts/page";

import { PageRenderer } from "@features/page-builder/PageRenderer";
import { CLUB_INFO } from "@features/app-shell/clubInfo";

/**
 * « Contacts ».
 *
 * Cette page N'EXISTAIT PAS, alors que la navbar et l'appel à l'action de
 * l'accueil y renvoyaient tous deux : les deux liens tombaient en 404.
 *
 * Adossée à `SitePage` comme « L'association », elle se rédige au centre de
 * contrôle (`/dashboard/site-pages/contacts`) sans ligne de code. Les
 * coordonnées de `clubInfo` s'affichent en complément dès qu'elles sont
 * renseignées, pour que la page dise déjà quelque chose avant d'être écrite.
 */
export default async function ContactsPage(): Promise<JSX.Element> {
  if (await isEditorialPageGated("contacts")) {
    return <UnderConstruction />;
  }

  const page = await prisma.sitePage.findUnique({
    where: { slug: "contacts" },
  });
  const content = parsePageContentV1(page?.content);

  const hasInfo =
    CLUB_INFO.address.length > 0 ||
    CLUB_INFO.phone !== "" ||
    CLUB_INFO.email !== "";

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">{page?.title ?? "Contacts"}</h1>

      {content.blocks.length > 0 ? (
        <PageRenderer content={content} />
      ) : (
        !hasInfo && (
          <p className="akfc-measure-block text-muted-foreground">
            Cette page n&apos;a pas encore été rédigée.
          </p>
        )
      )}

      {hasInfo && (
        <div className="akfc-measure-block mt-8 rounded-lg border border-border p-6">
          <h2 className="mb-4 text-lg font-semibold">Coordonnées</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {CLUB_INFO.address.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {CLUB_INFO.phone !== "" && (
              <li>
                <a
                  href={`tel:${CLUB_INFO.phone.replace(/\s/g, "")}`}
                  className="text-emerald-600 hover:underline"
                >
                  {CLUB_INFO.phone}
                </a>
              </li>
            )}
            {CLUB_INFO.email !== "" && (
              <li>
                <a
                  href={`mailto:${CLUB_INFO.email}`}
                  className="text-emerald-600 hover:underline"
                >
                  {CLUB_INFO.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
