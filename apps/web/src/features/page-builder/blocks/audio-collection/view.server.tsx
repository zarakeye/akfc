import type { AudioCollectionBlockV1 } from "@contracts/page";

import type { BlockViewProps } from "../../BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  View                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Rendu public d'un bloc `audio-collection`.
 *
 * Liste verticale, chaque item avec son titre (ou nom de fichier en
 * repli) et un mini-player `<audio controls>` natif. Le `preload="metadata"`
 * évite que tous les fichiers se téléchargent à l'affichage — seul un
 * petit header de métadonnées est récupéré, le binaire vient au clic
 * sur play.
 *
 * Les items dont le mediaId ne résout pas sont silencieusement omis
 * (asset hors `published` ou supprimé).
 *
 * ⚠️ Limitation actuelle : l'URL pointe vers `/api/media/r2/...` qui
 * exige une session admin. Pour le visiteur anonyme, ces players ne
 * fonctionneront que partiellement (le `<audio>` recevra un 401 au
 * fetch). Le contournement viendra au sous-chantier 6c avec une route
 * publique séparée pour les assets `published`.
 */
export function AudioCollectionView({
  block,
  resolveMedia,
}: BlockViewProps<AudioCollectionBlockV1>) {
  const items = block.items.flatMap((item) => {
    const media = resolveMedia(item.mediaId);
    return media ? [{ item, media }] : [];
  });

  if (items.length === 0) return null;

  return (
    <ul
      className="flex flex-col"
      style={{ gap: "var(--akfc-item-gap)" }}
    >
      {items.map(({ item, media }) => (
        <li
          key={item.mediaId}
          className="rounded-md border border-border bg-card"
          style={{ padding: "var(--akfc-card-padding)" }}
        >
          <p className="mb-2 text-sm font-medium">
            {item.title ?? media.fileName}
          </p>
          <audio
            controls
            preload="metadata"
            src={media.url}
            className="w-full"
          >
            <a href={media.url} download={media.fileName}>
              Télécharger l&apos;audio
            </a>
          </audio>
        </li>
      ))}
    </ul>
  );
}
