"use client";

import { type JSX } from "react";

import { trpc } from "@trpc/trpcClient";
import { PAGE_REGISTRY, ALL_PAGE_KEYS } from "@/config/pageRegistry";

/**
 * Centre de contrôle « Publication des pages » (mode « En construction »).
 *
 * Une page non publiée n'est visible que des administrateurs ; publiée, elle
 * l'est du public/des membres. Toggle par page + actions globales.
 */
export default function PagesControlPage(): JSX.Element {
  const utils = trpc.useUtils();
  const { data: states, isLoading } = trpc.pageVisibility.all.useQuery();

  const invalidate = () => void utils.pageVisibility.all.invalidate();
  const setPublished = trpc.pageVisibility.setPublished.useMutation({
    onSuccess: invalidate,
  });
  const setAll = trpc.pageVisibility.setAll.useMutation({ onSuccess: invalidate });

  const publishedByKey = new Map(
    (states ?? []).map((s) => [s.key, s.published] as const),
  );
  const isPublished = (key: string): boolean => publishedByKey.get(key) ?? false;

  const busy = setPublished.isPending || setAll.isPending;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Publication des pages</h1>
      <p className="mb-6 text-sm text-gray-600">
        Une page « en construction » n'est visible que des administrateurs.
        Publiez-la quand elle est prête.
      </p>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <span className="font-medium">Toutes les pages</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setAll.mutate({ keys: [...ALL_PAGE_KEYS], published: true })
            }
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            Tout publier
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setAll.mutate({ keys: [...ALL_PAGE_KEYS], published: false })
            }
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            Tout en construction
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <ul className="space-y-1">
          {PAGE_REGISTRY.map((p) => {
            const pub = isPublished(p.key);
            return (
              <li
                key={p.key}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
              >
                <div>
                  <span className="font-medium">{p.label}</span>
                  <span className="ml-2 text-xs text-gray-400">{p.path}</span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setPublished.mutate({ key: p.key, published: !pub })
                  }
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 " +
                    (pub
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200")
                  }
                >
                  {pub ? "Publiée" : "En construction"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
