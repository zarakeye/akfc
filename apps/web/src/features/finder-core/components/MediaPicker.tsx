import { JSX, useEffect, useMemo } from 'react';
import Finder from '@features/finder-core/components/Finder';
import { Modal } from '@components/ui/Modal';
import type { FileAdapter, FinderNode } from '@contracts/finder';
import { usePickerCartStore } from '@finder-core/cart/usePickerCartStore';
import { PickerCart } from '@features/finder-core/components/PickerCart';
import {
  isPickable,
  isMediaNode,
} from '@features/finder-core/utils/statusFolders';
import { storagePathOf } from '@features/finder-core/utils/storagePath';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedPaths: string[]) => void;
  adapter: FileAdapter;
  /**
   * Chemin racine de l'arbre du finder embarqué dans le picker.
   *
   * Propagé tel quel au composant `<Finder>` pour alimenter sa TreeView.
   * Pour AKFC, c'est typiquement l'`appRoot` du projet (ex: "AKFC").
   */
  rootPath: string;
  /**
   * Filtre des FICHIERS affichés dans le Finder embarqué. Par défaut : médias
   * visuels seulement (images + vidéos), via `isMediaNode`. Surchargeable pour
   * réutiliser le picker dans un autre contexte (audio only, tout, etc.).
   * Les dossiers ne sont jamais filtrés (navigation préservée).
   */
  fileFilter?: (node: FinderNode) => boolean;
};

/**
 * MediaPicker
 *
 * Picker média basé sur le Finder complet, en mode PANIER. L'utilisateur
 * pioche des médias en cliquant dessus (dans la grille — et, livraison 2, dans
 * l'arbre) ; chaque clic épingle/retire le média du panier, qui SURVIT à la
 * navigation entre dossiers. On peut donc accumuler des médias de plusieurs
 * dossiers, puis valider l'ensemble.
 *
 * ─── Règle métier : published only ──────────────────────────────────────────
 *
 * Seuls les médias publiés sont épinglables. On filtre à la SOURCE : le clic
 * n'épingle un fichier que s'il est `isPickable` (fichier + published). Un
 * média en attente/corbeille reste visible (pour pouvoir le publier via le
 * Finder), mais cliquer dessus ne l'ajoute pas au panier.
 *
 * ─── Source de vérité ───────────────────────────────────────────────────────
 *
 * Le panier vit dans `usePickerCartStore` (`@workspace/finder-core`), partagé
 * et portable. Ce composant ne fait que le brancher au Finder (pickMode +
 * onPickToggle) et au bandeau (PickerCart). La validation extrait les paths du
 * panier et les passe à `onSubmit`.
 */
export function MediaPicker({
  open,
  onClose,
  onSubmit,
  adapter,
  rootPath,
  fileFilter = isMediaNode,
}: Props): JSX.Element {
  const items = usePickerCartStore((s) => s.items);
  const toggleCart = usePickerCartStore((s) => s.toggleCart);
  const removeFromCart = usePickerCartStore((s) => s.removeFromCart);
  const clearCart = usePickerCartStore((s) => s.clearCart);

  // Le panier est une ressource de session : on le vide à l'ouverture du
  // picker pour repartir d'une sélection vierge, et à la fermeture pour ne
  // pas laisser de résidu d'une session sur l'autre.
  useEffect(() => {
    if (open) clearCart();
  }, [open, clearCart]);

  // Liste ordonnée des nodes du panier (Map → tableau, ordre d'insertion).
  const cartNodes = useMemo(() => Array.from(items.values()), [items]);
  const cartCount = cartNodes.length;

  // Décision d'épinglage : seuls les FICHIERS publiés sont pickables.
  //
  // On passe le nœud ENTIER. L'ancienne version reconstruisait un objet
  // `{ type: 'file', path: node.path }` — ce qui privait `isPickable` de
  // `meta`, donc de `meta.status`, donc de la seule source fiable du statut.
  // Elle ne pouvait plus que le déduire du chemin : correct tant que le
  // chemin portait la strate, muet ensuite.
  function handlePickToggle(node: FinderNode) {
    if (!isPickable(node)) return; // non-publié ou dossier → on n'épingle pas
    toggleCart(node);
  }

  function handleSubmit() {
    if (cartCount === 0) return;

    // ⚠️ Les LOCALISATEURS, pas les clés du panier.
    //
    // `items` est keyée par `node.path` — un chemin LOGIQUE depuis le
    // chantier « arbre sans strate de statut ». C'est la bonne clé pour le
    // panier (les ghosts de la grille interrogent `isInCart(node.path)`), mais
    // pas ce qu'attend le bout de la chaîne : `onSubmit` mène à
    // `media.resolveByPaths`, qui matche `MediaAsset.fullPath` — physique.
    //
    // Rendre les clés ici renvoyait `AKFC/cours/x/photo` contre un
    // `AKFC/pending/cours/x/photo` en base : aucun match, aucun id, une
    // galerie vide. Et silencieusement, parce que le panier, lui, était bien
    // rempli.
    const paths = cartNodes.map(storagePathOf);
    onSubmit(paths);
    clearCart();
    onClose();
  }

  function handleClose() {
    clearCart();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-4 border-b font-medium">Sélectionner des médias</div>

      {/* Règle posée d'emblée : seuls les médias publiés sont épinglables. */}
      <div className="px-4 py-2 border-b bg-blue-50 text-xs text-blue-800">
        Cliquez sur un média <strong>publié</strong> pour l&apos;ajouter à la
        sélection. Vous pouvez naviguer entre les dossiers&nbsp;: la sélection
        est conservée. Un média en attente ou à la corbeille reste visible mais
        n&apos;est pas sélectionnable tant qu&apos;il n&apos;est pas publié.
      </div>

      <div className="flex-1 overflow-auto">
        <Finder
          adapter={adapter}
          rootPath={rootPath}
          fileFilter={fileFilter}
          pickMode
          isInCart={(path) => items.has(path)}
          onPickToggle={handlePickToggle}
        />
      </div>

      {/* Bandeau panier — vignettes de la sélection, retrait individuel. */}
      <PickerCart nodes={cartNodes} onRemove={removeFromCart} onClear={clearCart} />

      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {cartCount} média{cartCount > 1 ? 's' : ''} sélectionné
          {cartCount > 1 ? 's' : ''}
        </span>

        <div className="flex gap-2">
          <button onClick={handleClose} className="px-3 py-1 border rounded">
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={cartCount === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Ajouter à la galerie
          </button>
        </div>
      </div>
    </Modal>
  );
}