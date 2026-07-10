'use client';

import { JSX, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileSearch, Files, FileWarning, Maximize2 } from 'lucide-react';

import type { FileAdapter, FinderNode, FinderNodeMetadata } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import { useNodeMetadata } from '@features/finder-core/hooks/useNodeMetadata';
import { useNodeTextContent } from '@features/finder-core/hooks/useNodeTextContent';
import { resolveSelection } from '@features/finder-core/utils/resolveSelection';
import { formatBytes } from '@features/finder-core/utils/formatBytes';
import { formatDate } from '@features/finder-core/utils/formatDate';
import PreviewModal from '@features/finder-core/components/PreviewModal';
import DescriptionField from '@features/finder-core/components/DescriptionField';

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
export type PreviewKind =
  | 'image'
  | 'video'
  | 'pdf'
  | 'audio'
  | 'text'
  | 'markdown'
  | 'docx'
  | 'unsupported';

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'ogg', 'oga', 'm4a', 'opus', 'flac']);
const TEXT_FORMATS = new Set(['txt']);
const MARKDOWN_FORMATS = new Set(['md', 'markdown']);
const DOCX_FORMATS = new Set(['docx']);

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
  if (DOCX_FORMATS.has(format)) return 'docx';

  return 'unsupported';
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

type Props = {
  adapter: FileAdapter;
};

export default function PreviewPanel({ adapter }: Props): JSX.Element {
  const { selection, files } = useFinderStore();
  const [modalOpen, setModalOpen] = useState(false);

  const allItems = files.map((f) => ({ id: f.id, path: f.path }));

  const resolved = resolveSelection({
    items: allItems,
    roots: selection.roots,
    excluded: selection.excluded,
  });

  const ids = Array.from(resolved);
  const file = ids.length === 1 ? files.find((f) => f.id === ids[0]) ?? null : null;

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
  const canExpand = kind !== 'unsupported' && Boolean(file.meta?.url);

  return (
    <div className="p-4 h-full flex flex-col gap-4 overflow-auto">
      {/* Header : nom du fichier + bouton "ouvrir en grand" */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium truncate flex-1" title={file.name}>
          {file.name}
        </div>
        {canExpand && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Ouvrir en grand"
            aria-label="Ouvrir en grand"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Renderer principal selon kind (variant inline par défaut) */}
      <PreviewRenderer file={file} kind={kind} variant="inline" />

      {/* Bloc metadata : silencieux si pas de support, sinon affiché */}
      {adapter.getMetadata && (
        <MetadataBlock
          metadata={metadata}
          loading={metadataLoading}
          error={metadataError}
        />
      )}

      {/* Champ description éditable — toujours rendu pour les fichiers single
          (Phase 3). Si le fichier n'est pas tracké en MediaAsset (orphelin
          ou R2 pas encore couvert), la mutation backend retourne une erreur
          gérée par le composant. */}
      <DescriptionField file={file} />

      {/* Path complet en bas, muted, sélectionnable pour copier */}
      <div className="mt-auto pt-2 border-t border-gray-100 text-xs text-gray-400 break-all select-text">
        {file.path}
      </div>

      {/* Modale fullscreen — montée toujours, masque/affiche via prop isOpen */}
      <PreviewModal
        file={file}
        kind={kind}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            PREVIEW RENDERER                                */
/* -------------------------------------------------------------------------- */

export function PreviewRenderer({
  file,
  kind,
  variant = 'inline',
}: {
  file: FinderNode;
  kind: PreviewKind;
  variant?: 'inline' | 'fullscreen';
}): JSX.Element {
  const url = file.meta?.url;

  if (!url) {
    return <PreviewEmpty message="Pas de preview disponible" />;
  }

  const isFullscreen = variant === 'fullscreen';

  switch (kind) {
    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={file.name}
          className={
            isFullscreen
              ? 'max-w-full max-h-full object-contain mx-auto'
              : 'max-h-[300px] object-contain rounded border'
          }
        />
      );

    case 'video':
      return isFullscreen ? (
        <div className="h-full w-full flex items-center justify-center bg-black">
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <video
          src={url}
          controls
          className="max-h-[300px] rounded border w-full"
        />
      );

    case 'audio':
      return isFullscreen ? (
        <div className="h-full w-full flex items-center justify-center p-8">
          <audio src={url} controls autoPlay className="w-full max-w-2xl" />
        </div>
      ) : (
        <audio src={url} controls className="w-full" />
      );

    case 'pdf':
      return (
        <iframe
          src={url}
          title={file.name}
          className={
            isFullscreen
              ? 'w-full h-full border-0'
              : 'w-full h-[400px] rounded border'
          }
        />
      );

    case 'text':
      return <TextPreview url={url} variant={variant} />;

    case 'markdown':
      return <MarkdownPreview url={url} variant={variant} />;

    case 'docx':
      return <DocxPreview url={url} variant={variant} />;

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

export function TextPreview({
  url,
  variant = 'inline',
}: {
  url: string;
  variant?: 'inline' | 'fullscreen';
}): JSX.Element {
  const { content, loading, error, truncated } = useNodeTextContent(url);

  if (loading) return <PreviewEmpty message="Chargement…" />;
  if (error) return <PreviewEmpty message="Impossible de charger le fichier" />;
  if (content === null) return <PreviewEmpty message="Fichier vide" />;

  const containerClass =
    variant === 'fullscreen'
      ? 'h-full overflow-auto p-6 bg-gray-50 text-sm whitespace-pre-wrap break-words font-mono'
      : 'max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-xs whitespace-pre-wrap break-words';

  return (
    <div className={variant === 'fullscreen' ? 'h-full flex flex-col' : 'flex flex-col gap-1'}>
      <pre className={containerClass}>{content}</pre>
      {truncated && (
        <div className="text-xs text-gray-400 italic px-3 py-1">
          Aperçu tronqué — fichier trop volumineux pour un affichage complet.
        </div>
      )}
    </div>
  );
}

export function MarkdownPreview({
  url,
  variant = 'inline',
}: {
  url: string;
  variant?: 'inline' | 'fullscreen';
}): JSX.Element {
  const { content, loading, error, truncated } = useNodeTextContent(url);

  if (loading) return <PreviewEmpty message="Chargement…" />;
  if (error) return <PreviewEmpty message="Impossible de charger le fichier" />;
  if (content === null) return <PreviewEmpty message="Fichier vide" />;

  const containerClass =
    variant === 'fullscreen'
      ? 'h-full overflow-auto p-8 bg-white text-base markdown-preview max-w-4xl mx-auto'
      : 'max-h-[300px] overflow-auto p-3 rounded border bg-gray-50 text-sm markdown-preview';

  return (
    <div className={variant === 'fullscreen' ? 'h-full flex flex-col' : 'flex flex-col gap-1'}>
      <div className={containerClass}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {truncated && (
        <div className="text-xs text-gray-400 italic px-3 py-1">
          Aperçu tronqué — fichier trop volumineux pour un affichage complet.
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DOCX PREVIEW                                  */
/* -------------------------------------------------------------------------- */

function DocxPreview({
  url,
  variant = 'inline',
}: {
  url: string;
  variant?: 'inline' | 'fullscreen';
}): JSX.Element {
  const [state, setState] = useState<{
    html: string | null;
    loading: boolean;
    error: string | null;
  }>({ html: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState({ html: null, loading: true, error: null });
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (!cancelled) {
          setState({ html: result.value, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            html: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Conversion failed',
          });
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state.loading) return <PreviewEmpty message="Conversion DOCX en cours…" />;
  if (state.error) return <PreviewEmpty message="Impossible d'afficher le document" />;
  if (!state.html) return <PreviewEmpty message="Document vide" />;

  const containerClass =
    variant === 'fullscreen'
      ? 'h-full overflow-auto p-8 bg-white text-base docx-preview max-w-4xl mx-auto'
      : 'max-h-[400px] overflow-auto p-3 rounded border bg-gray-50 text-sm docx-preview';

  return (
    <div className={variant === 'fullscreen' ? 'h-full flex flex-col' : 'flex flex-col gap-1'}>
      <div className={containerClass} dangerouslySetInnerHTML={{ __html: state.html }} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              METADATA BLOCK                                */
/* -------------------------------------------------------------------------- */

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
          <div key={row.label} className="contents">
            <div className="text-gray-500">{row.label}</div>
            <div className="text-gray-800 break-all">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}