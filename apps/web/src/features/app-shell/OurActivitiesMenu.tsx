'use client';
import { JSX, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@trpc/trpcClient";

/**
 * Menu public « Nos activités ».
 *
 * En tête : deux accès directs aux listes publiques — « Tous les stages »
 * (`/stages`) et « Tous les évènements » (`/events`). En dessous, les
 * disciplines regroupées par famille (familles triées par `sortOrder`,
 * disciplines par nom, les sans-famille sous « Autres »), liens vers
 * `/disciplines/[slug]`.
 *
 * Calqué sur le menu « Documentation » du Header : hover piloté par l'état
 * React (`onMouseEnter`/`onMouseLeave`), texte blanc + halo emerald au survol,
 * chevron `chevron-white.svg` qui pivote, panneau `bg-gray-300` à liens
 * `text-gray-800 hover:bg-gray-100`.
 */
export default function OurActivitiesMenu(): JSX.Element {
  const [hover, setHover] = useState<boolean>(false);
  const { data: familiesData } = trpc.disciplineFamily.getAll.useQuery();
  const { data: disciplinesData } = trpc.discipline.getAll.useQuery();
  const families = familiesData ?? [];
  const disciplines = disciplinesData ?? [];
  const groups = [...families]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((f) => ({
      id: f.id,
      name: f.name,
      disciplines: disciplines
        .filter((d) => d.familyId === f.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((g) => g.disciplines.length > 0);
  const orphans = disciplines
    .filter((d) => d.familyId == null)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (orphans.length > 0) {
    groups.push({ id: -1, name: "Autres", disciplines: orphans });
  }
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex text-white items-center transition duration-700 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
    >
      <span>Nos activités</span>
      <Image
        src="/chevron-white.svg"
        alt=""
        aria-hidden="true"
        width={30}
        height={30}
        className={`transition-transform duration-300 ${hover ? "rotate-180" : ""}`}
      />
      <div
        className={`${hover ? "block" : "hidden"} absolute z-20 top-full left-1/2 transform -translate-x-1/2 min-w-[18rem] bg-gray-300 border-4 rounded shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300`}
      >
        {/* Accès directs aux listes publiques */}
        <ul className="border-b border-gray-400">
          <li>
            <Link
              href="/stages"
              className="block px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100"
            >
              Tous les stages
            </Link>
          </li>
          <li>
            <Link
              href="/events"
              className="block px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100"
            >
              Tous les évènements
            </Link>
          </li>
        </ul>

        {/* Disciplines par famille */}
        {groups.length === 0 ? (
          <p className="px-4 py-2 text-gray-800">Bientôt disponible.</p>
        ) : (
          <div className="grid gap-2 p-2 sm:grid-cols-2">
            {groups.map((family) => (
              <div key={family.id}>
                <p className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {family.name}
                </p>
                <ul>
                  {family.disciplines.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/disciplines/${d.slug}`}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}