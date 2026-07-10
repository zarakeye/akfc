#!/bin/bash
# Galerie : champs Stage / Event CONDITIONNELS, pilotes par la categorie.
#  - Stage n apparait que si la categorie choisie a le type "Stage".
#  - Event n apparait que si la categorie a le type "Event".
#  - Discipline / Origine : toujours affiches.
#  - Un champ qui disparait est reinitialise (pas d id fantome au submit).
#  - En EDITION : une valeur existante reste visible (pas d effacement au
#    montage) ; le reset ne s applique qu a un vrai changement de categorie.
# Seed : "Demo" -> "Event" (une demo est un evenement). NB : la ligne
# existante en base doit etre renommee A LA MAIN (voir message).
# À lancer depuis la RACINE du monorepo : bash apply_gallery_conditional_facets.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

echo "-> apps/web/src/features/admin/galleries/forms/CreateGalleryForm.tsx"
cat > 'apps/web/src/features/admin/galleries/forms/CreateGalleryForm.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> apps/web/src/features/admin/galleries/forms/UpdateGalleryForm.tsx"
cat > 'apps/web/src/features/admin/galleries/forms/UpdateGalleryForm.tsx' << 'FILE_EOF'
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
FILE_EOF

echo "-> prisma/seed.js"
cat > 'prisma/seed.js' << 'FILE_EOF'
#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import generatePassword from "generate-password";
import bcrypt from "bcryptjs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // ==========================================================================
  // 1. Permissions
  // ==========================================================================
  const PERMISSIONS = [
    "manage_users",
    "manage_roles",
    "manage_permissions",
    "manage_posts",
    "manage_comments",
    "manage_categories",
    "manage_disciplines",
    "manage_courses",
    "manage_stages",
    "view_posts",
  ];

  const permissionRecords = [];
  for (const permission of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { name: permission },
      update: {},
      create: { name: permission },
    });
    permissionRecords.push(perm);
  }
  console.log("✅ Permissions seeded:", permissionRecords.length);

  // ==========================================================================
  // 2. Roles
  // ==========================================================================
  // Le rôle ADMIN doit TOUJOURS détenir l'intégralité des permissions
  // existantes — si on ajoute une permission plus tard, elle est
  // automatiquement propagée à ADMIN au prochain seed (pas besoin de rejouer
  // manuellement une query SQL).
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      description: "Administrateur — accès total",
      permissions: {
        // On écrase la liste : tous les liens actuels sont supprimés, puis
        // recréés depuis `permissionRecords` pour coller à la liste à jour.
        deleteMany: {},
        create: permissionRecords.map((p) => ({ permissionId: p.id })),
      },
    },
    create: {
      name: "ADMIN",
      description: "Administrateur — accès total",
      permissions: {
        create: permissionRecords.map((p) => ({ permissionId: p.id })),
      },
    },
  });
  console.log(
    `✅ Role ADMIN seeded with ${permissionRecords.length} permission(s)`
  );

  const guestRole = await prisma.role.upsert({
    where: { name: "GUEST" },
    update: {},
    create: {
      name: "GUEST",
      description:
        "Intervenant extérieur — référencement nominal pour les stages, ne se connecte pas",
    },
  });
  console.log("✅ Role GUEST seeded");

  // ==========================================================================
  // 3. Admin user (Stéphane) — password généré aléatoirement
  // ==========================================================================
  // NOTE: l'envoi par email (sendPasswordEmail) est désactivé tant qu'un loader
  // TypeScript (tsx, ts-node/esm) n'est pas branché sur le seed. Le mot de
  // passe est affiché en console ET écrit dans `.seed-credentials.txt` à la
  // racine du projet (à gitignorer si pas déjà fait).
  const ADMIN_EMAIL = "stephane.bazze@outlook.fr";

  const password = generatePassword.generate({
    length: 12,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
  });
  const hash = await bcrypt.hash(password, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hash,
      roleId: adminRole.id,
    },
    create: {
      email: ADMIN_EMAIL,
      firstName: "Stéphane",
      password: hash,
      roleId: adminRole.id,
      emailVerified: true,
      isFirstLogin: false,
    },
  });
  console.log("✅ Admin user seeded:");
  console.log("   📧", adminUser.email);
  console.log("   🔐 password:", password);

  // Persiste le password dans un fichier local pour pouvoir le récupérer après
  // (si la console est perdue dans le bruit). À gitignorer.
  try {
    await writeFile(
      join(process.cwd(), ".seed-credentials.txt"),
      `email: ${adminUser.email}\npassword: ${password}\nseededAt: ${new Date().toISOString()}\n`,
      { encoding: "utf-8" }
    );
    console.log("   💾 credentials saved to .seed-credentials.txt");
  } catch (err) {
    console.warn(
      "   ⚠️  could not write .seed-credentials.txt:",
      err.message
    );
  }

  // ==========================================================================
  // 4. Catégories
  // ==========================================================================
  const CATEGORIES = ["Cours", "Stage", "Event"];
  const categoryByType = {};
  for (const type of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { type },
      update: {},
      create: { type },
    });
    categoryByType[type] = cat;
  }
  console.log("✅ Catégories seeded:", Object.keys(categoryByType).join(", "));

  // ==========================================================================
  // 4bis. Dossiers racines Cloudinary — immuables (pending / published / bin)
  // ==========================================================================
  // Ces 3 dossiers doivent exister constamment, vides ou non. On les persiste
  // ici pour que le Finder les affiche dès le premier rendu, avant tout
  // upload. Leur immutabilité (interdiction de les renommer ou supprimer) est
  // garantie côté router Cloudinary par la garde `assertRootFolder`.
  //
  // Note : même logique exécutée au boot de l'app via `instrumentation.ts`,
  // pour auto-cicatriser si une ligne vient à disparaître après le seed.
  const APP_ROOT = process.env.APP_SHORT_NAME || "AKFC";
  const ROOT_FOLDERS = [
    { fullPath: `${APP_ROOT}/pending`, status: "pending" },
    { fullPath: `${APP_ROOT}/published`, status: "published" },
    { fullPath: `${APP_ROOT}/bin`, status: "bin" },
  ];

  for (const f of ROOT_FOLDERS) {
    await prisma.folder.upsert({
      where: {
        appRoot_fullPath: {
          appRoot: APP_ROOT,
          fullPath: f.fullPath,
        },
      },
      update: {},
      create: {
        appRoot: APP_ROOT,
        fullPath: f.fullPath,
        status: f.status,
      },
    });
  }
  console.log(
    "✅ Root folders seeded:",
    ROOT_FOLDERS.map((f) => f.fullPath).join(", ")
  );

  // ==========================================================================
  // 5. Disciplines (catégorie "Cours" — modèle à 2 niveaux validé)
  // ==========================================================================
  // TODO: réviser `instructorId` quand de vrais coachs/référents auront été
  //       créés en base. Pour l'instant, Stéphane est référent par défaut.
  const courseCategoryId = categoryByType["Cours"].id;

  const DISCIPLINES = [
    {
      name: "Taï-chi",
      type: "MARTIAL_ART",
      family: "Kung-fu Wushu",
      school: "Chen",
      classification: "interne (yin)",
      origin: "Chine",
      description:
        "Apprentissage des taolus de l'école Chen. Pratique interne, lente et continue.",
    },
    {
      name: "Taolu multi-styles",
      type: "MARTIAL_ART",
      family: "Kung-fu Wushu",
      school: null,
      classification: null,
      origin: "Chine",
      description: "Étude de divers taolus et de leurs applications.",
    },
    {
      name: "Tchoy-Lee-Fut",
      type: "MARTIAL_ART",
      family: "Kung-fu Wushu",
      school: null,
      classification: "externe (yang)",
      origin: "Chine du Sud",
      description:
        "Style externe du Sud de la Chine. Pratique adaptée selon le public (adultes / 12-16 ans).",
    },
    {
      name: "Kali Escrima",
      type: "MARTIAL_ART",
      family: null,
      school: null,
      classification: null,
      origin: "Philippines",
      description: "Art martial philippin centré sur le travail des armes.",
    },
  ];

  const disciplineByName = {};
  for (const d of DISCIPLINES) {
    const disc = await prisma.discipline.upsert({
      where: {
        categoryId_name: {
          categoryId: courseCategoryId,
          name: d.name,
        },
      },
      update: {},
      create: {
        ...d,
        categoryId: courseCategoryId,
        instructorId: adminUser.id,
      },
    });
    disciplineByName[d.name] = disc;
  }
  console.log(
    "✅ Disciplines (Cours) seeded:",
    Object.keys(disciplineByName).join(", ")
  );

  console.log("🌱 Seed completed");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
FILE_EOF

echo
pnpm --filter web typecheck