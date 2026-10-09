"use client";

import type { ComponentType, JSX } from "react";

import type { PageBlockKindV1, PageBlockV1, ResolvedMedia } from "@contracts/page";
import { getBlockDefinition } from "@features/page-builder/blockRegistry";
import type { BlockViewProps } from "@features/page-builder/BlockDefinition.types";

/**
 * Tous les types de blocs, rendus par leurs VRAIES vues (celles de la page publique), sur des
 * données d'exemple et des médias factices. Aucune imitation : ce que montre le laboratoire est
 * ce que rendra le site, variantes comprises (galerie en grille / carrousel / mosaïque, texte
 * enrobant à gauche / à droite, média-texte avec image, avatar ou logo, alterné comme sur une page).
 *
 * `LAB_SAMPLES` est typé sur `PageBlockKindV1` : ajouter un type de bloc sans lui donner
 * d'exemple ici fait échouer la compilation — le laboratoire ne peut plus prendre de retard.
 */

type Sample<K extends PageBlockKindV1> = {
  label: string;
  /** Ancre visée par les réglages (« cliquez le nom d'un réglage »). */
  anchor?: string;
  block: Extract<PageBlockV1, { type: K }>;
};

type Samples = { [K in PageBlockKindV1]: Sample<K>[] };

/* ── Médias factices ─────────────────────────────────────────────────── */

const SHADES = ["#d1fae5", "#e0e7ff", "#fef3c7", "#fce7f3", "#e5e7eb", "#cffafe"];

function svgImage(label: string, w: number, h: number, shade: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${shade}"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.round(Math.min(w, h) / 9)}" fill="#475569" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Une seconde de silence (WAV 8 kHz, 8 bits) : un vrai lecteur audio, sans fichier. */
function silentWav(): string {
  const n = 8000;
  const bytes = new Uint8Array(44 + n);
  const v = new DataView(bytes.buffer);
  const str = (o: number, s: string): void => { for (let i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); };
  str(0, "RIFF"); v.setUint32(4, 36 + n, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, "data"); v.setUint32(40, n, true); bytes.fill(128, 44);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

const AUDIO_URL = silentWav();

function fakeImage(id: string, label: string, w: number, h: number, i: number): ResolvedMedia {
  return { url: svgImage(label, w, h, SHADES[i % SHADES.length]), kind: "image", posterUrl: null, mimeType: "image/svg+xml", fileName: `${id}.svg`, width: w, height: h, duration: null };
}

/** Résolution factice : l'identifiant d'exemple dit la nature et les proportions du média. */
function resolveMedia(mediaId: string): ResolvedMedia | null {
  const [kind, ...rest] = mediaId.split(":");
  if (kind === "img") {
    const [label, w, h, i] = rest;
    return fakeImage(mediaId, label, Number(w), Number(h), Number(i));
  }
  if (kind === "audio") {
    return { url: AUDIO_URL, kind: "audio", posterUrl: null, mimeType: "audio/wav", fileName: `${rest[0]}.wav`, width: null, height: null, duration: 1 };
  }
  if (kind === "doc") {
    return { url: "#", kind: "document", posterUrl: null, mimeType: "application/pdf", fileName: `${rest[0]}.pdf`, width: null, height: null, duration: null };
  }
  return null;
}

const resolveAvatar = (): ResolvedMedia => fakeImage("avatar", "avatar", 400, 400, 3);
const siteLogo: ResolvedMedia = { url: "/AKFC_logo.svg", kind: "image", posterUrl: null, mimeType: "image/svg+xml", fileName: "logo.svg", width: null, height: null, duration: null };

/* ── Contenu d'exemple ───────────────────────────────────────────────── */

const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
const h = (level: number, text: string) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.";
const doc = (...content: unknown[]) => ({ type: "doc", content }) as never;

const TEXT_DOC = doc(
  h(2, "Texte seul"),
  p(LOREM),
  { type: "bulletList", content: [1, 2, 3].map((i) => ({ type: "listItem", content: [p(`Élément de liste ${i}`)] })) },
  { type: "blockquote", content: [p("Une citation, pour voir son retrait et son interlignage.")] },
  p("Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa."),
);
const SHORT_DOC = (title: string) => doc(h(3, title), p(LOREM), p("Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor."));
const FLOAT_DOC = (side: string) =>
  doc(
    h(3, `Texte enrobant, image à ${side}`),
    p(`${LOREM} ${LOREM}`),
    p("Un deuxième paragraphe, pour que le texte dépasse la hauteur de l'image et reprenne toute la largeur sous elle : c'est là qu'on juge l'enrobage."),
    p(LOREM),
  );

const gallery = (layout: "grid" | "carousel" | "masonry") =>
  [0, 1, 2, 3, 4, 5].map((i) => ({
    mediaId: `img:image ${i + 1}:${layout === "masonry" ? 600 : 800}:${layout === "masonry" ? [400, 800, 600, 900, 450, 700][i] : 600}:${i}`,
    caption: `Légende de l'image ${i + 1}`,
  }));

export const LAB_SAMPLES: Samples = {
  tiptap: [{ label: "Texte (tiptap)", anchor: "lab-pleine-largeur", block: { id: "lab-tiptap", type: "tiptap", content: TEXT_DOC } }],
  "media-text": [
    { label: "Média et texte — image de la bibliothèque", block: { id: "lab-mt-1", type: "media-text", content: SHORT_DOC("Média à gauche"), media: { kind: "library", mediaId: "img:média:800:600:1", caption: "Légende du média" } } },
    { label: "Média et texte — logo du site (alterné)", block: { id: "lab-mt-2", type: "media-text", content: SHORT_DOC("Média à droite"), media: { kind: "site-logo" } } },
    { label: "Média et texte — avatar d'un membre", block: { id: "lab-mt-3", type: "media-text", content: SHORT_DOC("Retour à gauche"), media: { kind: "avatar", userId: "lab", caption: "Portrait" } } },
  ],
  "float-text": [
    { label: "Texte enrobant — logo du site", block: { id: "lab-ft-logo", type: "float-text", side: "left", content: FLOAT_DOC("gauche (logo)"), media: { kind: "site-logo" } } },
    { label: "Texte enrobant — image à gauche", anchor: "lab-float", block: { id: "lab-ft-l", type: "float-text", side: "left", content: FLOAT_DOC("gauche"), media: { kind: "library", mediaId: "img:image:600:600:2" } } },
    { label: "Texte enrobant — image à droite", block: { id: "lab-ft-r", type: "float-text", side: "right", content: FLOAT_DOC("droite"), media: { kind: "library", mediaId: "img:image:600:800:4" } } },
  ],
  "image-gallery": [
    { label: "Galerie — grille", anchor: "lab-collections", block: { id: "lab-g-grid", type: "image-gallery", layout: "grid", items: gallery("grid") } },
    { label: "Galerie — carrousel", block: { id: "lab-g-car", type: "image-gallery", layout: "carousel", items: gallery("carousel") } },
    { label: "Galerie — mosaïque", block: { id: "lab-g-mas", type: "image-gallery", layout: "masonry", items: gallery("masonry") } },
  ],
  "audio-collection": [
    { label: "Collection audio", block: { id: "lab-audio", type: "audio-collection", items: [{ mediaId: "audio:piste-1", title: "Piste 1" }, { mediaId: "audio:piste-2" }] } },
  ],
  "document-list": [
    { label: "Liste de documents", block: { id: "lab-docs", type: "document-list", items: [{ mediaId: "doc:reglement-interieur", label: "Règlement intérieur" }, { mediaId: "doc:planning-saison" }] } },
  ],
};

/** Ordre d'une page plausible : texte, colonnes, enrobage, collections. */
const ORDER: PageBlockKindV1[] = ["tiptap", "media-text", "float-text", "image-gallery", "audio-collection", "document-list"];

export function RealBlocksPreview(): JSX.Element {
  const samples = ORDER.flatMap((k) => LAB_SAMPLES[k] as Sample<PageBlockKindV1>[]);
  // Alternance des média-texte, calculée comme le rendu public (PageRenderer.sideFor).
  const mediaTextIds = samples.filter((s) => s.block.type === "media-text").map((s) => s.block.id);
  return (
    <div id="lab-blocs" className="flex flex-col" style={{ gap: "var(--akfc-block-gap)" }}>
      {samples.map((s) => {
        const View = getBlockDefinition(s.block.type).View as unknown as ComponentType<BlockViewProps<PageBlockV1>>;
        const rank = mediaTextIds.indexOf(s.block.id);
        return (
          <section key={s.block.id} id={s.anchor}>
            <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <View
              block={s.block}
              resolveMedia={resolveMedia}
              resolveAvatar={resolveAvatar}
              siteLogo={siteLogo}
              mediaSide={rank === -1 ? undefined : rank % 2 === 0 ? "left" : "right"}
            />
          </section>
        );
      })}
    </div>
  );
}
