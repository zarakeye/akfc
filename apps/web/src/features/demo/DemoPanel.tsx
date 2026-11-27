"use client";

import { useEffect, useState, useSyncExternalStore, useTransition, type JSX } from "react";
import { Clock, FlaskConical, Mail, UserRound, X } from "lucide-react";

import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "#features/demo/demoAccounts.ts";
import { DemoTours } from "#features/demo/DemoTours.tsx";
import { readOpen, subscribeOpen, writeOpen } from "#features/demo/demoPanelOpen.ts";
import { markDemoMode } from "#features/demo/demoMode.ts";
import { useSessionStore } from "#lib/stores/useSessionStore.ts";
import { tourStore } from "#features/tours/tour.store.ts";
import { switchDemoAccountAction } from "#features/demo/switchDemoAccount.action.ts";
import type { DemoInfo } from "#features/demo/demoInfo.ts";

// L'horloge : une valeur par seconde. Côté serveur, pas d'heure (pas de compte à rebours rendu).
function subscribeClock(listener: () => void): () => void {
  const timer = window.setInterval(listener, 1000);
  return () => window.clearInterval(timer);
}
const readClock = (): number => Math.floor(Date.now() / 1000) * 1000;
const noClock = (): number | null => null;

/** « 47:05 », « 0:42 » : le temps restant, minutes et secondes. */
function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Le panneau de la démo, posé sur toutes les pages quand DEMO_MODE=1 : le temps qui reste, le
 * compte connecté, « Me connecter en tant que… », les parcours, et la boîte mail de la démo. Replié, il n'est
 * qu'une pastille en bas à gauche ; son état (ouvert, fermé) est retenu par le navigateur.
 */
export function DemoPanel({ info, currentEmail }: { info: DemoInfo; currentEmail: string | null }): JSX.Element {
  // Le panneau n'existe que dans la démo : il le signale aux fichiers d'exemple (demoMode.ts).
  useEffect(() => markDemoMode(), []);
  // Pendant un tuto, le panneau reste replié : il ne doit rien cacher de la page parcourue.
  const touring = useSyncExternalStore(
    tourStore.subscribe,
    () => tourStore.getSnapshot() !== null,
    () => false,
  );
  const open = useSyncExternalStore(subscribeOpen, readOpen, () => true) && !touring;
  const now = useSyncExternalStore<number | null>(subscribeClock, readClock, noClock);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toggle = writeOpen;

  const remaining = info.endsAt !== null && now !== null ? info.endsAt - now : null;
  const ended = remaining !== null && remaining <= 0;
  const late = remaining !== null && remaining < 5 * 60 * 1000;
  // Le compte connecté : celui de la session côté navigateur, qui suit une connexion faite par le
  // formulaire (un tuto guidé) sans rechargement ; à défaut, celui du rendu serveur.
  const status = useSessionStore((st) => st.status);
  const liveEmail = useSessionStore((st) => st.session?.user?.email ?? null);
  const email = status === "authenticated" || status === "guest" ? liveEmail : currentEmail;
  const current = DEMO_ACCOUNTS.find((a) => a.email === email) ?? null;

  const switchTo = (key: string): void => {
    setError(null);
    startTransition(async () => {
      const result = await switchDemoAccountAction(key);
      // Rechargement complet : l'en-tête, les menus et les droits suivent le nouveau compte.
      if (result.ok) window.location.reload();
      else setError(result.error);
    });
  };

  const timer =
    remaining === null ? null : (
      <span className={`inline-flex items-center gap-1 tabular-nums ${late ? "text-warning" : ""}`}>
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {ended ? "terminée" : formatRemaining(remaining)}
      </span>
    );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
        aria-label="Ouvrir le panneau de la démo"
      >
        <FlaskConical className="h-4 w-4" aria-hidden />
        Démo
        {timer}
      </button>
    );
  }

  return (
    <aside
      aria-label="Panneau de la démo"
      className="fixed bottom-4 left-4 z-[60] flex max-h-[calc(100dvh-2rem)] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-y-auto rounded-xl border border-border bg-popover text-sm text-popover-foreground shadow-2xl"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="inline-flex items-center gap-2 font-semibold">
          <FlaskConical className="h-4 w-4" aria-hidden />
          Démo d&apos;AKFC
        </span>
        <span className="flex items-center gap-3">
          {timer}
          <button
            type="button"
            onClick={() => toggle(false)}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Replier le panneau"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </span>
      </header>

      {ended && (
        <p className="mx-4 mt-3 rounded-md bg-warning-muted px-3 py-2 text-warning">
          L&apos;heure est écoulée : rechargez l&apos;onglet Killercoda pour une nouvelle session.
        </p>
      )}

      <section className="px-4 py-3">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Connecté en tant que</h2>
        <p className="inline-flex items-center gap-2">
          <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
          {current ? current.label : email ? email : "visiteur (non connecté)"}
        </p>
      </section>

      <section className="border-t border-border px-4 py-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Me connecter en tant que…</h2>
        <ul className="flex flex-col gap-1.5">
          {DEMO_ACCOUNTS.map((a) => {
            const active = a.email === email;
            return (
              <li key={a.key}>
                <button
                  type="button"
                  disabled={pending || active}
                  onClick={() => switchTo(a.key)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition ${
                    active
                      ? "border-success bg-success-muted"
                      : "border-border hover:border-ring hover:bg-muted disabled:opacity-60"
                  }`}
                >
                  <span className="block font-medium">{a.label}</span>
                  <span className="block text-xs text-muted-foreground">{a.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <p className="mt-2 text-xs text-muted-foreground">
          Mot de passe de tous les comptes : <code className="rounded bg-muted px-1">{DEMO_PASSWORD}</code>
        </p>
      </section>

      <section className="border-t border-border px-4 py-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parcours</h2>
        <DemoTours onSwitch={switchTo} currentKey={current?.key ?? null} pending={pending} />
      </section>

      <section className="border-t border-border px-4 py-3">
        <a
          href={info.mailUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-medium text-brand hover:underline"
        >
          <Mail className="h-4 w-4" aria-hidden />
          La boîte mail de la démo (Mailpit)
        </a>
        <p className="mt-1 text-xs text-muted-foreground">Tous les e-mails envoyés par le site y arrivent.</p>
      </section>
    </aside>
  );
}
