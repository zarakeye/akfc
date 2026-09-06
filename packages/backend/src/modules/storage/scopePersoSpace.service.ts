import type { StorageFolderNode, StorageNode } from "@contracts/storage";

/**
 * Aplatissement d'AFFICHAGE du conteneur `personal-space` sur le sous-espace de
 * l'utilisateur courant : dans l'arbre, `personal-space` montre directement le
 * contenu de `personal-space/<slug>-<userId>` (illusion « ce dossier est mon
 * espace ») et masque les sous-espaces des autres admins. Le physique reste
 * intact — c'est purement de l'affichage.
 */
export function scopePersoSpaceInTree(
  root: StorageFolderNode,
  appRoot: string,
  userId: string,
): StorageFolderNode {
  const persoContainer = `${appRoot}/personal-space`;
  const rebuild = (n: StorageNode): StorageNode => {
    if (n.type !== "folder") return n;
    if (n.path === persoContainer) {
      const mine = (n.children ?? []).find(
        (c): c is StorageFolderNode =>
          c.type === "folder" && c.path.endsWith(`-${userId}`),
      );
      return {
        ...n,
        children: mine?.children ?? [],
        hasChildren: mine?.hasChildren ?? (mine?.children?.length ?? 0) > 0,
      };
    }
    if (!n.children) return n;
    return { ...n, children: n.children.map(rebuild) };
  };
  return rebuild(root) as StorageFolderNode;
}
