"use client";

import { useForm } from "react-hook-form";
import { JSX, startTransition, useActionState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";

import { saveCategoryFormSchema } from "@contracts/forms/saveCategoryForm.schema";
import { CATEGORY_KEYS, CATEGORY_KEY_LABELS, type CategoryKey } from "@contracts/categories/categoryKey";
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
  key: CategoryKey;
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
 *
 * La catégorie se choisit dans la liste fixe (`course`, `seminar`, `event`), parmi celles
 * qui n'existent pas encore ; une fois choisie, elle ne change plus (affichée, et renvoyée
 * par un input caché). Le libellé, lui, reste modifiable.
 */
export function CategoryForm({ initial }: { initial?: Category }): JSX.Element {
  // Resolver client : on ne valide QUE `key` et `type` (l'`id` vient de l'input caché).
  const form = useForm<FormValues>({
    resolver: zodResolver(saveCategoryFormSchema.pick({ key: true, type: true })),
    defaultValues: { key: initial?.key ?? undefined, type: initial?.type ?? "" },
    mode: "onBlur",
  });

  const utils = trpc.useUtils();
  const { data: categories } = trpc.category.getAll.useQuery();
  // Les clés encore libres (et celle de la ligne éditée, si elle en a une).
  const taken = new Set((categories ?? []).map((c) => c.key).filter((k) => k !== initial?.key));
  const freeKeys = CATEGORY_KEYS.filter((k) => !taken.has(k));
  const keyLocked = initial?.key != null;
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
        onSubmit={(e) => {
          // La validation du client est asynchrone : on suspend TOUJOURS l'envoi (un
          // preventDefault après un await arriverait trop tard, l'action serait déjà partie),
          // puis on le relance si le formulaire est valide.
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          void form.trigger().then((valid) => {
            if (valid) startTransition(() => formAction(formData));
          });
        }}
        className="max-w-md space-y-4"
      >
        {/* Présent uniquement en édition → fait basculer l'action sur update. */}
        {initial && <input type="hidden" name="id" value={initial.id} />}

        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem data-tour="categories.form.key">
              <FormLabel>Catégorie</FormLabel>
              {keyLocked ? (
                <>
                  <p className="text-sm">{CATEGORY_KEY_LABELS[field.value]}</p>
                  <input type="hidden" name="key" value={field.value} />
                </>
              ) : (
                <FormControl>
                  <select
                    name={field.name}
                    value={field.value ?? ""}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      const key = e.target.value as CategoryKey;
                      field.onChange(key);
                      // Libellé vide : on propose celui de la liste.
                      if (!form.getValues("type").trim()) {
                        form.setValue("type", CATEGORY_KEY_LABELS[key], { shouldValidate: true });
                      }
                    }}
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
                  >
                    <option value="" disabled>
                      — Choisir —
                    </option>
                    {freeKeys.map((k) => (
                      <option key={k} value={k}>
                        {CATEGORY_KEY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </FormControl>
              )}
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem data-tour="categories.form.type">
              <FormLabel>Libellé</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="type"
                  type="text"
                  placeholder="Le nom affiché sur le site"
                />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {state.error && <p className="text-red-500">{state.error}</p>}

        <div className="flex justify-end" data-tour="categories.form.submit">
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