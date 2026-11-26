"use client";

import { useMemo, useSyncExternalStore, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Check, LogIn, PlayCircle } from "lucide-react";

import { DEMO_ACCOUNTS, type DemoAccountKey } from "#features/demo/demoAccounts.ts";
import { DEMO_TOURS, type DemoTour } from "#features/demo/demoTours.ts";
import { writeOpen } from "#features/demo/demoPanelOpen.ts";
import { getTour } from "#features/tours/tour.registry.ts";
import { tourStore } from "#features/tours/tour.store.ts";

const STORE_KEY = "akfc-demo-tours";

type ToursState = { picked: string[]; done: string[] };
const EMPTY = JSON.stringify({ picked: [], done: [] } satisfies ToursState);

// Les parcours choisis et les étapes faites, retenus par le navigateur (la chaîne brute : une
// même valeur tant que rien ne change, comme l'attend useSyncExternalStore).
const listeners = new Set<() => void>();
function readRaw(): string {
  try {
    return window.localStorage.getItem(STORE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}
function parse(raw: string): ToursState {
  try {
    const v = JSON.parse(raw) as Partial<ToursState>;
    return { picked: Array.isArray(v.picked) ? v.picked : [], done: Array.isArray(v.done) ? v.done : [] };
  } catch {
    return { picked: [], done: [] };
  }
}
function write(next: ToursState): void {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    // sans stockage, rien n'est retenu
  }
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const toggleIn = (list: string[], item: string): string[] =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

function TourSteps({
  tour,
  state,
  onSwitch,
  currentKey,
  pending,
}: {
  tour: DemoTour;
  state: ToursState;
  onSwitch: (key: DemoAccountKey) => void;
  currentKey: DemoAccountKey | null;
  pending: boolean;
}): JSX.Element {
  const router = useRouter();
  // Un tuto guidé : le curseur va de cible en cible, la bulle dit quoi faire, le visiteur agit.
  const guide = (id: string): void => {
    const t = getTour(id);
    if (!t) return;
    // Le panneau se replie : il ne doit rien cacher de la page que le tuto fait parcourir.
    writeOpen(false);
    tourStore.start(t.id, { cursor: true });
    router.push(t.startRoute);
  };
  return (
    <div className="mt-2 rounded-md bg-muted px-3 py-2">
      <p className="mb-2 text-xs text-muted-foreground">{tour.pitch}</p>
      <ol className="flex flex-col gap-1.5">
        {tour.steps.map((step, i) => {
          const id = `${tour.key}:${i}`;
          const done = state.done.includes(id);
          const account = step.as ? DEMO_ACCOUNTS.find((a) => a.key === step.as) : undefined;
          return (
            <li key={id} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => write({ ...state, done: toggleIn(state.done, id) })}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  done ? "border-success bg-success text-primary-foreground" : "border-border bg-background"
                }`}
                aria-label={done ? "Marquer l'étape comme à faire" : "Marquer l'étape comme faite"}
                aria-pressed={done}
              >
                {done && <Check className="h-3 w-3" aria-hidden />}
              </button>
              <span className={done ? "text-muted-foreground line-through" : ""}>
                {step.href ? (
                  <Link href={step.href} className="underline decoration-dotted underline-offset-2 hover:text-brand">
                    {step.text}
                  </Link>
                ) : (
                  step.text
                )}
                {step.tour && getTour(step.tour) && (
                  <button
                    type="button"
                    onClick={() => guide(step.tour as string)}
                    className="ml-1 inline-flex items-center gap-1 rounded bg-brand px-1.5 text-xs text-brand-foreground hover:bg-brand/90"
                  >
                    <PlayCircle className="h-3 w-3" aria-hidden />
                    Guidé
                  </button>
                )}
                {account && account.key !== currentKey && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onSwitch(account.key)}
                    className="ml-1 inline-flex items-center gap-1 rounded border border-border px-1.5 text-xs text-brand hover:bg-background disabled:opacity-60"
                  >
                    <LogIn className="h-3 w-3" aria-hidden />
                    {account.label}
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 mb-1 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" aria-hidden />
        Dans la documentation
      </p>
      <ul className="flex flex-col gap-0.5 text-xs">
        {tour.docs.map((d) => (
          <li key={d.href}>
            <a href={d.href} target="_blank" rel="noreferrer" className="text-brand hover:underline">
              {d.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Les parcours, dans le panneau de la démo : une case par parcours ; un parcours coché déplie ses
 * étapes (cochables à leur tour) et ses chapitres de doc. Tout se retient dans le navigateur.
 */
export function DemoTours({
  onSwitch,
  currentKey,
  pending,
}: {
  onSwitch: (key: DemoAccountKey) => void;
  currentKey: DemoAccountKey | null;
  pending: boolean;
}): JSX.Element {
  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY);
  const state = useMemo(() => parse(raw), [raw]);

  const families: { family: DemoTour["family"]; title: string }[] = [
    { family: "fonction", title: "Ce que fait le site" },
    { family: "metier", title: "Par métier" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {families.map(({ family, title }) => (
        <div key={family}>
          <h3 className="mb-1 text-xs font-medium text-muted-foreground">{title}</h3>
          <ul className="flex flex-col gap-1">
            {DEMO_TOURS.filter((t) => t.family === family).map((tour) => {
              const picked = state.picked.includes(tour.key);
              const doneCount = tour.steps.filter((_, i) => state.done.includes(`${tour.key}:${i}`)).length;
              return (
                <li key={tour.key}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={picked}
                      onChange={() => write({ ...state, picked: toggleIn(state.picked, tour.key) })}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="flex-1">{tour.title}</span>
                    {doneCount > 0 && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {doneCount}/{tour.steps.length}
                      </span>
                    )}
                  </label>
                  {picked && (
                    <TourSteps tour={tour} state={state} onSwitch={onSwitch} currentKey={currentKey} pending={pending} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
