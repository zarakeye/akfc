"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";

import { trpc } from "@trpc/trpcClient";
import { PAGE_REGISTRY } from "@/config/pageRegistry";

/**
 * Hub « Pages éditoriales » — pages au contenu PROPRE (non dynamiques, non
 * alimentées par un autre éditeur). Chaque page : badge d'état, accès à son
 * constructeur, et publication / retour en brouillon.
 */
export default function EditorialPagesHub(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: states, isLoading } = trpc.pageVisibility.all.useQuery();
  const setPublished = trpc.pageVisibility.setPublished.useMutation({
    onSuccess: () => void utils.pageVisibility.all.invalidate(),
  });

  const publishedByKey = new Map(
    (states ?? []).map((s) => [s.key, s.published] as const),
  );
  const isPublished = (key: string): boolean => publishedByKey.get(key) ?? false;
  const busy = setPublished.isPending;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">Pages éditoriales</h1>
      <p className="mb-6 text-sm text-gray-600">
        Pages au contenu propre, non alimentées par un autre éditeur. Composez-les
        dans leur constructeur, puis publiez-les. Une page en brouillon n’est
        visible que des administrateurs.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <ul className="space-y-2">
          {PAGE_REGISTRY.map((p) => {
            const pub = isPublished(p.key);
            return (
              <li
                key={p.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.label}</span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-semibold " +
                        (pub
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {pub ? "Publiée" : "Brouillon"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{p.path}</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/site-pages/${p.key}`)
                    }
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setPublished.mutate({ key: p.key, published: !pub })
                    }
                    className={
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 " +
                      (pub
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700")
                    }
                  >
                    {pub ? "Repasser en brouillon" : "Publier"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
