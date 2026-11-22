import { trpcClient } from '#core/trpc/trpcClient.ts';

/**
 * Le sélecteur de médias rend des chemins ; un contenu (galerie, page, fiche) retient des
 * identifiants, qui survivent à un déplacement ou à un renommage. Cette conversion est la même
 * pour tous les formulaires : une seule fonction, pour que toutes les voies produisent la même
 * référence.
 *
 * L'ordre des chemins est gardé (celui du panier). Un chemin sans média est écarté ; si aucun
 * n'en a, l'erreur est levée : le sélecteur l'affiche et reste ouvert, au lieu de se fermer
 * sans rien ajouter. Un refus du serveur remonte de la même façon.
 */
export async function pathsToMediaIds(appRoot: string, paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const byPath = await trpcClient.media.resolveByPaths.query({ appRoot, paths });
  const ids = paths
    .map((p) => byPath[p])
    .filter((id): id is string => typeof id === 'string');
  if (ids.length === 0) {
    throw new Error("Ces fichiers ne sont pas enregistrés comme médias de la bibliothèque.");
  }
  return ids;
}
