/**
 * État du tuto en cours : un petit store EXTERNE à React (lu par `useSyncExternalStore`).
 *
 * Pourquoi pas un simple `useState` ? Parce que l'état doit SURVIVRE à un changement de
 * page (un tuto traverse plusieurs routes) et à un rechargement : il vit donc dans
 * `sessionStorage` (propre à l'onglet, effacé à sa fermeture). Un store externe lit ce
 * stockage sans `setState` dans un effet, et le serveur voit simplement « aucun tuto »
 * (`getServerSnapshot`), ce qui évite tout écart d'hydratation.
 */
export interface TourState {
  tourId: string;
  index: number;
}

const KEY = "akfc.tour";
const listeners = new Set<() => void>();
let state: TourState | null | undefined; // undefined = pas encore lu

function read(): TourState | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as TourState;
    return typeof v?.tourId === "string" && Number.isInteger(v.index) ? v : null;
  } catch {
    return null;
  }
}

function write(next: TourState | null): void {
  state = next;
  try {
    if (next) window.sessionStorage.setItem(KEY, JSON.stringify(next));
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* stockage indisponible (navigation privée…) : le tuto marche, sans survivre au rechargement */
  }
  listeners.forEach((l) => l());
}

export const tourStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): TourState | null {
    if (state === undefined) state = read();
    return state;
  },
  getServerSnapshot(): TourState | null {
    return null;
  },
  start(tourId: string): void {
    write({ tourId, index: 0 });
  },
  /** Passe à l'étape suivante, seulement si l'on est bien à `fromIndex` (évite les doubles passages). */
  next(fromIndex: number): void {
    const s = tourStore.getSnapshot();
    if (s && s.index === fromIndex) write({ ...s, index: s.index + 1 });
  },
  stop(): void {
    write(null);
  },
};
