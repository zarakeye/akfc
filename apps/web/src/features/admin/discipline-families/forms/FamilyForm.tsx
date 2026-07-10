"use client";

import { useForm } from "react-hook-form";
import { JSX, useActionState, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DisciplineFamily } from "@prisma/client";

import { saveFamilyFormSchema } from "@contracts/forms/saveFamilyForm.schema";
import {
  saveFamilyFormAction,
  type SaveFamilyFormState,
} from "@features/admin/discipline-families/actions/saveFamilyForm.action";
import { slugify } from "@contracts/slug/slugify";
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
  name: string;
  slug: string;
  sortOrder: number;
}

/** Form famille de disciplines — create+edit via `initial?`, pattern hybride. */
export function FamilyForm({ initial }: { initial?: DisciplineFamily }): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      saveFamilyFormSchema.pick({ name: true, slug: true, sortOrder: true }),
    ),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      sortOrder: initial?.sortOrder ?? 0,
    },
    mode: "onBlur",
  });

  // Le slug se génère depuis le nom tant que l'admin n'y a pas touché.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));

  const utils = trpc.useUtils();
  const [state, formAction, isPending] = useActionState<
    SaveFamilyFormState,
    FormData
  >(saveFamilyFormAction, {} as SaveFamilyFormState);

  useEffect(() => {
    if (state.success) {
      void utils.disciplineFamily.getAll.invalidate();
      if (initial)
        void utils.disciplineFamily.getById.invalidate({ id: initial.id });
    }
  }, [state.success, utils, initial]);

  if (state.success && state.familyId != null) {
    return (
      <SuccessRedirect
        target={`/dashboard/discipline-families/${state.familyId}`}
        message={initial ? "Famille mise à jour." : "Famille créée."}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          if (!(await form.trigger())) e.preventDefault();
        }}
        className="max-w-md space-y-4"
      >
        {initial && <input type="hidden" name="id" value={initial.id} />}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="Kung-fu, Karaté, Kali…"
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugTouched) {
                      form.setValue("slug", slugify(e.target.value), {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Slug
                <button
                  type="button"
                  className="text-xs font-normal underline"
                  onClick={() => {
                    form.setValue("slug", slugify(form.getValues("name")), {
                      shouldValidate: true,
                    });
                    setSlugTouched(false);
                  }}
                >
                  régénérer
                </button>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="slug"
                  type="text"
                  className="font-mono text-xs"
                  onChange={(e) => {
                    field.onChange(e);
                    setSlugTouched(true);
                  }}
                />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordre d&apos;affichage</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  {...form.register("sortOrder", { valueAsNumber: true })}
                  id="sortOrder"
                  type="number"
                  min={0}
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
            {isPending ? "Enregistrement…" : initial ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}