import type { JSX, ReactNode } from "react";
import type { PageBlockKindV1 } from "@contracts/page";

/*
 * Aperçus des types de blocs du builder : une maquette filaire stylisée et une phrase,
 * affichées au survol (ou au focus clavier) d'un type dans le menu « Ajouter un bloc ».
 * Dessins en SVG, couleurs du thème (clair comme sombre) : aucun fichier image à charger.
 */

const W = 240;
const H = 140;

/* Briques de dessin ─────────────────────────────────────────────────── */

/** Ligne de texte (barre arrondie). */
function Line({ x, y, w, strong = false }: { x: number; y: number; w: number; strong?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={strong ? 8 : 5}
      rx={strong ? 4 : 2.5}
      className={strong ? "fill-foreground/70" : "fill-muted-foreground/40"}
    />
  );
}

/** Paragraphe : lignes régulières, la dernière plus courte. */
function Paragraph({ x, y, w, lines, gap = 10 }: { x: number; y: number; w: number; lines: number; gap?: number }) {
  return (
    <>
      {Array.from({ length: lines }, (_, i) => (
        <Line key={i} x={x} y={y + i * gap} w={i === lines - 1 ? w * 0.6 : w} />
      ))}
    </>
  );
}

/** Vignette d'image : cadre, soleil et montagnes. */
function Picture({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const r = Math.min(w, h) * 0.12;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} className="fill-primary/15 stroke-primary/40" strokeWidth={1} />
      <circle cx={x + w * 0.72} cy={y + h * 0.3} r={r} className="fill-primary/45" />
      <path
        d={`M${x + 2} ${y + h - 2} L${x + w * 0.35} ${y + h * 0.45} L${x + w * 0.55} ${y + h * 0.7} L${x + w * 0.7} ${y + h * 0.55} L${x + w - 2} ${y + h - 2} Z`}
        className="fill-primary/40"
      />
    </g>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-hidden="true" className="block">
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={8} className="fill-background stroke-border" />
      {children}
    </svg>
  );
}

/* Illustrations ─────────────────────────────────────────────────────── */

function TextPreview() {
  return (
    <Frame>
      <Line x={20} y={20} w={110} strong />
      <Paragraph x={20} y={42} w={200} lines={3} />
      <Paragraph x={20} y={84} w={200} lines={3} />
    </Frame>
  );
}

function GalleryPreview() {
  const cols = 3, rows = 2, gap = 8, pad = 16;
  const w = (W - pad * 2 - gap * (cols - 1)) / cols;
  const h = (H - pad * 2 - gap * (rows - 1)) / rows;
  return (
    <Frame>
      {Array.from({ length: cols * rows }, (_, i) => (
        <Picture key={i} x={pad + (i % cols) * (w + gap)} y={pad + Math.floor(i / cols) * (h + gap)} w={w} h={h} />
      ))}
    </Frame>
  );
}

function AudioPreview() {
  const bars = [6, 12, 9, 16, 11, 18, 8, 14, 10, 15, 7, 12, 9, 16, 6, 11, 13, 8];
  return (
    <Frame>
      {[0, 1, 2].map((row) => {
        const y = 22 + row * 36;
        return (
          <g key={row}>
            <circle cx={30} cy={y + 8} r={11} className={row === 0 ? "fill-primary" : "fill-primary/25"} />
            <path d={`M${27} ${y + 2} L${35} ${y + 8} L${27} ${y + 14} Z`} className={row === 0 ? "fill-primary-foreground" : "fill-primary"} />
            <Line x={50} y={y} w={row === 0 ? 90 : 70} />
            {bars.map((b, i) => (
              <rect
                key={i}
                x={50 + i * 7}
                y={y + 22 - b * 0.6}
                width={4}
                height={b * 0.6}
                rx={1.5}
                className={row === 0 && i < 7 ? "fill-primary" : "fill-muted-foreground/30"}
              />
            ))}
            <Line x={190} y={y + 5} w={30} />
          </g>
        );
      })}
    </Frame>
  );
}

function DocumentsPreview() {
  return (
    <Frame>
      {[0, 1, 2].map((row) => {
        const y = 18 + row * 38;
        return (
          <g key={row}>
            <rect x={16} y={y - 4} width={W - 32} height={32} rx={6} className="fill-muted/60" />
            <path d={`M26 ${y} h14 l7 7 v17 h-21 Z`} className="fill-background stroke-primary/60" strokeWidth={1.2} />
            <path d={`M40 ${y} v7 h7`} className="fill-none stroke-primary/60" strokeWidth={1.2} />
            <Line x={58} y={y + 4} w={row === 1 ? 90 : 110} strong />
            <Line x={58} y={y + 16} w={50} />
            <path
              d={`M${W - 34} ${y + 4} v11 m-5 -5 l5 5 l5 -5 M${W - 40} ${y + 21} h12`}
              className="fill-none stroke-muted-foreground"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </Frame>
  );
}

function MediaTextPreview() {
  return (
    <Frame>
      <Picture x={16} y={18} w={96} h={104} />
      <Line x={128} y={26} w={80} strong />
      <Paragraph x={128} y={48} w={96} lines={6} />
    </Frame>
  );
}

function FloatTextPreview() {
  return (
    <Frame>
      <Picture x={16} y={16} w={78} h={62} />
      <Line x={106} y={18} w={90} strong />
      <Paragraph x={106} y={38} w={118} lines={4} />
      <Paragraph x={16} y={88} w={208} lines={4} />
    </Frame>
  );
}

/* Registre ──────────────────────────────────────────────────────────── */

export const BLOCK_PREVIEWS: Record<PageBlockKindV1, { picture: () => JSX.Element; description: string }> = {
  tiptap: {
    picture: TextPreview,
    description: "Un texte mis en forme : titres, paragraphes, listes, liens.",
  },
  "image-gallery": {
    picture: GalleryPreview,
    description: "Des images présentées en grille, en carrousel ou en mosaïque.",
  },
  "audio-collection": {
    picture: AudioPreview,
    description: "Une liste de pistes audio à écouter directement dans la page.",
  },
  "document-list": {
    picture: DocumentsPreview,
    description: "Une liste de documents à ouvrir ou à télécharger.",
  },
  "media-text": {
    picture: MediaTextPreview,
    description: "Une image et un texte côte à côte.",
  },
  "float-text": {
    picture: FloatTextPreview,
    description: "Un texte qui s'enroule autour d'une image.",
  },
};

/** Carte d'aperçu d'un type de bloc : illustration, nom et description. */
export function BlockPreviewCard({ kind, label }: { kind: PageBlockKindV1; label: string }): JSX.Element | null {
  const preview = BLOCK_PREVIEWS[kind];
  if (!preview) return null;
  const Picture = preview.picture;
  return (
    <div className="w-64 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg">
      <Picture />
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{preview.description}</p>
    </div>
  );
}
