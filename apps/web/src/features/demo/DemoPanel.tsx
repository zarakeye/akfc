"use client";

import { useState, useSyncExternalStore, useTransition, type JSX } from "react";
import { Clock, FlaskConical, Mail, UserRound, X } from "lucide-react";

import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "#features/demo/demoAccounts.ts";
import { switchDemoAccountAction } from "#features/demo/switchDemoAccount.action.ts";
import type { DemoInfo } from "#features/demo/demoInfo.ts";

const OPEN_KEY = "akfc-demo-panel-open";

// Ouvert ou replié, retenu par le navigateur. Lu par useSyncExternalStore : le serveur rend le
// panneau ouvert, le navigateur corrige aussitôt, sans écart d'hydratation.
const openListeners = new Set<() => void>();
function readOpen(): boolean {
  try {
    return window.localStorage.getItem(OPEN_KEY) !== "0";
  } catch {
    return true;
  }
}
function writeOpen(next: boolean): void {
  try {
    window.localStorage.setItem(OPEN_KEY, next ? "1" : "0");
  } catch {
    // sans stockage, l'état n'est simplement pas retenu
  }
  openListeners.forEach((l) => l());
}
function subscribeOpen(listener: () => void): () => void {
  openListeners.add(listener);
  return () => openListeners.delete(listener);
}

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
 * compte connecté, « Me connecter en tant que… », et la boîte mail de la démo. Replié, il n'est
 * qu'une pastille en bas à gauche ; son état (ouvert, fermé) est retenu par le navigateur.
 */
export function DemoPanel({ info, currentEmail }: { info: DemoInfo; currentEmail: string | null }): JSX.Element {
  const open = useSyncExternalStore(subscribeOpen, readOpen, () => true);
  const now = useSyncExternalStore<number | null>(subscribeClock, readClock, noClock);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toggle = writeOpen;

  const remaining = info.endsAt !== null && now !== null ? info.endsAt - now : null;
  const ended = remaining !== null && remaining <= 0;
  const late = remaining !== null && remaining < 5 * 60 * 1000;
  const current = DEMO_ACCOUNTS.find((a) => a.email === currentEmail) ?? null;

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
      <span className={`inline-flex items-center gap-1 tabular-nums ${late ? "text-amber-600 dark:text-amber-400" : ""}`}>
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {ended ? "terminée" : formatRemaining(remaining)}
      </span>
    );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
      className="fixed bottom-4 left-4 z-[60] flex max-h-[calc(100dvh-2rem)] w-80 flex-col overflow-y-auto rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <span className="inline-flex items-center gap-2 font-semibold">
          <FlaskConical className="h-4 w-4" aria-hidden />
          Démo d&apos;AKFC
        </span>
        <span className="flex items-center gap-3">
          {timer}
          <button
            type="button"
            onClick={() => toggle(false)}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Replier le panneau"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </span>
      </header>

      {ended && (
        <p className="mx-4 mt-3 rounded-md bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          L&apos;heure est écoulée : rechargez l&apos;onglet Killercoda pour une nouvelle session.
        </p>
      )}

      <section className="px-4 py-3">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Connecté en tant que</h2>
        <p className="inline-flex items-center gap-2">
          <UserRound className="h-4 w-4 text-zinc-500" aria-hidden />
          {current ? current.label : currentEmail ? currentEmail : "visiteur (non connecté)"}
        </p>
      </section>

      <section className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Me connecter en tant que…</h2>
        <ul className="flex flex-col gap-1.5">
          {DEMO_ACCOUNTS.map((a) => {
            const active = a.email === currentEmail;
            return (
              <li key={a.key}>
                <button
                  type="button"
                  disabled={pending || active}
                  onClick={() => switchTo(a.key)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                      : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="block font-medium">{a.label}</span>
                  <span className="block text-xs text-zinc-500">{a.hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
        <p className="mt-2 text-xs text-zinc-500">
          Mot de passe de tous les comptes : <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{DEMO_PASSWORD}</code>
        </p>
      </section>

      <section className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <a
          href={info.mailUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline dark:text-blue-400"
        >
          <Mail className="h-4 w-4" aria-hidden />
          La boîte mail de la démo (Mailpit)
        </a>
        <p className="mt-1 text-xs text-zinc-500">Tous les e-mails envoyés par le site y arrivent.</p>
      </section>
    </aside>
  );
}
