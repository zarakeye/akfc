#!/usr/bin/env bash
#
# AKFC — Finder membre (b'), BRIQUE 4 (finale) : câblage de /mes-espaces.
#
# `(public)/mes-espaces/page.tsx` réécrit : rend le VRAI `Finder` en mode membre
#   <Finder adapter={memberFinderAdapter} rootPath={MEMBER_FINDER_ROOT} readOnly />
# — donc toute la richesse visuelle (arbre + grille + preview + recherche…),
# enraciné sur la racine virtuelle « Mes espaces » (tes groupes top-level +
# descendants). Positionne `currentPath` sur la racine virtuelle au montage
# (le store s'initialise sinon sur l'appRoot). Superpose une barre de DÉPÔT
# (flux 2c : createR2Upload → PUT → registerR2Upload → depositToGroupSpace) qui
# cible l'espace COURANT du finder si le membre y est ÉDITEUR, puis rafraîchit
# via `reloadFolderContent()`. Remplace la liste allégée (3c).
#
# Prérequis : brique 1 (readOnly) + brique 3 (memberFinderAdapter) + 2c (mutations
# createR2Upload/registerR2Upload/depositToGroupSpace) + notif/passerelle.
# FRONT NON testé → valider + prévoir une itération (hauteur du conteneur,
# rafraîchissement après dépôt). Pas de migration.
# Usage : bash apply-member-finder-4-wire.sh
#         AKFC_APPLY_ONLY=1 bash apply-member-finder-4-wire.sh   (clone)
#
set -euo pipefail

PAGE="apps/web/src/app/(public)/mes-espaces/page.tsx"

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance depuis la racine du repo." >&2
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

mkdir -p "$(dirname "$PAGE")"
cat > "$PAGE" <<'TSX'
"use client";

import {
  type ChangeEvent,
  type JSX,
  useEffect,
  useRef,
  useState,
} from "react";

import Finder from "@features/finder-core/components/Finder";
import { useFinderStore } from "@features/finder-core/state/useFinderStore";
import { trpc } from "@trpc/trpcClient";
import {
  memberFinderAdapter,
  MEMBER_FINDER_ROOT,
} from "@features/finder-adapters/member/memberFinder.adapter";

/**
 * Barre de DÉPÔT superposée au finder membre. Cible l'espace COURANT (déduit de
 * `currentPath`) si le membre y est ÉDITEUR. Flux R2 identique au dépôt 2c, puis
 * `reloadFolderContent()` pour rafraîchir l'arbre (l'adaptateur re-fetch).
 */
function MemberDepositBar(): JSX.Element | null {
  const currentPath = useFinderStore((s) => s.currentPath);
  const { data: spaces } = trpc.storage.myCollaborativeSpaces.useQuery();

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const createR2 = trpc.storage.createR2Upload.useMutation();
  const registerR2 = trpc.storage.registerR2Upload.useMutation();
  const deposit = trpc.memberDocument.depositToGroupSpace.useMutation();

  const space =
    (spaces ?? []).find(
      (s) => currentPath === s.path || currentPath.startsWith(s.path + "/"),
    ) ?? null;

  if (!space || space.access !== "EDITOR") return null;
  const groupId = space.groupId;

  async function onFileChosen(e: ChangeEvent<HTMLInputElement>): Promise<void> {
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
      if (!res.ok) throw new Error(`Envoi échoué (HTTP ${res.status}).`);

      const registered = await registerR2.mutateAsync({
        path: auth.path,
        expectedBytes: file.size,
        expectedMimeType: file.type,
        destination,
        originalFileName: file.name,
      });

      await deposit.mutateAsync({ path: registered.path, groupId });
      useFinderStore.getState().reloadFolderContent();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Le dépôt a échoué.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-3 flex items-center gap-3">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Dépôt en cours…" : `Déposer dans « ${space.name} »`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={onFileChosen}
      />
      {uploadError && (
        <span className="text-sm text-red-600">{uploadError}</span>
      )}
    </div>
  );
}

/**
 * « Mes espaces » — finder MEMBRE calqué sur le finder admin (lecture seule),
 * enraciné sur la racine virtuelle dont les enfants sont les groupes de plus
 * haut niveau accessibles (racines multiples gérées). Dépôt superposé.
 */
export default function MesEspacesPage(): JSX.Element {
  useEffect(() => {
    // Le store s'initialise sur l'appRoot ; on le place sur la racine virtuelle.
    useFinderStore.getState().setPath(MEMBER_FINDER_ROOT);
  }, []);

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-6xl flex-col p-4">
      <h1 className="mb-4 shrink-0 text-2xl font-semibold">
        Mes espaces collaboratifs
      </h1>
      <MemberDepositBar />
      <div className="min-h-0 flex-1">
        <Finder
          adapter={memberFinderAdapter}
          rootPath={MEMBER_FINDER_ROOT}
          readOnly
        />
      </div>
    </div>
  );
}
TSX
echo "page réécrite : $PAGE"

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
if git commit -m "feat(finder): /mes-espaces = Finder membre (readOnly + racine virtuelle + dépôt) — b' complet" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Valider : /mes-espaces affiche le finder riche enraciné sur tes groupes top-level ; navigation, preview ; dépôt dans un espace où tu es éditeur."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi