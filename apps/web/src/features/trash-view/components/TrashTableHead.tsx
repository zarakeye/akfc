import { JSX } from 'react';

/** En-tête du tableau de la corbeille (vue dédiée et finder) : les colonnes de TrashEntryTableRow. */
export default function TrashTableHead(): JSX.Element {
  return (
    <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wider">
      <tr>
        <th className="px-3 py-2 text-left w-8"></th>
        <th className="px-3 py-2 text-left w-8"></th>
        <th className="px-3 py-2 text-left">Nom</th>
        <th className="px-3 py-2 text-left">Chemin d&apos;origine</th>
        <th className="px-3 py-2 text-left">Jeté le</th>
        <th className="px-3 py-2 text-left">Jeté par</th>
        <th className="px-3 py-2 text-left">Effacé le</th>
        <th className="px-3 py-2 text-right">Taille</th>
      </tr>
    </thead>
  );
}
