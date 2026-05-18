'use client';

import { JSX, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Champ de recherche avec debounce 250ms.
 *
 * - L'input est contrôlé localement (typedValue) pour fluidité.
 * - Après 250ms sans frappe, on propage la valeur au parent via `onChange`.
 *   Le parent passe alors la valeur au backend pour filtrer.
 *
 * Pourquoi le debounce ? Sans ça, chaque touche déclencherait une requête
 * tRPC vers `listBin` côté backend — saturation inutile pour un résultat
 * qui change à chaque frappe.
 *
 * Le bouton X efface immédiatement (pas de debounce sur le clear).
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher...',
}: Props): JSX.Element {
  const [localValue, setLocalValue] = useState(value);

  // Synchronisation parent → local (utile si le parent reset depuis l'extérieur)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce local → parent
  useEffect(() => {
    if (localValue === value) return;
    const t = setTimeout(() => {
      onChange(localValue);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue]);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="
          pl-8 pr-8 py-1.5 text-sm border rounded
          w-64
          focus:outline-none focus:ring-2 focus:ring-blue-400
        "
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
