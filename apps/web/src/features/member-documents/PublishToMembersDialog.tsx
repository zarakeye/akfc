"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";

type Audience = "ALL_MEMBERS" | "SPECIFIC";

/**
 * Dialogue de mise à disposition d'un fichier aux membres — réutilisable
 * (menu contextuel, formulaire d'upload, DnD).
 *
 * `path` : chemin logique du fichier (le backend résout le MediaAsset). Le
 * dialogue interroge lui-même l'état de publication : mode « publier » si le
 * fichier n'est pas encore à disposition, mode « retirer » sinon.
 */
export function PublishToMembersDialog({
  path,
  defaultTitle,
  onClose,
  onDone,
}: {
  path: string;
  defaultTitle?: string;
  onClose: () => void;
  onDone?: () => void;
}) {
  const utils = trpc.useUtils();
  const [audience, setAudience] = useState<Audience>("ALL_MEMBERS");
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pubQuery = trpc.memberDocument.publicationForPath.useQuery({ path });
  const publication = pubQuery.data ?? null;

  const membersQuery = trpc.memberDocument.listMembers.useQuery(undefined, {
    enabled: !publication && audience === "SPECIFIC",
  });
  const groupsQuery = trpc.memberGroup.list.useQuery(undefined, {
    enabled: !publication && audience === "SPECIFIC",
  });

  const invalidate = () => {
    void utils.memberDocument.listAdmin.invalidate();
    void utils.memberDocument.publicationForPath.invalidate();
    void utils.memberDocument.listForMe.invalidate();
    void utils.memberDocument.unreadCountForMe.invalidate();
    void utils.memberDocument.unreadBreakdownForMe.invalidate();
  };
  const done = () => {
    invalidate();
    onDone?.();
    onClose();
  };

  const publish = trpc.memberDocument.publish.useMutation({
    onSuccess: done,
    onError: (e) => setError(e.message),
  });
  const unpublish = trpc.memberDocument.unpublish.useMutation({
    onSuccess: done,
    onError: (e) => setError(e.message),
  });

  const busy = publish.isPending || unpublish.isPending;

  const toggleRecipient = (id: string) =>
    setRecipientIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  const toggleGroup = (id: string) =>
    setGroupIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );

  const submit = () => {
    setError(null);
    if (
      audience === "SPECIFIC" &&
      recipientIds.length === 0 &&
      groupIds.length === 0
    ) {
      setError("Choisissez au moins un groupe ou un membre.");
      return;
    }
    publish.mutate({
      path,
      title: title.trim() || undefined,
      audience,
      recipientUserIds: audience === "SPECIFIC" ? recipientIds : undefined,
      groupIds: audience === "SPECIFIC" ? groupIds : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">
            {publication
              ? "Document à disposition"
              : "Rendre disponible aux membres"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 px-4 py-4">
          {pubQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : publication ? (
            <p className="text-sm text-muted-foreground">
              Ce fichier est déjà à disposition des membres
              {publication.audience === "ALL_MEMBERS"
                ? " (tous les membres)."
                : " (membres sélectionnés)."}
            </p>
          ) : (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Titre affiché (optionnel)
                </p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sinon, le nom du fichier"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Audience</p>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === "ALL_MEMBERS"}
                      onChange={() => setAudience("ALL_MEMBERS")}
                      className="accent-brand"
                    />
                    Tous les membres
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === "SPECIFIC"}
                      onChange={() => setAudience("SPECIFIC")}
                      className="accent-brand"
                    />
                    Des membres précis
                  </label>
                </div>
              </div>

              {audience === "SPECIFIC" && (
                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Groupes
                    </p>
                    <div className="max-h-40 space-y-1 overflow-auto rounded-lg border border-border p-2">
                      {groupsQuery.isLoading ? (
                        <p className="px-1 py-2 text-sm text-muted-foreground">
                          Chargement…
                        </p>
                      ) : (groupsQuery.data ?? []).length === 0 ? (
                        <p className="px-1 py-2 text-sm text-muted-foreground">
                          Aucun groupe.
                        </p>
                      ) : (
                        (groupsQuery.data ?? []).map((g) => (
                          <label
                            key={g.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-foreground hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={groupIds.includes(g.id)}
                              onChange={() => toggleGroup(g.id)}
                              className="accent-brand"
                            />
                            {g.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Membres
                    </p>
                    <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-border p-2">
                      {membersQuery.isLoading ? (
                        <p className="px-1 py-2 text-sm text-muted-foreground">
                          Chargement…
                        </p>
                      ) : (membersQuery.data ?? []).length === 0 ? (
                        <p className="px-1 py-2 text-sm text-muted-foreground">
                          Aucun membre.
                        </p>
                      ) : (
                        (membersQuery.data ?? []).map((m) => (
                          <label
                            key={m.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-foreground hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={recipientIds.includes(m.id)}
                              onChange={() => toggleRecipient(m.id)}
                              className="accent-brand"
                            />
                            {m.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Annuler
          </button>
          {publication ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                unpublish.mutate({ id: publication.id });
              }}
              disabled={busy}
              className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              Retirer des documents
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={busy || pubQuery.isLoading}
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
            >
              Mettre à disposition
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
