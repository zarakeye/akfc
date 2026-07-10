"use client";

import { useForm } from "react-hook-form";
import { JSX, useActionState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";

import { saveCategoryFormSchema } from "@contracts/forms/saveCategoryForm.schema";
import {
  saveCategoryFormAction,
  type SaveCategoryFormState,
} from "@features/admin/categories/actions/saveCategoryForm.action";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { trpc } from "@trpc/trpcClient";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

interface FormValues {
  type: string;
}

/**
 * Formulaire de catégorie — création ET édition via `initial?`, sur le pattern
 * hybride (RHF + `useActionState` + server action `saveCategoryFormAction`).
 *
 * La distinction create/edit ne tient qu'à `initial` :
 *   - défauts du `useForm` ;
 *   - input caché `id` rendu seulement en édition (→ l'action bascule dessus) ;
 *   - libellés.
 * L'action renvoyant toujours `categoryId`, le `SuccessRedirect` est identique
 * dans les deux cas.
 */
export function CategoryForm({ initial }: { initial?: Category }): JSX.Element {
  // Resolver client : on ne valide QUE `type` (l'`id` vient de l'input caché).
  const form = useForm<FormValues>({
    resolver: zodResolver(saveCategoryFormSchema.pick({ type: true })),
    defaultValues: { type: initial?.type ?? "" },
    mode: "onBlur",
  });

  const utils = trpc.useUtils();
  const [state, formAction, isPending] = useActionState<
    SaveCategoryFormState,
    FormData
  >(saveCategoryFormAction, {} as SaveCategoryFormState);

  useEffect(() => {
    if (state.success) {
      void utils.category.getAll.invalidate();
      if (initial) void utils.category.getById.invalidate({ id: initial.id });
    }
  }, [state.success, utils, initial]);

  if (state.success && state.categoryId != null) {
    return (
      <SuccessRedirect
        target={`/dashboard/categories/${state.categoryId}`}
        message={initial ? "Catégorie mise à jour." : "Catégorie créée."}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          const valid = await form.trigger();
          if (!valid) e.preventDefault();
        }}
        className="max-w-md space-y-4"
      >
        {/* Présent uniquement en édition → fait basculer l'action sur update. */}
        {initial && <input type="hidden" name="id" value={initial.id} />}

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="type"
                  type="text"
                  placeholder="Cours, Stage, Évènement…"
                />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {state.error && <p className="text-red-500">{state.error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Enregistrement…"
              : initial
                ? "Mettre à jour"
                : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}