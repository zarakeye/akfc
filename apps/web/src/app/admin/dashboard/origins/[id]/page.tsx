"use client";

import { use, useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Origin } from "@prisma/client";

import {
  OriginForm,
  type OriginFormInput,
} from "@features/admin/origins/forms/OriginForm";
import { useOriginStore } from "@lib/stores/useOriginStore";

export default function EditOriginPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const originId = Number(id);

  const fetchOriginById = useOriginStore((s) => s.fetchOriginById);
  const updateOrigin = useOriginStore((s) => s.updateOrigin);
  const deleteOrigin = useOriginStore((s) => s.deleteOrigin);

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchOriginById(originId).then((o) => {
      if (!cancelled) {
        setOrigin(o);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [originId, fetchOriginById]);

  const handleSubmit = async (input: OriginFormInput): Promise<void> => {
    const updated = await updateOrigin({
      id: originId,
      ...input,
    });
    setOrigin(updated);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    const confirmed = window.confirm(
      "Supprimer cette origine ? Cette action est irréversible.",
    );
    if (!confirmed) return;

    try {
      await deleteOrigin(originId);
      router.push("/admin/dashboard/origins");
    } catch (err) {
      // Le router renvoie CONFLICT si des disciplines/stages/events
      // pointent encore vers cette origine — message exposé à l'admin
      // pour qu'il sache quoi détacher d'abord.
      setDeleteError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  if (!origin) {
    return (
      <div>
        <Link
          href="/admin/dashboard/origins"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
        <p className="text-sm">Origine introuvable.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/dashboard/origins"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Éditer {origin.flag ? `${origin.flag} ` : ""}
          {origin.name}
        </h2>
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

      <OriginForm
        initial={origin}
        onSubmit={handleSubmit}
        submitLabel="Mettre à jour"
      />
    </div>
  );
}