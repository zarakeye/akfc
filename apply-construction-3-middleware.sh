#!/usr/bin/env bash
#
# AKFC — Chantier « En construction », BRIQUE 3 : enforcement (middleware).
#
#   - /api/page-access (route nodejs) : résout la session (createTRPCContext) →
#     rôle, + l'état publié de la page → renvoie { allowed }. Admin (role ADMIN)
#     ou page publiée → allowed ; sinon refusé.
#   - middleware (edge) : pour une route toggable non autorisée → REWRITE vers
#     /en-construction (l'URL reste la même, le contenu réel n'est pas servi).
#     Fail-open si la route d'accès échoue (ne casse pas le site).
#   - (public)/en-construction : la page placeholder.
#
# Prérequis : brique 1 (pageVisibility) + brique 2 (registre). FRONT/edge NON
# testé → valider. Pas de migration.
# Usage : bash apply-construction-3-middleware.sh
#         AKFC_APPLY_ONLY=1 bash apply-construction-3-middleware.sh   (clone)
#
set -euo pipefail

API="apps/web/src/app/api/page-access/route.ts"
MW="apps/web/middleware.ts"
PLACEHOLDER="apps/web/src/app/(public)/en-construction/page.tsx"

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance depuis la racine du repo." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── route API /api/page-access (nodejs) ─────────────────────────────────────
mkdir -p "$(dirname "$API")"
cat > "$API" <<'TS'
import type { NextRequest } from "next/server";

import { createTRPCContext } from "@backend/trpc";
import { pageKeyForPath } from "@config/pageRegistry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Décide si la requête a le droit de VOIR la vraie page `path` :
 *   - route non toggable → autorisée ;
 *   - admin (role ADMIN) → autorisée (voit toujours la vraie page) ;
 *   - sinon → autorisée uniquement si la page est publiée.
 * Consommée par le middleware (qui rewrite vers /en-construction si refusé).
 */
export async function GET(req: NextRequest): Promise<Response> {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  const key = pageKeyForPath(path);
  if (!key) return Response.json({ allowed: true });

  const ctx = await createTRPCContext({ req });

  const userId = ctx.sessionClient?.user?.id;
  if (userId) {
    const me = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } },
    });
    if (me?.role?.name === "ADMIN") return Response.json({ allowed: true });
  }

  const row = await ctx.prisma.pageVisibility.findUnique({ where: { key } });
  return Response.json({ allowed: row?.published === true });
}
TS
echo "route API écrite : $API"

# ── middleware (edge) ───────────────────────────────────────────────────────
cat > "$MW" <<'TS'
import { NextResponse, type NextRequest } from "next/server";

import { pageKeyForPath } from "@config/pageRegistry";

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
TS
echo "middleware écrit : $MW"

# ── page placeholder « En construction » ────────────────────────────────────
mkdir -p "$(dirname "$PLACEHOLDER")"
cat > "$PLACEHOLDER" <<'TSX'
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
TSX
echo "placeholder écrit : $PLACEHOLDER"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(pages): enforcement En construction (middleware + /api/page-access + placeholder)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Valider : page non publiée → public/membre voit « En construction », admin voit la vraie page. (Tout est masqué tant que rien n'est publié — pense au centre de contrôle, brique 4.)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi