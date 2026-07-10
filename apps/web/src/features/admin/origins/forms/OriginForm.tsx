"use client";

import { useForm } from "react-hook-form";
import { JSX, useActionState, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Origin } from "@prisma/client";

import { saveOriginFormSchema } from "@contracts/forms/saveOriginForm.schema";
import {
  saveOriginFormAction,
  type SaveOriginFormState,
} from "@features/admin/origins/actions/saveOriginForm.action";
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
  description: string;
  country: string;
  region: string;
  flag: string;
  historicalPeriod: string;
  sortOrder: number;
}

/** Form origine culturelle — create+edit via `initial?`, pattern hybride. */
export function OriginForm({ initial }: { initial?: Origin }): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      saveOriginFormSchema.pick({
        name: true,
        slug: true,
        description: true,
        country: true,
        region: true,
        flag: true,
        historicalPeriod: true,
        sortOrder: true,
      }),
    ),
    // Les champs nullables deviennent "" pour l'input contrôlé ; l'action
    // reconvertit "" → null.
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      country: initial?.country ?? "",
      region: initial?.region ?? "",
      flag: initial?.flag ?? "",
      historicalPeriod: initial?.historicalPeriod ?? "",
      sortOrder: initial?.sortOrder ?? 0,
    },
    mode: "onBlur",
  });

  const [slugTouched, setSlugTouched] = useState(Boolean(initial));

  const utils = trpc.useUtils();
  const [state, formAction, isPending] = useActionState<
    SaveOriginFormState,
    FormData
  >(saveOriginFormAction, {} as SaveOriginFormState);

  useEffect(() => {
    if (state.success) {
      void utils.origin.getAll.invalidate();
      if (initial) void utils.origin.getById.invalidate({ id: initial.id });
    }
  }, [state.success, utils, initial]);

  if (state.success && state.originId != null) {
    return (
      <SuccessRedirect
        target={`/dashboard/origins/${state.originId}`}
        message={initial ? "Origine mise à jour." : "Origine créée."}
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
        className="max-w-xl space-y-4"
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
                  placeholder="Japon, Okinawa, Chine…"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  id="description"
                  rows={3}
                  className="w-full rounded border border-input bg-background px-2 py-1"
                />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays (optionnel)</FormLabel>
                <FormControl>
                  <Input {...field} id="country" type="text" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Région (optionnel)</FormLabel>
                <FormControl>
                  <Input {...field} id="region" type="text" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="flag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drapeau (optionnel)</FormLabel>
                <FormControl>
                  <Input {...field} id="flag" type="text" placeholder="🇯🇵" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="historicalPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Période historique (optionnel)</FormLabel>
                <FormControl>
                  <Input {...field} id="historicalPeriod" type="text" />
                </FormControl>
                <div className="h-6">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

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