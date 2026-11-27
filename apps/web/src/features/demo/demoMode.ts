import { useSyncExternalStore } from "react";

/**
 * La démo est-elle là ? `DEMO_MODE` ne se lit que sur le serveur ; le panneau de la démo, rendu
 * seulement dans la démo, le signale ici en s'affichant. Ce qui n'existe que pour la démo (les
 * fichiers d'exemple) le lit, sans dépendre du panneau.
 */
let demo = false;
const listeners = new Set<() => void>();

export function markDemoMode(): void {
  if (demo) return;
  demo = true;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemoMode(): boolean {
  return useSyncExternalStore(subscribe, () => demo, () => false);
}

/**
 * Un fichier d'exemple (apps/web/public/demo) : le visiteur n'a pas forcément d'image ni de PDF
 * sous la main. Il passe par le même chemin qu'un fichier choisi sur l'ordinateur.
 */
export async function demoSampleFile(name: "image-exemple.jpg" | "document-exemple.pdf"): Promise<File> {
  const res = await fetch(`/demo/${name}`);
  if (!res.ok) throw new Error("Fichier d'exemple introuvable.");
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || (name.endsWith(".pdf") ? "application/pdf" : "image/jpeg") });
}
