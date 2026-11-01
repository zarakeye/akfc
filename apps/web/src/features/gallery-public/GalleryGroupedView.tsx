"use client";

import { useMemo, useState, type JSX } from "react";
import { ChevronRight, Lock } from "lucide-react";

import { GalleryGrid } from "@features/gallery-public/GalleryGrid";
import { type LightboxItem } from "@features/gallery-public/GalleryLightbox";
import { CATEGORY_KEYS, type CategoryKey } from "@contracts/categories/categoryKey";
import { compareDisciplines, type FamilyRank } from "@features/app-shell/disciplineOrder";

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
  discipline: { id: number; name: string; family: FamilyRank | null } | null;
  category: { id: number; key: CategoryKey | null; type: string } | null;
  origin: { id: number; name: string } | null;
  items: LightboxItem[];
}

interface GalleryGroupedViewProps {
  galleries: GroupedGallery[];
  onItemClick: (items: LightboxItem[], index: number) => void;
}

/** Ordre des catégories, par clé (jamais par libellé, que l'on peut renommer). */
const CATEGORY_ORDER = CATEGORY_KEYS;

/** Libellé du groupe « sans discipline » (catégorie General / transverses). */
const DIVERS_LABEL = "Divers";


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
    // id de discipline → la discipline, et (clé de catégorie → galeries)
    const byDiscipline = new Map<
      number,
      { discipline: NonNullable<GroupedGallery["discipline"]>; cats: Map<CategoryKey, GroupedGallery[]> }
    >();
    // clé de catégorie → libellé affiché
    const labels = new Map<CategoryKey, string>();

    for (const g of galleries) {
      const discipline = g.discipline;
      const catKey = g.category?.key ?? null;

      // Sans discipline → Divers (contenu transverse / vie du club).
      if (!discipline) {
        divers.push(g);
        continue;
      }
      // Avec discipline mais sans catégorie de la liste → Divers aussi
      // (ces galeries n'ont pas de sous-groupe catégorie légitime).
      if (!catKey) {
        divers.push(g);
        continue;
      }
      labels.set(catKey, g.category!.type);
      if (!byDiscipline.has(discipline.id)) byDiscipline.set(discipline.id, { discipline, cats: new Map() });
      const cats = byDiscipline.get(discipline.id)!.cats;
      if (!cats.has(catKey)) cats.set(catKey, []);
      cats.get(catKey)!.push(g);
    }

    const result: DisciplineGroup[] = [];

    // Disciplines dans l'ordre du menu « Nos disciplines » (disciplineOrder.ts) : famille, puis nom.
    const ordered = [...byDiscipline.values()].sort((a, b) => compareDisciplines(a.discipline, b.discipline));
    for (const { discipline, cats } of ordered) {
      const discKey = `discipline-${discipline.id}`;
      const catGroups: CategoryGroup[] = [...cats.keys()]
        .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
        .map((catKey) => ({
          key: `${discKey}::${catKey}`,
          label: labels.get(catKey)!,
          galleries: cats.get(catKey)!,
        }));
      result.push({
        key: discKey,
        label: discipline.name,
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
