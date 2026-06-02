"use client";

import { use, useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import type { Stage } from "@prisma/client";

import {
  StageForm,
  type StageFormInput,
} from "@features/admin/stages/forms/StageForm";
import { useStageStore } from "@lib/stores/useStageStore";
import { useStageSessionStore } from "@lib/stores/useStageSessionStore";
import {
  SessionsManager,
  type SessionDraft,
} from "@features/admin/common/components/SessionsManager";

/**
 * Type étendu du Stage avec ses animators inclus (relation chargée
 * par le router via `relationLoadStrategy: "join"`).
 */
type StageWithRelations = Stage & {
  animators?: { id: string }[];
};

export default function EditStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const stageId = Number(id);

  const fetchStageById = useStageStore((s) => s.fetchStageById);
  const updateStage = useStageStore((s) => s.updateStage);
  const deleteStage = useStageStore((s) => s.deleteStage);

  const sessions = useStageSessionStore((s) => s.sessions);
  const fetchSessions = useStageSessionStore((s) => s.fetchByStage);
  const createSession = useStageSessionStore((s) => s.createSession);
  const updateSession = useStageSessionStore((s) => s.updateSession);
  const deleteSession = useStageSessionStore((s) => s.deleteSession);

  const [stage, setStage] = useState<StageWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchStageById(stageId).then((s) => {
      if (!cancelled) {
        setStage(s as StageWithRelations | null);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [stageId, fetchStageById]);

  // Charge les sessions du stage en parallèle du stage lui-même.
  useEffect(() => {
    void fetchSessions(stageId);
  }, [stageId, fetchSessions]);

  const handleSubmit = async (input: StageFormInput): Promise<void> => {
    const updated = await updateStage({
      id: stageId,
      label: input.label,
      audience: input.audience,
      disciplineId: input.disciplineId,
      externalDisciplineLabel: input.externalDisciplineLabel,
      originId: input.originId,
      description: input.description,
      program: input.program,
      preRegistered: input.preRegistered,
      primaryAnimatorId: input.primaryAnimatorId,
      coAnimatorIds: input.coAnimatorIds,
    });
    setStage(updated as StageWithRelations);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    const confirmed = window.confirm(
      "Supprimer ce stage ? Les sessions associées seront aussi supprimées " +
        "(cascade). Cette action est irréversible.",
    );
    if (!confirmed) return;

    try {
      await deleteStage(stageId);
      router.push("/admin/dashboard/stages");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  if (!stage) {
    return (
      <div>
        <Link
          href="/admin/dashboard/stages"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <p className="text-sm">Stage introuvable.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/dashboard/stages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <Link
          href={`/stages/${stage.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Voir la page publique
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Éditer {stage.label}</h2>
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

      <StageForm
        initial={stage}
        onSubmit={handleSubmit}
        submitLabel="Mettre à jour"
      />

      <SessionsManager
        sessions={sessions}
        onCreate={async (draft: SessionDraft) => {
          await createSession({ stageId, ...draft });
        }}
        onUpdate={async (id: number, draft: SessionDraft) => {
          await updateSession({ id, ...draft });
        }}
        onDelete={(id: number) => deleteSession(id)}
      />
    </div>
  );
}