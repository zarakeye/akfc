"use client";

import { useState, type JSX, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ExpandableContent } from "@features/social/ExpandableContent";

/**
 * Liste de cartes bâties sur une présentation synthétique.
 *
 * Employée par la page d'accueil (disciplines) et par l'agenda (stages et
 * événements). Un seul composant plutôt que deux jumeaux : ils auraient
 * divergé à la première correction, qui n'en aurait touché qu'un.
 *
 * Le contenu de chaque carte est un RSC (`PageRenderer`) rendu par le serveur
 * et passé ici en `ReactNode` : ce composant ne rend aucun contenu lui-même,
 * il ne fait qu'arbitrer le dépliage. C'est ce qui permet à un composant
 * client de piloter du contenu serveur.
 *
 * ACCORDÉON : une seule clé dépliée est retenue, donc dérouler une carte
 * replie mécaniquement la précédente. Aucun cas particulier à traiter — c'est
 * la forme de l'état qui l'impose.
 */

export interface SummaryCardData {
  /**
   * Clé unique dans la liste — une CHAÎNE et non un identifiant numérique :
   * l'agenda mêle stages et événements, dont les identifiants se recouvrent.
   * `stage-12` et `event-12` doivent rester distincts.
   */
  key: string;
  title: string;
  /** Ligne secondaire facultative : une date, une discipline… */
  subtitle?: string;
  /** Lien de sortie vers la page complète. `null` = pas de lien. */
  href: string | null;
  linkLabel: string;
  /** Image de carte, déjà résolue côté serveur. */
  imageUrl: string | null;
  /** Rendu serveur de la présentation synthétique. */
  content: ReactNode;
}

const DEFAULT_COLLAPSED_HEIGHT = 220;

/**
 * Les cartes sont en GRILLE. Ce n'est pas qu'une question d'allure : une
 * carte occupant un tiers du puits reste sous les seuils de bascule des blocs
 * qu'elle contient, ce qui rend leur mise en page prévisible.
 */
const GRID_CLASS = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export function SummaryCards({
  cards,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
}: {
  cards: SummaryCardData[];
  collapsedHeight?: number;
}): JSX.Element {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className={GRID_CLASS}>
      {cards.map((card) => (
        <article
          key={card.key}
          className="flex h-full flex-col rounded-lg border border-border bg-white p-6"
        >
          {card.imageUrl && (
            // Hors du repli, et en `aspect-video` : c'est ce qui rend les
            // cartes vraiment égales. Une image DANS la zone repliée
            // mangerait toute la hauteur disponible et n'en laisserait aucune
            // au texte, avec un résultat différent selon la forme de chaque
            // photo.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageUrl}
              alt=""
              className="mb-4 block aspect-video w-full rounded-md object-cover"
            />
          )}

          <h3 className="text-xl font-semibold">{card.title}</h3>
          {card.subtitle && (
            <p className="mb-3 text-sm text-muted-foreground">
              {card.subtitle}
            </p>
          )}
          {!card.subtitle && <div className="mb-3" />}

          <ExpandableContent
            collapsedHeight={collapsedHeight}
            expanded={expandedKey === card.key}
            onToggle={() =>
              setExpandedKey((current) =>
                current === card.key ? null : card.key,
              )
            }
            expandLabel="Lire la suite"
          >
            {card.content}
          </ExpandableContent>

          {card.href && (
            <div className="mt-auto border-t border-border pt-3">
              <Link
                href={card.href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                {card.linkLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
