"use client";

import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

/**
 * Bandeau de succès + redirection.
 *
 * À afficher quand une server action / mutation a réussi. Montre un message
 * de succès et un bouton « OK » qui embarque un countdown : au clic OU à
 * l'expiration du compte à rebours, on redirige vers `target` (typiquement la
 * page de présentation `[id]` de l'entité).
 *
 * `seconds` (défaut 3) laisse à l'utilisateur le temps de prendre conscience
 * de l'action sans le faire attendre.
 */
export function SuccessRedirect({
  target,
  message = "Enregistré avec succès.",
  seconds = 3,
}: {
  target: string;
  message?: string;
  seconds?: number;
}): JSX.Element {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      router.push(target);
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, router, target]);

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      <span className="flex-1 text-sm text-emerald-800">{message}</span>
      <button
        type="button"
        onClick={() => router.push(target)}
        className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
      >
        OK — {remaining}s
      </button>
    </div>
  );
}