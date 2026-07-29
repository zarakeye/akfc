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
/**
 * Palette de la bio d'instructeur : le seul bloc « texte enrobant une image ».
 *
 * Un bloc suffit parce qu'il dégénère proprement — sans image choisie, il rend
 * du texte simple à la mesure. Une section purement textuelle est donc ce même
 * bloc sans image, et il n'y a pas lieu d'ouvrir aussi le bloc texte.
 *
 * Si l'usage prouve le contraire, ajouter "tiptap" ici suffit.
 */
const INSTRUCTOR_BIO_BLOCKS = ["float-text"] as const;

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
  // Instantané sérialisé de ce qui est ENREGISTRÉ. Comparer le contenu plutôt
  // que lever un simple drapeau : si l'on défait une modification, l'éditeur
  // redevient « à jour » au lieu de garder un faux positif jusqu'au
  // rechargement.
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  if (state.isLoading) return null;
  // Non-titulaire : aucune section. C'est le backend qui tranche.
  if (!state.data?.isInstructor) return null;

  const persisted = state.data.bio
    ? parsePageContentV1(state.data.bio)
    : emptyPageContentV1();
  const current = content ?? persisted;

  // Référence : le dernier enregistrement réussi de cette session, sinon ce
  // qui vient de la base.
  const baseline = savedSnapshot ?? JSON.stringify(persisted);
  const dirty = JSON.stringify(current) !== baseline;

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
        <div className="flex shrink-0 items-center gap-3">
          {dirty && (
            <span className="text-xs font-medium text-amber-600">
              Modifications non enregistrées
            </span>
          )}
          <button
            type="button"
            disabled={save.isPending || !dirty}
            onClick={() => {
              // L'instantané est pris AVANT l'appel et posé seulement au
              // succès : un enregistrement qui échoue ne doit pas faire
              // croire que le contenu est à jour.
              const snapshot = JSON.stringify(current);
              save.mutate(
                { bio: current },
                { onSuccess: () => setSavedSnapshot(snapshot) },
              );
            }}
            className="shrink-0 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      <PageBuilder
        value={current}
        onChange={setContent}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
        allowedBlocks={INSTRUCTOR_BIO_BLOCKS}
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
