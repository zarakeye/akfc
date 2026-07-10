#!/bin/bash
# Chantier galeries — G.0 phase 2 : formulaires admin (titre requis, date,
# 5 facettes cumulables), actions, contrats, table, include getAll.
# À lancer depuis la RACINE du monorepo : bash apply_g0_phase2.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> packages/contracts/src/forms/createGalleryForm.schema.ts"
cat > 'packages/contracts/src/forms/createGalleryForm.schema.ts' << 'FILE_EOF'
import { z } from "zod";
import { slugSchema } from "@contracts/slug/slug.schema";

// 🧩 Schéma — création d'une galerie (métadonnées seulement).
// `visibility` en z.enum littéral pour garder @contracts indépendant de Prisma.
//
// `date` et les cinq facettes arrivent du DOM en STRINGS (input type="date"
// et selects) — le contrat valide la forme, l'action convertit ("" = null).
// Les facettes sont CUMULABLES (décision 2026-07-03).
const facetIdString = z.string().regex(/^\d*$/, "Identifiant invalide.");

export const createGalleryFormSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(120),
  slug: slugSchema,
  visibility: z.enum(["PUBLIC", "MEMBERS"]),
  sortOrder: z.number().int().min(0),
  /** "YYYY-MM-DD" ou "" (pas de date). */
  date: z.string(),
  disciplineId: facetIdString,
  categoryId: facetIdString,
  stageId: facetIdString,
  eventId: facetIdString,
  originId: facetIdString,
});

export type CreateGalleryFormSchema = z.infer<typeof createGalleryFormSchema>;
FILE_EOF

echo "-> packages/contracts/src/forms/updateGalleryForm.schema.ts"
cat > 'packages/contracts/src/forms/updateGalleryForm.schema.ts' << 'FILE_EOF'
import { z } from "zod";
import { slugSchema } from "@contracts/slug/slug.schema";

// 🧩 Schéma — édition d'une galerie (métadonnées). `id` via input caché.
// Mêmes conventions que la création : date/facettes en strings du DOM,
// converties par l'action ("" = null). Facettes CUMULABLES.
const facetIdString = z.string().regex(/^\d*$/, "Identifiant invalide.");

export const updateGalleryFormSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(120),
  slug: slugSchema,
  visibility: z.enum(["PUBLIC", "MEMBERS"]),
  sortOrder: z.number().int().min(0),
  date: z.string(),
  disciplineId: facetIdString,
  categoryId: facetIdString,
  stageId: facetIdString,
  eventId: facetIdString,
  originId: facetIdString,
});

export type UpdateGalleryFormSchema = z.infer<typeof updateGalleryFormSchema>;
FILE_EOF

echo "-> apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts"
cat > 'apps/web/src/features/admin/galleries/actions/createGalleryForm.action.ts' << 'FILE_EOF'
'use server';

import { prisma } from "@backend/prisma";
import { createGalleryFormSchema } from "@contracts/forms/createGalleryForm.schema";

export type CreateGalleryFormState = {
  success: boolean;
  error?: string;
  galleryId?: number;
};

/** Select vide ("") → null, sinon l'id numérique. */
const toFacetId = (s: string): number | null => (s === "" ? null : Number(s));
/** input type="date" vide ("") → null, sinon minuit local du jour choisi. */
const toDate = (s: string): Date | null =>
  s === "" ? null : new Date(`${s}T00:00:00`);

/**
 * 🧩 Action Server — crée une galerie ET ses items en une seule transaction.
 *
 * Les métadonnées sont validées par `createGalleryFormSchema` (titre
 * REQUIS depuis la migration gallery_metadata ; date et facettes
 * cumulables converties ici depuis leurs strings DOM). Les images
 * choisies arrivent dans l'input caché `items` (JSON d'ids média),
 * parsées à part puis créées en `items.create` imbriqué : tout est
 * atomique.
 */
export const createGalleryFormAction = async (
  prevState: CreateGalleryFormState,
  formData: FormData,
): Promise<CreateGalleryFormState> => {
  // Métadonnées
  const str = (k: string) => {
    const v = formData.get(k);
    return v == null ? "" : String(v);
  };
  const result = createGalleryFormSchema.safeParse({
    title: str('title'),
    slug: formData.get('slug'),
    visibility: formData.get('visibility'),
    sortOrder: Number(formData.get('sortOrder') ?? 0),
    date: str('date'),
    disciplineId: str('disciplineId'),
    categoryId: str('categoryId'),
    stageId: str('stageId'),
    eventId: str('eventId'),
    originId: str('originId'),
  });

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  // Items (ids média) — parsés à part, comme les permissions du form de rôle.
  const rawItems = formData.get('items');
  let mediaIds: string[] = [];
  try {
    mediaIds = rawItems ? JSON.parse(String(rawItems)) : [];
  } catch {
    return { success: false, error: "Format des médias invalide." };
  }

  try {
    const created = await prisma.gallery.create({
      data: {
        title: result.data.title,
        slug: result.data.slug,
        visibility: result.data.visibility,
        sortOrder: result.data.sortOrder,
        date: toDate(result.data.date),
        disciplineId: toFacetId(result.data.disciplineId),
        categoryId: toFacetId(result.data.categoryId),
        stageId: toFacetId(result.data.stageId),
        eventId: toFacetId(result.data.eventId),
        originId: toFacetId(result.data.originId),
        items:
          mediaIds.length > 0
            ? {
                create: mediaIds.map((mediaAssetId, index) => ({
                  mediaAssetId,
                  sortOrder: index,
                })),
              }
            : undefined,
      },
    });
    return { success: true, galleryId: created.id };
  } catch {
    return {
      success: false,
      error: "Création impossible : ce slug est peut-être déjà utilisé.",
    };
  }
};
FILE_EOF

echo "-> apps/web/src/features/admin/galleries/actions/updateGalleryForm.action.ts"
cat > 'apps/web/src/features/admin/galleries/actions/updateGalleryForm.action.ts' << 'FILE_EOF'
'use server';

import { prisma } from "@backend/prisma";
import { updateGalleryFormSchema } from "@contracts/forms/updateGalleryForm.schema";

export type UpdateGalleryFormState = {
  success: boolean;
  error?: string;
};

/** Select vide ("") → null, sinon l'id numérique. */
const toFacetId = (s: string): number | null => (s === "" ? null : Number(s));
/** input type="date" vide ("") → null, sinon minuit local du jour choisi. */
const toDate = (s: string): Date | null =>
  s === "" ? null : new Date(`${s}T00:00:00`);

/**
 * 🧩 Action Server — met à jour les métadonnées d'une galerie (titre
 * requis, date et facettes cumulables converties depuis les strings DOM).
 */
export const updateGalleryFormAction = async (
  prevState: UpdateGalleryFormState,
  formData: FormData
): Promise<UpdateGalleryFormState> => {
  const str = (k: string) => {
    const v = formData.get(k);
    return v == null ? "" : String(v);
  };
  const result = updateGalleryFormSchema.safeParse({
    id: formData.get('id'),
    title: str('title'),
    slug: formData.get('slug'),
    visibility: formData.get('visibility'),
    sortOrder: Number(formData.get('sortOrder') ?? 0),
    date: str('date'),
    disciplineId: str('disciplineId'),
    categoryId: str('categoryId'),
    stageId: str('stageId'),
    eventId: str('eventId'),
    originId: str('originId'),
  });

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    await prisma.gallery.update({
      where: { id: result.data.id },
      data: {
        title: result.data.title,
        slug: result.data.slug,
        visibility: result.data.visibility,
        sortOrder: result.data.sortOrder,
        date: toDate(result.data.date),
        disciplineId: toFacetId(result.data.disciplineId),
        categoryId: toFacetId(result.data.categoryId),
        stageId: toFacetId(result.data.stageId),
        eventId: toFacetId(result.data.eventId),
        originId: toFacetId(result.data.originId),
      },
    });
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Mise à jour impossible : ce slug est peut-être déjà utilisé.",
    };
  }
};
FILE_EOF

echo "-> apps/web/src/features/admin/galleries/forms/CreateGalleryForm.tsx"
cat > 'apps/web/src/features/admin/galleries/forms/CreateGalleryForm.tsx' << 'FILE_EOF'
import { useForm } from "react-hook-form";
import { JSX, useActionState, useEffect, useState } from 'react';
import { createGalleryFormAction, type CreateGalleryFormState } from '@features/admin/galleries/actions/createGalleryForm.action';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGalleryFormSchema } from "@contracts/forms/createGalleryForm.schema";
import { slugify } from "@contracts/slug/slugify";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { trpc } from "@trpc/trpcClient";
import { MediaItemsEditor } from "@features/admin/galleries/components/MediaItemsEditor";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

interface FormValues {
  title: string;
  slug: string;
  visibility: "PUBLIC" | "MEMBERS";
  sortOrder: number;
  /** "YYYY-MM-DD" ou "" — converti en Date|null par l'action. */
  date: string;
  // Facettes cumulables — "" = aucune, sinon l'id en string (DOM).
  disciplineId: string;
  categoryId: string;
  stageId: string;
  eventId: string;
  originId: string;
}

type FacetName =
  | "disciplineId"
  | "categoryId"
  | "stageId"
  | "eventId"
  | "originId";

interface CreateGalleryFormProps {
  setCreating?: (creating: 'GALLERY' | null) => void;
  setOpenList?: (open: 'GALLERIES' | null) => void;
  setDisplayingMyInfo?: (display: boolean) => void;
}

/**
 * Création d'une galerie en une étape : métadonnées + images.
 * Le slug se génère depuis le titre tant que l'admin n'y a pas touché. Les
 * images choisies (état local) partent dans l'input caché `items` ; la server
 * action crée la galerie et ses items en une transaction.
 */
export function CreateGalleryForm({ setCreating, setOpenList, setDisplayingMyInfo }: CreateGalleryFormProps): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(createGalleryFormSchema),
    defaultValues: {
      title: '', slug: '', visibility: 'PUBLIC', sortOrder: 0,
      date: '', disciplineId: '', categoryId: '', stageId: '', eventId: '', originId: '',
    },
    mode: 'onBlur',
  });

  const [slugTouched, setSlugTouched] = useState(false);
  const [mediaIds, setMediaIds] = useState<string[]>([]);

  const utils = trpc.useUtils();

  // Options des facettes (cumulables) — les getAll publics suffisent.
  // Limite v1 assumée : stages/events listés = publiés uniquement.
  const { data: disciplines } = trpc.discipline.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: stages } = trpc.stage.getAll.useQuery();
  const { data: events } = trpc.event.getAll.useQuery();
  const { data: origins } = trpc.origin.getAll.useQuery();
  const [state, formAction, isPending] = useActionState<CreateGalleryFormState, FormData>(createGalleryFormAction, {} as CreateGalleryFormState);

  // Rafraîchit la liste des galeries après une création réussie (la query
  // tRPC ne sait rien de la server action → il faut l'invalider).
  useEffect(() => {
    if (state.success) {
      void utils.gallery.getAll.invalidate();
    }
  }, [state.success, utils]);

  // Au succès, on redirige vers la fiche de la nouvelle galerie (countdown
  // 3 s ou clic « OK ») — cohérent avec les autres créations.
  if (state.success && state.galleryId != null) {
    return (
      <SuccessRedirect
        target={`/dashboard/galleries/${state.galleryId}`}
        message="Galerie créée."
      />
    );
  }

  const facetField = <T extends { id: number }>(
    name: FacetName,
    label: string,
    options: T[] | undefined,
    display: (o: T) => string,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select
              {...field}
              id={name}
              className="w-full rounded border border-input bg-background px-2 py-1"
            >
              <option value="">— Aucun(e) —</option>
              {(options ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {display(o)}
                </option>
              ))}
            </select>
          </FormControl>
          <div className="h-10"><FormMessage /></div>
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          const valid = await form.trigger();
          if (!valid) e.preventDefault();
        }}
        className="space-y-4 w-full max-w-2xl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="title"
                  type="text"
                  placeholder="Carousel d'accueil…"
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugTouched) {
                      form.setValue('slug', slugify(e.target.value), { shouldValidate: true });
                    }
                  }}
                />
              </FormControl>
              <div className="h-10"><FormMessage /></div>
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
                    form.setValue('slug', slugify(form.getValues('title')), { shouldValidate: true });
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
              <div className="h-10"><FormMessage /></div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibilité</FormLabel>
              <FormControl>
                <select {...field} {...form.register("visibility")} id="visibility" className="w-full rounded border border-input bg-background px-2 py-1">
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS">Membres</option>
                </select>
              </FormControl>
              <div className="h-10"><FormMessage /></div>
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
                <Input {...field} {...form.register("sortOrder", { valueAsNumber: true })} id="sortOrder" type="number" min={0} />
              </FormControl>
              <div className="h-10"><FormMessage /></div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de la galerie</FormLabel>
              <FormControl>
                <Input {...field} id="date" type="date" />
              </FormControl>
              <div className="h-10"><FormMessage /></div>
            </FormItem>
          )}
        />

        {/* Facettes cumulables — "" = aucune ; l'action convertit en null. */}
        {facetField("disciplineId", "Discipline", disciplines, (d) => d.name)}
        {facetField("categoryId", "Catégorie", categories, (c) => c.type)}
        {facetField("stageId", "Stage", stages, (s) => s.label)}
        {facetField("eventId", "Évènement", events, (e) => e.label)}
        {facetField("originId", "Origine", origins, (o) => o.name)}

        {/* Images — état local envoyé via l'input caché `items` */}
        <div>
          <input type="hidden" name="items" value={JSON.stringify(mediaIds)} />
          <MediaItemsEditor value={mediaIds} onChange={setMediaIds} />
        </div>

        {state.error && <p className="text-red-500">{state.error}</p>}

        <div className="flex gap-3.5 justify-end">
          <Button type="button" onClick={() => {
            if (setCreating) setCreating(null);
            if (setOpenList) setOpenList('GALLERIES');
            if (setDisplayingMyInfo) setDisplayingMyInfo(false);
          }}>Annuler</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
FILE_EOF

echo "-> apps/web/src/features/admin/galleries/forms/UpdateGalleryForm.tsx"
cat > 'apps/web/src/features/admin/galleries/forms/UpdateGalleryForm.tsx' << 'FILE_EOF'
import { useForm } from "react-hook-form";
import { JSX, useActionState, useState, useEffect } from 'react';
import { updateGalleryFormAction, type UpdateGalleryFormState } from '@features/admin/galleries/actions/updateGalleryForm.action';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateGalleryFormSchema } from "@contracts/forms/updateGalleryForm.schema";
import { slugify } from "@contracts/slug/slugify";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import type { Gallery } from '@prisma/client';
import { trpc } from "@/core/trpc/trpcClient";

/** Date → valeur input type="date" (YYYY-MM-DD, locale). "" si null. */
function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

interface FormValues {
  title: string;
  slug: string;
  visibility: "PUBLIC" | "MEMBERS";
  sortOrder: number;
  /** "YYYY-MM-DD" ou "" — converti en Date|null par l'action. */
  date: string;
  // Facettes cumulables — "" = aucune, sinon l'id en string (DOM).
  disciplineId: string;
  categoryId: string;
  stageId: string;
  eventId: string;
  originId: string;
}

type FacetName =
  | "disciplineId"
  | "categoryId"
  | "stageId"
  | "eventId"
  | "originId";

interface UpdateGalleryFormProps {
  gallery: Gallery;
  setCreating?: (creating: 'GALLERY' | null) => void;
  setOpenList?: (open: 'GALLERIES' | null) => void;
  setDisplayingMyInfo?: (display: boolean) => void;
}

/**
 * Édition des métadonnées d'une galerie. Pré-rempli depuis `gallery`,
 * `id` transmis via input caché.
 */
export function UpdateGalleryForm({ gallery, setCreating, setOpenList, setDisplayingMyInfo }: UpdateGalleryFormProps): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(updateGalleryFormSchema.pick({
      title: true, slug: true, visibility: true, sortOrder: true,
      date: true, disciplineId: true, categoryId: true, stageId: true, eventId: true, originId: true,
    })),
    defaultValues: {
      title: gallery.title,
      slug: gallery.slug,
      visibility: gallery.visibility,
      sortOrder: gallery.sortOrder,
      date: toDateInputValue(gallery.date),
      disciplineId: gallery.disciplineId != null ? String(gallery.disciplineId) : '',
      categoryId: gallery.categoryId != null ? String(gallery.categoryId) : '',
      stageId: gallery.stageId != null ? String(gallery.stageId) : '',
      eventId: gallery.eventId != null ? String(gallery.eventId) : '',
      originId: gallery.originId != null ? String(gallery.originId) : '',
    },
    mode: 'onBlur',
  });

  const [slugTouched, setSlugTouched] = useState(true);

  const [state, formAction, isPending] = useActionState<UpdateGalleryFormState, FormData>(updateGalleryFormAction, {} as UpdateGalleryFormState);

  const utils = trpc.useUtils();

  // Options des facettes (cumulables) — les getAll publics suffisent.
  // Limite v1 assumée : stages/events listés = publiés uniquement.
  const { data: disciplines } = trpc.discipline.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: stages } = trpc.stage.getAll.useQuery();
  const { data: events } = trpc.event.getAll.useQuery();
  const { data: origins } = trpc.origin.getAll.useQuery();

  useEffect(() => {
    if (state.success) {
      void utils.gallery.getById.invalidate();
      void utils.gallery.getAll.invalidate();
    }
  }, [state.success, utils]);

  const facetField = <T extends { id: number }>(
    name: FacetName,
    label: string,
    options: T[] | undefined,
    display: (o: T) => string,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select
              {...field}
              id={name}
              className="w-full rounded border border-input bg-background px-2 py-1"
            >
              <option value="">— Aucun(e) —</option>
              {(options ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {display(o)}
                </option>
              ))}
            </select>
          </FormControl>
          <div className="h-10"><FormMessage /></div>
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          const valid = await form.trigger();
          if (!valid) e.preventDefault();
        }}
        className="space-y-4 w-80"
      >
        <input type="hidden" name="id" value={gallery.id} />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="title"
                  type="text"
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugTouched) {
                      form.setValue('slug', slugify(e.target.value), { shouldValidate: true });
                    }
                  }}
                />
              </FormControl>
              <div className="h-10"><FormMessage /></div>
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
                    form.setValue('slug', slugify(form.getValues('title')), { shouldValidate: true });
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
              <div className="h-10"><FormMessage /></div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibilité</FormLabel>
              <FormControl>
                <select {...field} {...form.register("visibility")} id="visibility" className="w-full rounded border border-input bg-background px-2 py-1">
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS">Membres</option>
                </select>
              </FormControl>
              <div className="h-10"><FormMessage /></div>
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
                <Input {...field} {...form.register("sortOrder", { valueAsNumber: true })} id="sortOrder" type="number" min={0} />
              </FormControl>
              <div className="h-10"><FormMessage /></div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de la galerie</FormLabel>
              <FormControl>
                <Input {...field} id="date" type="date" />
              </FormControl>
              <div className="h-10"><FormMessage /></div>
            </FormItem>
          )}
        />

        {/* Facettes cumulables — "" = aucune ; l'action convertit en null. */}
        {facetField("disciplineId", "Discipline", disciplines, (d) => d.name)}
        {facetField("categoryId", "Catégorie", categories, (c) => c.type)}
        {facetField("stageId", "Stage", stages, (s) => s.label)}
        {facetField("eventId", "Évènement", events, (e) => e.label)}
        {facetField("originId", "Origine", origins, (o) => o.name)}

        {state.error && !form.formState.isValid &&
          <p className="text-red-500">{state.error}</p>
        }

        <div className="flex gap-3.5 justify-end">
          <Button type="button" onClick={() => {
            if (setCreating) setCreating(null);
            if (setOpenList) setOpenList('GALLERIES');
            if (setDisplayingMyInfo) setDisplayingMyInfo(false);
          }}>Annuler</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
FILE_EOF

echo "-> apps/web/src/features/admin/galleries/components/GalleriesTable.tsx"
cat > 'apps/web/src/features/admin/galleries/components/GalleriesTable.tsx' << 'FILE_EOF'
'use client';

import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@trpc/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';

/**
 * Liste des galeries via `trpc.gallery.getAll.useQuery()`. Clic sur une ligne
 * → page `[id]`. On dérive les lignes (plutôt qu'un cast) pour exposer le
 * nombre d'images (`_count.items`), la date et les RATTACHEMENTS CUMULÉS
 * (discipline, catégorie, stage, event, origine — joints par virgule).
 */

/** Slug réservé du carousel d'accueil (aligné sur le backend). */
const CAROUSEL_SLUG = 'accueil';

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Public',
  MEMBERS: 'Membres',
};

type GalleryRow = {
  id: number;
  titre: string;
  slug: string;
  date: string;
  rattachements: string;
  images: number;
  visibilite: string;
  ordre: number;
};

export default function GalleriesTable(): JSX.Element {
  const router = useRouter();
  const { data: galleries, isLoading, isError } = trpc.gallery.getAll.useQuery();

  if (isLoading) return <div>Chargement…</div>;
  if (isError) return <div>Erreur lors du chargement des galeries.</div>;

  const rows: GalleryRow[] = (galleries ?? []).map((g) => {
    const facettes = [
      g.discipline?.name,
      g.category?.type,
      g.stage?.label,
      g.event?.label,
      g.origin?.name,
    ].filter((v): v is string => Boolean(v));

    return {
      id: g.id,
      titre: g.title,
      slug: g.slug,
      date: g.date ? new Date(g.date).toLocaleDateString('fr-FR') : '—',
      rattachements:
        facettes.length > 0
          ? facettes.join(', ')
          : g.slug === CAROUSEL_SLUG
            ? "Carousel d'accueil"
            : '—',
      images: g._count.items,
      visibilite: VISIBILITY_LABELS[g.visibility] ?? g.visibility,
      ordre: g.sortOrder,
    };
  });

  const columns: Column<GalleryRow>[] = [
    { property: 'id', displayName: 'ID', type: 'number' },
    { property: 'titre', displayName: 'Titre', type: 'string' },
    { property: 'date', displayName: 'Date', type: 'string' },
    { property: 'rattachements', displayName: 'Rattachements', type: 'string' },
    { property: 'images', displayName: 'Images', type: 'number' },
    { property: 'visibilite', displayName: 'Visibilité', type: 'string' },
    { property: 'ordre', displayName: 'Ordre', type: 'number' },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      onRowClick={(row: GalleryRow | null) => {
        if (row) router.push(`/dashboard/galleries/${row.id}`);
      }}
    />
  );
}
FILE_EOF

echo "-> packages/backend/src/modules/galleries/router.ts"
cat > 'packages/backend/src/modules/galleries/router.ts' << 'FILE_EOF'
import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { requirePermission } from "@backend/trpc/middleware";
import { slugSchema } from "@contracts/slug/slug.schema";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import { deriveMediaKind } from "@backend/modules/media/helpers/deriveMediaKind";
import { z } from "zod";

/**
 * Router `gallery`.
 *
 * Une Gallery réutilise des MediaAsset existants via GalleryItem (jointure
 * ordonnée). Rattachements optionnels et CUMULABLES (discipline,
 * catégorie, stage, event, origine) — les facettes de la future
 * recherche. Une galerie sans rattachement au slug réservé
 * `CAROUSEL_SLUG` sert de carousel d'accueil.
 *
 * - Lectures publiques : `getBySlug`, `getCarousel`.
 * - Écritures + lectures admin : `requirePermission("manage_galleries")`.
 */

/** Slug réservé pour le carousel de la page d'accueil. */
export const CAROUSEL_SLUG = "home-carousel";

/** include standard : items ordonnés + l'asset média de chaque item. */
const galleryWithItems = {
  items: {
    orderBy: { sortOrder: "asc" },
    include: { mediaAsset: true },
  },
} satisfies Prisma.GalleryInclude;

const themeFields = {
  disciplineId: z.number().int().positive().nullable().optional(),
  stageId: z.number().int().positive().nullable().optional(),
  eventId: z.number().int().positive().nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  originId: z.number().int().positive().nullable().optional(),
};

const createInput = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Le titre est obligatoire.").max(120),
  date: z.coerce.date().nullable().optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  ...themeFields,
});

const updateInput = z.object({
  id: z.number().int().positive(),
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(120).optional(),
  date: z.coerce.date().nullable().optional(),
  visibility: z.enum(["PUBLIC", "MEMBERS"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  ...themeFields,
});

export const galleryRouter = router({
  /* ----- Lectures admin ----- */

  getAll: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .query(async ({ ctx }) => {
      return ctx.prisma.gallery.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { items: true } },
          discipline: { select: { id: true, name: true } },
          stage: { select: { id: true, label: true } },
          event: { select: { id: true, label: true } },
          category: { select: { id: true, type: true } },
          origin: { select: { id: true, name: true } },
        },
      });
    }),

  getById: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const gallery = await ctx.prisma.gallery.findUnique({
        where: { id: input.id },
        include: galleryWithItems,
      });
      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Galerie introuvable." });
      }
      return gallery;
    }),

  /* ----- Lectures publiques ----- */

  getBySlug: publicProcedure
    .input(z.object({ slug: slugSchema }))
    .query(async ({ ctx, input }) => {
      const gallery = await ctx.prisma.gallery.findUnique({
        where: { slug: input.slug },
        include: galleryWithItems,
      });
      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Galerie introuvable." });
      }
      return gallery;
    }),

  /**
   * Récupère la galerie du carousel d'accueil (slug `CAROUSEL_SLUG`) avec ses
   * items filtrés (assets publiés uniquement) et transformés (URL de proxy +
   * métadonnées + kind/posterUrl).
   *
   * Accessible publiquement pour afficher le carousel sur la page d'accueil
   * sans authentification.
   *
   * Le `kind` est dérivé via le helper partagé `deriveMediaKind` (même logique
   * que `media.resolveByIds`), et le poster vidéo via la route proxy `&as=poster`.
   * Les URLs sont construites pour l'audience `public` (les assets R2
   * éventuels passent alors par la route publique).
   */
  getCarousel: publicProcedure.query(async ({ ctx }) => {
    const gallery = await ctx.prisma.gallery.findUnique({
      where: { slug: CAROUSEL_SLUG },
      include: galleryWithItems,
    });
    if (!gallery) return null;

    return {
      id: gallery.id,
      slug: gallery.slug,
      title: gallery.title,
      items: gallery.items
        .filter((it) => it.mediaAsset.status === "published")
        .map((it) => {
          const a = it.mediaAsset;
          const kind = deriveMediaKind(a.resourceType, a.mimeType);
          const url = buildMediaProxyUrl(
            { publicId: a.publicId, fullPath: a.fullPath },
            "public",
          );

          return {
            mediaAssetId: it.mediaAssetId,
            url,
            kind,
            posterUrl: kind === "video" ? `${url}&as=poster` : null,
            mimeType: a.mimeType,
            fileName: a.fullPath.split("/").pop() ?? a.fullPath,
            width: a.width,
            height: a.height,
          };
        }),
    };
  }),

  /* ----- Écritures ----- */

  create: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.gallery.create({ data: input });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce slug de galerie est déjà utilisé.",
          });
        }
        throw e;
      }
    }),

  update: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      try {
        return await ctx.prisma.gallery.update({ where: { id }, data });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce slug de galerie est déjà utilisé.",
          });
        }
        throw e;
      }
    }),

  delete: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Les GalleryItem sont supprimés en cascade (FK onDelete: Cascade).
      return ctx.prisma.gallery.delete({ where: { id: input.id } });
    }),

  /* ----- Gestion des items (ajout / retrait / réordonnancement) ----- */

  /**
   * Remplace l'intégralité des items d'une galerie par la liste ordonnée
   * `mediaAssetIds` (le `sortOrder` suit l'index du tableau). Couvre en une
   * seule opération l'ajout, le retrait et le réordonnancement — pratique
   * pour un écran admin en drag-and-drop. Transactionnel.
   */
  setItems: protectedProcedure
    .use(requirePermission("manage_galleries"))
    .input(
      z.object({
        galleryId: z.number().int().positive(),
        mediaAssetIds: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async (tx) => {
        await tx.galleryItem.deleteMany({
          where: { galleryId: input.galleryId },
        });

        if (input.mediaAssetIds.length > 0) {
          await tx.galleryItem.createMany({
            data: input.mediaAssetIds.map((mediaAssetId, index) => ({
              galleryId: input.galleryId,
              mediaAssetId,
              sortOrder: index,
            })),
            skipDuplicates: true,
          });
        }

        return tx.gallery.findUnique({
          where: { id: input.galleryId },
          include: galleryWithItems,
        });
      });
    }),
});

export default galleryRouter;
FILE_EOF

echo
pnpm --filter backend typecheck && pnpm --filter web typecheck