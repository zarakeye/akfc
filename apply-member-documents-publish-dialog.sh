#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 6b (fondation) : dialogue réutilisable.
#
# Crée `PublishToMembersDialog` — le composant partagé de mise à disposition,
# appelé depuis les 3 surfaces à venir (menu contextuel, formulaire d'upload,
# DnD). Gère : publier (audience à tous / à des membres + destinataires + titre
# optionnel) et retirer (si déjà publié). S'appuie sur `publish`/`unpublish`/
# `listMembers` (increments 2 + 6a).
#
# Ce composant ne fait que le DIALOGUE ; son branchement sur chaque surface
# suit (menu contextuel, puis upload).
#
# Nécessite les increments 1, 2, 6a appliqués.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-publish-dialog.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-publish-dialog.sh
#
set -euo pipefail

DLG="apps/web/src/features/member-documents/PublishToMembersDialog.tsx"

if [ ! -f "package.json" ] || [ ! -d "apps/web/src/features/member-documents" ]; then
  echo "ERREUR: lance depuis la racine, increment 4a appliqué (dossier member-documents attendu)." >&2
  exit 1
fi

if [ -f "$DLG" ]; then
  echo "dialogue déjà présent — laissé tel quel"
else
cat > "$DLG" <<'DLG_EOF'
"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { trpc } from "@trpc/trpcClient";

type Audience = "ALL_MEMBERS" | "SPECIFIC";

export type ExistingPublication = {
  id: string;
  audience: Audience;
} | null;

/**
 * Dialogue de mise à disposition d'un fichier aux membres — réutilisable
 * (menu contextuel, formulaire d'upload, DnD).
 *
 * `path` : chemin logique du fichier (le backend résout le MediaAsset).
 * `existing` : publication en cours si le fichier est déjà à disposition
 * (bascule le dialogue en mode « retirer »).
 */
export function PublishToMembersDialog({
  path,
  defaultTitle,
  existing = null,
  onClose,
  onDone,
}: {
  path: string;
  defaultTitle?: string;
  existing?: ExistingPublication;
  onClose: () => void;
  onDone?: () => void;
}) {
  const utils = trpc.useUtils();
  const [audience, setAudience] = useState<Audience>("ALL_MEMBERS");
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const membersQuery = trpc.memberDocument.listMembers.useQuery(undefined, {
    enabled: !existing && audience === "SPECIFIC",
  });

  const invalidate = () => {
    void utils.memberDocument.listAdmin.invalidate();
    void utils.memberDocument.publicationForPath.invalidate();
    void utils.memberDocument.listForMe.invalidate();
    void utils.memberDocument.unreadCountForMe.invalidate();
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

  const submit = () => {
    setError(null);
    if (audience === "SPECIFIC" && recipientIds.length === 0) {
      setError("Choisissez au moins un destinataire.");
      return;
    }
    publish.mutate({
      path,
      title: title.trim() || undefined,
      audience,
      recipientUserIds: audience === "SPECIFIC" ? recipientIds : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">
            {existing ? "Document à disposition" : "Rendre disponible aux membres"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 px-4 py-4">
          {existing ? (
            <p className="text-sm text-gray-600">
              Ce fichier est déjà à disposition des membres
              {existing.audience === "ALL_MEMBERS"
                ? " (tous les membres)."
                : " (membres sélectionnés)."}
            </p>
          ) : (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Titre affiché (optionnel)
                </p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sinon, le nom du fichier"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Audience</p>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === "ALL_MEMBERS"}
                      onChange={() => setAudience("ALL_MEMBERS")}
                      className="accent-emerald-600"
                    />
                    Tous les membres
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === "SPECIFIC"}
                      onChange={() => setAudience("SPECIFIC")}
                      className="accent-emerald-600"
                    />
                    Des membres précis
                  </label>
                </div>
              </div>

              {audience === "SPECIFIC" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Destinataires
                  </p>
                  <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-gray-200 p-2">
                    {membersQuery.isLoading ? (
                      <p className="px-1 py-2 text-sm text-gray-500">Chargement…</p>
                    ) : (membersQuery.data ?? []).length === 0 ? (
                      <p className="px-1 py-2 text-sm text-gray-500">
                        Aucun membre.
                      </p>
                    ) : (
                      (membersQuery.data ?? []).map((m) => (
                        <label
                          key={m.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={recipientIds.includes(m.id)}
                            onChange={() => toggleRecipient(m.id)}
                            className="accent-emerald-600"
                          />
                          {m.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Annuler
          </button>
          {existing ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                unpublish.mutate({ id: existing.id });
              }}
              disabled={busy}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              Retirer des documents
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              Mettre à disposition
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
DLG_EOF
echo "PublishToMembersDialog créé"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): dialogue réutilisable de mise à disposition (publish/unpublish)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi