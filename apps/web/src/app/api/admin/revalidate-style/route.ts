import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";

/**
 * Invalide le rendu des pages après un enregistrement du réglage de style.
 *
 * ─── Pourquoi ici et non dans la mutation tRPC ─────────────────────────
 *
 * `packages/backend` ne connaît pas Next et n'a pas à le connaître : y
 * importer `next/cache` lierait le domaine au framework pour un détail
 * d'infrastructure. Cette route vit dans `apps/web`, où Next est chez lui.
 *
 * ─── Pourquoi le layout et non les pages ───────────────────────────────
 *
 * La surcharge est injectée par le layout RACINE, qui enveloppe tout. Une
 * invalidation page par page laisserait passer celles qu'on aurait
 * oubliées ; `revalidatePath("/", "layout")` couvre l'arbre entier.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // Route d'administration : le réglage vaut pour le site entier, sa
  // régénération n'est pas une opération anonyme.
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
