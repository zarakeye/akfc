'use client';

import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { trpc } from '@/lib/trpcClient';

type Props = {
  path: string;
  onNavigate: (path: string) => void;
};

type ParsedPath = {
  appRoot: string;
  status: 'pending' | 'published' | 'bin' | null;
  base: string;   // `${appRoot}/${status}` si status OK
  suffix: string; // partie après `${base}/`
};

function normalizePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, '');
}

function parsePath(fullPath: string): ParsedPath {
  const p = normalizePath(fullPath);
  const parts = p.split('/').filter(Boolean);

  const appRoot = parts[0] ?? '';
  const statusCandidate = parts[1] ?? null;

  const status =
    statusCandidate === 'pending' || statusCandidate === 'published' || statusCandidate === 'bin'
      ? statusCandidate
      : null;

  const base = status ? `${appRoot}/${status}` : appRoot;
  const prefix = status ? `${base}/` : `${base}/`;
  const suffix = status && p.startsWith(prefix) ? p.slice(prefix.length) : '';

  return { appRoot, status, base, suffix };
}

function selectLastSegment(input: HTMLInputElement) {
  const v = input.value;
  const i = v.lastIndexOf('/');
  const start = i >= 0 ? i + 1 : 0;
  input.setSelectionRange(start, v.length);
}

export function BreadCrumb({ path, onNavigate }: Props): JSX.Element {
  const parsed = useMemo(() => parsePath(path), [path]);

  // ✅ Remount key : si path change, l'éditeur se réinitialise sans useEffect setState
  return <BreadCrumbInner key={path} path={path} parsed={parsed} onNavigate={onNavigate} />;
}

function BreadCrumbInner({
  path,
  parsed,
  onNavigate,
}: {
  path: string;
  parsed: ParsedPath;
  onNavigate: (path: string) => void;
}): JSX.Element {
  const utils = trpc.useUtils();

  const crumbs = useMemo(() => {
    const p = normalizePath(path);
    const parts = p.split('/').filter(Boolean);

    const out: { label: string; fullPath: string }[] = [];
    let acc = '';

    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      out.push({ label: part, fullPath: acc });
    }

    return out;
  }, [path]);

  const [editing, setEditing] = useState(false);
  const [draftSuffix, setDraftSuffix] = useState(parsed.suffix);
  const inputRef = useRef<HTMLInputElement>(null);

  // focus + sélection : OK dans un effect (pas de setState)
  useEffect(() => {
    if (!editing) return;
    const id = setTimeout(() => {
      if (!inputRef.current) return;
      inputRef.current.focus();
      selectLastSegment(inputRef.current);
    }, 0);
    return () => clearTimeout(id);
  }, [editing]);

  const renameFolderPrefix = trpc.cloudinary.renameFolderPrefix.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.cloudinary.getFolderTree.invalidate();
      setEditing(false);
      onNavigate(variables.toPrefix);
    },
    onError: (err) => console.error('[renameFolderPrefix] failed:', err),
  });

  const isBusy = renameFolderPrefix.isPending;

  const isStatusRoot = parsed.status !== null && normalizePath(path) === parsed.base;

  function startEdit() {
    if (!parsed.status) return;
    if (isStatusRoot) return;
    setDraftSuffix(parsed.suffix); // init au clic
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraftSuffix(parsed.suffix);
  }

  function applyEdit() {
    if (!parsed.status) return;

    const cleaned = normalizePath(draftSuffix);
    if (!cleaned) return;

    const fromPrefix = normalizePath(path);
    const toPrefix = `${parsed.base}/${cleaned}`;

    if (fromPrefix === toPrefix) {
      setEditing(false);
      return;
    }

    const ok = confirm(`Renommer/déplacer ce dossier ?\n\n${fromPrefix}\n→\n${toPrefix}\n`);
    if (!ok) return;

    renameFolderPrefix.mutate({ fromPrefix, toPrefix });
  }

  // ✅ Quand editing=true : on remplace TOUT le breadcrumb par l'éditeur
  if (parsed.status && editing) {
    return (
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">{parsed.base}/</span>
          <input
            ref={inputRef}
            className="border rounded px-2 py-2 text-sm w-[520px]"
            value={draftSuffix}
            onChange={(e) => setDraftSuffix(e.target.value)}
            disabled={isBusy}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            placeholder="ex: clients/2026"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={applyEdit}
            disabled={isBusy || !normalizePath(draftSuffix)}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isBusy ? '…' : 'Appliquer'}
          </button>
          <button
            onClick={cancelEdit}
            disabled={isBusy}
            className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  // ✅ Mode normal : breadcrumb + bouton ✏️
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        {crumbs.map((c, idx) => (
          <div key={c.fullPath} className="flex items-center gap-2 min-w-0">
            <button
              className="text-sm text-blue-600 hover:underline truncate"
              onClick={() => onNavigate(c.fullPath)}
              disabled={isBusy}
              title={c.fullPath}
            >
              {c.label}
            </button>
            {idx < crumbs.length - 1 && <span className="text-gray-400">/</span>}
          </div>
        ))}
      </div>

      {parsed.status && (
        <button
          onClick={startEdit}
          disabled={isBusy || isStatusRoot}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          title={
            isStatusRoot
              ? 'Renommer la racine pending/published/bin est désactivé'
              : 'Modifier le chemin du dossier'
          }
        >
          ✏️
        </button>
      )}
    </div>
  );
}