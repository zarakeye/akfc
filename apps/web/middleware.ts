import { NextResponse, type NextRequest } from "next/server";

import { pageKeyForPath } from "@/config/pageRegistry";

/**
 * Porte « En construction » : pour une page publique toggable, si le visiteur
 * n'a pas le droit de la voir (non publiée et non-admin), on RÉÉCRIT vers
 * /en-construction — le contenu réel n'est jamais servi. La décision est prise
 * par /api/page-access (accès nodejs à la session + à la base). Fail-open : si
 * la vérification échoue, on laisse passer (ne pas casser le site).
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  if (!pageKeyForPath(pathname)) return NextResponse.next();

  try {
    const url = new URL("/api/page-access", req.url);
    url.searchParams.set("path", pathname);
    const res = await fetch(url, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });
    if (res.ok) {
      const data = (await res.json()) as { allowed?: boolean };
      if (data.allowed === false) {
        const dest = req.nextUrl.clone();
        dest.pathname = "/en-construction";
        dest.search = "";
        return NextResponse.rewrite(dest);
      }
    }
  } catch {
    // fail-open
  }
  return NextResponse.next();
}

export const config = {
  // Toutes les routes SAUF /api, les assets _next et les fichiers statiques.
  // pageKeyForPath filtre ensuite aux seules pages toggables.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
