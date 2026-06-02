"use client";

import { useEffect, type JSX } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useStageStore } from "@lib/stores/useStageStore";

const AUDIENCE_LABELS: Record<string, string> = {
  KIDS: "Enfants",
  TEENAGERS: "Ados",
  ADULTS: "Adultes",
  ALL_AGES: "Tous publics",
};

export default function StagesListPage(): JSX.Element {
  const stages = useStageStore((s) => s.stages);
  const fetchStages = useStageStore((s) => s.fetchStages);

  useEffect(() => {
    void fetchStages();
  }, [fetchStages]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stages</h2>
        <Link
          href="/admin/dashboard/stages/create"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Créer un stage
        </Link>
      </div>

      {stages.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aucun stage pour le moment.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Label</th>
                <th className="px-4 py-2 font-medium">Audience</th>
                <th className="px-4 py-2 font-medium">Rattachement</th>
                <th className="px-4 py-2 font-medium">Animateur principal</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s) => {
                const attachment = formatAttachment(s);
                return (
                  <tr
                    key={s.id}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/admin/dashboard/stages/${s.id}`}
                        className="hover:underline"
                      >
                        {s.label}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {AUDIENCE_LABELS[s.audience] ?? s.audience}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {attachment}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      #{s.primaryAnimatorId.slice(0, 8)}…
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Formate le rattachement d'un stage en une chaîne lisible :
 * « Discipline #5 » ou « ext: Calligraphie chinoise » ou « Origine #3 »
 * ou combinaison.
 */
function formatAttachment(stage: {
  disciplineId: number | null;
  externalDisciplineLabel: string | null;
  originId: number | null;
}): string {
  const parts: string[] = [];
  if (stage.disciplineId !== null) parts.push(`Discipline #${stage.disciplineId}`);
  if (stage.externalDisciplineLabel)
    parts.push(`ext: ${stage.externalDisciplineLabel}`);
  if (stage.originId !== null) parts.push(`Origine #${stage.originId}`);
  return parts.length > 0 ? parts.join(" • ") : "—";
}