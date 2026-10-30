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
import { uploadToR2 } from "@features/media/uploadToR2";
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

      const registered = await uploadToR2({
        file,
        destination,
        create: createR2.mutateAsync,
        register: registerR2.mutateAsync,
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
