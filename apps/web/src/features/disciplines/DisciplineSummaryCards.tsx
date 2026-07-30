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
const DEFAULT_COLLAPSED_HEIGHT = 220;

/**
 * Les cartes sont en GRILLE, et ce n'est pas qu'une question d'allure.
 *
 * Le bloc média-texte n'empile le média au-dessus du texte qu'en dessous de
 * 44rem. Une carte occupant un tiers du puits fait environ 21rem, donc
 * toujours sous le seuil : l'empilement est garanti par construction. En
 * pleine largeur, la carte repasserait à deux colonnes — précisément la mise
 * en page qu'on ne veut pas ici.
 */
const GRID_CLASS = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export function DisciplineSummaryCards({
  cards,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
}: {
  cards: DisciplineSummaryCardData[];
  collapsedHeight?: number;
}): JSX.Element {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className={GRID_CLASS}>
      {cards.map((card) => (
        <article
          key={card.id}
          className="flex h-full flex-col rounded-lg border border-border bg-white p-6"
        >
          <h3 className="mb-3 text-xl font-semibold">{card.name}</h3>

          <ExpandableContent
            collapsedHeight={collapsedHeight}
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
            <div className="mt-auto border-t border-border pt-3">
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
