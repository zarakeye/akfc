'use client';

import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { trpcClient } from '@trpc/trpcClient';

type CarouselItem = {
  mediaAssetId: string;
  url: string;
  kind: 'image' | 'video' | 'audio' | 'document';
  posterUrl: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
};

type Carousel = {
  id: number;
  slug: string;
  title: string | null;
  items: CarouselItem[];
} | null;

/**
 * Carousel de la page d'accueil — la galerie au slug réservé du carousel.
 *
 * Client Component public : fetch en vanilla `trpcClient`. Mécanique Embla
 * (swipe/drag, boucle). Avance pilotée manuellement : timer 5 s pour les
 * IMAGES, fin de lecture (`onEnded`) pour les VIDÉOS (jouées muettes une fois).
 * Une barre de progression au niveau section reflète le slide actif (largeur
 * réelle de lecture pour une vidéo, remplissage CSS 5 s pour une image).
 */
export default function HomeCarousel(): JSX.Element | null {
  // Carousel null tant que le fetch n'est pas terminé. On n'affiche rien côté erreur.
  const [carousel, setCarousel] = useState<Carousel>(null);
  // Progression de lecture d'une vidéo active (0 → 1). Pour les images, la barre est animée en CSS sur 5 s.
  const [progress, setProgress] = useState(0); // 0 → 1, slide actif uniquement

  // Embla Carousel (swipe/drag, loop). On pilote l'avance manuellement.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  // Index du slide actif (pour la barre de progression et les bullets). On ne garde pas l'index dans Embla : on le met à jour via l'événement 'select'.
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Refs vers les <video> pour piloter play/pause/reset selon le slide actif.
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Fetch du carousel au montage. On ne fait rien côté erreur : on n'affiche rien.
  useEffect(() => {
    let cancelled = false;
    trpcClient.gallery.getCarousel
      .query()
      .then((c) => {
        if (!cancelled) setCarousel(c);
      })
      .catch(() => {
        // Pas de carousel / erreur réseau : on n'affiche rien.
      });
    return () => {
      cancelled = true;
    };
  }, []);


  // Memoise la liste des items pour ne pas recréer le tableau à chaque render.
  const items = useMemo(() => carousel?.items ?? [], [carousel]);

  // Timer pour avancer automatiquement après 5 s sur les images. Les vidéos pilotent l'avance via onEnded.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronise la lecture des vidéos et le timer d'avance selon l'index actif.
  const syncPlayback = useCallback(
    (index: number) => {
      const current = items[index];

      // (Re)joue la vidéo active, stoppe/rembobine les autres.
      videoRefs.current.forEach((video, id) => {
        if (current && id === current.mediaAssetId) {
          video.currentTime = 0;
          void video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });

      // Un seul pilote d'avance. On annule toujours le timer précédent.
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
        advanceTimer.current = null;
      }

      // Si le slide actif est une vidéo, on ne met pas de timer : l'avance se fait via onEnded. Pour les images, on avance après 5 s.
      if (current?.kind === 'video') {
        // La vidéo pilote l'avance via onEnded → pas de timer.
        return;
      }

      // Image (ou autre) : avance après 5 s.
      advanceTimer.current = setTimeout(() => {
        emblaApi?.scrollNext();
      }, 5000);
    },
    [items, emblaApi],
  );

  // Nettoyage du timer au démontage.
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // Sync initiale (premier slide / changement de contenu après fetch). Déféré
  // pour ne pas exécuter de pilotage synchrone dans le corps de l'effet.
  useEffect(() => {
    if (!emblaApi || items.length === 0) return;
    const id = requestAnimationFrame(() =>
      syncPlayback(emblaApi.selectedScrollSnap()),
    );
    return () => cancelAnimationFrame(id);
  }, [emblaApi, items, syncPlayback]);

  // Abonnement aux événements Embla. onSelect est un callback d'event (pas un
  // corps d'effet) → setState autorisé : on y met à jour l'index, on remet la
  // barre à 0, et on resynchronise la lecture.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const i = emblaApi.selectedScrollSnap();
      setSelectedIndex(i);
      setProgress(0);
      syncPlayback(i);
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, syncPlayback]);

  // Ré-initialise Embla quand le contenu change (fetch async). reInit() émet
  // 'reInit' → onSelect resynchronise index, barre et lecture.
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, items.length]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  // Progression de lecture d'une vidéo active → barre. Rien pour les images
  // (leur barre est animée en CSS sur 5 s).
  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const v = e.currentTarget;
      if (v.duration > 0) setProgress(v.currentTime / v.duration);
    },
    [],
  );

  // Fin d'une vidéo → avance au slide suivant.
  const handleVideoEnded = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  if (items.length === 0) return null;

  const activeItem = items[selectedIndex];

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item) => (
            <div
              key={item.mediaAssetId}
              className="relative min-w-0 flex-[0_0_100%]"
            >
              {item.kind === 'video' ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(item.mediaAssetId, el);
                    else videoRefs.current.delete(item.mediaAssetId);
                  }}
                  src={item.url}
                  poster={item.posterUrl ?? undefined}
                  muted
                  playsInline
                  preload="metadata"
                  onEnded={handleVideoEnded}
                  onTimeUpdate={handleTimeUpdate}
                  className="h-[40vh] w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="h-[40vh] w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {carousel?.title && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-8">
          <h1 className="text-3xl font-bold text-white">{carousel.title}</h1>
        </div>
      )}

      {/* Barre de progression — au niveau section, APRÈS le titre dans le DOM
          (donc au-dessus dans l'empilement, z-30). Reflète le slide actif. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1 bg-white/25">
        {activeItem?.kind === 'video' ? (
          // Vidéo : largeur pilotée par la lecture réelle.
          <div
            className="h-full bg-white"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        ) : (
          // Image : remplissage CSS sur 5 s. La `key` redémarre l'animation à
          // chaque changement de slide.
          <div
            key={`img-progress-${selectedIndex}`}
            className="h-full bg-white animate-[carousel-fill_5s_linear_forwards]"
          />
        )}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Image précédente"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Image suivante"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.mediaAssetId}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Aller à l'image ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === selectedIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}