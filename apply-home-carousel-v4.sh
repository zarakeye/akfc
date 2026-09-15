#!/usr/bin/env bash
#
# AKFC — HomeCarousel : ruban à inertie v4 (axe scalé continu + DOM-direct).
#
# Intègre la mécanique validée en maquette v4 :
#  - animation DOM-direct (RAF écrit les transforms, pas de setState/frame) → fluide ;
#  - ancrage CONTINU sur un axe scalé → passage au centre SANS bond ;
#  - zéro chevauchement (espacement = demi-largeurs scalées + gap) ;
#  - débordement franc + fondu des bords ; focus central ;
#  - chevrons/drag → mode manuel + aimant ; play/pause (drift) ;
#  - vidéos : poster + bouton play centré, lecture en place au centre.
# Fetch tRPC conservé, largeur depuis item.width/height (bornée, fallback).
#
# Périmètre : apps/web/src/features/app-shell/HomeCarousel.tsx. Un typecheck.
# Usage : bash apply-home-carousel-v4.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/app-shell/HomeCarousel.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

cat > "$F" <<'TSX'
"use client";

import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/* ►►► Réglages (validés en maquette v4) ◄◄◄ */
const H = 320;
const GAP = 22;
const MIN_RATIO = 0.4;
const MAX_RATIO = 2.5;
const DEFAULT_RATIO = 1.5;
const FRICTION = 0.94;
const SNAP_V = 0.7;
const SNAP_EASE = 0.16;
const DRIFT_V = 0.5;
const DRIFT_EASE = 0.03;
const EMPH_SCALE = 0.32;
const EMPH_RANGE = 0.5;
const EMPH_POW = 1.7;
const THROW_MULT = 16;

type Geo = { it: CarouselItem; w: number; base: number; center: number };

function ratioOf(it: CarouselItem): number {
  const r =
    it.width && it.height && it.height > 0 ? it.width / it.height : DEFAULT_RATIO;
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, r));
}

/**
 * HomeCarousel — ruban à inertie (axe scalé continu, DOM-direct).
 *
 * Hauteur fixe, largeur libre par média (ratio conservé) → portraits hauts &
 * étroits, paysages larges, côte à côte, SANS fond flou. Boucle infinie ;
 * drag/lancer + friction ; aimant central ; focus central ; zéro chevauchement ;
 * débordement franc + fondu des bords. Chevrons/drag coupent la rotation
 * continue (play/pause). Vidéos : poster + bouton play centré, lecture en place.
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

  const items = useMemo<CarouselItem[]>(
    () =>
      (carousel?.items ?? []).filter(
        (i) => i.kind === "image" || i.kind === "video",
      ),
    [carousel],
  );

  const geo = useMemo<{ list: Geo[]; W: number }>(() => {
    let x = 0;
    const list: Geo[] = items.map((it) => {
      const w = ratioOf(it) * H;
      const g: Geo = { it, w, base: x, center: x + w / 2 };
      x += w + GAP;
      return g;
    });
    return { list, W: x };
  }, [items]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cwRef = useRef(1000);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const offset = useRef(0);
  const velocity = useRef(0);
  const target = useRef<number | null>(null);
  const dragging = useRef(false);
  const playingRef = useRef(true);
  const [playing, setPlaying] = useState(true);
  playingRef.current = playing;
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const drag = useRef({ lastX: 0, lastT: 0, vx: 0 });

  useEffect(() => {
    offset.current = 0;
    velocity.current = 0;
    target.current = null;
  }, [geo.W]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => (cwRef.current = e[0].contentRect.width));
    ro.observe(el);
    cwRef.current = el.getBoundingClientRect().width;
    return () => ro.disconnect();
  }, []);

  const layout = useCallback((): number => {
    const W = geo.W;
    const list = geo.list;
    const n = list.length;
    if (n === 0 || W <= 0) return 0;
    const cw = cwRef.current;
    const half = cw / 2;
    const range = cw * EMPH_RANGE;

    const pstar = ((offset.current % W) + W) % W;

    const s = new Array<number>(n);
    const nlin = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      let d = list[i].center - pstar;
      if (d > W / 2) d -= W;
      if (d < -W / 2) d += W;
      nlin[i] = d;
      const t = Math.max(0, 1 - Math.abs(d) / range);
      s[i] = 1 + EMPH_SCALE * Math.pow(t, EMPH_POW);
    }

    const sc = new Array<number>(n);
    sc[0] = (list[0].w * s[0]) / 2;
    for (let i = 1; i < n; i++) {
      sc[i] =
        sc[i - 1] + (list[i - 1].w * s[i - 1]) / 2 + GAP + (list[i].w * s[i]) / 2;
    }
    const SW =
      sc[n - 1] + (list[n - 1].w * s[n - 1]) / 2 + GAP + (list[0].w * s[0]) / 2;

    let i0 = n - 1;
    for (let i = 0; i < n; i++) {
      if (pstar >= list[i].base && pstar < list[i].base + list[i].w + GAP) {
        i0 = i;
        break;
      }
    }
    const f = (pstar - list[i0].base) / (list[i0].w + GAP);
    const scaledLeft = sc[i0] - (list[i0].w * s[i0]) / 2;
    const pstarScaled = scaledLeft + f * (list[i0].w * s[i0] + GAP);

    for (let i = 0; i < n; i++) {
      const el = nodeRefs.current.get(list[i].it.mediaAssetId);
      if (!el) continue;
      let cx = half + (sc[i] - pstarScaled);
      const k = Math.round((half - cx) / SW);
      cx += k * SW;
      if (Math.abs(cx - half) > cw * 1.6) {
        el.style.visibility = "hidden";
        continue;
      }
      const emph = (s[i] - 1) / EMPH_SCALE;
      el.style.visibility = "visible";
      el.style.transform = `translate(${cx - list[i].w / 2}px, -50%) scale(${s[i]})`;
      el.style.filter = `brightness(${0.5 + 0.5 * emph})`;
      el.style.zIndex = String(Math.round(emph * 100));
    }

    let f2 = 0;
    for (let i = 1; i < n; i++) if (Math.abs(nlin[i]) < Math.abs(nlin[f2])) f2 = i;
    return nlin[f2];
  }, [geo]);

  useEffect(() => {
    if (geo.W <= 0) return;
    let raf = 0;
    const tick = () => {
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
            target.current = offset.current + layout();
          }
        }
      }
      layout();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [geo.W, layout]);

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
      const pstar = ((offset.current % W) + W) % W;
      let best: number | null = null;
      let bestD = Infinity;
      geo.list.forEach((g) => {
        let d = g.center - pstar;
        if (d > W / 2) d -= W;
        if (d < -W / 2) d += W;
        if (dir > 0 && d > 1 && d < bestD) {
          bestD = d;
          best = d;
        }
        if (dir < 0 && d < -1 && -d < bestD) {
          bestD = -d;
          best = d;
        }
      });
      if (best == null) return;
      target.current = offset.current + best;
    },
    [geo, goManual],
  );

  const playVideo = useCallback(
    (id: string) => {
      goManual();
      // centre la tuile puis joue en place
      const W = geo.W;
      const pstar = ((offset.current % W) + W) % W;
      const g = geo.list.find((x) => x.it.mediaAssetId === id);
      if (g) {
        let d = g.center - pstar;
        if (d > W / 2) d -= W;
        if (d < -W / 2) d += W;
        target.current = offset.current + d;
      }
      setActiveVideo(id);
      const v = videoRefs.current.get(id);
      if (v) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }
    },
    [geo, goManual],
  );

  if (geo.list.length === 0) return null;

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
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        {geo.list.map((g) => {
          const item = g.it;
          const isVideo = item.kind === "video";
          const showPlay = isVideo && activeVideo !== item.mediaAssetId;
          return (
            <div
              key={item.mediaAssetId}
              ref={(el) => {
                if (el) nodeRefs.current.set(item.mediaAssetId, el);
                else nodeRefs.current.delete(item.mediaAssetId);
              }}
              className="absolute left-0 top-1/2 overflow-hidden rounded-xl bg-black/20 shadow-lg will-change-transform"
              style={{
                width: g.w,
                height: H,
                transform: "translate(-9999px,-50%)",
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
                  onClick={() => playVideo(item.mediaAssetId)}
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
git commit -m "feat(home): carrousel ruban v4 (axe scalé continu, DOM-direct, zéro chevauchement, sans bond)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }