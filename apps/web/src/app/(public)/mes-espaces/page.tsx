"use client";

import {
  type ChangeEvent,
  type JSX,
  useRef,
  useState,
} from "react";

import Finder from "#features/finder-core/components/Finder.tsx";
import SpacesBinPanel from "#features/trash-view/components/SpacesBinPanel.tsx";
import { useFinderStore } from "#features/finder-core/state/useFinderStore.ts";
import { trpc } from "#core/trpc/trpcClient.ts";
import { TRPCClientError } from "@trpc/client";
import { uploadToR2 } from "#features/media/uploadToR2.ts";
import {
  memberFinderAdapter,
  MEMBER_FINDER_ROOT,
} from "#features/finder-adapters/member/memberFinder.adapter.ts";
import { demoSampleFile, useDemoMode } from "#features/demo/demoMode.ts";

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
  // Fichier du même nom déjà présent : on demande avant de le remplacer (nouvelle version).
  const [toReplace, setToReplace] = useState<File | null>(null);

  const createR2 = trpc.storage.createR2Upload.useMutation();
  const registerR2 = trpc.storage.registerR2Upload.useMutation();
  const deposit = trpc.memberDocument.depositToGroupSpace.useMutation();
  // La démo : un PDF d'exemple, pour le visiteur qui n'en a pas sous la main.
  const demo = useDemoMode();

  const space =
    (spaces ?? []).find(
      (s) => currentPath === s.path || currentPath.startsWith(s.path + "/"),
    ) ?? null;

  if (!space || space.access !== "EDITOR") return null;
  const groupId = space.groupId;

  async function send(file: File, allowOverwrite: boolean): Promise<void> {
    setUploadError(null);
    setToReplace(null);
    setUploading(true);
    try {
      const destination = { kind: "group" as const, groupId };

      const registered = await uploadToR2({
        file,
        destination,
        allowOverwrite,
        create: createR2.mutateAsync,
        register: registerR2.mutateAsync,
      });

      // Déjà publié (remplacement) : le serveur le signale, rien à recréer.
      await deposit.mutateAsync({ path: registered.path, groupId });
      useFinderStore.getState().reloadFolderContent();
    } catch (err) {
      if (!allowOverwrite && err instanceof TRPCClientError && err.data?.code === "CONFLICT") {
        setToReplace(file);
      } else {
        setUploadError(err instanceof Error ? err.message : "Le dépôt a échoué.");
      }
    } finally {
      setUploading(false);
    }
  }

  function onFileChosen(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void send(file, false);
  }

  return (
    <div className="mb-3 flex items-center gap-3">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
      >
        {uploading ? "Dépôt en cours…" : `Déposer dans « ${space.name} »`}
      </button>
      {demo && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => {
            demoSampleFile("document-exemple.pdf").then(
              (file) => send(file, false),
              (err: Error) => setUploadError(err.message),
            );
          }}
          data-tour="deposit.sample"
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Document d&apos;exemple
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={onFileChosen}
      />
      {uploadError && (
        <span className="text-sm text-destructive">{uploadError}</span>
      )}
      {toReplace && (
        <span className="flex flex-wrap items-center gap-2 text-sm text-foreground" role="alert">
          « {toReplace.name} » existe déjà. Le remplacer ? L&apos;actuel restera dans ses versions.
          <button
            type="button"
            onClick={() => void send(toReplace, true)}
            data-tour="deposit.replace"
            className="rounded-md bg-brand px-2 py-1 text-xs font-medium text-brand-foreground hover:bg-brand/90"
          >
            Remplacer
          </button>
          <button
            type="button"
            onClick={() => setToReplace(null)}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            Annuler
          </button>
        </span>
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
  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-6xl flex-col p-4">
      <h1 className="mb-4 shrink-0 text-2xl font-semibold">
        Mes espaces collaboratifs
      </h1>
      <MemberDepositBar />
      <SpacesBinPanel />
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
