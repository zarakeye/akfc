"use client";

import { type JSX } from "react";
import { useRouter } from "next/navigation";

import { trpc } from "#core/trpc/trpcClient.ts";
import { PAGE_REGISTRY } from "#config/pageRegistry.ts";

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
      <p className="mb-6 text-sm text-muted-foreground">
        Pages au contenu propre, non alimentées par un autre éditeur. Composez-les
        dans leur constructeur, puis publiez-les. Une page en brouillon n’est
        visible que des administrateurs.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <ul className="space-y-2" data-tour="pages.list">
          {PAGE_REGISTRY.map((p) => {
            const pub = isPublished(p.key);
            return (
              <li
                key={p.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.label}</span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-semibold " +
                        (pub
                          ? "bg-success-muted text-success"
                          : "bg-warning-muted text-warning")
                      }
                    >
                      {pub ? "Publiée" : "Brouillon"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{p.path}</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    data-tour="pages.item.edit"
                    onClick={() =>
                      router.push(`/dashboard/site-pages/${p.key}`)
                    }
                    className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    data-tour="pages.item.publish"
                    disabled={busy}
                    onClick={() =>
                      setPublished.mutate({ key: p.key, published: !pub })
                    }
                    className={
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 " +
                      (pub
                        ? "bg-warning-muted text-warning hover:bg-warning/20"
                        : "bg-brand text-brand-foreground hover:bg-brand/90")
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
