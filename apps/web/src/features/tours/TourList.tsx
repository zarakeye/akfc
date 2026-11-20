"use client";

import { JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, PlayCircle } from "lucide-react";

import { useSessionStore } from "#lib/stores/useSessionStore.ts";
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
    <section aria-label={title} className="not-prose my-6 rounded-xl border border-success/40 bg-success-muted/60 p-4">
      <p className="mb-3 font-semibold text-success">{title}</p>
      <ol className="flex flex-col gap-2">
        {tours.map(({ id, tour }, i) => {
          if (!tour) {
            return (
              <li key={id} className="rounded-lg border border-dashed border-warning/40 bg-warning-muted p-3 text-sm text-warning">
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
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-success/40 bg-card p-3 text-left transition-colors hover:border-success/40 hover:bg-success-muted disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-success/40 disabled:hover:bg-card"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-muted text-sm font-semibold text-success">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{tour.title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {allowed ? tour.description : unavailableReason(tour.audience)}
                  </span>
                </span>
                {allowed ? (
                  <PlayCircle className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
              <Link
                href={tour.doc}
                className="flex shrink-0 items-center rounded-lg px-2 text-sm text-success hover:bg-success-muted hover:underline"
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
