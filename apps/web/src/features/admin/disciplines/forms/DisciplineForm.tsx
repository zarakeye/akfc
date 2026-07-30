"use client";

import { useState } from "react";
import type { Discipline, DisciplineType } from "@prisma/client";

import { PageBuilder } from "@features/page-builder";
import { trpc, trpcClient } from "@/core/trpc/trpcClient";
import { MediaPicker } from "@/features/finder-core/components/MediaPicker";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

import { CategorySelect } from "@features/admin/common/components/CategorySelect";
import { OriginSelect } from "@features/admin/common/components/OriginSelect";
import { FamilySelect } from "@/features/admin/common/components/FamilySelect";
import { InstructorSelect } from "@features/admin/common/components/InstructorSelect";

import { slugify } from "@contracts/slug/slugify";
import {
  emptyPageContentV1,
  parsePageContentV1,
  plainTextFromPageContentV1,
  DISCIPLINE_SUMMARY_MAX_CHARS,
  type PageContentV1,
} from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Palette du builder de présentation synthétique : le seul bloc TEXTE.
 *
 * L'image ne passe plus par un bloc mais par un champ à part. Les blocs
 * porteurs d'images — média-texte, texte enrobant une image — ont chacun
 * leur mise en page propre : ratios, côté, seuils de bascule. Pour une carte
 * dont la disposition est fixe, c'est du bagage inutile, et il s'est retourné
 * contre nous.
 *
 * Ne restant que du texte, plus rien dans le contenu ne peut décider de la
 * mise en page : la carte dispose, et elle seule.
 */
const SUMMARY_BLOCKS = ["tiptap"] as const;

/**
 * Défait une présentation rédigée AVANT la refonte, sans rien écrire en base.
 *
 * L'ancien format rangeait texte et image dans un même bloc (« média-texte »
 * ou « texte enrobant une image »), désormais hors palette. Sans cette
 * reprise, ouvrir une fiche existante afficherait un builder vide et ferait
 * perdre le texte au premier enregistrement.
 *
 * Le texte de chaque bloc devient un bloc texte ordinaire ; la première image
 * de BIBLIOTHÈQUE rencontrée alimente le champ image.
 *
 * Les images d'avatar sont ignorées à dessein : un avatar n'est pas un
 * `MediaAsset` et n'a pas d'identifiant que ce champ puisse porter. Mieux
 * vaut un champ visiblement vide qu'une référence silencieusement fausse.
 */
function splitLegacySummary(raw: unknown): {
  text: PageContentV1;
  mediaId: string | null;
} {
  const parsed = parsePageContentV1(raw);

  const carrier = parsed.blocks.find(
    (block) =>
      (block.type === "media-text" || block.type === "float-text") &&
      block.media?.kind === "library",
  );
  const mediaId =
    carrier &&
    (carrier.type === "media-text" || carrier.type === "float-text") &&
    carrier.media?.kind === "library"
      ? carrier.media.mediaId
      : null;

  const blocks: PageContentV1["blocks"] = parsed.blocks.flatMap((block) => {
    if (block.type === "tiptap") return [block];
    if (block.type === "media-text" || block.type === "float-text") {
      return [{ id: block.id, type: "tiptap" as const, content: block.content ?? {} }];
    }
    // Galeries, audios, documents : sans place dans une carte, et sans texte
    // à préserver. On les laisse tomber plutôt que de les rendre inéditables.
    return [];
  });

  return { text: { version: 1, blocks }, mediaId };
}

export interface DisciplineFormInput {
  name: string;
  slug: string;
  type: DisciplineType;
  familyId: number | null;
  school: string | null;
  classification: string | null;
  originId: number | null;
  description: PageContentV1;
  /**
   * Présentation synthétique pour la page d'accueil. Composite VIDE = la
   * discipline ne figure pas sur l'accueil.
   */
  summary: PageContentV1;
  /** Image de la carte d'accueil. `null` = carte sans illustration. */
  summaryMediaId: string | null;
  categoryId: number;
  instructorId: string;
}

export interface DisciplineFormProps {
  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Discipline;
  /** Appelée à la soumission. */
  onSubmit: (input: DisciplineFormInput) => Promise<void>;
  /** Libellé du bouton de soumission. Default "Enregistrer". */
  submitLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constantes                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

const DISCIPLINE_TYPES: { value: DisciplineType; label: string }[] = [
  { value: "MARTIAL_ART", label: "Art martial" },
  { value: "CALLIGRAPHY", label: "Calligraphie" },
];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Formulaire d'édition d'une `Discipline`. Trois sections :
 *
 *   1. **Identité** — name, slug, type, catégorie, instructeur principal
 *   2. **Origine et classification** — origine culturelle (Origin) et
 *      famille (DisciplineFamily, via sélecteur), plus school / classification
 *   3. **Description** — composite Json édité au PageBuilder
 *
 * Validations au submit :
 *   - `name` non vide
 *   - `slug` non vide (auto-rempli depuis le nom, éditable)
 *   - `categoryId !== 0` (forcé par le placeholder du CategorySelect)
 *   - `instructorId !== null` (Discipline.instructorId est NOT NULL)
 *
 * Le `slug` suit le nom tant que l'admin n'y a pas touché (pattern
 * `OriginForm`), puis devient indépendant — il reste **stable au
 * renommage** une fois figé. Le `familyId` remplace l'ancien champ texte
 * libre `family` : on choisit une `DisciplineFamily` existante (ou aucune).
 *
 * Le `categoryId` est immutable côté router ; en mode édition le select
 * est remplacé par un champ désactivé.
 */
export function DisciplineForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: DisciplineFormProps) {
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [slug, setSlug] = useState<string>(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial);
  const [type, setType] = useState<DisciplineType>(
    initial?.type ?? "MARTIAL_ART",
  );
  const [familyId, setFamilyId] = useState<number | null>(
    initial?.familyId ?? null,
  );
  const [school, setSchool] = useState<string>(initial?.school ?? "");
  const [classification, setClassification] = useState<string>(
    initial?.classification ?? "",
  );
  const [originId, setOriginId] = useState<number | null>(
    initial?.originId ?? null,
  );
  const [categoryId, setCategoryId] = useState<number>(
    initial?.categoryId ?? 0,
  );
  const [instructorId, setInstructorId] = useState<string | null>(
    initial?.instructorId ?? null,
  );
  const [description, setDescription] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.description) : emptyPageContentV1(),
  );
  // Reprise de l'ancien format, calculée à chaque rendu mais consommée
  // uniquement à l'initialisation des états ci-dessous : ouvrir une fiche
  // n'écrit rien.
  const legacy = splitLegacySummary(initial?.summary);

  const [summary, setSummary] = useState<PageContentV1>(
    initial ? legacy.text : emptyPageContentV1(),
  );
  const [summaryMediaId, setSummaryMediaId] = useState<string | null>(
    initial ? (initial.summaryMediaId ?? legacy.mediaId) : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  // Résolution de l'image choisie, pour l'aperçu du formulaire.
  const summaryImage = trpc.media.resolveByIds.useQuery(
    { mediaIds: summaryMediaId ? [summaryMediaId] : [] },
    { enabled: summaryMediaId !== null },
  );
  const summaryImageUrl = summaryMediaId
    ? (summaryImage.data?.[summaryMediaId]?.url ?? null)
    : null;
  // Réglages éditoriaux PARTAGÉS (une seule ligne SiteStyle, comme le
  // laboratoire). Le contrôle est ici pour qu'on puisse l'essayer sans
  // changer de page ; la valeur, elle, vaut pour toutes les disciplines.
  const limits = trpc.siteStyle.getLimits.useQuery();
  const saveLimits = trpc.siteStyle.saveLimits.useMutation();

  // Saisie locale, qui prend le pas sur la valeur enregistrée tant qu'on
  // tape : le compteur réagit immédiatement, l'enregistrement attend le
  // départ du champ.
  const [maxCharsDraft, setMaxCharsDraft] = useState<number | null>(null);
  const [cardHeightDraft, setCardHeightDraft] = useState<number | null>(null);

  const maxChars =
    maxCharsDraft ??
    limits.data?.summaryMaxChars ??
    DISCIPLINE_SUMMARY_MAX_CHARS;
  const cardHeight = cardHeightDraft ?? limits.data?.cardCollapsedHeight ?? 220;

  const persistLimits = () => {
    saveLimits.mutate({
      summaryMaxChars: maxChars,
      cardCollapsedHeight: cardHeight,
    });
  };

  // Mesure du texte réellement tapé : ni le balisage ni les légendes ne
  // comptent. Recalculée à chaque rendu — l'opération est un simple parcours
  // d'arbre, sans mémoïsation nécessaire (React Compiler s'en charge).
  const summaryChars = plainTextFromPageContentV1(summary).length;
  const summaryOverLimit = summaryChars > maxChars;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = !!initial;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugTouched(true);
  };

  const handleRegenerateSlug = () => {
    setSlug(slugify(name));
    setSlugTouched(false);
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (name.trim() === "") {
      setSubmitError("Le nom est obligatoire.");
      return;
    }
    if (slug.trim() === "") {
      setSubmitError("Le slug est obligatoire.");
      return;
    }
    if (categoryId === 0) {
      setSubmitError("Veuillez sélectionner une catégorie.");
      return;
    }
    if (instructorId === null) {
      setSubmitError(
        "L'instructeur principal est obligatoire. Sélectionne quelqu'un.",
      );
      return;
    }

    if (summaryOverLimit) {
      setSubmitError(
        `La présentation synthétique dépasse la limite : ${summaryChars} caractères pour ${maxChars} autorisés. Raccourcissez-la — le détail a sa place dans la description ci-dessus.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        type,
        familyId,
        school: school.trim() === "" ? null : school.trim(),
        classification:
          classification.trim() === "" ? null : classification.trim(),
        originId,
        description,
        summary,
        summaryMediaId,
        categoryId,
        instructorId,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Identité ─────────────────────────────────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">Identité</legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nom *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Karaté Shotokan"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center justify-between font-medium">
            Slug *
            <button
              type="button"
              onClick={handleRegenerateSlug}
              className="text-xs font-normal text-muted-foreground underline hover:text-foreground"
            >
              régénérer depuis le nom
            </button>
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="karate-shotokan"
            className="rounded border border-input bg-background px-2 py-1 font-mono text-xs"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Type *</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DisciplineType)}
            className="rounded border border-input bg-background px-2 py-1"
          >
            {DISCIPLINE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            Catégorie *
            {isEditMode && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (non modifiable)
              </span>
            )}
          </span>
          {isEditMode ? (
            <input
              type="text"
              value={`Catégorie #${categoryId}`}
              disabled
              className="cursor-not-allowed rounded border border-input bg-muted px-2 py-1 text-muted-foreground"
            />
          ) : (
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Instructeur principal *</span>
          <InstructorSelect value={instructorId} onChange={setInstructorId} />
        </label>
      </fieldset>

      {/* ── Origine et classification ───────────────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">
          Origine et classification
        </legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Origine culturelle</span>
          <OriginSelect value={originId} onChange={setOriginId} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Famille</span>
          <FamilySelect value={familyId} onChange={setFamilyId} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">École</span>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="Shōtōkan, Aikikai…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Classification</span>
          <input
            type="text"
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            placeholder="Sport olympique, art martial traditionnel…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>
      </fieldset>

      {/* ── Description (PageBuilder) ───────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Description (PageBuilder)
        </legend>
        <PageBuilder
          value={description}
          onChange={setDescription}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      {/* ── Présentation synthétique (builder restreint) ─────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Présentation synthétique (page d&apos;accueil)
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Une image et quelques lignes, affichées en carte sur la page
          d&apos;accueil avec un lien vers la page complète ci-dessus. Dans la
          carte, l&apos;image se place au-dessus du texte. Laissez vide pour
          que cette discipline ne figure pas sur l&apos;accueil.
        </p>
        <div className="mb-4 space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Image de la carte
          </span>
          <div className="flex items-start gap-3">
            <div className="h-24 w-40 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              {summaryImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={summaryImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  {summaryMediaId ? "Chargement…" : "Aucune image"}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {summaryMediaId ? "Remplacer l'image" : "Choisir une image"}
              </button>
              {summaryMediaId && (
                <button
                  type="button"
                  onClick={() => setSummaryMediaId(null)}
                  className="text-left text-xs text-muted-foreground hover:text-destructive"
                >
                  Retirer l&apos;image
                </button>
              )}
            </div>
          </div>
        </div>

        <PageBuilder
          value={summary}
          onChange={setSummary}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
          allowedBlocks={SUMMARY_BLOCKS}
        />

        {pickerOpen && (
          <MediaPicker
            open
            adapter={finderStorageAdapter}
            rootPath={APP_ROOT}
            onClose={() => setPickerOpen(false)}
            onSubmit={(paths) => {
              setPickerOpen(false);
              if (paths.length === 0) return;
              // Le picker rend des CHEMINS ; la conversion en identifiant est
              // la même que celle du builder, pour que les deux voies
              // produisent exactement la même référence.
              void trpcClient.media.resolveByPaths
                .query({ appRoot: APP_ROOT, paths })
                .then((resolved) => {
                  const found = Object.values(resolved).find(
                    (id): id is string => id !== null,
                  );
                  if (found) setSummaryMediaId(found);
                });
            }}
          />
        )}
        <p
          className={
            summaryOverLimit
              ? "mt-2 text-right text-xs font-medium text-destructive"
              : summaryChars > maxChars * 0.85
                ? "mt-2 text-right text-xs font-medium text-amber-600"
                : "mt-2 text-right text-xs text-muted-foreground"
          }
        >
          {summaryChars} / {maxChars} caractères
          {summaryOverLimit && " — enregistrement bloqué"}
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-dashed border-border pt-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Limite de caractères
            <input
              type="number"
              min={100}
              max={3000}
              step={50}
              value={maxChars}
              onChange={(e) => setMaxCharsDraft(Number(e.target.value))}
              onBlur={persistLimits}
              className="w-28 rounded-md border border-border px-2 py-1 text-sm text-foreground"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Hauteur repliée des cartes (px)
            <input
              type="number"
              min={80}
              max={1000}
              step={10}
              value={cardHeight}
              onChange={(e) => setCardHeightDraft(Number(e.target.value))}
              onBlur={persistLimits}
              className="w-28 rounded-md border border-border px-2 py-1 text-sm text-foreground"
            />
          </label>

          <p className="flex-1 text-xs text-muted-foreground">
            Ces deux réglages valent pour TOUTES les disciplines, pas
            seulement celle-ci — une règle éditoriale n&apos;a de sens que si
            elle est la même partout. La hauteur est ce qui rend les cartes
            égales : un nombre de caractères ne le ferait pas, les mots
            n&apos;ayant pas tous la même longueur.
            {saveLimits.isPending && " Enregistrement…"}
          </p>
        </div>
      </fieldset>

      {/* ── Action ──────────────────────────────────────────────────── */}
      {submitError && (
        <pre className="whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {submitError}
        </pre>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </div>
  );
}