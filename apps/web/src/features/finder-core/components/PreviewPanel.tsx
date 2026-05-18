'use client';

import { JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileSearch, Files, FileWarning } from 'lucide-react';

import type { FileAdapter, FinderNode, FinderNodeMetadata } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useNodeMetadata } from '@features/finder-core/hooks/useNodeMetadata';
import { useNodeTextContent } from '@features/finder-core/hooks/useNodeTextContent';
import { resolveSelection } from '@features/finder-core/utils/resolveSelection';
import { formatBytes } from '@features/finder-core/utils/formatBytes';
import { formatDate } from '@features/finder-core/utils/formatDate';

/* -------------------------------------------------------------------------- */
/*                              PREVIEW KIND                                  */
/* -------------------------------------------------------------------------- */

/**
 * Type discriminé du renderer à utiliser pour la preview principale.
 *
 * On dérive ce type localement plutôt que de l'ajouter au contrat
 * `MediaMeta.kind` (qui reste limité à image/video/document, suffisant
 * pour les besoins amont). Le PreviewPanel a un besoin de granularité
 * plus fine (PDF distinct de document, audio distinct de video) qui
 * lui est propre.
 */
type PreviewKind =
  | 'image'
  | 'video'
  | 'pdf'
  | 'audio'
  | 'text'
  | 'markdown'
  | 'unsupported';

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'flac']);
const TEXT_FORMATS = new Set(['txt']);
const MARKDOWN_FORMATS = new Set(['md', 'markdown']);

/**
 * Détermine quel renderer utiliser pour un fichier donné.
 *
 * On combine deux sources d'information :
 *   - `file.meta.kind` : posé par l'adapter, fiable pour image/video.
 *   - `file.meta.format` ou `metadata.format` : extension/format technique,
 *     nécessaire pour distinguer pdf/audio/txt/md à l'intérieur du kind
 *     'document' (que le contrat ne subdivise pas).
 *
 * Priorité au `kind` quand il est explicite (image/video), puis au `format`.
 */
function getPreviewKind(
  file: FinderNode,
  metadata: FinderNodeMetadata | null,
): PreviewKind {
  if (file.meta?.kind === 'image') return 'image';
  if (file.meta?.kind === 'video') return 'video';

  const format = (file.meta?.format ?? metadata?.format ?? '').toLowerCase();

  if (format === 'pdf') return 'pdf';
  if (AUDIO_FORMATS.has(format)) return 'audio';
  if (MARKDOWN_FORMATS.has(format)) return 'markdown';
  if (TEXT_FORMATS.has(format)) return 'text';

  return 'unsupported';
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

type Props = {
  /**
   * Adapter du finder, transmis depuis `Finder.tsx`. Nécessaire pour
   * appeler `getMetadata` côté hook. Si l'adapter n'expose pas
   * `getMetadata`, le bloc metadata est silencieusement omis.
   */
  adapter: FileAdapter;
};

export default function PreviewPanel({ adapter }: Props): JSX.Element {
  const { selection, files } = useFinderStore();

  const allItems = files.map((f) => ({ id: f.id, path: f.path }));

  const resolved = resolveSelection({
    items: allItems,
    roots: selection.roots,
    excluded: selection.excluded,
  });

  const ids = Array.from(resolved);
  const file = ids.length === 1 ? files.find((f) => f.id === ids[0]) ?? null : null;

  // Hook metadata : appelé inconditionnellement (rules of hooks).
  // Le `path: null` quand pas de single-selection court-circuite le fetch.
  const { metadata, loading: metadataLoading, error: metadataError } =
    useNodeMetadata(adapter, file?.path ?? null);

  /* ------------------------------ EMPTY STATE ----------------------------- */

  if (ids.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 p-6 text-center">
        <FileSearch className="h-10 w-10 opacity-50" aria-hidden />
        <div className="text-sm">
          Sélectionnez un fichier<br />pour le prévisualiser
        </div>
      </div>
    );
  }

  /* ---------------------------- MULTI-SELECTION --------------------------- */

  if (ids.length > 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 p-6 text-center">
        <Files className="h-10 w-10 opacity-60 text-gray-400" aria-hidden />
        <div className="text-base font-medium text-gray-700">{ids.length} éléments sélectionnés</div>
        <div className="text-sm text-gray-400">Aperçu multiple non disponible</div>
      </div>
    );
  }

  /* -------------------------- SINGLE BUT NOT FOUND ------------------------ */
  // Cas marginal : la sélection référence un id qui n'est plus dans `files`
  // (ex: race entre un drop qui rafraîchit et le store de sélection).

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 gap-3 p-6 text-center">
        <FileWarning className="h-10 w-10 opacity-60" aria-hidden />
        <div className="text-sm">Aperçu indisponible</div>
      </div>
    );
  }

  /* -------------------------- SINGLE FILE PREVIEW ------------------------- */

  const kind = getPreviewKind(file, metadata);

  return (
    <div className="p-4 h-full flex flex-col gap-4 overflow-auto">
      {/* Nom du fichier */}
      <div className="text-sm font-medium truncate" title={file.name}>
        {file.name}
      </div>

      {/* Renderer principal selon kind */}
      <PreviewRenderer file={file} kind={kind} />

      {/* Bloc metadata : silencieux si pas de support, sinon affiché */}
      {adapter.getMetadata && (
        <MetadataBlock
          metadata={metadata}
          loading={metadataLoading}
          error={metadataError}
        />
      )}

      {/* Path complet en bas, muted, sélectionnable pour copier */}
      <div className="mt-auto pt-2 border-t border-gray-100 text-xs text-gray-400 break-all select-text">
        {file.path}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            PREVIEW RENDERER                                */
/* -------------------------------------------------------------------------- */

/**
 * Dispatcher du renderer principal selon le kind détecté.
 *
 * Chaque branche est minimale et autonome. Les renderers async (text,
 * markdown) ont besoin de leur propre cycle de fetch et sont donc
 * extraits en sous-composants pour bénéficier de leur propre `useEffect`.
 */
function PreviewRenderer({
  file,
  kind,
}: {
  file: FinderNode;
  kind: PreviewKind;
}): JSX.Element {
  const url = file.meta?.url;

  if (!url) {
    return <PreviewEmpty message="Pas de preview disponible" />;
  }

  switch (kind) {
    case 'image':
      return (
        <img
          src={url}
          alt={file.name}
          className="max-h-[300px] object-contain rounded border"
        />
      );

    case 'video':
      return (
        <video
          src={url}
          controls
          className="max-h-[300px] rounded border w-full"
        />
      );

    case 'audio':
      return (
        <audio
          src={url}
          controls
          className="w-full"
        />
      );

    case 'pdf':
      return (
        <iframe
          src={url}
          title={file.name}
          // Hauteur fixe : la sidebar n'a pas une hauteur garantie suffisante
          // pour un PDF, on impose une fenêtre confortable avec scroll interne.
          className="w-full h-[400px] rounded border"
        />
      );

    case 'text':
      return <TextPreview url={url} />;

    case 'markdown':
      return <MarkdownPreview url={url} />;

    case 'unsupported':
    default:
      return <PreviewEmpty message="Aperçu non supporté pour ce format" />;
  }
}

function PreviewEmpty({ message }: { message: string }): JSX.Element {
  return <div className="text-gray-400 text-sm italic">{message}</div>;
}

/* -------------------------------------------------------------------------- */
/*                         TEXT / MARKDOWN PREVIEWS                           */
/* -------------------------------------------------------------------------- */

/**
 * Preview de fichier texte brut (.txt).
 *
 * Le contenu est fetché via `useNodeTextContent`, tronqué si trop gros,
 * et affiché dans un `<pre>` avec scroll interne (pour ne pas exploser
 * la hauteur de la sidebar).
 */
function TextPreview({ url }: { url: string }): JSX.Element {
  const { content, loading, error, truncated } = useNodeTextContent(url);

  if (loading) return <PreviewEmpty message="Chargement…" />;
  if (error) return <PreviewEmpty message="Impossible de charger le fichier" />;
  if (content === null) return <PreviewEmpty message="Fichier vide" />;

  return (
    <div className="flex flex-col gap-1">
      <pre className="max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-xs whitespace-pre-wrap break-words">
        {content}
      </pre>
      {truncated && (
        <div className="text-xs text-gray-400 italic">
          Aperçu tronqué — fichier trop volumineux pour un affichage complet.
        </div>
      )}
    </div>
  );
}

/**
 * Preview markdown rendu en HTML via `react-markdown`.
 *
 * Sécurité : `react-markdown` ne passe PAS le HTML inline du markdown
 * par défaut (`skipHtml` est false mais `rehype-raw` n'est pas activé).
 * On est donc protégé contre l'injection de balises arbitraires depuis
 * un .md hostile — pas besoin de DOMPurify.
 *
 * Les classes `prose` de Tailwind Typography ne sont pas activées dans
 * le projet ; on stylise minimalement à la main pour rester sobre.
 */
function MarkdownPreview({ url }: { url: string }): JSX.Element {
  const { content, loading, error, truncated } = useNodeTextContent(url);

  if (loading) return <PreviewEmpty message="Chargement…" />;
  if (error) return <PreviewEmpty message="Impossible de charger le fichier" />;
  if (content === null) return <PreviewEmpty message="Fichier vide" />;

  return (
    <div className="flex flex-col gap-1">
      <div className="max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-sm markdown-preview">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {truncated && (
        <div className="text-xs text-gray-400 italic">
          Aperçu tronqué — fichier trop volumineux pour un affichage complet.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              METADATA BLOCK                                */
/* -------------------------------------------------------------------------- */

/**
 * Affiche les métadonnées riches en grid 2 colonnes (label : valeur).
 *
 * Comportement par état :
 *   - loading        → "Chargement…" muted
 *   - error          → "Métadonnées indisponibles" muted (silencieux)
 *   - metadata null  → "Métadonnées indisponibles" muted
 *   - metadata vide  → on n'affiche pas le bloc (toutes les valeurs absentes)
 *   - metadata présentes → tableau des champs renseignés uniquement
 */
function MetadataBlock({
  metadata,
  loading,
  error,
}: {
  metadata: FinderNodeMetadata | null;
  loading: boolean;
  error: string | null;
}): JSX.Element | null {
  if (loading) {
    return (
      <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
        Chargement…
      </div>
    );
  }

  if (error || metadata === null) {
    return (
      <div className="border-t border-gray-100 pt-3 text-xs text-gray-400 italic">
        Métadonnées indisponibles
      </div>
    );
  }

  // Construction de la liste des paires (label, value), en filtrant
  // celles qui n'ont pas de valeur. Si tout est vide, on n'affiche rien.
  const rows: Array<{ label: string; value: string }> = [];

  if (metadata.format) rows.push({ label: 'Format', value: metadata.format });
  if (metadata.mimeType) rows.push({ label: 'Type MIME', value: metadata.mimeType });

  const size = formatBytes(metadata.bytes);
  if (size) rows.push({ label: 'Taille', value: size });

  const created = formatDate(metadata.createdAt);
  if (created) rows.push({ label: 'Créé le', value: created });

  const updated = formatDate(metadata.updatedAt);
  if (updated) rows.push({ label: 'Modifié le', value: updated });

  if (rows.length === 0) return null;

  return (
    <div className="border-t border-gray-100 pt-3">
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        {rows.map((row) => (
          // On utilise un Fragment avec key sur le label : les couples
          // (label, value) sont stables et non interchangeables.
          <div key={row.label} className="contents">
            <div className="text-gray-500">{row.label}</div>
            <div className="text-gray-800 break-all">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
