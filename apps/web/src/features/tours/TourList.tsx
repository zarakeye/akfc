"use client";

import { JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, PlayCircle } from "lucide-react";

import { useSessionStore } from "@lib/stores/useSessionStore";
import { tourStore } from "./tour.store";
import { canFollow, getTour, unavailableReason } from "./tour.registry";

/**
 * Un parcours : des tutos dans l'ordre où on les suit, numérotés, chacun cliquable
 * (composant MDX `<TourList title="…" ids="a,b,c" />`). Un clic lance le tuto et conduit à sa page
 * de départ ; « La fiche » ouvre sa documentation. Un tuto hors du rôle du visiteur reste listé,
 * grisé, avec la raison.
 *
 * Les identifiants arrivent en une chaîne séparée par des virgules : le MDX du projet ne passe
 * pas de tableau en attribut (partie « Contenu éditorial »). `check-tour-targets` les vérifie.
 */
export function TourList({ title, ids }: { title: string; ids: string }): JSX.Element {
  const router = useRouter();
  const user = useSessionStore((s) => s.session?.user);
  const viewer = { loggedIn: !!user, isAdmin: !!user?.isAdmin };
  const tours = ids.split(",").map((id) => ({ id: id.trim(), tour: getTour(id.trim()) }));

  return (
    <section aria-label={title} className="not-prose my-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
      <p className="mb-3 font-semibold text-emerald-900">{title}</p>
      <ol className="flex flex-col gap-2">
        {tours.map(({ id, tour }, i) => {
          if (!tour) {
            return (
              <li key={id} className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                Tuto « {id} » introuvable.
              </li>
            );
          }
          const allowed = canFollow(tour.audience, viewer);
          return (
            <li key={id} className="flex items-stretch gap-2">
              <button
                type="button"
                disabled={!allowed}
                onClick={() => {
                  tourStore.start(tour.id);
                  router.push(tour.startRoute);
                }}
                aria-label={`${i + 1}. ${tour.title}${allowed ? "" : " (indisponible)"}`}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-emerald-100 bg-white p-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-emerald-100 disabled:hover:bg-white"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-900">{tour.title}</span>
                  <span className="block text-sm text-slate-600">
                    {allowed ? tour.description : unavailableReason(tour.audience)}
                  </span>
                </span>
                {allowed ? (
                  <PlayCircle className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                )}
              </button>
              <Link
                href={tour.doc}
                className="flex shrink-0 items-center rounded-lg px-2 text-sm text-emerald-800 hover:bg-emerald-100 hover:underline"
              >
                La fiche
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
