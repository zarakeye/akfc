import { type JSX } from "react";
import { Construction } from "lucide-react";

/**
 * Page « En construction » — cible de réécriture pour les pages publiques non
 * encore publiées (vues par le public et les membres ; les admins voient la
 * vraie page). L'URL d'origine est conservée (rewrite).
 */
export default function EnConstructionPage(): JSX.Element {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <Construction className="h-14 w-14 text-gray-400" aria-hidden />
      <h1 className="text-2xl font-semibold text-gray-900">Page en construction</h1>
      <p className="text-gray-600">
        Cette page n'est pas encore disponible. Elle arrive bientôt — merci de
        votre patience.
      </p>
    </div>
  );
}
