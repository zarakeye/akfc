"use client";

import { useState, type JSX } from "react";

import { trpc } from "@trpc/trpcClient";
import { PageBuilder } from "@features/page-builder";
import {
  parsePageContentV1,
  emptyPageContentV1,
  type PageContentV1,
} from "@contracts/page";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

/**
 * Éditeur de la présentation publique d'un instructeur, sur SON profil.
 *
 * Ne s'affiche que si l'utilisateur est titulaire — la question est posée au
 * backend (`getMyInstructorState`), jamais devinée ici. La sauvegarde passe
 * par `saveMyInstructorBio`, dont la cible est l'utilisateur de session : on
 * n'edite que soi, structurellement.
 *
 * Montage du builder identique a DisciplineForm : meme composant controle,
 * meme parse, meme adapter. Le format en base est un Json, comme la
 * description de discipline — rien a convertir.
 */
export function InstructorBioEditor(): JSX.Element | null {
  const state = trpc.user.getMyInstructorState.useQuery();
  const utils = trpc.useUtils();
  const save = trpc.user.saveMyInstructorBio.useMutation({
    onSuccess: () => {
      void utils.user.getMyInstructorState.invalidate();
    },
  });

  // Le state initial du builder est pose une fois la requete resolue ; tant
  // qu'elle charge, on ne rend rien (la section est optionnelle, pas de
  // squelette a afficher).
  const [content, setContent] = useState<PageContentV1 | null>(null);

  if (state.isLoading) return null;
  // Non-titulaire : aucune section. C'est le backend qui tranche.
  if (!state.data?.isInstructor) return null;

  const current =
    content ??
    (state.data.bio
      ? parsePageContentV1(state.data.bio)
      : emptyPageContentV1());

  return (
    <section className="mt-10 rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Ma présentation d&apos;instructeur
          </h2>
          <p className="text-xs text-muted-foreground">
            Affichée sur la page publique des instructeurs. Laissez-la vide
            pour ne pas y figurer.
          </p>
        </div>
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate({ bio: current })}
          className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      <PageBuilder
        value={current}
        onChange={setContent}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
      />

      {save.isSuccess && (
        <p className="mt-2 text-xs text-muted-foreground">
          Présentation enregistrée.
        </p>
      )}
      {save.isError && (
        <p className="mt-2 text-xs text-destructive">
          Échec : {save.error.message}
        </p>
      )}
    </section>
  );
}
