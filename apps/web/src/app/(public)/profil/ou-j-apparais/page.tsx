import type { JSX } from "react";
import type { Metadata } from "next";

import { MyAppearances } from "@features/image-consent/MyAppearances";

/**
 * « Où j'apparais » — `/profil/ou-j-apparais` (le proxy garde `/profil`). Les photos et vidéos où le
 * club a identifié le membre connecté, où elles sont montrées, et ce que son droit à l'image permet.
 */
export const metadata: Metadata = { title: "Où j'apparais" };

export default function MyAppearancesPage(): JSX.Element {
  return <MyAppearances />;
}
