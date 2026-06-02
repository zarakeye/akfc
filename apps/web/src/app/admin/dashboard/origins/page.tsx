"use client";

import { useEffect, type JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useOriginStore } from "@lib/stores/useOriginStore";

export default function OriginsListPage(): JSX.Element {
  const origins = useOriginStore((s) => s.origins);
  const fetchOrigins = useOriginStore((s) => s.fetchOrigins);

  useEffect(() => {
    void fetchOrigins();
  }, [fetchOrigins]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Origines culturelles</h2>
        <Link
          href="/admin/dashboard/origins/create"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une origine
        </Link>
      </div>

      {origins.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucune origine pour le moment. Crée-en une pour pouvoir y
          rattacher tes disciplines, stages et événements.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Drapeau</th>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Slug</th>
                <th className="px-4 py-2 font-medium">Pays / Région</th>
                <th className="px-4 py-2 font-medium">Période</th>
                <th className="px-4 py-2 text-right font-medium">Ordre</th>
              </tr>
            </thead>
            <tbody>
              {origins.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-border hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-lg">{o.flag ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/dashboard/origins/${o.id}`}
                      className="hover:underline"
                    >
                      {o.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {o.slug}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {[o.country, o.region]
                      .filter((p): p is string => Boolean(p))
                      .join(" • ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {o.historicalPeriod ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {o.sortOrder}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}