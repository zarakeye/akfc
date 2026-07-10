"use client";

import { useMemo, useState, type JSX } from "react";
import { ChevronRight, Lock } from "lucide-react";

import { GalleryGrid } from "@features/gallery-public/GalleryGrid";
import { type LightboxItem } from "@features/gallery-public/GalleryLightbox";

/**
 * Vue publique groupée des galeries — Structure Y :
 *   niveau 1 : DISCIPLINE (ordre métier ci-dessous ; « Divers » en fin pour
 *              les galeries sans discipline / catégorie General),
 *   niveau 2 : CATÉGORIE (Cours → Stages → Events),
 *   niveau 3 : GALERIE (togglable),
 *   niveau 4 : MÉDIAS (GalleryGrid → lightbox via onItemClick).
 *
 * Tous les niveaux sont MULTI-OUVERTURE (Set d'ids ouverts par niveau).
 * Tout groupe/sous-groupe sans galerie est masqué (construit à partir des
 * données, donc un groupe vide n'existe simplement pas).
 *
 * Le filtrage par origine est fait EN AMONT par le parent (la liste reçue
 * est déjà filtrée) ; ce composant ne s'occupe que du groupement/affichage.
 */

export interface GroupedGallery {
  id: number;
  title: string;
  date: Date | null;
  visibility: string;
  discipline: { id: number; name: string } | null;
  category: { id: number; type: string } | null;
  origin: { id: number; name: string } | null;
  items: LightboxItem[];
}

interface GalleryGroupedViewProps {
  galleries: GroupedGallery[];
  onItemClick: (items: LightboxItem[], index: number) => void;
}

/** Ordre métier des disciplines (par nom). Les absentes suivent, triées
 *  alphabétiquement, avant le groupe « Divers » toujours en dernier. */
const DISCIPLINE_ORDER = [
  "Taolus multi-styles",
  "Tchoy Lee Fut",
  "Taïchi Chuan",
  "Kali",
  "Calligraphie chinoise",
];

/** Ordre des catégories (par type). Les autres ne sont pas affichées ici. */
const CATEGORY_ORDER = ["Cours", "Stage", "Event"];

/** Libellé du groupe « sans discipline » (catégorie General / transverses). */
const DIVERS_LABEL = "Divers";

function disciplineRank(name: string): number {
  const i = DISCIPLINE_ORDER.indexOf(name);
  return i === -1 ? DISCIPLINE_ORDER.length : i;
}

function categoryRank(type: string): number {
  const i = CATEGORY_ORDER.indexOf(type);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

interface CategoryGroup {
  key: string;
  label: string;
  galleries: GroupedGallery[];
}
interface DisciplineGroup {
  key: string;
  label: string;
  isDivers: boolean;
  categories: CategoryGroup[];
  // Galeries directes (groupe Divers : pas de sous-catégorie).
  directGalleries: GroupedGallery[];
}

export function GalleryGroupedView({
  galleries,
  onItemClick,
}: GalleryGroupedViewProps): JSX.Element {
  // Sémantique INVERSÉE : on stocke les groupes REPLIÉS, pas les ouverts.
  // Set vide = tout ouvert par défaut ; replier est un acte de l'utilisateur
  // (et un nouveau groupe apparu après filtrage est ouvert d'office).
  const [closedDisc, setClosedDisc] = useState<Set<string>>(new Set());
  const [closedCat, setClosedCat] = useState<Set<string>>(new Set());
  const [closedGallery, setClosedGallery] = useState<Set<number>>(new Set());

  // Construction de la hiérarchie discipline → catégorie → galeries. Un
  // groupe n'existe que s'il contient au moins une galerie (donc jamais vide).
  const groups = useMemo<DisciplineGroup[]>(() => {
    // Divers : galeries sans discipline (peu importe la catégorie).
    const divers: GroupedGallery[] = [];
    // discipline name → (catégorie type → galeries)
    const byDiscipline = new Map<string, Map<string, GroupedGallery[]>>();

    for (const g of galleries) {
      const discName = g.discipline?.name ?? null;
      const catType = g.category?.type ?? null;

      // Sans discipline → Divers (contenu transverse / vie du club).
      if (!discName) {
        divers.push(g);
        continue;
      }
      // Avec discipline mais catégorie hors Cours/Stage/Event → Divers aussi
      // (ces galeries n'ont pas de sous-groupe catégorie légitime).
      if (!catType || !CATEGORY_ORDER.includes(catType)) {
        divers.push(g);
        continue;
      }
      if (!byDiscipline.has(discName)) byDiscipline.set(discName, new Map());
      const cats = byDiscipline.get(discName)!;
      if (!cats.has(catType)) cats.set(catType, []);
      cats.get(catType)!.push(g);
    }

    const result: DisciplineGroup[] = [];

    // Disciplines ordonnées (ordre métier puis alpha).
    const discNames = [...byDiscipline.keys()].sort(
      (a, b) => disciplineRank(a) - disciplineRank(b) || a.localeCompare(b),
    );
    for (const discName of discNames) {
      const cats = byDiscipline.get(discName)!;
      const catGroups: CategoryGroup[] = [...cats.keys()]
        .sort((a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b))
        .map((catType) => ({
          key: `${discName}::${catType}`,
          label: catType,
          galleries: cats.get(catType)!,
        }));
      result.push({
        key: discName,
        label: discName,
        isDivers: false,
        categories: catGroups,
        directGalleries: [],
      });
    }

    // Divers en dernier, si non vide.
    if (divers.length > 0) {
      result.push({
        key: DIVERS_LABEL,
        label: DIVERS_LABEL,
        isDivers: true,
        categories: [],
        directGalleries: divers,
      });
    }

    return result;
  }, [galleries]);

  const toggle = <T,>(
    set: Set<T>,
    setSet: (s: Set<T>) => void,
    key: T,
  ): void => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSet(next);
  };

  if (groups.length === 0) {
    return (
      <p className="text-gray-500">Aucune galerie ne correspond à ce filtre.</p>
    );
  }

  const renderGallery = (g: GroupedGallery): JSX.Element => {
    const open = !closedGallery.has(g.id);
    return (
      <div key={g.id} className="border-l-2 border-gray-100 pl-3">
        <button
          type="button"
          onClick={() => toggle(closedGallery, setClosedGallery, g.id)}
          className="flex w-full items-center gap-2 py-2 text-left"
        >
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
              open ? "rotate-90" : ""
            }`}
          />
          <span className="font-medium text-gray-800">{g.title}</span>
          {g.visibility === "MEMBERS" && (
            <Lock className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="ml-auto text-xs text-gray-400">
            {g.items.length} média{g.items.length > 1 ? "s" : ""}
          </span>
        </button>
        {open && (
          <div className="pb-3 pl-6">
            <GalleryGrid
              items={g.items}
              onItemClick={(index) => onItemClick(g.items, index)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {groups.map((disc) => {
        const discOpen = !closedDisc.has(disc.key);
        return (
          <section key={disc.key}>
            {/* Niveau 1 : discipline (ou Divers) */}
            <button
              type="button"
              onClick={() => toggle(closedDisc, setClosedDisc, disc.key)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left"
            >
              <ChevronRight
                className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${
                  discOpen ? "rotate-90" : ""
                }`}
              />
              <span className="text-lg font-semibold text-gray-900">
                {disc.label}
              </span>
            </button>

            {discOpen && (
              <div className="px-4 pb-3">
                {disc.isDivers
                  ? // Divers : galeries directes, sans sous-catégorie.
                    disc.directGalleries.map(renderGallery)
                  : // Sinon : niveau 2 = catégories.
                    disc.categories.map((cat) => {
                      const catOpen = !closedCat.has(cat.key);
                      return (
                        <div key={cat.key} className="mt-1">
                          <button
                            type="button"
                            onClick={() =>
                              toggle(closedCat, setClosedCat, cat.key)
                            }
                            className="flex w-full items-center gap-2 py-2 text-left"
                          >
                            <ChevronRight
                              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                                catOpen ? "rotate-90" : ""
                              }`}
                            />
                            <span className="font-semibold uppercase tracking-wide text-gray-600 text-sm">
                              {cat.label}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {cat.galleries.length}
                            </span>
                          </button>
                          {catOpen && (
                            <div className="pl-6">
                              {cat.galleries.map(renderGallery)}
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
