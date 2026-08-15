#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, 2c (FRONT) : dépôt membre dans l'espace.
#
# Réécrit `(public)/mes-espaces/[groupId]/page.tsx` : conserve le parcours en
# lecture (2b) et ajoute, POUR LES ÉDITEURS uniquement, un bouton « Ajouter un
# document » qui exécute la séquence R2 (createR2Upload → PUT présigné →
# registerR2Upload, destination `kind:"group"`) puis appelle
# `depositToGroupSpace` (socle Option B) → le fichier devient un MemberDocument
# ciblé sur le groupe (reçus/badges/cloche s'appliquent) et apparaît dans le
# finder.
#
# v1 volontairement bornée : documents PDF, dépôt à la RACINE de l'espace du
# groupe (la destination `kind:"group"` résout la base). Images/vidéos
# (Cloudinary) et dépôt dans le sous-dossier courant = itérations suivantes.
#
# FRONT non testé ici → à valider à l'écran. Prérequis : 1a, 1b, 2b, et le socle
# `apply-collab-2c-socle-deposit.sh`. Pas de migration.
# Usage : bash apply-collab-2c-front-deposit.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-2c-front-deposit.sh   (clone)
#
set -euo pipefail

PAGE="apps/web/src/app/(public)/mes-espaces/[groupId]/page.tsx"

if [ ! -f "package.json" ] || [ ! -d "apps/web/src/app/(public)/mes-espaces" ]; then
  echo "ERREUR: lance depuis la racine ; 2a/2b doivent être appliqués." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

mkdir -p "apps/web/src/app/(public)/mes-espaces/[groupId]"

cat > "$PAGE" <<'EOF'
"use client";

import { JSX, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CornerLeftUp,
  Folder as FolderIcon,
  FileText,
  Upload,
} from "lucide-react";

import { trpc } from "@trpc/trpcClient";

/**
 * Espace collaboratif d'un groupe — page MEMBRE `(public)/mes-espaces/[groupId]`.
 *
 * Parcours en lecture (getTree rooté, garde 1e) + dépôt de document pour les
 * ÉDITEURS : séquence R2 (createR2Upload → PUT → registerR2Upload,
 * destination `kind:"group"`) puis `depositToGroupSpace` (le fichier devient un
 * MemberDocument ciblé sur le groupe). v1 : PDF, dépôt à la racine de l'espace.
 */
export default function EspacePage(): JSX.Element {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const utils = trpc.useUtils();

  const spacesQuery = trpc.storage.myCollaborativeSpaces.useQuery();
  const space =
    (spacesQuery.data ?? []).find((s) => s.groupId === groupId) ?? null;

  const [path, setPath] = useState<string | null>(null);
  const currentPath = path ?? space?.path ?? null;

  const treeQuery = trpc.storage.getTree.useQuery(
    { path: currentPath ?? "", depth: 1 },
    { enabled: Boolean(currentPath) },
  );

  const createR2 = trpc.storage.createR2Upload.useMutation();
  const registerR2 = trpc.storage.registerR2Upload.useMutation();
  const deposit = trpc.memberDocument.depositToGroupSpace.useMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (spacesQuery.isLoading) {
    return <div className="mx-auto max-w-3xl p-6">Chargement…</div>;
  }
  if (!space) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Link
          href="/mes-espaces"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Mes espaces
        </Link>
        <p className="mt-6 text-sm text-gray-500">
          Espace introuvable ou inaccessible.
        </p>
      </div>
    );
  }

  const children = treeQuery.data?.root.children ?? [];
  const atRoot = currentPath === space.path;
  const canEdit = space.access === "EDITOR";

  const goUp = (): void => {
    if (!currentPath || atRoot) return;
    const parent = currentPath.split("/").slice(0, -1).join("/");
    setPath(parent.length >= space.path.length ? parent : space.path);
  };

  const onFileChosen = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const destination = { kind: "group" as const, groupId };

      const auth = await createR2.mutateAsync({
        destination,
        originalFileName: file.name,
        mimeType: file.type,
        maxBytes: file.size,
      });

      const res = await fetch(auth.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) {
        throw new Error(`Envoi échoué (HTTP ${res.status}).`);
      }

      const registered = await registerR2.mutateAsync({
        path: auth.path,
        expectedBytes: file.size,
        expectedMimeType: file.type,
        destination,
        originalFileName: file.name,
      });

      await deposit.mutateAsync({ path: registered.path, groupId });
      await utils.storage.getTree.invalidate();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Le dépôt a échoué.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href="/mes-espaces"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" /> Mes espaces
      </Link>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{space.name}</h1>
        <div className="flex items-center gap-3">
          <span
            className={
              "rounded-full px-2 py-0.5 text-xs font-medium " +
              (canEdit
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600")
            }
          >
            {canEdit ? "éditeur" : "lecteur"}
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Dépôt…" : "Ajouter un document"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onFileChosen}
          />
        </div>
      </div>

      {uploadError && (
        <p className="mb-3 text-sm text-red-600">{uploadError}</p>
      )}

      {!atRoot && (
        <button
          type="button"
          onClick={goUp}
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:underline"
        >
          <CornerLeftUp className="h-4 w-4" /> Dossier parent
        </button>
      )}

      {treeQuery.isLoading && (
        <p className="text-sm text-gray-500">Chargement du dossier…</p>
      )}
      {treeQuery.isError && (
        <p className="text-sm text-red-600">Impossible de lire ce dossier.</p>
      )}
      {treeQuery.data && children.length === 0 && (
        <p className="text-sm text-gray-500">Dossier vide.</p>
      )}

      <ul className="space-y-1">
        {children.map((child) =>
          child.type === "folder" ? (
            <li key={child.path}>
              <button
                type="button"
                onClick={() => setPath(child.path)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
              >
                <FolderIcon className="h-4 w-4 shrink-0 text-gray-400" />
                {child.name}
              </button>
            </li>
          ) : (
            <li
              key={child.path}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
            >
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              {child.name}
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
EOF
echo "réécrit : $PAGE"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(groups): dépôt membre dans l'espace (upload R2 kind:group -> depositToGroupSpace)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valide à l'écran : /mes-espaces → un espace (éditeur) → Ajouter un document (PDF)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi