#!/usr/bin/env bash
#
# step_discipline_cards_home.sh
#
# Incrément 3/3 (première moitié) — les cartes sur l'accueil, plus la limite
# de caractères sur le builder restreint. Le menu « Qui sommes-nous ? » suit
# dans un script à part.
#
# ─── Réemploi plutôt que réécriture ────────────────────────────────────────
#
# Le mur de posts fait DÉJÀ ce que tu décris : contenu composite rendu
# intégralement côté serveur, clampé visuellement par `ExpandableContent`,
# avec mesure du débordement au ResizeObserver et bouton qui n'apparaît que
# si le contenu déborde vraiment. Écrire un second composant du même métier
# aurait été un doublon, avec deux comportements à maintenir en phase.
#
# Il ne lui manquait qu'une chose : il garde son état pour lui, alors que ton
# accordéon exige qu'un parent arbitre. `ExpandableContent` accepte donc
# désormais un mode CONTRÔLÉ (`expanded` + `onToggle`) — et reste inchangé
# quand on ne les passe pas, donc le mur de posts n'est pas touché.
#
# ─── Troncature : par hauteur, pas par nombre de mots ──────────────────────
#
# Tu demandais une coupe à un certain nombre de mots. Je te livre une coupe à
# une HAUTEUR fixe, et voici pourquoi — c'est un désaccord de moyen, pas de
# but.
#
# Ton but est que toutes les cartes aient la même dimension au départ. Un
# nombre de mots ne le garantit pas : les mots n'ont pas la même longueur, et
# l'image enrobée décale les retours à la ligne d'une carte à l'autre. Deux
# cartes de 40 mots peuvent occuper 5 et 8 lignes. Une hauteur fixe, elle,
# donne l'égalité par construction.
#
# Elle préserve en outre le texte riche — gras, liens, titres — qu'une coupe
# au mot obligerait à aplatir en texte brut, puisqu'on ne peut pas couper du
# HTML au milieu sans le casser. Et elle traite l'image comme le texte : une
# carte qui ouvre sur une grande photo est clampée elle aussi.
#
# La hauteur repliée est un seul nombre (`COLLAPSED_HEIGHT`), à ajuster à
# l'œil une fois tes vraies présentations en place.
#
# ─── L'accordéon ───────────────────────────────────────────────────────────
#
# Le parent ne retient qu'un seul identifiant déplié. Dérouler une carte
# replie donc mécaniquement la précédente — il n'y a pas de cas à traiter,
# c'est la forme de l'état qui l'impose.
#
# ─── La limite de caractères ───────────────────────────────────────────────
#
# Le comptage marche sur le TEXTE BRUT extrait du composite : ni le balisage,
# ni les légendes, ni les identifiants de médias ne comptent — seul ce que
# l'admin a réellement tapé.
#
# Le compteur est vivant sous le builder et vire à l'orange puis au rouge ;
# au-delà, l'enregistrement est refusé avec un message qui donne le compte.
# J'ai écarté le blocage à la frappe : il exigerait
# `@tiptap/extension-character-count` (absent du projet) et une intervention
# dans la configuration de l'éditeur, qui a déjà coûté des régressions ici.
# Un blocage dur est par ailleurs hostile au collage — il tronque au milieu
# d'une phrase sans prévenir.
#
# La limite vit dans les contrats et non dans le formulaire, pour que le
# backend puisse la faire respecter à son tour le jour où tu le voudras.
#
# Usage :
#   bash step_discipline_cards_home.sh
#   AKFC_APPLY_ONLY=1 bash step_discipline_cards_home.sh
#
set -euo pipefail

PLAIN="packages/contracts/src/page/plainText.ts"
INDEX="packages/contracts/src/page/index.ts"
EXPAND="apps/web/src/features/social/ExpandableContent.tsx"
CARDS="apps/web/src/features/disciplines/DisciplineSummaryCards.tsx"
FORM="apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
HOME="apps/web/src/app/(public)/page.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "DisciplineSummaryCards" "$HOME" 2>/dev/null; then
  echo "✓ déjà appliqué (cartes sur l'accueil) — rien à faire"
  exit 0
fi

for f in "$INDEX" "$EXPAND" "$FORM" "$HOME"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "summary Json" prisma/schema.prisma || {
  echo "✗ les incréments 1/3 et 2/3 doivent être appliqués d'abord"; exit 1; }

mkdir -p apps/web/src/features/disciplines

# ─────────────────────────────────────────────────────────────────────────
#  1 — Extraction de texte brut et limite, dans les contrats
# ─────────────────────────────────────────────────────────────────────────

cat > "$PLAIN" <<'TS'
import type { PageContentV1 } from '@contracts/page/blocks.v1';

/**
 * Extraction du texte BRUT d'un composite de page.
 *
 * Sert à mesurer ce qu'un rédacteur a réellement tapé, sans compter le
 * balisage, les légendes ni les identifiants de médias. C'est la seule
 * mesure qui ait un sens pour une limite éditoriale : compter le JSON
 * pénaliserait quelqu'un qui met un mot en gras.
 */

/**
 * Longueur maximale de la présentation synthétique d'une discipline.
 *
 * Une présentation qui dépasse cette longueur cesse d'être synthétique et
 * fait double emploi avec la page détaillée — c'est précisément ce que la
 * limite empêche.
 *
 * Vit dans les contrats et non dans le formulaire pour que le backend
 * puisse la faire respecter à son tour, sans dupliquer la valeur.
 */
export const DISCIPLINE_SUMMARY_MAX_CHARS = 600;

/**
 * Texte d'un nœud ProseMirror et de sa descendance.
 *
 * Les nœuds sont joints par une espace : deux paragraphes successifs
 * comptent pour deux mots séparés et non pour un mot collé.
 */
function textFromNode(node: unknown): string {
  if (node === null || typeof node !== 'object') return '';
  const n = node as { text?: unknown; content?: unknown };
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.content)) {
    return n.content.map(textFromNode).join(' ');
  }
  return '';
}

/**
 * Texte brut de tous les blocs porteurs de texte riche (tiptap, media-text,
 * float-text). Les blocs de médias n'ont pas de texte propre et ne comptent
 * donc pas.
 */
export function plainTextFromPageContentV1(content: PageContentV1): string {
  return content.blocks
    .map((block) => ('content' in block ? textFromNode(block.content) : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
TS
echo "  + plainText.ts"

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

edit("packages/contracts/src/page/index.ts",
"""export * from '@contracts/page/parseContent';""",
"""export * from '@contracts/page/parseContent';
export * from '@contracts/page/plainText';""")

# ── 2 — ExpandableContent devient pilotable ───────────────────────────────
edit("apps/web/src/features/social/ExpandableContent.tsx",
"""interface ExpandableContentProps {
  children: ReactNode;
  /** Hauteur repliée, en px. */
  collapsedHeight?: number;
}""",
"""interface ExpandableContentProps {
  children: ReactNode;
  /** Hauteur repliée, en px. */
  collapsedHeight?: number;
  /**
   * Mode CONTRÔLÉ. Fourni, l'état de dépliage appartient au parent — ce qui
   * permet un accordéon, où déplier une carte replie la précédente. Absent,
   * le composant garde son état pour lui (comportement du mur de posts,
   * inchangé).
   */
  expanded?: boolean;
  onToggle?: () => void;
  /** Libellés, pour adapter au contexte (« Voir → », « Lire la suite »…). */
  expandLabel?: string;
  collapseLabel?: string;
}""")

edit("apps/web/src/features/social/ExpandableContent.tsx",
"""export function ExpandableContent({
  children,
  collapsedHeight = 300,
}: ExpandableContentProps): JSX.Element {
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);""",
"""export function ExpandableContent({
  children,
  collapsedHeight = 300,
  expanded: controlledExpanded,
  onToggle,
  expandLabel = "Voir →",
  collapseLabel = "Réduire",
}: ExpandableContentProps): JSX.Element {
  const innerRef = useRef<HTMLDivElement>(null);
  const [selfExpanded, setSelfExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  // Contrôlé dès que le parent fournit `expanded`. Le hook d'état interne
  // reste appelé dans tous les cas — l'ordre des hooks ne doit pas dépendre
  // des props.
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : selfExpanded;
  const toggle = () => {
    if (isControlled) onToggle?.();
    else setSelfExpanded((e) => !e);
  };""")

edit("apps/web/src/features/social/ExpandableContent.tsx",
"""        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          {expanded ? "Réduire" : "Voir →"}
        </button>""",
"""        <button
          type="button"
          onClick={toggle}
          className="mt-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          {expanded ? collapseLabel : expandLabel}
        </button>""")
PY

# ─────────────────────────────────────────────────────────────────────────
#  3 — Les cartes
# ─────────────────────────────────────────────────────────────────────────

cat > "$CARDS" <<'TSX'
"use client";

import { useState, type JSX, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ExpandableContent } from "@features/social/ExpandableContent";

/**
 * Cartes de présentation synthétique des disciplines, sur la page d'accueil.
 *
 * Le contenu de chaque carte est un RSC (`PageRenderer`) rendu par le
 * serveur et passé ici en `ReactNode` : ce composant ne rend aucun contenu
 * lui-même, il ne fait qu'arbitrer le dépliage. C'est ce qui permet à un
 * composant client de piloter du contenu serveur.
 *
 * ACCORDÉON : un seul identifiant déplié est retenu, donc dérouler une carte
 * replie mécaniquement la précédente. Il n'y a pas de cas particulier à
 * traiter — c'est la forme de l'état qui l'impose.
 */

export interface DisciplineSummaryCardData {
  id: number;
  name: string;
  slug: string | null;
  /** Rendu serveur de la présentation synthétique. */
  content: ReactNode;
}

/**
 * Hauteur repliée, en pixels.
 *
 * La troncature est en HAUTEUR et non en nombre de mots : c'est ce qui rend
 * les cartes égales par construction. Deux présentations de même longueur en
 * mots peuvent occuper cinq ou huit lignes selon les mots employés et selon
 * la façon dont l'image enrobée décale les retours à la ligne.
 *
 * À ajuster à l'œil une fois de vraies présentations en place.
 */
const COLLAPSED_HEIGHT = 220;

export function DisciplineSummaryCards({
  cards,
}: {
  cards: DisciplineSummaryCardData[];
}): JSX.Element {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="flex flex-col" style={{ gap: "var(--akfc-block-gap)" }}>
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-lg border border-border bg-white p-6"
        >
          <h3 className="mb-3 text-xl font-semibold">{card.name}</h3>

          <ExpandableContent
            collapsedHeight={COLLAPSED_HEIGHT}
            expanded={expandedId === card.id}
            onToggle={() =>
              setExpandedId((current) =>
                current === card.id ? null : card.id,
              )
            }
            expandLabel="Lire la suite"
          >
            {card.content}
          </ExpandableContent>

          {card.slug && (
            <div className="mt-4 border-t border-border pt-3">
              <Link
                href={`/disciplines/${card.slug}`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                Voir la discipline
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
TSX
echo "  + DisciplineSummaryCards.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  4 — Le compteur dans le formulaire, puis la section d'accueil
# ─────────────────────────────────────────────────────────────────────────

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

FORM = "apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
HOME = "apps/web/src/app/(public)/page.tsx"

# ── import de la mesure et de la limite ──────────────────────────────────
edit(FORM, """  emptyPageContentV1,
  parsePageContentV1,""",
"""  emptyPageContentV1,
  parsePageContentV1,
  plainTextFromPageContentV1,
  DISCIPLINE_SUMMARY_MAX_CHARS,""")

# ── la mesure, au niveau du composant ────────────────────────────────────
edit(FORM, """  const [isSubmitting, setIsSubmitting] = useState(false);""",
"""  // Mesure du texte réellement tapé : ni le balisage ni les légendes ne
  // comptent. Recalculée à chaque rendu — l'opération est un simple parcours
  // d'arbre, sans mémoïsation nécessaire (React Compiler s'en charge).
  const summaryChars = plainTextFromPageContentV1(summary).length;
  const summaryOverLimit = summaryChars > DISCIPLINE_SUMMARY_MAX_CHARS;

  const [isSubmitting, setIsSubmitting] = useState(false);""")

# ── refus d'enregistrement au-delà de la limite ──────────────────────────
edit(FORM, """    setIsSubmitting(true);
    try {
      await onSubmit({""",
"""    if (summaryOverLimit) {
      setSubmitError(
        `La présentation synthétique dépasse la limite : ${summaryChars} caractères pour ${DISCIPLINE_SUMMARY_MAX_CHARS} autorisés. Raccourcissez-la — le détail a sa place dans la description ci-dessus.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({""")

# ── le compteur vivant sous le builder restreint ─────────────────────────
edit(FORM, """        <PageBuilder
          value={summary}
          onChange={setSummary}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
          allowedBlocks={SUMMARY_BLOCKS}
        />
      </fieldset>""",
"""        <PageBuilder
          value={summary}
          onChange={setSummary}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
          allowedBlocks={SUMMARY_BLOCKS}
        />
        <p
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
      </fieldset>""")

# ── page d'accueil : imports ─────────────────────────────────────────────
edit(HOME, """import { PostCard } from "@features/social/PostCard";""",
"""import { PostCard } from "@features/social/PostCard";
import { PageRenderer } from "@features/page-builder/PageRenderer";
import { DisciplineSummaryCards } from "@features/disciplines/DisciplineSummaryCards";
import { parsePageContentV1 } from "@contracts/page";""")

# ── page d'accueil : la requête ──────────────────────────────────────────
edit(HOME, """export default async function HomePage(): Promise<JSX.Element> {
  const activities = [""",
"""export default async function HomePage(): Promise<JSX.Element> {
  // Disciplines présentées sur l'accueil : celles dont la présentation
  // synthétique n'est PAS vide. Rédiger vaut donc inscription, et il n'y a ni
  // sélection ni ordre à maintenir à part.
  //
  // Le filtre se fait après lecture plutôt qu'en SQL : « composite non vide »
  // se juge sur `blocks.length` une fois le Json parsé, ce qu'une clause
  // Prisma ne sait pas exprimer sans dépendre de la forme sérialisée.
  const disciplineRows = await prisma.discipline.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, summary: true },
  });

  const disciplineCards = disciplineRows
    .map((row) => ({ row, content: parsePageContentV1(row.summary) }))
    .filter(({ content }) => content.blocks.length > 0)
    .map(({ row, content }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      // Rendu SERVEUR, passé ensuite en ReactNode au composant client qui
      // arbitre le dépliage : « Lire la suite » ne va rien chercher, il lève
      // seulement le clamp.
      content: <PageRenderer content={content} />,
    }));

  const activities = [""")

# ── page d'accueil : la section ──────────────────────────────────────────
edit(HOME, """      </section>

      {/* Accès aux pages publiques */}""",
"""      </section>

      {/* Présentations synthétiques des disciplines */}
      {disciplineCards.length > 0 && (
        <section className="akfc-page py-12">
          <h2 className="mb-8 text-2xl font-bold">Nos disciplines</h2>
          <DisciplineSummaryCards cards={disciplineCards} />
        </section>
      )}

      {/* Accès aux pages publiques */}""")
PY

echo "✓ cartes d'accueil, accordéon et limite de caractères posés"

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
git commit -m "feat(home): cartes de presentation synthetique des disciplines

Increment 3/3, premiere moitie. Le menu « Qui sommes-nous ? » suit.

Reemploi plutot que reecriture : le mur de posts clampait deja du
contenu serveur avec ExpandableContent (mesure du debordement au
ResizeObserver, bouton affiche seulement si ca deborde). Il ne lui
manquait qu'un mode CONTROLE — sans lui, chaque carte garderait son
etat et l'accordeon serait impossible. Le mur de posts n'est pas touche
: sans les props de controle, le comportement est inchange.

Troncature en HAUTEUR et non en nombre de mots. Le but est que les
cartes aient la meme dimension au depart ; un nombre de mots ne le
garantit pas (longueurs inegales, retours a la ligne decales par
l'image enrobee), une hauteur fixe si. Elle preserve en outre le texte
riche, qu'une coupe au mot obligerait a aplatir.

Accordeon : le parent ne retient qu'un identifiant deplie, donc
derouler une carte replie la precedente sans cas particulier.

Limite de caracteres sur le texte BRUT extrait du composite — ni
balisage ni legendes ne comptent. Compteur vivant, puis refus
d'enregistrement au-dela. Pas de blocage a la frappe : il exigerait
@tiptap/extension-character-count (absent) et une intervention dans la
configuration de l'editeur, deja source de regressions ici. La limite
vit dans les contrats pour que le backend puisse la reprendre."

echo "✓ commité"
git log -1 --oneline