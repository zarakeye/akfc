#!/usr/bin/env bash
#
# AKFC — HomeCarousel : ruban à inertie (remplace le rendu plein-cadre + flou).
#
# Réécrit HomeCarousel.tsx : ruban infini hauteur fixe / largeur libre par
# média (ratio conservé → fini le fond flou envahissant sur les portraits).
# Drag + lancer (friction), aimant central, mise en évidence de l'image centrale,
# fondu des bords, chevrons, play/pause (drift). Tuiles vidéo : poster + bouton
# play centré (clic → manuel + centre + joue en place ; fin → reste en manuel).
# Fetch tRPC conservé. Supprime : fond flou, titre, barre de progression,
# bullets, et la dépendance embla DANS ce composant.
#
# Périmètre : apps/web/src/features/app-shell/HomeCarousel.tsx. Un typecheck.
# Usage : bash apply-home-carousel-ribbon.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/app-shell/HomeCarousel.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

cat > "$F" <<'TSX'
"use client";

import {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

import { trpcClient } from "@trpc/trpcClient";

type CarouselItem = {
  mediaAssetId: string;
  url: string;
  kind: "image" | "video" | "audio" | "document";
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

/* ►►► Constantes de réglage (validées en maquette) ◄◄◄ */
const H = 320; // hauteur du ruban (px)
const GAP = 18; // espace entre médias (px)
const MIN_RATIO = 0.4; // garde-fous de ratio (w/h)
const MAX_RATIO = 2.5;
const DEFAULT_RATIO = 1.5; // si width/height inconnus
const FRICTION = 0.94; // décélération du lancer
const SNAP_V = 0.7; // seuil d'enclenchement de l'aimant (px/frame)
const SNAP_EASE = 0.16; // vitesse de calage
const DRIFT_V = 0.5; // vitesse du défilement auto (px/frame)
const DRIFT_EASE = 0.03; // retour vers le drift après un lancer
const EMPH_SCALE = 0.3; // agrandissement max au centre
const EMPH_RANGE = 0.42; // portée du focus (fraction largeur conteneur)
const THROW_MULT = 16; // sensibilité du lancer

type Geo = {
  it: CarouselItem;
  w: number;
  center: number;
};

function ratioOf(it: CarouselItem): number {
  const r =
    it.width && it.height && it.height > 0 ? it.width / it.height : DEFAULT_RATIO;
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, r));
}

/**
 * HomeCarousel — ruban à inertie (façon manège).
 *
 * Hauteur fixe, largeur libre par média (ratio conservé) → portraits hauts &
 * étroits, paysages larges, côte à côte, SANS fond flou. Boucle infinie ; drag
 * + lancer avec friction ; aimant central ; média central mis en évidence ;
 * fondu des bords ; chevrons ; play/pause (drift). Vidéos : poster + bouton
 * play centré (clic → passe en manuel, centre la tuile, joue en place ; à la
 * fin l'overlay revient et on reste en manuel).
 */
export default function HomeCarousel(): JSX.Element | null {
  const [carousel, setCarousel] = useState<Carousel>(null);

  useEffect(() => {
    let cancelled = false;
    trpcClient.gallery.getCarousel
      .query()
      .then((c) => {
        if (!cancelled) setCarousel(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Médias affichables (image/vidéo uniquement).
  const items = useMemo<CarouselItem[]>(
    () =>
      (carousel?.items ?? []).filter(
        (i) => i.kind === "image" || i.kind === "video",
      ),
    [carousel],
  );

  // Géométrie : largeur + centre cumulés, total W.
  const geo = useMemo<{ list: Geo[]; W: number }>(() => {
    let x = 0;
    const list: Geo[] = items.map((it) => {
      const w = ratioOf(it) * H;
      const g: Geo = { it, w, center: x + w / 2 };
      x += w + GAP;
      return g;
    });
    return { list, W: x };
  }, [items]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cw, setCw] = useState(1000);

  const offset = useRef(0);
  const velocity = useRef(0);
  const target = useRef<number | null>(null);
  const dragging = useRef(false);
  const nearestDelta = useRef(0);
  const [, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const drag = useRef({ lastX: 0, lastT: 0, vx: 0 });
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Réinitialise la position quand le contenu change (fetch async).
  useEffect(() => {
    offset.current = 0;
    velocity.current = 0;
    target.current = null;
  }, [geo.W]);

  // Mesure du conteneur.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setCw(e[0].contentRect.width));
    ro.observe(el);
    setCw(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Boucle physique.
  useEffect(() => {
    if (geo.W <= 0) return;
    let raf = 0;
    const tick = () => {
      const W = geo.W;
      if (!dragging.current) {
        if (target.current != null) {
          offset.current += (target.current - offset.current) * SNAP_EASE;
          if (Math.abs(target.current - offset.current) < 0.4) {
            offset.current = target.current;
            target.current = null;
            velocity.current = 0;
          }
        } else if (playingRef.current) {
          velocity.current += (DRIFT_V - velocity.current) * DRIFT_EASE;
          offset.current += velocity.current;
        } else {
          offset.current += velocity.current;
          velocity.current *= FRICTION;
          if (Math.abs(velocity.current) < SNAP_V) {
            velocity.current = 0;
            target.current = offset.current + nearestDelta.current;
          }
        }
      }
      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [geo.W]);

  const goManual = useCallback(() => setPlaying(false), []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      target.current = null;
      velocity.current = 0;
      goManual();
      drag.current = { lastX: e.clientX, lastT: performance.now(), vx: 0 };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [goManual],
  );
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - drag.current.lastX;
    const dt = Math.max(1, now - drag.current.lastT);
    offset.current -= dx;
    drag.current.vx = dx / dt;
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
  }, []);
  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    velocity.current = -drag.current.vx * THROW_MULT;
  }, []);

  const step = useCallback(
    (dir: number) => {
      goManual();
      const W = geo.W;
      if (W <= 0) return;
      const center = cw / 2;
      const norm = ((offset.current % W) + W) % W;
      const centers: number[] = [];
      geo.list.forEach((g) => {
        [-1, 0, 1].forEach((k) => centers.push(g.center - norm + k * W));
      });
      centers.sort((a, b) => a - b);
      let targetSc: number | undefined;
      if (dir > 0) {
        targetSc = centers.find((sc) => sc > center + 1);
      } else {
        const cand = centers.filter((sc) => sc < center - 1);
        targetSc = cand[cand.length - 1];
      }
      if (targetSc == null) return;
      target.current = offset.current + (targetSc - center);
    },
    [geo, cw, goManual],
  );

  const playVideo = useCallback(
    (id: string, sc: number) => {
      goManual();
      target.current = offset.current + (sc - cw / 2);
      setActiveVideo(id);
      const v = videoRefs.current.get(id);
      if (v) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }
    },
    [cw, goManual],
  );

  if (geo.list.length === 0) return null;

  // Rendu : chaque média à ses positions enroulées visibles.
  const W = geo.W;
  const center = cw / 2;
  const norm = ((offset.current % W) + W) % W;
  const range = cw * EMPH_RANGE;
  let bestAbs = Infinity;
  let bestDelta = 0;
  type R = {
    g: Geo;
    k: number;
    left: number;
    sc: number;
    scale: number;
    bright: number;
    z: number;
  };
  const rendered: R[] = [];
  geo.list.forEach((g) => {
    [-1, 0, 1].forEach((k) => {
      const sc = g.center - norm + k * W;
      const left = sc - g.w / 2;
      if (left > -g.w - 40 && left < cw + g.w + 40) {
        const dist = Math.abs(sc - center);
        const t = Math.max(0, 1 - dist / range);
        const emph = t * t * (3 - 2 * t);
        rendered.push({
          g,
          k,
          left,
          sc,
          scale: 1 + EMPH_SCALE * emph,
          bright: 0.5 + 0.5 * emph,
          z: Math.round(emph * 100),
        });
        if (dist < bestAbs) {
          bestAbs = dist;
          bestDelta = sc - center;
        }
      }
    });
  });
  nearestDelta.current = bestDelta;

  return (
    <section className="relative">
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className="relative select-none touch-none cursor-grab overflow-hidden active:cursor-grabbing"
        style={{
          height: H * (1 + EMPH_SCALE) + 8,
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%)",
        }}
      >
        {rendered.map(({ g, k, left, sc, scale, bright, z }) => {
          const item = g.it;
          const isVideo = item.kind === "video";
          const showPlay = isVideo && activeVideo !== item.mediaAssetId;
          return (
            <div
              key={`${item.mediaAssetId}-${k}`}
              className="absolute top-1/2 overflow-hidden rounded-xl bg-black/20 shadow-lg"
              style={{
                left,
                width: g.w,
                height: H,
                transform: `translateY(-50%) scale(${scale})`,
                filter: `brightness(${bright})`,
                zIndex: z,
              }}
            >
              {isVideo ? (
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
                  onEnded={() => setActiveVideo(null)}
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              )}

              {showPlay && (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => playVideo(item.mediaAssetId, sc)}
                  aria-label="Lire la vidéo"
                  className="absolute left-1/2 top-1/2 z-[150] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
                >
                  <Play className="h-7 w-7 translate-x-[2px]" fill="currentColor" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {geo.list.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Précédent"
            className="absolute left-4 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur transition-colors hover:bg-black/65"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Suivant"
            className="absolute right-4 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur transition-colors hover:bg-black/65"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Mettre en pause" : "Reprendre le défilement"}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-sm text-gray-700 backdrop-blur transition-colors hover:bg-white"
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {playing ? "Pause" : "Lecture"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
TSX
echo "  ok  HomeCarousel.tsx"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -20 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "feat(home): carrousel en ruban à inertie (fin du fond flou ; drag/lancer, aimant, focus central, vidéos)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }

echo ""
echo "Note : la dépendance embla-carousel-react n'est plus utilisée PAR CE composant."
echo "Vérifie qu'aucun autre fichier ne l'importe avant de la retirer du package.json :"
echo "  grep -rn 'embla-carousel' apps/web/src --include=*.tsx --include=*.ts | grep -v node_modules"