import { JSX } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "#components/ui/Button.tsx";

/**
 * Contenu de la page « introuvable » (404), partagé par les fichiers not-found.tsx :
 * - app/not-found.tsx : adresse inconnue, ou notFound() appelé dans le site public ;
 * - app/(admin)/dashboard/not-found.tsx : notFound() dans le panneau de contrôle.
 *
 * Seul le lien de retour change d'un contexte à l'autre. Next répond déjà avec le code HTTP 404
 * et demande aux moteurs de ne pas indexer la page : rien à faire de plus ici.
 */
export function PageIntrouvable({
  retour,
  libelleRetour,
}: {
  retour: string;
  libelleRetour: string;
}): JSX.Element {
  return (
    <section
      aria-labelledby="titre-introuvable"
      className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-20 text-center"
    >
      <Compass aria-hidden="true" className="h-12 w-12 text-muted-foreground" />
      <p className="text-sm font-medium tracking-wide text-muted-foreground">Erreur 404</p>
      <h1 id="titre-introuvable" className="text-3xl font-bold text-foreground">
        Page introuvable
      </h1>
      <p className="leading-7 text-muted-foreground">
        Cette page n’existe pas, ou plus. Le lien était peut-être ancien, ou l’adresse mal recopiée.
      </p>
      <Button asChild className="mt-2">
        <Link href={retour}>{libelleRetour}</Link>
      </Button>
    </section>
  );
}
