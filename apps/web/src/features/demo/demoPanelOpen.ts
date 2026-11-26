/**
 * Le panneau de la démo, ouvert ou replié, retenu par le navigateur. Lu par useSyncExternalStore :
 * le serveur rend le panneau ouvert, le navigateur corrige aussitôt, sans écart d'hydratation.
 * À part du panneau : un tuto guidé le replie au démarrage, pour ne rien cacher de la page.
 */
const OPEN_KEY = "akfc-demo-panel-open";

const openListeners = new Set<() => void>();
export function readOpen(): boolean {
  try {
    return window.localStorage.getItem(OPEN_KEY) !== "0";
  } catch {
    return true;
  }
}
export function writeOpen(next: boolean): void {
  try {
    window.localStorage.setItem(OPEN_KEY, next ? "1" : "0");
  } catch {
    // sans stockage, l'état n'est simplement pas retenu
  }
  openListeners.forEach((l) => l());
}
export function subscribeOpen(listener: () => void): () => void {
  openListeners.add(listener);
  return () => openListeners.delete(listener);
}
