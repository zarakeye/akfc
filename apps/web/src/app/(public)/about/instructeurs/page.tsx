import type { JSX } from "react";

import { Prisma } from "@prisma/client";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";
import { UserPortrait } from "@features/social/UserPortrait";
import { formatUserName, type DisplayUser } from "@features/social/userDisplay";

/**
 * /about/instructeurs — les instructeurs TITULAIRES qui se sont présentés.
 *
 * Lecture directe de Prisma (Server Component) : on n'interroge pas sa
 * propre base par HTTP. Le critère est celui de `listPublicInstructors` —
 * rattachement a un enseignement ET bio non nulle — repris ici pour rester
 * un seul rendu serveur sans aller-retour tRPC.
 */
export default async function InstructeursPage(): Promise<JSX.Element> {
  const instructors = await prisma.user.findMany({
    where: {
      AND: [
        { instructorBio: { not: Prisma.DbNull } },
        {
          OR: [
            { disciplinesAsInstructor: { some: {} } },
            { coursesAsInstructor: { some: {} } },
            { stagesAsPrimaryAnimator: { some: {} } },
            { stagesAsAnimator: { some: {} } },
          ],
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      pseudo: true,
      email: true,
      avatar: true,
      instructorBio: true,
    },
    orderBy: [
      { instructorOrder: { sort: "asc", nulls: "last" } },
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">Nos instructeurs</h1>

      {instructors.length === 0 ? (
        <p className="text-muted-foreground">
          Aucune présentation d&apos;instructeur pour le moment.
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: "var(--akfc-block-gap)" }}>
          {instructors.map((instructor) => {
            const displayUser: DisplayUser = {
              id: instructor.id,
              firstName: instructor.firstName,
              lastName: instructor.lastName,
              pseudo: instructor.pseudo,
              email: instructor.email,
              avatar: instructor.avatar,
              image: null,
            };

            return (
              // La carte prend le PUITS, pas la mesure.
              //
              // `akfc-measure-block` etait pose ici, ce qui plafonnait la
              // carte a 68ch. Mais la mesure est la largeur d'une LIGNE DE
              // TEXTE, pas celle d'un conteneur qui ajoute par-dessus une
              // bordure, 48px de rembourrage et un puits interne : le texte
              // a l'interieur etait donc forcement plus etroit qu'elle,
              // 57 caracteres au lieu de 68.
              //
              // La mesure appartient au texte, et le texte se la donne deja
              // lui-meme — chaque bloc porte `akfc-prose` ou
              // `akfc-measure-block`.
              <article
                key={instructor.id}
                className="rounded-lg border border-border p-6"
              >
                {/* La mesure passe ICI : sans elle, portrait et nom
                    fuiraient vers le bord gauche d'une carte devenue large
                    pendant que le texte resterait centre a 68ch. */}
                <header className="akfc-measure-block mb-4 flex items-center gap-3">
                  <div className="scale-125">
                    <UserPortrait user={displayUser} size="md" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {formatUserName(displayUser)}
                  </h2>
                </header>

                <PageRenderer content={parsePageContentV1(instructor.instructorBio)} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
