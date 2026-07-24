import type { JSX } from "react";

import { BlockStyleLab } from "@features/design-lab/BlockStyleLab";

/**
 * /dashboard/design-lab
 *
 * Outil interne : régler la typographie et les espacements du rendu des
 * blocs sur un contenu lorem ipsum, sans avoir à créer une page de test ni
 * à recharger après chaque essai.
 *
 * Les curseurs pilotent les VRAIES variables du rendu (`--akfc-*`), donc ce
 * qui est réglé ici vaut pour la vue publique comme pour l'aperçu du builder.
 */
export default function DesignLabPage(): JSX.Element {
  return (
    // Le layout du tableau de bord pose la règle : le <main> défile par
    // défaut, et une page qui gère son propre défilement se borne elle-même
    // (`h-full overflow-hidden`), comme la bibliothèque. Le laboratoire est
    // ce cas-là — mais seulement à partir de `lg`, où il y a deux colonnes à
    // tenir côte à côte. En dessous, la page défile normalement.
    <div className="flex flex-col gap-4 p-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <header className="shrink-0 space-y-1">
        <h1 className="text-lg font-semibold">Laboratoire de rendu</h1>
        <p className="text-sm text-muted-foreground">
          Les curseurs modifient les variables CSS réellement utilisées par le
          rendu des blocs. Rien n&apos;est enregistré&nbsp;: une fois le
          réglage trouvé, recopiez le bloc CSS affiché dans{" "}
          <code className="rounded bg-muted px-1">globals.css</code>.
        </p>
      </header>

      {/* `min-h-0` : sans lui, un enfant de flex refuse de descendre sous la
          hauteur de son contenu et le confinement ne prendrait jamais. */}
      <div className="lg:min-h-0 lg:flex-1">
        <BlockStyleLab />
      </div>
    </div>
  );
}
