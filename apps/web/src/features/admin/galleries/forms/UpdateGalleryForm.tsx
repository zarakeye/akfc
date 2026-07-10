import { useForm } from "react-hook-form";
import { JSX, useActionState, useState, useEffect, useRef } from "react";
import {
  updateGalleryFormAction,
  type UpdateGalleryFormState,
} from "@features/admin/galleries/actions/updateGalleryForm.action";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateGalleryFormSchema } from "@contracts/forms/updateGalleryForm.schema";
import { slugify } from "@contracts/slug/slugify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import type { Gallery } from "@prisma/client";
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
  "disciplineId" | "categoryId" | "stageId" | "eventId" | "originId";

/**
 * Types de catégorie qui débloquent une facette conditionnelle (doit
 * correspondre EXACTEMENT au `Category.type` en base).
 */
const CATEGORY_TYPE_STAGE = "Stage";
const CATEGORY_TYPE_EVENT = "Event";

interface UpdateGalleryFormProps {
  gallery: Gallery;
  setCreating?: (creating: "GALLERY" | null) => void;
  setOpenList?: (open: "GALLERIES" | null) => void;
  setDisplayingMyInfo?: (display: boolean) => void;
}

/**
 * Édition des métadonnées d'une galerie. Pré-rempli depuis `gallery`,
 * `id` transmis via input caché.
 */
export function UpdateGalleryForm({
  gallery,
  setCreating,
  setOpenList,
  setDisplayingMyInfo,
}: UpdateGalleryFormProps): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      updateGalleryFormSchema.pick({
        title: true,
        slug: true,
        visibility: true,
        sortOrder: true,
        date: true,
        disciplineId: true,
        categoryId: true,
        stageId: true,
        eventId: true,
        originId: true,
      }),
    ),
    defaultValues: {
      title: gallery.title,
      slug: gallery.slug,
      visibility: gallery.visibility,
      sortOrder: gallery.sortOrder,
      date: toDateInputValue(gallery.date),
      disciplineId:
        gallery.disciplineId != null ? String(gallery.disciplineId) : "",
      categoryId: gallery.categoryId != null ? String(gallery.categoryId) : "",
      stageId: gallery.stageId != null ? String(gallery.stageId) : "",
      eventId: gallery.eventId != null ? String(gallery.eventId) : "",
      originId: gallery.originId != null ? String(gallery.originId) : "",
    },
    mode: "onBlur",
  });

  const [slugTouched, setSlugTouched] = useState(true);

  const [state, formAction, isPending] = useActionState<
    UpdateGalleryFormState,
    FormData
  >(updateGalleryFormAction, {} as UpdateGalleryFormState);

  const utils = trpc.useUtils();

  // Options des facettes (cumulables) — les getAll publics suffisent.
  // Limite v1 assumée : stages/events listés = publiés uniquement.
  const { data: disciplines } = trpc.discipline.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: stages } = trpc.stage.getAll.useQuery();
  const { data: events } = trpc.event.getAll.useQuery();
  const { data: origins } = trpc.origin.getAll.useQuery();

  // Catégorie sélectionnée → son type. Pilote l'affichage de Stage / Event.
  const selectedCategoryId = form.watch("categoryId");
  const selectedCategoryType = (categories ?? []).find(
    (c) => String(c.id) === selectedCategoryId,
  )?.type;
  // On affiche la facette si la catégorie la justifie OU si une valeur est
  // déjà renseignée (galerie existante) — pour ne pas masquer/effacer une
  // donnée au simple affichage. Un changement de catégorie vers une valeur
  // non concernée réinitialise ensuite le champ (useEffect ci-dessous).
  const showStage =
    selectedCategoryType === CATEGORY_TYPE_STAGE ||
    Boolean(form.watch("stageId"));
  const showEvent =
    selectedCategoryType === CATEGORY_TYPE_EVENT ||
    Boolean(form.watch("eventId"));

  // Reset d'une facette quand la catégorie ne la justifie plus. On IGNORE le
  // montage initial (première valeur de categoryId) pour ne pas effacer une
  // donnée existante d'une galerie dont la catégorie serait incohérente ;
  // le reset ne s'applique qu'à un changement de catégorie par l'admin.
  const initialCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (initialCategoryRef.current === null) {
      initialCategoryRef.current = selectedCategoryId;
      return;
    }
    if (selectedCategoryId === initialCategoryRef.current) return;
    if (
      selectedCategoryType !== CATEGORY_TYPE_STAGE &&
      form.getValues("stageId")
    ) {
      form.setValue("stageId", "");
    }
    if (
      selectedCategoryType !== CATEGORY_TYPE_EVENT &&
      form.getValues("eventId")
    ) {
      form.setValue("eventId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedCategoryType]);

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
          <div className="h-10">
            <FormMessage />
          </div>
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
                      form.setValue("slug", slugify(e.target.value), {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              </FormControl>
              <div className="h-10">
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
                    form.setValue("slug", slugify(form.getValues("title")), {
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
              <div className="h-10">
                <FormMessage />
              </div>
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
                <select
                  {...field}
                  {...form.register("visibility")}
                  id="visibility"
                  className="w-full rounded border border-input bg-background px-2 py-1"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS">Membres</option>
                </select>
              </FormControl>
              <div className="h-10">
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
              <div className="h-10">
                <FormMessage />
              </div>
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
              <div className="h-10">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Facettes cumulables — "" = aucune ; l'action convertit en null. */}
        {facetField("disciplineId", "Discipline", disciplines, (d) => d.name)}
        {facetField("categoryId", "Catégorie", categories, (c) => c.type)}
        {showStage && facetField("stageId", "Stage", stages, (s) => s.label)}
        {showEvent &&
          facetField("eventId", "Évènement", events, (e) => e.label)}
        {facetField("originId", "Origine", origins, (o) => o.name)}

        {state.error && !form.formState.isValid && (
          <p className="text-red-500">{state.error}</p>
        )}

        <div className="flex gap-3.5 justify-end">
          <Button
            type="button"
            onClick={() => {
              if (setCreating) setCreating(null);
              if (setOpenList) setOpenList("GALLERIES");
              if (setDisplayingMyInfo) setDisplayingMyInfo(false);
            }}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
