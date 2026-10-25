import type { JSX } from "react";

/**
 * Logo d'un partenaire sur une pastille claire : les logos de partenaires (texte sombre, couleurs)
 * restent lisibles sur le pied de page noir comme sur une page claire. Lien vers son site s'il en a un.
 */
export function PartnerLogo({
  name,
  logoUrl,
  websiteUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  size?: "md" | "lg";
}): JSX.Element {
  const box = size === "lg" ? "h-24 w-36" : "h-16 w-28";
  // Pastille blanche dans les deux thèmes : `bg-[#fff]` et pas bg-white : réorienté vers un fond
  // sombre en mode sombre par styles/dark-legacy.css, il rendrait les logos (texte sombre) illisibles.
  const inner = (
    <span className={`flex ${box} items-center justify-center rounded-md bg-[#fff] p-2 shadow-sm ring-1 ring-black/5`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-center text-xs font-medium text-[#374151]">{name}</span>
      )}
    </span>
  );
  return websiteUrl ? (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`${name} (nouvel onglet)`}
      className="inline-flex rounded-md transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-emerald-500"
    >
      {inner}
    </a>
  ) : (
    inner
  );
}
