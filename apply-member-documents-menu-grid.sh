#!/usr/bin/env bash
#
# AKFC — Documents membres, 6b (menu contextuel, vue GRILLE) : preuve verticale.
#
#   - `PublishToMembersDialog` : interroge lui-même `publicationForPath` →
#     mode « publier » ou « retirer », plus besoin de le lui passer ;
#   - GridItem : item de menu « Rendre disponible aux membres » (admin +
#     fichier uniquement), qui ouvre le dialogue (état local `publishTarget`,
#     rendu à côté du MoveDialog — même motif que le déplacement).
#
# Une seule vue câblée pour l'instant (grille) : je ne peux pas tester le front,
# donc on valide le rendu ici avant de répliquer à l'arbre / tableau / liste.
#
# Nécessite les increments 1, 2, 6a + le dialogue (fondation) appliqués.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-menu-grid.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-menu-grid.sh
#
set -euo pipefail

DLG="apps/web/src/features/member-documents/PublishToMembersDialog.tsx"
GRID="apps/web/src/features/finder-core/components/GridItem.tsx"

if [ ! -f "package.json" ] || [ ! -f "$GRID" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($GRID attendu)." >&2
  exit 1
fi

# ── 1) Dialogue auto-renseigné (réécrit) ────────────────────────────────────
cat > "$DLG" <<'DLG_EOF'
"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { trpc } from "@trpc/trpcClient";

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
  const [error, setError] = useState<string | null>(null);

  const pubQuery = trpc.memberDocument.publicationForPath.useQuery({ path });
  const publication = pubQuery.data ?? null;

  const membersQuery = trpc.memberDocument.listMembers.useQuery(undefined, {
    enabled: !publication && audience === "SPECIFIC",
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
            {publication
              ? "Document à disposition"
              : "Rendre disponible aux membres"}
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
          {pubQuery.isLoading ? (
            <p className="text-sm text-gray-500">Chargement…</p>
          ) : publication ? (
            <p className="text-sm text-gray-600">
              Ce fichier est déjà à disposition des membres
              {publication.audience === "ALL_MEMBERS"
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
          {publication ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                unpublish.mutate({ id: publication.id });
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
              disabled={busy || pubQuery.isLoading}
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
echo "dialogue auto-renseigné écrit"

# ── 2) Câblage GridItem ─────────────────────────────────────────────────────
python3 - "$GRID" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "PublishToMembersDialog" in s:
    print("GridItem déjà câblé"); sys.exit(0)

# imports
A_OLD = "import { MoveDialog } from '@features/finder-core/components/MoveDialog';"
A_NEW = ("import { MoveDialog } from '@features/finder-core/components/MoveDialog';\n"
         "import { PublishToMembersDialog } from '@features/member-documents/PublishToMembersDialog';\n"
         "import { storagePathOf } from '@features/finder-core/utils/storagePath';\n"
         "import { useSessionStore } from '@lib/stores/useSessionStore';")
assert s.count(A_OLD) == 1, "ancre import GridItem introuvable — abandon"
s = s.replace(A_OLD, A_NEW)

# état publishTarget
B_OLD = "  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);"
B_NEW = ("  const [movingNodes, setMovingNodes] = useState<FinderNode[] | null>(null);\n"
         "  const [publishTarget, setPublishTarget] = useState<FinderNode | null>(null);")
assert s.count(B_OLD) == 1, "ancre state GridItem introuvable — abandon"
s = s.replace(B_OLD, B_NEW)

# isAdmin
C_OLD = "  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode, moveNodes } = useNodeActions();"
C_NEW = ("  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode, moveNodes } = useNodeActions();\n"
         "  const isAdmin = useSessionStore((st) => st.session?.user?.role?.name === 'ADMIN');")
assert s.count(C_OLD) == 1, "ancre useNodeActions GridItem introuvable — abandon"
s = s.replace(C_OLD, C_NEW)

# item de menu (après Déplacer…)
D_OLD = r'''      {
        label: 'Déplacer…',
        onClick: () => setMovingNodes(targetNodes),
      },'''
D_NEW = r'''      {
        label: 'Déplacer…',
        onClick: () => setMovingNodes(targetNodes),
      },
      ...(isAdmin && !isFolder && !isStatus
        ? [
            {
              label: 'Rendre disponible aux membres',
              onClick: () => setPublishTarget(node),
            } as ContextMenuItem,
          ]
        : []),'''
assert s.count(D_OLD) == 1, "ancre item Déplacer introuvable — abandon"
s = s.replace(D_OLD, D_NEW)

# rendu du dialogue (après le MoveDialog)
E_OLD = r'''            setMovingNodes(null);
          }}
        />
      )}

      {menuPos && ('''
E_NEW = r'''            setMovingNodes(null);
          }}
        />
      )}

      {publishTarget && (
        <PublishToMembersDialog
          path={storagePathOf(publishTarget)}
          defaultTitle={publishTarget.name}
          onClose={() => setPublishTarget(null)}
        />
      )}

      {menuPos && ('''
assert s.count(E_OLD) == 1, "ancre rendu MoveDialog introuvable — abandon"
s = s.replace(E_OLD, E_NEW)

p.write_text(s, encoding="utf-8"); print("GridItem câblé")
PY

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
if git commit -m "feat(documents): action « Rendre disponible aux membres » dans le menu contextuel (grille)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi