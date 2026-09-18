#!/usr/bin/env bash
# AKFC — HomeCarousel v5 : hauteur responsive + toggle continu/diapo + pastilles.
# Conserve : multi-copies, largeur live, interpolation par morceaux, couture SW,
# vidéos (copie centrale joue au clic). Ajoute : H responsive (image entière,
# object-contain), modes continu/diapo (3 s), pastilles cliquables.
# Usage : bash apply-home-carousel-v5.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/app-shell/HomeCarousel.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

cat > "$F" <<'TSX'
"use client";

import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Infinity as InfinityIcon,
  GalleryHorizontalEnd,
} from "lucide-react";

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

/* ►►► Réglages ◄◄◄ */
const H_MAX = 320;
const H_MIN = 170;
const NET = 0.84; // fraction "nette" (hors fondus) de la largeur
const H_RATIO = 1.5; // ratio de référence pour la hauteur (évite qu'un panorama écrase le ruban)
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
const DIAPO_DWELL = 3000; // ms au centre en mode diapo

type AutoMode = "continu" | "diapo";
type Geo = { it: CarouselItem; w: number; base: number; center: number };

function ratioOf(it: CarouselItem): number {
  const r =
    it.width && it.height && it.height > 0 ? it.width / it.height : DEFAULT_RATIO;
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, r));
}

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

  const [cw, setCw] = useState(1000);
  const [playing, setPlaying] = useState(true);
  const [autoMode, setAutoMode] = useState<AutoMode>("continu");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const playingRef = useRef(playing);
  playingRef.current = playing;
  const autoModeRef = useRef(autoMode);
  autoModeRef.current = autoMode;
  const activeRef = useRef(0);
  const nlinRef = useRef<number[]>([]);
  const diapoRest = useRef<number | null>(null);

  // Hauteur responsive : la tuile la plus large (au scale central) tient dans
  // la zone nette (hors fondus).
  const H = useMemo(
    () =>
      Math.max(H_MIN, Math.min(H_MAX, (NET * cw) / (H_RATIO * (1 + EMPH_SCALE)))),
    [cw],
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
  }, [items, H]);

  // Copies par contenu pour couvrir l'écran quand le ruban est étroit.
  const copies = useMemo(() => {
    if (geo.W <= 0) return 1;
    const window = 2600 * (1 + 2 * 1.3);
    return Math.min(11, Math.max(1, Math.ceil(window / geo.W) + 1));
  }, [geo.W]);
  const mid = Math.floor(copies / 2);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const offset = useRef(0);
  const velocity = useRef(0);
  const target = useRef<number | null>(null);
  const dragging = useRef(false);
  const drag = useRef({ lastX: 0, lastT: 0, vx: 0 });

  useEffect(() => {
    offset.current = 0;
    velocity.current = 0;
    target.current = null;
  }, [geo.W]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => setCw(e[0].contentRect.width));
    ro.observe(el);
    setCw(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const layout = useCallback((): number => {
    const W = geo.W;
    const list = geo.list;
    const n = list.length;
    if (n === 0 || W <= 0) return 0;
    const cwl = containerRef.current?.clientWidth || cw;
    if (cwl <= 0) return 0;
    const half = cwl / 2;
    const range = cwl * EMPH_RANGE;

    const pstar = ((offset.current % W) + W) % W;

    const s = new Array<number>(n);
    const emphN = new Array<number>(n);
    const nlin = new Array<number>(n);
    const maxScaledW = NET * cwl; // largeur nette : le scale ne doit jamais la dépasser
    for (let i = 0; i < n; i++) {
      let d = list[i].center - pstar;
      if (d > W / 2) d -= W;
      if (d < -W / 2) d += W;
      nlin[i] = d;
      const t = Math.max(0, 1 - Math.abs(d) / range);
      const e = Math.pow(t, EMPH_POW);
      emphN[i] = e;
      // Scale voulu (grossissement central) BORNÉ pour tenir dans la zone nette :
      // une image large sur petit écran voit son scale plafonné (voire < 1 →
      // elle RÉDUIT) au lieu de déborder. Ratio conservé, image entière.
      s[i] = Math.min(1 + EMPH_SCALE * e, maxScaledW / list[i].w);
    }
    nlinRef.current = nlin;

    const sc = new Array<number>(n);
    sc[0] = (list[0].w * s[0]) / 2;
    for (let i = 1; i < n; i++) {
      sc[i] =
        sc[i - 1] + (list[i - 1].w * s[i - 1]) / 2 + GAP + (list[i].w * s[i]) / 2;
    }
    const SW = sc[n - 1] + (list[n - 1].w * s[n - 1]) / 2 + GAP;

    let i0 = n - 1;
    for (let i = 0; i < n; i++) {
      if (pstar >= list[i].base && pstar < list[i].base + list[i].w + GAP) {
        i0 = i;
        break;
      }
    }
    const scaledLeft = sc[i0] - (list[i0].w * s[i0]) / 2;
    const local = pstar - list[i0].base;
    const pstarScaled =
      local <= list[i0].w
        ? scaledLeft + local * s[i0]
        : scaledLeft + list[i0].w * s[i0] + (local - list[i0].w);

    const limit = cwl * 1.3;
    for (let i = 0; i < n; i++) {
      let cx0 = half + (sc[i] - pstarScaled);
      const k = Math.round((half - cx0) / SW);
      cx0 += k * SW;
      const bright = 0.5 + 0.5 * emphN[i];
      const z = String(Math.round(emphN[i] * 100));
      for (let c = 0; c < copies; c++) {
        const el = nodeRefs.current.get(`${list[i].it.mediaAssetId}#${c}`);
        if (!el) continue;
        const cx = cx0 + (c - mid) * SW;
        if (cx < -limit || cx > cwl + limit) {
          el.style.visibility = "hidden";
          continue;
        }
        el.style.visibility = "visible";
        el.style.width = `${list[i].w}px`;
        el.style.height = `${H}px`;
        el.style.transform = `translate(${cx - list[i].w / 2}px, -50%) scale(${s[i]})`;
        el.style.filter = `brightness(${bright})`;
        el.style.zIndex = z;
      }
    }

    let f2 = 0;
    for (let i = 1; i < n; i++) if (Math.abs(nlin[i]) < Math.abs(nlin[f2])) f2 = i;
    if (f2 !== activeRef.current) {
      activeRef.current = f2;
      setActiveIndex(f2);
    }
    return nlin[f2];
  }, [geo, cw, H, copies, mid]);

  const nextDelta = useCallback((): number => {
    const nl = nlinRef.current;
    let best = Infinity;
    for (const d of nl) if (d > 1 && d < best) best = d;
    return best === Infinity ? 0 : best;
  }, []);

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
            diapoRest.current = null;
          }
        } else if (playingRef.current) {
          if (autoModeRef.current === "diapo") {
            if (diapoRest.current == null) diapoRest.current = performance.now();
            if (performance.now() - diapoRest.current >= DIAPO_DWELL) {
              diapoRest.current = null;
              target.current = offset.current + nextDelta();
            }
          } else {
            velocity.current += (DRIFT_V - velocity.current) * DRIFT_EASE;
            offset.current += velocity.current;
          }
        } else {
          offset.current += velocity.current;
          velocity.current *= FRICTION;
          if (Math.abs(velocity.current) < SNAP_V) {
            velocity.current = 0;
            const nl = nlinRef.current;
            if (nl.length) target.current = offset.current + nl[activeRef.current];
          }
        }
      }
      layout();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [geo.W, layout, nextDelta]);

  const goManual = useCallback(() => {
    setPlaying(false);
    diapoRest.current = null;
  }, []);

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

  const goToIndex = useCallback(
    (i: number) => {
      goManual();
      const nl = nlinRef.current;
      if (nl[i] != null) target.current = offset.current + nl[i];
    },
    [goManual],
  );
  const step = useCallback(
    (dir: number) => {
      goManual();
      const nl = nlinRef.current;
      let best: number | null = null;
      let bestD = Infinity;
      nl.forEach((d) => {
        if (dir > 0 && d > 1 && d < bestD) {
          bestD = d;
          best = d;
        }
        if (dir < 0 && d < -1 && -d < bestD) {
          bestD = -d;
          best = d;
        }
      });
      if (best != null) target.current = offset.current + best;
    },
    [goManual],
  );

  const playVideo = useCallback(
    (id: string) => {
      goManual();
      const nl = nlinRef.current;
      const idx = geo.list.findIndex((g) => g.it.mediaAssetId === id);
      if (idx >= 0 && nl[idx] != null) target.current = offset.current + nl[idx];
      setActiveVideo(id);
      const v = videoRefs.current.get(`${id}#${mid}`);
      if (v) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }
    },
    [geo, goManual, mid],
  );

  const changeMode = useCallback((m: AutoMode) => {
    setAutoMode(m);
    diapoRest.current = null;
    target.current = null;
  }, []);

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
        {geo.list.flatMap((g) =>
          Array.from({ length: copies }, (_, c) => {
            const item = g.it;
            const isVideo = item.kind === "video";
            const isMid = c === mid;
            const showPlay = isVideo && activeVideo !== item.mediaAssetId;
            return (
              <div
                key={`${item.mediaAssetId}#${c}`}
                ref={(el) => {
                  const key = `${item.mediaAssetId}#${c}`;
                  if (el) nodeRefs.current.set(key, el);
                  else nodeRefs.current.delete(key);
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
                      const key = `${item.mediaAssetId}#${c}`;
                      if (el) videoRefs.current.set(key, el);
                      else videoRefs.current.delete(key);
                    }}
                    src={isMid ? item.url : undefined}
                    poster={item.posterUrl ?? undefined}
                    muted
                    playsInline
                    preload="metadata"
                    onEnded={() => setActiveVideo(null)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-contain"
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
          }),
        )}
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

          {/* Pastilles (une par contenu) */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {geo.list.map((g, i) => (
              <button
                key={g.it.mediaAssetId}
                type="button"
                onClick={() => goToIndex(i)}
                aria-label={`Aller au contenu ${i + 1}`}
                aria-current={i === activeIndex}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === activeIndex
                    ? "bg-emerald-500"
                    : "bg-gray-800 hover:bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Toggle mode + play/pause */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="inline-flex overflow-hidden rounded-full border border-black/10">
              <button
                type="button"
                onClick={() => changeMode("continu")}
                title="Défilement continu"
                aria-pressed={autoMode === "continu"}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                  autoMode === "continu"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/70 text-gray-700 hover:bg-white"
                }`}
              >
                <InfinityIcon className="h-4 w-4" /> Continu
              </button>
              <button
                type="button"
                onClick={() => changeMode("diapo")}
                title="Mode diaporama (3 s / contenu)"
                aria-pressed={autoMode === "diapo"}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                  autoMode === "diapo"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/70 text-gray-700 hover:bg-white"
                }`}
              >
                <GalleryHorizontalEnd className="h-4 w-4" /> Diapo
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Mettre en pause" : "Reprendre le défilement"}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-sm text-gray-700 backdrop-blur transition-colors hover:bg-white"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Lecture"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
TSX
echo "  ok  HomeCarousel.tsx (v5)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(home): carrousel v5 — hauteur responsive, modes continu/diapo, pastilles cliquables" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }