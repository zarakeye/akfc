#!/usr/bin/env bash
#
# step_inline_editorial_limits.sh
#
# Les deux réglages éditoriaux deviennent modifiables SUR PLACE, à côté du
# builder — sans changer de page.
#
# ─── Pourquoi pas le laboratoire, finalement ───────────────────────────────
#
# Tu as raison sur l'usage : un réglage qu'on ne peut pas essayer sans changer
# de page, on ne l'essaie pas. On le laisse à sa valeur par défaut et il ne
# sert à rien.
#
# Mais la VALEUR, elle, reste partagée : une limite éditoriale n'a de sens que
# si elle vaut pour toutes les cartes. Le contrôle vit donc dans le
# formulaire, la valeur dans `SiteStyle` — la même ligne unique que le
# laboratoire. Régler depuis une discipline change le réglage de TOUTES, et
# l'interface le dit explicitement, sinon la surprise viendrait plus tard.
#
# ─── Deux colonnes plutôt qu'une entrée dans `variables` ───────────────────
#
# `SiteStyle.variables` est une carte de propriétés CSS, validée par une
# expression régulière qui n'accepte que `--akfc-…`. Y glisser une limite de
# caractères — qui n'est pas une propriété CSS et ne finira jamais dans une
# balise `<style>` — aurait été un abus de ce champ. Deux colonnes entières
# disent ce qu'elles sont et se valident naturellement.
#
# ─── Sur le mot « caractères » pour l'accordéon ────────────────────────────
#
# Le second réglage est une HAUTEUR en pixels, pas un nombre de caractères, et
# c'est volontaire — un nombre de caractères ne donnerait pas des cartes de
# même hauteur, puisque les mots n'ont pas la même longueur. Le champ est donc
# libellé comme une hauteur, pour que tu saches ce que tu règles ; l'effet
# recherché, lui, est le même.
#
# ─── Une procédure à part, pas une modification de l'existante ─────────────
#
# `siteStyle.get` et `siteStyle.save` restent intactes : le layout racine et
# le laboratoire en dépendent, et changer leur forme de retour pour y ajouter
# deux entiers aurait fait porter à ces deux consommateurs le risque d'un
# ajout qui ne les concerne pas. Deux procédures nouvelles, `getLimits` et
# `saveLimits`, coûtent un aller-retour de plus et ne cassent rien.
#
# Usage :
#   bash step_inline_editorial_limits.sh
#   AKFC_APPLY_ONLY=1 bash step_inline_editorial_limits.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/siteStyle/router.ts"
FORM="apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
CARDS="apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"
HOME="apps/web/src/app/(public)/page.tsx"
MIGDIR="prisma/migrations/20260730160000_editorial_limits"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "summaryMaxChars" "$SCHEMA" 2>/dev/null; then
  echo "✓ déjà appliqué (colonnes de réglages présentes) — rien à faire"
  exit 0
fi

for f in "$SCHEMA" "$ROUTER" "$FORM" "$CARDS" "$HOME"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

mkdir -p "$MIGDIR"
cat > "$MIGDIR/migration.sql" <<'SQL'
-- Réglages éditoriaux partagés, pilotés depuis le formulaire de discipline.
--
-- NOT NULL + DEFAULT : la ligne existante reçoit les valeurs en vigueur
-- jusqu'ici (600 caractères, 220 pixels), donc aucun changement visible à
-- l'application de la migration.
ALTER TABLE "SiteStyle"
  ADD COLUMN "summaryMaxChars" INTEGER NOT NULL DEFAULT 600,
  ADD COLUMN "cardCollapsedHeight" INTEGER NOT NULL DEFAULT 220;
SQL
echo "  + migration 20260730160000_editorial_limits"

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

SCHEMA = "prisma/schema.prisma"
ROUTER = "packages/backend/src/modules/siteStyle/router.ts"
FORM   = "apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
CARDS  = "apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"
HOME   = "apps/web/src/app/(public)/page.tsx"

# ── 1/9 schéma ────────────────────────────────────────────────────────────
edit(SCHEMA, """model SiteStyle {
  id        Int      @id @default(1)
  variables Json
  updatedAt DateTime @updatedAt
}""",
"""model SiteStyle {
  id        Int      @id @default(1)
  variables Json

  /// Longueur maximale d'une présentation synthétique de discipline, en
  /// caractères de texte brut.
  ///
  /// Colonne à part et non entrée de `variables` : ce n'est pas une propriété
  /// CSS et cela ne finira jamais dans une balise `<style>`.
  summaryMaxChars Int @default(600)

  /// Hauteur repliée des cartes d'accueil, en pixels.
  ///
  /// Une hauteur et non un nombre de caractères : c'est elle qui rend les
  /// cartes égales, les mots n'ayant pas tous la même longueur.
  cardCollapsedHeight Int @default(220)

  updatedAt DateTime @updatedAt
}""")

# ── 2/9 routeur : lecture et écriture des réglages ────────────────────────
edit(ROUTER, """      return { success: true };
    }),
});""",
"""      return { success: true };
    }),

  /**
   * Réglages ÉDITORIAUX, distincts des variables CSS.
   *
   * Procédures à part plutôt qu'un élargissement de `get` / `save` : le
   * layout racine et le laboratoire dépendent de la forme de retour de ces
   * dernières, et leur faire porter deux entiers qui ne les concernent pas
   * aurait été un risque gratuit.
   *
   * Lecture publique, comme `get` : la page d'accueil en a besoin pour
   * replier ses cartes, et un visiteur anonyme doit la rendre correctement.
   */
  getLimits: publicProcedure.query(async ({ ctx }) => {
    const row = await ctx.prisma.siteStyle.findUnique({
      where: { id: 1 },
      select: { summaryMaxChars: true, cardCollapsedHeight: true },
    });
    // Repli sur les valeurs par défaut du schéma quand aucune ligne n'existe
    // encore — le site doit s'afficher avant tout premier enregistrement.
    return {
      summaryMaxChars: row?.summaryMaxChars ?? 600,
      cardCollapsedHeight: row?.cardCollapsedHeight ?? 220,
    };
  }),

  saveLimits: protectedProcedure
    .input(
      z.object({
        // Bornes larges mais réelles : elles empêchent surtout la saisie
        // absurde (zéro, ou une valeur qui viderait la page de son sens).
        summaryMaxChars: z.number().int().min(100).max(3000),
        cardCollapsedHeight: z.number().int().min(80).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.siteStyle.upsert({
        where: { id: 1 },
        create: { id: 1, variables: {}, ...input },
        update: input,
      });
      return { success: true };
    }),
});""")

# ── 3/9 formulaire : accès tRPC ───────────────────────────────────────────
edit(FORM, """import { PageBuilder } from "@features/page-builder";""",
"""import { PageBuilder } from "@features/page-builder";
import { trpc } from "@/core/trpc/trpcClient";""")

# ── 4/9 formulaire : état des réglages ────────────────────────────────────
edit(FORM, """  // Mesure du texte réellement tapé : ni le balisage ni les légendes ne
  // comptent. Recalculée à chaque rendu — l'opération est un simple parcours
  // d'arbre, sans mémoïsation nécessaire (React Compiler s'en charge).
  const summaryChars = plainTextFromPageContentV1(summary).length;
  const summaryOverLimit = summaryChars > DISCIPLINE_SUMMARY_MAX_CHARS;""",
"""  // Réglages éditoriaux PARTAGÉS (une seule ligne SiteStyle, comme le
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
  const summaryOverLimit = summaryChars > maxChars;""")

# ── 5/9 formulaire : le refus d'enregistrement suit la limite réglée ──────
edit(FORM, """        `La présentation synthétique dépasse la limite : ${summaryChars} caractères pour ${DISCIPLINE_SUMMARY_MAX_CHARS} autorisés. Raccourcissez-la — le détail a sa place dans la description ci-dessus.`,""",
"""        `La présentation synthétique dépasse la limite : ${summaryChars} caractères pour ${maxChars} autorisés. Raccourcissez-la — le détail a sa place dans la description ci-dessus.`,""")

# ── 6/9 formulaire : compteur + les deux champs, sous le builder ──────────
edit(FORM, """        <p
          className={
            summaryOverLimit
              ? "mt-2 text-right text-xs font-medium text-destructive"
              : summaryChars > DISCIPLINE_SUMMARY_MAX_CHARS * 0.85
                ? "mt-2 text-right text-xs font-medium text-amber-600"
                : "mt-2 text-right text-xs text-muted-foreground"
          }
        >
          {summaryChars} / {DISCIPLINE_SUMMARY_MAX_CHARS} caractères
          {summaryOverLimit && " — enregistrement bloqué"}
        </p>
      </fieldset>""",
"""        <p
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
      </fieldset>""")

# ── 7/9 cartes : la hauteur devient une donnée ────────────────────────────
edit(CARDS, """/**
 * Hauteur repliée, en pixels.
 *
 * La troncature est en HAUTEUR et non en nombre de mots : c'est ce qui rend
 * les cartes égales par construction. Deux présentations de même longueur en
 * mots peuvent occuper cinq ou huit lignes selon les mots employés et selon
 * la façon dont l'image enrobée décale les retours à la ligne.
 *
 * À ajuster à l'œil une fois de vraies présentations en place.
 */
const COLLAPSED_HEIGHT = 220;""",
"""/**
 * Hauteur repliée par défaut, en pixels — utilisée seulement si l'appelant
 * n'en fournit pas.
 *
 * La troncature est en HAUTEUR et non en nombre de mots : c'est ce qui rend
 * les cartes égales par construction. Deux présentations de même longueur en
 * mots peuvent occuper cinq ou huit lignes selon les mots employés.
 *
 * La valeur réelle vient de `SiteStyle`, réglable depuis le formulaire de
 * discipline.
 */
const DEFAULT_COLLAPSED_HEIGHT = 220;""")

edit(CARDS, """export function DisciplineSummaryCards({
  cards,
}: {
  cards: DisciplineSummaryCardData[];
}): JSX.Element {""",
"""export function DisciplineSummaryCards({
  cards,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
}: {
  cards: DisciplineSummaryCardData[];
  collapsedHeight?: number;
}): JSX.Element {""")

edit(CARDS, """            collapsedHeight={COLLAPSED_HEIGHT}""",
"""            collapsedHeight={collapsedHeight}""")

# ── 8/9 accueil : lecture de la hauteur ──────────────────────────────────
edit(HOME, """  const activities = [""",
"""  // Hauteur repliée des cartes : réglage partagé, lu ici plutôt que codé en
  // dur pour que le champ du formulaire ait un effet visible.
  const styleRow = await prisma.siteStyle.findUnique({
    where: { id: 1 },
    select: { cardCollapsedHeight: true },
  });

  const activities = [""")

# ── 9/9 accueil : transmission ───────────────────────────────────────────
edit(HOME, """          <DisciplineSummaryCards cards={disciplineCards} />""",
"""          <DisciplineSummaryCards
            cards={disciplineCards}
            collapsedHeight={styleRow?.cardCollapsedHeight ?? 220}
          />""")
PY

echo "✓ réglages éditoriaux posés"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni migration, ni typecheck, ni commit."
  exit 0
fi

# ── Migration et génération, DEPUIS LA RACINE ──────────────────────────────
# Prisma est configuré à la racine (postinstall, config seed, schéma) : lancé
# depuis packages/backend, il ne vise pas le bon schéma et rend la main sans
# rien faire — une réussite apparente, déjà rencontrée ici.
echo "→ migration (depuis la racine)…"
pnpm prisma migrate deploy || { echo "✗ migration échouée — rien n'est commité"; exit 1; }

echo "→ génération du client (depuis la racine)…"
pnpm prisma generate || { echo "✗ génération échouée — rien n'est commité"; exit 1; }

echo "→ vérification du client généré…"
GEN="$(find node_modules -path '*.prisma/client/index.d.ts' 2>/dev/null | head -1 || true)"
if [ -z "$GEN" ] || ! grep -q "summaryMaxChars" "$GEN"; then
  echo "✗ le client généré ne connaît pas summaryMaxChars — rien n'est commité"
  exit 1
fi
echo "  ✓ client à jour"

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(editorial): limite et hauteur repliee reglables sur place

Un reglage qu'on ne peut pas essayer sans changer de page ne s'essaie
pas. Les deux controles vivent donc a cote du builder, dans le
formulaire de discipline.

La VALEUR, elle, reste partagee : une limite editoriale n'a de sens que
si elle vaut pour toutes les cartes. Elle est stockee dans SiteStyle —
la meme ligne unique que le laboratoire — et l'interface annonce
explicitement que le reglage vaut pour toutes les disciplines.

Deux colonnes entieres plutot que des entrees dans SiteStyle.variables:
ce champ est une carte de proprietes CSS, validee par une expression
reguliere qui n'accepte que --akfc- ; une limite de caracteres n'en est
pas une et ne finira jamais dans une balise <style>.

getLimits / saveLimits sont des procedures NOUVELLES : get et save
restent intactes, le layout racine et le laboratoire dependant de leur
forme de retour.

Le second reglage est une hauteur en pixels et non un nombre de
caracteres — c'est la hauteur qui rend les cartes egales, les mots
n'ayant pas tous la meme longueur. Le champ est libelle comme tel."

echo "✓ commité"
git log -1 --oneline