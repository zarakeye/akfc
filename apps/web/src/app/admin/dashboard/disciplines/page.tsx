"use client";

import { useEffect, type JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useDisciplineStore } from "@lib/stores/useDisciplineStore";

const TYPE_LABELS: Record<string, string> = {
  MARTIAL_ART: "Art martial",
  CALLIGRAPHY: "Calligraphie",
};

export default function DisciplinesListPage(): JSX.Element {
  const disciplines = useDisciplineStore((s) => s.disciplines);
  const fetchDisciplines = useDisciplineStore((s) => s.fetchDisciplines);

  useEffect(() => {
    void fetchDisciplines();
  }, [fetchDisciplines]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Disciplines</h2>
        <Link
          href="/admin/dashboard/disciplines/create"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer une discipline
        </Link>
      </div>

      {disciplines.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucune discipline pour le moment. Crée-en une pour commencer.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">École</th>
                <th className="px-4 py-2 font-medium">Catégorie</th>
                <th className="px-4 py-2 font-medium">Origine</th>
              </tr>
            </thead>
            <tbody>
              {disciplines.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-border hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/dashboard/disciplines/${d.id}`}
                      className="hover:underline"
                    >
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {TYPE_LABELS[d.type] ?? d.type}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {d.school ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    Cat. #{d.categoryId}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {d.originId ? `#${d.originId}` : "—"}
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