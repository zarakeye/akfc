#!/usr/bin/env bash
#
# step_summary_image_front.sh
#
# Seconde moitié : le formulaire à deux champs, la carte qui empile image puis
# texte, et la reprise de ton contenu déjà rédigé.
#
# ─── Le formulaire ─────────────────────────────────────────────────────────
#
# Un picker d'image et un builder limité au bloc TEXTE. Plus aucun bloc ne
# porte de mise en page : la carte dispose, le contenu se contente d'exister.
#
# Le picker est `MediaPicker`, employé directement — `MediaListEditor` en
# dépend d'un contexte de PageBuilder qu'un formulaire n'a pas. Le chemin
# choisi est converti en identifiant par `media.resolveByPaths`, exactement
# comme le fait le builder.
#
# ─── La reprise de l'existant ──────────────────────────────────────────────
#
# Ta présentation actuelle contient un bloc « texte enrobant une image », qui
# ne fait plus partie de la palette. Le supprimer sans rien dire t'aurait fait
# perdre ton texte.
#
# À l'ouverture, `splitLegacySummary` défait donc l'ancien contenu : le texte
# de chaque bloc devient un bloc texte ordinaire, et la première image de
# bibliothèque rencontrée alimente le champ image. Rien à ressaisir.
#
# Les images d'AVATAR ne sont pas reprises : un avatar n'est pas un
# `MediaAsset` et n'a donc pas d'identifiant que ce champ puisse porter. Le
# cas ne se pose pas pour une discipline, mais il vaut mieux qu'il échoue
# visiblement — champ vide — que silencieusement.
#
# La conversion n'écrit rien tant que tu n'enregistres pas : ouvrir une fiche
# pour la regarder ne modifie aucune donnée.
#
# ─── La carte ──────────────────────────────────────────────────────────────
#
# L'image est HORS du repli, en `aspect-video`. C'est ce qui rend les cartes
# vraiment égales : une image dans la zone repliée mangerait toute la hauteur
# disponible et n'en laisserait aucune au texte, avec un résultat différent
# selon la forme de chaque photo. Seul le texte est clampé.
#
# Usage :
#   bash step_summary_image_front.sh
#   AKFC_APPLY_ONLY=1 bash step_summary_image_front.sh
#
set -euo pipefail

form_file="apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
edit_page="apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx"
cards_file="apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"
home_page="apps/web/src/app/(public)/page.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "summaryImages" "$home_page" 2>/dev/null; then
  echo "✓ déjà appliqué (images de carte résolues) — rien à faire"
  exit 0
fi

for f in "$form_file" "$edit_page" "$cards_file" "$home_page"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "summaryMediaId" prisma/schema.prisma || {
  echo "✗ le socle backend doit être appliqué d'abord"; exit 1; }

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

form_file = "apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
edit_page = "apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx"
cards_file = "apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"
home_page = "apps/web/src/app/(public)/page.tsx"

# ── 1/11 imports du formulaire ────────────────────────────────────────────
edit(form_file, """import { trpc } from "@/core/trpc/trpcClient";""",
"""import { trpc, trpcClient } from "@/core/trpc/trpcClient";
import { MediaPicker } from "@/features/finder-core/components/MediaPicker";""")

# ── 2/11 palette : texte seul, et la reprise de l'ancien contenu ──────────
edit(form_file, """/**
 * Palette du builder de présentation synthétique : le seul bloc
 * « média + texte ».
 *
 * Et NON le bloc « texte enrobant une image », qui a été essayé et ne
 * convient pas : un enrobage suppose un texte assez long pour longer l'image
 * puis se poursuivre dessous. Dans une carte, cette place n'existe pas — le
 * texte reste coincé dans la bande étroite qui longe l'image.
 *
 * Le média-texte, lui, passe à UNE colonne sous 44rem avec le média
 * AU-DESSUS du texte : c'est exactement l'ordre de lecture d'une carte, et
 * les cartes d'accueil sont toujours sous ce seuil.
 *
 * La restriction reste ce qui garantit que toutes les cartes se ressemblent :
 * un builder complet y autoriserait galeries et listes, et l'accueil
 * deviendrait un patchwork qu'aucune règle de style ne rattraperait.
 */
const SUMMARY_BLOCKS = ["media-text"] as const;""",
"""/**
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
}""")

# ── 3/11 type d'entrée ────────────────────────────────────────────────────
edit(form_file, """  summary: PageContentV1;
  categoryId: number;""",
"""  summary: PageContentV1;
  /** Image de la carte d'accueil. `null` = carte sans illustration. */
  summaryMediaId: string | null;
  categoryId: number;""")

# ── 4/11 état ─────────────────────────────────────────────────────────────
edit(form_file, """  const [summary, setSummary] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.summary) : emptyPageContentV1(),
  );""",
"""  // Reprise de l'ancien format, calculée à chaque rendu mais consommée
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
    : null;""")

# ── 5/11 payload ──────────────────────────────────────────────────────────
edit(form_file, """        description,
        summary,
        categoryId,""",
"""        description,
        summary,
        summaryMediaId,
        categoryId,""")

# ── 6/11 le picker, au-dessus du builder texte ────────────────────────────
edit(form_file, """        <PageBuilder
          value={summary}
          onChange={setSummary}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
          allowedBlocks={SUMMARY_BLOCKS}
        />""",
"""        <div className="mb-4 space-y-2">
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
        )}""")

# ── 7/11 page d'édition ───────────────────────────────────────────────────
edit(edit_page, """      summary: input.summary,""",
"""      summary: input.summary,
      summaryMediaId: input.summaryMediaId,""")

# ── 8/11 données de carte ─────────────────────────────────────────────────
edit(cards_file, """export interface DisciplineSummaryCardData {
  id: number;
  name: string;
  slug: string | null;
  /** Rendu serveur de la présentation synthétique. */
  content: ReactNode;
}""",
"""export interface DisciplineSummaryCardData {
  id: number;
  name: string;
  slug: string | null;
  /** Image de la carte, déjà résolue côté serveur. */
  imageUrl: string | null;
  /** Rendu serveur de la présentation synthétique. */
  content: ReactNode;
}""")

# ── 9/11 rendu : image au-dessus, HORS du repli ───────────────────────────
edit(cards_file, """          <h3 className="mb-3 text-xl font-semibold">{card.name}</h3>""",
"""          {card.imageUrl && (
            // Hors du repli, et en `aspect-video` : c'est ce qui rend les
            // cartes vraiment égales. Une image DANS la zone repliée
            // mangerait toute la hauteur disponible et n'en laisserait
            // aucune au texte, avec un résultat différent selon la forme de
            // chaque photo.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageUrl}
              alt=""
              className="mb-4 block aspect-video w-full rounded-md object-cover"
            />
          )}

          <h3 className="mb-3 text-xl font-semibold">{card.name}</h3>""")

# ── 10/11 accueil : lecture et résolution des images ──────────────────────
edit(home_page, """  const disciplineRows = await prisma.discipline.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, summary: true },
  });

  const disciplineCards = disciplineRows
    .map((row) => ({ row, content: parsePageContentV1(row.summary) }))
    .filter(({ content }) => content.blocks.length > 0)
    .map(({ row, content }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,""",
"""  const disciplineRows = await prisma.discipline.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      summary: true,
      summaryMediaId: true,
    },
  });

  // Résolution des images de carte en UNE requête, comme le fait
  // `PageRenderer` pour les médias d'un composite. Audience publique : ces
  // images s'affichent pour un visiteur anonyme.
  const summaryImages = await resolveMediaByIds(
    prisma,
    disciplineRows
      .map((row) => row.summaryMediaId)
      .filter((id): id is string => id !== null),
    "public",
  );

  const disciplineCards = disciplineRows
    .map((row) => ({ row, content: parsePageContentV1(row.summary) }))
    .filter(({ content }) => content.blocks.length > 0)
    .map(({ row, content }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      imageUrl: row.summaryMediaId
        ? (summaryImages[row.summaryMediaId]?.url ?? null)
        : null,""")

# ── 11/11 accueil : import de la résolution ───────────────────────────────
edit(home_page, """import { parsePageContentV1 } from "@contracts/page";""",
"""import { parsePageContentV1 } from "@contracts/page";
import { resolveMediaByIds } from "@backend/modules/media/services/resolveMediaByIds.service";""")
PY

echo "✓ formulaire à deux champs, carte image puis texte"

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
git commit -m "feat(disciplines): formulaire a deux champs et carte image puis texte

Le formulaire porte un picker d'image et un builder limite au bloc
TEXTE. Plus aucun bloc ne porte de mise en page : la carte dispose, le
contenu se contente d'exister.

MediaPicker est employe directement — MediaListEditor depend d'un
contexte de PageBuilder qu'un formulaire n'a pas. Le chemin choisi est
converti en identifiant par media.resolveByPaths, exactement comme le
fait le builder, pour que les deux voies produisent la meme reference.

Reprise de l'existant : splitLegacySummary defait les anciens blocs
porteurs d'images. Le texte de chacun devient un bloc texte ordinaire,
la premiere image de bibliotheque alimente le champ image. Sans cela,
ouvrir une fiche deja redigee aurait affiche un builder vide et fait
perdre le texte au premier enregistrement. La conversion n'ecrit rien
tant qu'on n'enregistre pas.

Les avatars ne sont pas repris : un avatar n'est pas un MediaAsset et
n'a pas d'identifiant que ce champ puisse porter. Mieux vaut un champ
visiblement vide qu'une reference silencieusement fausse.

Dans la carte, l'image est HORS du repli et en aspect-video. C'est ce
qui rend les cartes vraiment egales : une image dans la zone repliee
mangerait toute la hauteur et n'en laisserait aucune au texte, avec un
resultat different selon la forme de chaque photo."

echo "✓ commité"
git log -1 --oneline