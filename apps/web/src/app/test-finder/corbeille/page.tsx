import { JSX } from 'react';
import TrashView from '@features/trash-view/components/TrashView';

/**
 * Route /test-finder/corbeille
 *
 * Page dédiée à la vue Corbeille. Le composant `TrashView` gère tout
 * l'orchestrage (listing, drill-down, recherche, sélection, actions).
 *
 * Note : pas de paramètres dans l'URL pour la sélection ou le drill-down
 * — ces états vivent dans le store frontend `useTrashStore`. Si on voulait
 * partager un lien vers une entrée précise (deep-linking), on ajouterait
 * `?trashId=...` ou similaire et on synchroniserait le store depuis le
 * `useSearchParams`. Pas dans le scope du MVP.
 */
export default function CorbeillePage(): JSX.Element {
  return (
    <main className="h-screen p-4 bg-gray-50">
      <TrashView />
    </main>
  );
}
