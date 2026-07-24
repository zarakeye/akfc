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
    <div className="space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Laboratoire de rendu</h1>
        <p className="text-sm text-muted-foreground">
          Les curseurs modifient les variables CSS réellement utilisées par le
          rendu des blocs. Rien n&apos;est enregistré&nbsp;: une fois le
          réglage trouvé, recopiez le bloc CSS affiché dans{" "}
          <code className="rounded bg-muted px-1">globals.css</code>.
        </p>
      </header>

      <BlockStyleLab />
    </div>
  );
}
