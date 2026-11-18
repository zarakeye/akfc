"use client";

import { startTransition, useActionState, useEffect, type JSX } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { BreakingNews } from "@prisma/client";
import type { z } from "zod";

import { trpc } from "#core/trpc/trpcClient.ts";
import {
  saveBreakingNewsSchema,
  type SaveBreakingNewsInput,
} from "@akfc/contracts/breakingNews/breakingNews.schema.ts";
import { saveBreakingNewsFormAction } from "#features/admin/breaking-news/actions/saveBreakingNewsForm.action.ts";
import {
  initialSaveBreakingNewsFormState,
  type SaveBreakingNewsField,
  type SaveBreakingNewsFormState,
} from "#features/admin/breaking-news/actions/saveBreakingNewsForm.types.ts";

/**
 * Formulaire de flash info (création + édition via `initial?`), sur le modèle hybride :
 * React Hook Form et le schéma partagé dans le navigateur, server action
 * saveBreakingNewsFormAction pour l'enregistrement. Réussite → retour à la liste.
 *
 * NOTE : `toDatetimeLocalValue` est dupliqué de PostForm/EventForm — le
 * chantier « PublicationDateField partagé » (pending du handoff) absorbera
 * les trois occurrences.
 */

/** Date → valeur `datetime-local` (YYYY-MM-DDTHH:mm, heure locale). "" si null. */
function toDatetimeLocalValue(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Valeur `datetime-local` → date ISO, lue à l'heure du navigateur. "" si vide. */
function toIso(value: FormDataEntryValue | null): string {
  const text = String(value ?? "");
  return text === "" ? "" : new Date(text).toISOString();
}

const field = "rounded border border-input bg-background px-2 py-1";

export function BreakingNewsForm({
  initial,
  submitLabel = "Enregistrer",
}: {
  initial?: BreakingNews;
  submitLabel?: string;
}): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const router = useRouter();
  const utils = trpc.useUtils();

  const [state, formAction, isPending] = useActionState<SaveBreakingNewsFormState, FormData>(
    saveBreakingNewsFormAction,
    initialSaveBreakingNewsFormState,
  );

  // Valeurs d'entrée du schéma (du texte, ici) ; valeurs de sortie validées (des dates).
  const form = useForm<z.input<typeof saveBreakingNewsSchema>, unknown, SaveBreakingNewsInput>({
    resolver: zodResolver(saveBreakingNewsSchema),
    defaultValues: {
      title: initial?.title ?? "",
      body: initial?.body ?? "",
      href: initial?.href ?? "",
      publicationDate: toDatetimeLocalValue(initial?.publicationDate ?? null),
      expiresAt: toDatetimeLocalValue(initial?.expiresAt ?? null),
    },
    // Erreurs au premier envoi, puis corrigées à la frappe (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setError, formState } = form;
  const errors = formState.errors;

  useEffect(() => {
    if (state.status === "success") {
      // refetchType "all" : la liste n'est pas montée pendant qu'on est ici ; son cache est
      // rafraîchi AVANT la navigation, pas seulement marqué périmé.
      void utils.breakingNews.invalidate(undefined, { refetchType: "all" }).then(() => {
        router.push("/dashboard/breaking-news");
      });
      return;
    }
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [name, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(name as SaveBreakingNewsField, { type: "server", message });
    }
  }, [state, utils, router, setError]);

  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // La validation de React Hook Form est asynchrone : on suspend TOUJOURS l'envoi (un
        // preventDefault après un await arriverait trop tard), puis on le relance s'il est valide.
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Les dates partent en ISO, converties ici, à l'heure de l'administrateur : lue sur le
        // serveur, une valeur `datetime-local` le serait à l'heure du serveur.
        formData.set("publicationDate", toIso(formData.get("publicationDate")));
        formData.set("expiresAt", toIso(formData.get("expiresAt")));
        void form.trigger().then((valid) => {
          if (valid) startTransition(() => formAction(formData));
        });
      }}
      noValidate
      className="flex max-w-2xl flex-col gap-4"
    >
      {/* Présent uniquement en édition → l'action met à jour au lieu de créer. */}
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <label className="flex flex-col gap-1 text-sm" data-tour="breaking-news.form.title">
        <span className="font-medium">Titre</span>
        <input
          type="text"
          placeholder="Fermeture exceptionnelle, Résultats du vote…"
          className={field}
          {...register("title")}
        />
        {errors.title && <span className="text-sm text-destructive">{errors.title.message}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm" data-tour="breaking-news.form.body">
        <span className="font-medium">Corps</span>
        <textarea
          rows={4}
          placeholder="Texte court du flash info (600 caractères max)."
          className={field}
          {...register("body")}
        />
        {errors.body && <span className="text-sm text-destructive">{errors.body.message}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Lien (optionnel)</span>
        <input
          type="text"
          placeholder="/#post-12 (interne) ou https://… (externe)"
          className={field}
          {...register("href")}
        />
        <span className="text-xs text-muted-foreground">
          CTA de la fiche dans la sidebar — vers un post du mur, une page du
          site ou un lien externe.
        </span>
        {errors.href && <span className="text-sm text-destructive">{errors.href.message}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm" data-tour="breaking-news.form.publicationDate">
        <span className="font-medium">Date de publication</span>
        <input type="datetime-local" className={field} {...register("publicationDate")} />
        <span className="text-xs text-muted-foreground">
          Laisser vide = brouillon (non visible publiquement). Une date future
          programme la publication.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm" data-tour="breaking-news.form.expiresAt">
        <span className="font-medium">Date d&apos;expiration</span>
        <input type="datetime-local" className={field} {...register("expiresAt")} />
        <span className="text-xs text-muted-foreground">
          Passée cette date, le flash info disparaît du ruban et de la
          sidebar. Laisser vide = sans expiration.
        </span>
        {errors.expiresAt && <span className="text-sm text-destructive">{errors.expiresAt.message}</span>}
      </label>

      {errMsg && <p className="text-sm text-destructive">{errMsg}</p>}

      <div data-tour="breaking-news.form.submit">
        <button
          type="submit"
          disabled={isPending || state.status === "success"}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
