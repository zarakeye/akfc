"use client";

import { use, useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import type { Discipline } from "@prisma/client";

import {
  DisciplineForm,
  type DisciplineFormInput,
} from "@features/admin/disciplines/forms/DisciplineForm";
import { useDisciplineStore } from "@lib/stores/useDisciplineStore";

export default function EditDisciplinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const disciplineId = Number(id);

  const fetchDisciplineById = useDisciplineStore((s) => s.fetchDisciplineById);
  const updateDiscipline = useDisciplineStore((s) => s.updateDiscipline);
  const deleteDiscipline = useDisciplineStore((s) => s.deleteDiscipline);

  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchDisciplineById(disciplineId).then((d) => {
      if (!cancelled) {
        setDiscipline(d);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [disciplineId, fetchDisciplineById]);

  const handleSubmit = async (input: DisciplineFormInput): Promise<void> => {
    // Types alignés : description: PageContentV1 partout. Pas de cast.
    const updated = await updateDiscipline({
      id: disciplineId,
      name: input.name,
      type: input.type,
      family: input.family,
      school: input.school,
      classification: input.classification,
      originId: input.originId,
      description: input.description,
      instructorId: input.instructorId,
      // Note : categoryId n'est pas modifiable au router, on ne l'envoie pas
    });
    setDiscipline(updated);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    const confirmed = window.confirm(
      "Supprimer cette discipline ? Cette action est irréversible.",
    );
    if (!confirmed) return;

    try {
      await deleteDiscipline(disciplineId);
      router.push("/admin/dashboard/disciplines");
    } catch (err) {
      // Le router renvoie CONFLICT si des courses/stages/events/mediaAssets
      // pointent encore vers la discipline — diagnostic exposé tel quel.
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  if (!discipline) {
    return (
      <div>
        <Link
          href="/admin/dashboard/disciplines"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <p className="text-sm">Discipline introuvable.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/dashboard/disciplines"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <Link
          href={`/disciplines/${discipline.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Voir la page publique
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Éditer {discipline.name}</h2>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>

      {deleteError && (
        <pre className="mb-4 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {deleteError}
        </pre>
      )}

      <DisciplineForm
        initial={discipline}
        onSubmit={handleSubmit}
        submitLabel="Mettre à jour"
      />
    </div>
  );
}