import type { JSX } from "react";

import { SitePageEditor } from "@features/admin/site-pages/SitePageEditor";

/**
 * Titres proposés par défaut pour les pages connues, tant qu'aucune n'a été
 * enregistrée. Une page inconnue reçoit son slug — l'éditeur fonctionne quand
 * même, et le titre se corrige au premier enregistrement.
 */
const DEFAULT_TITLES: Record<string, string> = {
  association: "L'association",
  histoire: "L'histoire du club",
};

export default async function SitePageEditorRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Page « {DEFAULT_TITLES[slug] ?? slug} »
      </h1>
      <SitePageEditor slug={slug} fallbackTitle={DEFAULT_TITLES[slug] ?? slug} />
    </div>
  );
}
