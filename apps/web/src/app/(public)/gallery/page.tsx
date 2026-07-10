"use client";

import { useEffect, useMemo, useState, type JSX } from "react";

import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import {
  GalleryLightbox,
  type LightboxItem,
} from "@features/gallery-public/GalleryLightbox";
import {
  GalleryGroupedView,
  type GroupedGallery,
} from "@features/gallery-public/GalleryGroupedView";

/**
 * Page publique des galeries — `/gallery`.
 *
 * Fetch SESSION-AWARE (anonyme = PUBLIC, connecté = +MEMBERS ; re-fetch au
 * changement de session). Un filtre ORIGINE (choix unique + « toutes »)
 * réduit l'ensemble ; la vue groupée (discipline → catégorie → galerie →
 * médias) fait le reste. Kali n'apparaît naturellement pas quand l'origine
 * filtrée est Chine (aucune galerie kali chinoise → groupe absent).
 */

type PublicGallery = Awaited<
  ReturnType<typeof trpcClient.gallery.getPublicIndex.query>
>[number];

export default function PublicGalleryPage(): JSX.Element {
  const userId = useSessionStore((s) => s.session?.user?.id ?? null);
  const [galleries, setGalleries] = useState<PublicGallery[] | null>(null);
  const [originId, setOriginId] = useState<number | "all">("all");
  const [lightbox, setLightbox] = useState<{
    items: LightboxItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void trpcClient.gallery.getPublicIndex.query().then((data) => {
      if (!cancelled) setGalleries(data);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Origines présentes dans les galeries (pour peupler le sélecteur — on ne
  // propose que des origines qui ont au moins une galerie).
  const origins = useMemo(() => {
    const map = new Map<number, string>();
    for (const g of galleries ?? []) {
      if (g.origin) map.set(g.origin.id, g.origin.name);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [galleries]);

  // Galeries non vides, filtrées par origine, projetées pour la vue groupée.
  const visible: GroupedGallery[] = useMemo(() => {
    return (galleries ?? [])
      .filter((g) => g.items.length > 0)
      .filter((g) => originId === "all" || g.origin?.id === originId)
      .map((g) => ({
        id: g.id,
        title: g.title,
        date: g.date,
        visibility: g.visibility,
        discipline: g.discipline,
        category: g.category,
        origin: g.origin,
        items: g.items,
      }));
  }, [galleries, originId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">La galerie</h1>

      {/* Filtre origine */}
      {origins.length > 0 && (
        <div className="mb-6 flex items-center gap-2">
          <label htmlFor="origin-filter" className="text-sm text-gray-600">
            Origine :
          </label>
          <select
            id="origin-filter"
            value={originId === "all" ? "all" : String(originId)}
            onChange={(e) =>
              setOriginId(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="all">Toutes</option>
            {origins.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {galleries === null ? (
        <p className="text-gray-500">Chargement…</p>
      ) : (
        <GalleryGroupedView
          galleries={visible}
          onItemClick={(items, index) => setLightbox({ items, index })}
        />
      )}

      {lightbox && (
        <GalleryLightbox
          items={lightbox.items}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
