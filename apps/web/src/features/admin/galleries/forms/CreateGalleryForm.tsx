import { useForm } from "react-hook-form";
import { JSX, useActionState, useEffect, useState } from "react";
import {
  createGalleryFormAction,
  type CreateGalleryFormState,
} from "@features/admin/galleries/actions/createGalleryForm.action";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGalleryFormSchema } from "@contracts/forms/createGalleryForm.schema";
import { slugify } from "@contracts/slug/slugify";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
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
  "disciplineId" | "categoryId" | "stageId" | "eventId" | "originId";

/**
 * Types de catégorie qui débloquent une facette conditionnelle. La valeur
 * doit correspondre EXACTEMENT au `Category.type` en base (String libre,
 * pas d'enum). Centralisé ici pour limiter la fragilité du comparatif.
 */
const CATEGORY_TYPE_STAGE = "Stage";
const CATEGORY_TYPE_EVENT = "Event";

interface CreateGalleryFormProps {
  setCreating?: (creating: "GALLERY" | null) => void;
  setOpenList?: (open: "GALLERIES" | null) => void;
  setDisplayingMyInfo?: (display: boolean) => void;
}

/**
 * Création d'une galerie en une étape : métadonnées + images.
 * Le slug se génère depuis le titre tant que l'admin n'y a pas touché. Les
 * images choisies (état local) partent dans l'input caché `items` ; la server
 * action crée la galerie et ses items en une transaction.
 */
export function CreateGalleryForm({
  setCreating,
  setOpenList,
  setDisplayingMyInfo,
}: CreateGalleryFormProps): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(createGalleryFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      visibility: "PUBLIC",
      sortOrder: 0,
      date: "",
      disciplineId: "",
      categoryId: "",
      stageId: "",
      eventId: "",
      originId: "",
    },
    mode: "onBlur",
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
  const [state, formAction, isPending] = useActionState<
    CreateGalleryFormState,
    FormData
  >(createGalleryFormAction, {} as CreateGalleryFormState);

  // Catégorie sélectionnée → son `type`, qui pilote l'affichage conditionnel
  // des facettes Stage / Event.
  const selectedCategoryId = form.watch("categoryId");
  const selectedCategoryType = (categories ?? []).find(
    (c) => String(c.id) === selectedCategoryId,
  )?.type;
  const showStage = selectedCategoryType === CATEGORY_TYPE_STAGE;
  const showEvent = selectedCategoryType === CATEGORY_TYPE_EVENT;

  // Quand une facette conditionnelle disparaît (changement de catégorie), on
  // réinitialise sa valeur — sinon on soumettrait un id fantôme incohérent
  // avec la catégorie choisie.
  useEffect(() => {
    if (!showStage && form.getValues("stageId")) {
      form.setValue("stageId", "");
    }
    if (!showEvent && form.getValues("eventId")) {
      form.setValue("eventId", "");
    }
  }, [showStage, showEvent, form]);

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

        {/* Facettes cumulables — "" = aucune ; l'action convertit en null.
            Stage et Event ne s'affichent que si la catégorie choisie le
            justifie (type "Stage" ou "Event"). */}
        {facetField("disciplineId", "Discipline", disciplines, (d) => d.name)}
        {facetField("categoryId", "Catégorie", categories, (c) => c.type)}
        {showStage && facetField("stageId", "Stage", stages, (s) => s.label)}
        {showEvent &&
          facetField("eventId", "Évènement", events, (e) => e.label)}
        {facetField("originId", "Origine", origins, (o) => o.name)}

        {/* Images — état local envoyé via l'input caché `items` */}
        <div>
          <input type="hidden" name="items" value={JSON.stringify(mediaIds)} />
          <MediaItemsEditor value={mediaIds} onChange={setMediaIds} />
        </div>

        {state.error && <p className="text-red-500">{state.error}</p>}

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
            {isPending ? "Création..." : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
