#!/usr/bin/env bash
#
# step_agenda_forms.sh
#
# Incrément 2 de l'agenda — les formulaires de stage et d'événement reçoivent
# le résumé.
#
# ─── Un bloc partagé, écrit une fois ───────────────────────────────────────
#
# Trois formulaires ont désormais besoin du même ensemble : picker d'image,
# builder limité au texte, compteur de caractères, et les deux réglages
# partagés. Le recopier trois fois, c'est garantir qu'ils divergeront — la
# première correction n'en toucherait qu'un.
#
# `SummaryFieldset` porte donc l'ensemble, et `useSummaryLimits` expose les
# deux réglages à qui en a besoin. L'hôte s'en sert pour refuser
# l'enregistrement au-delà de la limite : c'est lui qui possède le bouton, la
# décision lui revient.
#
# Le formulaire des disciplines n'est PAS migré ici. Il fonctionne, et
# mélanger une extraction avec un branchement double le nombre de choses qui
# peuvent casser en un seul aller-retour. C'est l'incrément suivant, isolé.
#
# ─── Ce que le résumé sert ici ─────────────────────────────────────────────
#
# La carte de la page « Agenda », qui renverra vers la page de détail
# existante. Un résumé vide = pas de carte, donc pas de présence à l'agenda —
# même interrupteur que pour les disciplines sur l'accueil.
#
# ─── Le stage a maintenant TROIS composites ────────────────────────────────
#
# Description (ce qu'est le stage), programme (ce qui s'y passe), résumé
# (l'accroche). Les libellés le disent, sinon la question « lequel je
# remplis ? » se posera à chaque saisie.
#
# Usage :
#   bash step_agenda_forms.sh
#   AKFC_APPLY_ONLY=1 bash step_agenda_forms.sh
#
set -euo pipefail

shared_component="apps/web/src/features/admin/common/SummaryFieldset.tsx"
stage_form="apps/web/src/features/admin/stages/forms/StageForm.tsx"
event_form="apps/web/src/features/admin/events/forms/EventForm.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "SummaryFieldset" "$event_form" 2>/dev/null; then
  echo "✓ déjà appliqué (résumé posé sur les deux formulaires) — rien à faire"
  exit 0
fi

for f in "$stage_form" "$event_form"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "summaryMediaId" prisma/schema.prisma || {
  echo "✗ l'incrément 1 (socle) doit être appliqué d'abord"; exit 1; }

mkdir -p "$(dirname "$shared_component")"

cat > "$shared_component" <<'TSX'
"use client";

import { useState, type JSX, type ReactNode } from "react";

import { trpc, trpcClient } from "@/core/trpc/trpcClient";
import { MediaPicker } from "@/features/finder-core/components/MediaPicker";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";
import { PageBuilder } from "@features/page-builder";
import {
  plainTextFromPageContentV1,
  DISCIPLINE_SUMMARY_MAX_CHARS,
  type PageContentV1,
} from "@contracts/page";

/**
 * Bloc « présentation synthétique », partagé par les formulaires de
 * discipline, de stage et d'événement.
 *
 * Écrit une fois plutôt que recopié trois fois : trois exemplaires
 * divergeraient à la première correction, qui n'en toucherait qu'un.
 *
 * L'image passe par un CHAMP et non par un bloc du builder. Les blocs
 * porteurs d'images ont chacun leur mise en page propre — ratios, côté,
 * seuils de bascule — inutile ici où la carte impose sa disposition, et déjà
 * source d'ennuis. Le builder est donc limité au bloc TEXTE : plus rien dans
 * le contenu ne peut décider de la mise en page.
 */

const SUMMARY_BLOCKS = ["tiptap"] as const;

/**
 * Réglages éditoriaux PARTAGÉS (une seule ligne `SiteStyle`).
 *
 * Exposés par un hook plutôt que passés en props : l'hôte en a besoin pour
 * refuser l'enregistrement au-delà de la limite — c'est lui qui possède le
 * bouton — et le bloc en a besoin pour son compteur. Les deux consomment la
 * même requête, que react-query dédoublonne.
 */
export function useSummaryLimits(): {
  maxChars: number;
  cardCollapsedHeight: number;
} {
  const limits = trpc.siteStyle.getLimits.useQuery();
  return {
    maxChars: limits.data?.summaryMaxChars ?? DISCIPLINE_SUMMARY_MAX_CHARS,
    cardCollapsedHeight: limits.data?.cardCollapsedHeight ?? 220,
  };
}

export function SummaryFieldset({
  legend,
  help,
  summary,
  onSummaryChange,
  mediaId,
  onMediaIdChange,
}: {
  legend: string;
  help: ReactNode;
  summary: PageContentV1;
  onSummaryChange: (next: PageContentV1) => void;
  mediaId: string | null;
  onMediaIdChange: (next: string | null) => void;
}): JSX.Element {
  const { maxChars } = useSummaryLimits();
  const saveLimits = trpc.siteStyle.saveLimits.useMutation();
  const currentLimits = trpc.siteStyle.getLimits.useQuery();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [maxCharsDraft, setMaxCharsDraft] = useState<number | null>(null);
  const [cardHeightDraft, setCardHeightDraft] = useState<number | null>(null);

  const effectiveMax = maxCharsDraft ?? maxChars;
  const effectiveHeight =
    cardHeightDraft ?? currentLimits.data?.cardCollapsedHeight ?? 220;

  const persistLimits = () => {
    saveLimits.mutate({
      summaryMaxChars: effectiveMax,
      cardCollapsedHeight: effectiveHeight,
    });
  };

  const image = trpc.media.resolveByIds.useQuery(
    { mediaIds: mediaId ? [mediaId] : [] },
    { enabled: mediaId !== null },
  );
  const imageUrl = mediaId ? (image.data?.[mediaId]?.url ?? null) : null;

  const chars = plainTextFromPageContentV1(summary).length;
  const overLimit = chars > effectiveMax;

  return (
    <fieldset className="rounded-lg border border-border p-4">
      <legend className="px-2 text-sm font-medium">{legend}</legend>
      <p className="mb-3 text-xs text-muted-foreground">{help}</p>

      <div className="mb-4 space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Image de la carte
        </span>
        <div className="flex items-start gap-3">
          <div className="h-24 w-40 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                {mediaId ? "Chargement…" : "Aucune image"}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              {mediaId ? "Remplacer l'image" : "Choisir une image"}
            </button>
            {mediaId && (
              <button
                type="button"
                onClick={() => onMediaIdChange(null)}
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
        onChange={onSummaryChange}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
        allowedBlocks={SUMMARY_BLOCKS}
      />

      <p
        className={
          overLimit
            ? "mt-2 text-right text-xs font-medium text-destructive"
            : chars > effectiveMax * 0.85
              ? "mt-2 text-right text-xs font-medium text-amber-600"
              : "mt-2 text-right text-xs text-muted-foreground"
        }
      >
        {chars} / {effectiveMax} caractères
        {overLimit && " — enregistrement bloqué"}
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-dashed border-border pt-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Limite de caractères
          <input
            type="number"
            min={100}
            max={3000}
            step={50}
            value={effectiveMax}
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
            value={effectiveHeight}
            onChange={(e) => setCardHeightDraft(Number(e.target.value))}
            onBlur={persistLimits}
            className="w-28 rounded-md border border-border px-2 py-1 text-sm text-foreground"
          />
        </label>

        <p className="flex-1 text-xs text-muted-foreground">
          Ces deux réglages valent pour TOUTES les cartes du site — disciplines,
          stages et événements. Une règle éditoriale n&apos;a de sens que si
          elle est la même partout.
          {saveLimits.isPending && " Enregistrement…"}
        </p>
      </div>

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
            // celle du builder, pour que les deux voies produisent la même
            // référence.
            void trpcClient.media.resolveByPaths
              .query({ appRoot: APP_ROOT, paths })
              .then((resolved) => {
                const found = Object.values(resolved).find(
                  (id): id is string => id !== null,
                );
                if (found) onMediaIdChange(found);
              });
          }}
        />
      )}
    </fieldset>
  );
}
TSX
echo "  + SummaryFieldset.tsx"

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

stage_form = "apps/web/src/features/admin/stages/forms/StageForm.tsx"
event_form = "apps/web/src/features/admin/events/forms/EventForm.tsx"

help_stage = """Quelques lignes et une image, affichées en carte sur la page
          Agenda avec un lien vers la fiche complète. Laissez vide pour que ce
          stage ne figure pas à l&apos;agenda."""
help_event = """Quelques lignes et une image, affichées en carte sur la page
          Agenda avec un lien vers la fiche complète. Laissez vide pour que cet
          événement ne figure pas à l&apos;agenda."""

for path, kind, composite, help_text in (
    (stage_form, "Stage", "  program: PageContentV1;", help_stage),
    (event_form, "Event", "  content: PageContentV1;", help_event),
):
    # ── imports ──────────────────────────────────────────────────────────
    edit(path, """import { PageBuilder } from "@features/page-builder";""",
"""import { PageBuilder } from "@features/page-builder";
import {
  SummaryFieldset,
  useSummaryLimits,
} from "@features/admin/common/SummaryFieldset";""")

    # `plainTextFromPageContentV1` sert au refus d'enregistrement : sans cet
    # ajout, le fichier compile mais ne typecheck pas.
    edit(path, """import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@contracts/page";""",
"""import {
  emptyPageContentV1,
  parsePageContentV1,
  plainTextFromPageContentV1,
  type PageContentV1,
} from "@contracts/page";""")

    # ── type d'entrée ────────────────────────────────────────────────────
    edit(path, composite,
composite + """
  /** Présentation synthétique pour la carte d'agenda. Vide = pas de carte. */
  summary: PageContentV1;
  /** Image de la carte d'agenda. */
  summaryMediaId: string | null;""")

edit(stage_form, """  const [program, setProgram] = useState<PageContentV1>(""",
"""  const [summary, setSummary] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.summary) : emptyPageContentV1(),
  );
  const [summaryMediaId, setSummaryMediaId] = useState<string | null>(
    initial?.summaryMediaId ?? null,
  );
  const { maxChars: summaryMaxChars } = useSummaryLimits();
  const summaryOverLimit =
    plainTextFromPageContentV1(summary).length > summaryMaxChars;

  const [program, setProgram] = useState<PageContentV1>(""")

edit(event_form, """  const [submitError, setSubmitError] = useState<string | null>(null);""",
"""  const [summary, setSummary] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.summary) : emptyPageContentV1(),
  );
  const [summaryMediaId, setSummaryMediaId] = useState<string | null>(
    initial?.summaryMediaId ?? null,
  );
  const { maxChars: summaryMaxChars } = useSummaryLimits();
  const summaryOverLimit =
    plainTextFromPageContentV1(summary).length > summaryMaxChars;

  const [submitError, setSubmitError] = useState<string | null>(null);""")

# ── refus d'enregistrement et payload ────────────────────────────────────
edit(stage_form, """    setIsSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),""",
"""    if (summaryOverLimit) {
      setSubmitError(
        `La présentation synthétique dépasse la limite de ${summaryMaxChars} caractères. Raccourcissez-la — le détail a sa place dans la description et le programme.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),""")

edit(stage_form, """        description,
        program,
        preRegistered,""",
"""        description,
        program,
        summary,
        summaryMediaId,
        preRegistered,""")

edit(event_form, """    setIsSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),""",
"""    if (summaryOverLimit) {
      setSubmitError(
        `La présentation synthétique dépasse la limite de ${summaryMaxChars} caractères. Raccourcissez-la — le détail a sa place dans le contenu complet.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),""")

edit(event_form, """        slug: slug.trim(),
        content,
        audience,""",
"""        slug: slug.trim(),
        content,
        summary,
        summaryMediaId,
        audience,""")

# ── le bloc, après le dernier builder de chaque formulaire ───────────────
edit(stage_form, """        <PageBuilder
          value={program}
          onChange={setProgram}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>""",
"""        <PageBuilder
          value={program}
          onChange={setProgram}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      <SummaryFieldset
        legend="Présentation synthétique (page Agenda)"
        help={
          <>
            Quelques lignes et une image, affichées en carte sur la page Agenda
            avec un lien vers la fiche complète. Laissez vide pour que ce stage
            ne figure pas à l&apos;agenda.
          </>
        }
        summary={summary}
        onSummaryChange={setSummary}
        mediaId={summaryMediaId}
        onMediaIdChange={setSummaryMediaId}
      />""")

edit(event_form, """        <PageBuilder
          value={content}
          onChange={setContent}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>""",
"""        <PageBuilder
          value={content}
          onChange={setContent}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      <SummaryFieldset
        legend="Présentation synthétique (page Agenda)"
        help={
          <>
            Quelques lignes et une image, affichées en carte sur la page Agenda
            avec un lien vers la fiche complète. Laissez vide pour que cet
            événement ne figure pas à l&apos;agenda.
          </>
        }
        summary={summary}
        onSummaryChange={setSummary}
        mediaId={summaryMediaId}
        onMediaIdChange={setSummaryMediaId}
      />""")
PY

echo "✓ résumé branché sur les formulaires de stage et d'événement"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(agenda): resume sur les formulaires de stage et d'evenement

Increment 2. Trois formulaires ont desormais besoin du meme ensemble —
picker d'image, builder limite au texte, compteur, reglages partages.
Le recopier trois fois garantirait qu'ils divergent : la premiere
correction n'en toucherait qu'un.

SummaryFieldset porte l'ensemble, useSummaryLimits expose les deux
reglages. L'hote s'en sert pour refuser l'enregistrement au-dela de la
limite : c'est lui qui possede le bouton, la decision lui revient.

Le formulaire des disciplines n'est pas migre ici. Il fonctionne, et
meler une extraction a un branchement double le nombre de choses qui
peuvent casser en un seul aller-retour. Increment suivant, isole.

Le stage porte maintenant TROIS composites — description, programme,
resume. Les libelles le disent, sinon la question « lequel je
remplis ? » se posera a chaque saisie."

echo "✓ commité"
git log -1 --oneline