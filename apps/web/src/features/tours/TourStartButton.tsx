"use client";

import { JSX } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";

import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import { tourStore } from "./tour.store";
import { canFollow, getTour, unavailableReason } from "./tour.registry";

/**
 * Bouton « Lancer le tuto » des fiches de documentation (composant MDX `<TourStartButton id="…" />`).
 * À ne pas confondre avec `TourLauncher`, le bouton « ? » flottant qui liste les tutos de la page.
 * Démarre le tuto puis conduit à sa page de départ. Si le visiteur n'a pas le rôle requis, le
 * bouton explique pourquoi au lieu de lancer un tuto qui échouerait.
 */
export function TourStartButton({ id }: { id: string }): JSX.Element {
  const router = useRouter();
  const user = useSessionStore((s) => s.session?.user);
  const tour = getTour(id);

  if (!tour) {
    return (
      <p className="my-4 rounded-md border border-dashed border-warning/40 bg-warning-muted p-3 text-sm text-warning">
        Tuto « {id} » introuvable.
      </p>
    );
  }

  const allowed = canFollow(tour.audience, { loggedIn: !!user, isAdmin: !!user?.isAdmin });

  return (
    <div className="not-prose my-6 flex items-center gap-4 rounded-xl border border-success/40 bg-success-muted p-4">
      <PlayCircle className="h-8 w-8 shrink-0 text-success" />
      <div className="min-w-0 flex-1 text-left">
        <p className="font-semibold text-success">Tuto interactif : {tour.title}</p>
        <p className="text-sm text-success">
          {allowed
            ? `${tour.description} ${tour.steps.length} étapes, guidées sur la vraie page.`
            : unavailableReason(tour.audience)}
        </p>
      </div>
      <button
        type="button"
        disabled={!allowed}
        onClick={() => {
          tourStore.start(tour.id);
          router.push(tour.startRoute);
        }}
        className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Lancer le tuto
      </button>
    </div>
  );
}
