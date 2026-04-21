'use client';

import { Table, type Column } from 'react-ts-tab-lib';

interface DocsTableProps {
  /**
   * Columns header — accepts either:
   *  - a JSON string: '["Niveau","Question"]'
   *  - a JS array:    ["Niveau","Question"]
   */
  columnsJson: string | string[];
  /**
   * Rows content — accepts either:
   *  - a JSON string: '[["a","b"],["c","d"]]'
   *  - a JS 2D array: [["a","b"],["c","d"]]
   */
  rowsJson: string | string[][];
  title?: string;
}

/**
 * Parses a prop that can be either a JSON string or an already-parsed value.
 * Returns { value, error } where error is a human-readable message if parsing fails.
 */
function parseFlexibleJson<T>(
  input: unknown,
  propName: string,
): { value: T | null; error: string | null } {
  // Already an array — MDX may have pre-evaluated the expression.
  if (Array.isArray(input)) {
    return { value: input as T, error: null };
  }

  // String — standard JSON path.
  if (typeof input === 'string') {
    try {
      return { value: JSON.parse(input) as T, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return {
        value: null,
        error: `${propName}: JSON.parse failed — ${message}. Received: ${input.slice(0, 120)}${input.length > 120 ? '…' : ''}`,
      };
    }
  }

  return {
    value: null,
    error: `${propName}: expected string or array, got ${typeof input}`,
  };
}

export default function DocsTable({
  columnsJson,
  rowsJson,
  title,
}: DocsTableProps) {
  const { value: parsedColumns, error: columnsError } = parseFlexibleJson<
    string[]
  >(columnsJson, 'columnsJson');

  const { value: parsedRows, error: rowsError } = parseFlexibleJson<string[][]>(
    rowsJson,
    'rowsJson',
  );

  if (columnsError || rowsError || !parsedColumns || !parsedRows) {
    return (
      <div className="my-6 rounded-md border border-red-500 bg-red-950/40 p-4 text-sm text-red-200">
        <p className="font-semibold">DocsTable: invalid input</p>
        {columnsError ? (
          <p className="mt-2 opacity-80">{columnsError}</p>
        ) : null}
        {rowsError ? <p className="mt-2 opacity-80">{rowsError}</p> : null}
      </div>
    );
  }

  const columns: Column<Record<string, unknown>>[] = parsedColumns.map(
    (col, index) => ({
      property: `col_${index}`,
      displayName: col,
      type: 'string',
    }),
  );

  const rows: Record<string, unknown>[] = parsedRows.map((row) => {
    const obj: Record<string, unknown> = {};
    row.forEach((cell, index) => {
      obj[`col_${index}`] = cell;
    });
    return obj;
  });

  return (
    <div className="my-6 w-full">
      {title ? (
        <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      ) : null}
      <div className="my-6 rounded-2xl border border-red-500 p-4 text-white">
        <Table columns={columns} rows={rows} />
      </div>
    </div>
  );
}