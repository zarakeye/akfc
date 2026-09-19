#!/usr/bin/env bash
# AKFC — Supprime la latence du logo (sans le retirer du cloud).
#  A) Header préchargé : le layout public lit siteSettings (prisma) et passe
#     initialLogoUrl/initialBrand en props → logo présent dès le 1er rendu HTML.
#  B) Route /api/media/site-logo : cache long (le ?v=updatedAt invalide au besoin)
#     → instantané après la 1re visite.
# Usage : bash apply-logo-latency.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
LAYOUT="apps/web/src/app/(public)/layout.tsx"
HEADER="apps/web/src/features/app-shell/Header.tsx"
ROUTE="apps/web/src/app/api/media/site-logo/route.ts"
for f in "$LAYOUT" "$HEADER" "$ROUTE"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

python3 - "$LAYOUT" "$HEADER" "$ROUTE" <<'PY'
import sys, pathlib, re
LAYOUT, HEADER, ROUTE = sys.argv[1], sys.argv[2], sys.argv[3]
def rd(p): return pathlib.Path(p).read_text(encoding="utf-8")
def wr(p,s): pathlib.Path(p).write_text(s, encoding="utf-8")
def one(s, old, new, label):
    assert s.count(old)==1, f"{label}: ancre ×{s.count(old)}"
    return s.replace(old,new)

# ---------- A1) layout : lire siteSettings + passer les props ----------
s = rd(LAYOUT)
if "siteSettings" not in s:
    # lecture après le fetch des breakingNews
    anchor = '''  const activeNews = await prisma.breakingNews.findMany({
    where: {
      publicationDate: { not: null, lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { publicationDate: "desc" },
    take: 20,
  });'''
    add = anchor + '''

  // Identité (logo + libellé) lue côté serveur → passée au Header en valeur
  // initiale, pour un logo présent dès le 1er rendu (plus de flash/latence).
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "site" },
    select: { logoKey: true, updatedAt: true, shortTitle: true },
  });
  const initialLogoUrl = siteSettings?.logoKey
    ? `/api/media/site-logo?v=${siteSettings.updatedAt.getTime()}`
    : null;
  const initialBrand = siteSettings?.shortTitle ?? "AKFC";'''
    s = one(s, anchor, add, "layout read settings")
    s = one(s, "        <Header />",
               "        <Header initialLogoUrl={initialLogoUrl} initialBrand={initialBrand} />",
               "layout pass props")
    wr(LAYOUT, s); print("  ok  layout : siteSettings préchargé + props")
else:
    print("  — layout déjà")

# ---------- A2) Header : accepter les props + les utiliser en valeur immédiate ----------
s = rd(HEADER)
if "initialLogoUrl" not in s:
    s = one(s, "export default function Header() {",
        '''export default function Header({
  initialLogoUrl = null,
  initialBrand = "AKFC",
}: {
  initialLogoUrl?: string | null;
  initialBrand?: string;
} = {}) {''',
        "header signature")
    s = one(s,
        '''  const siteSettings = trpc.siteSettings.get.useQuery();
  const logoUrl = siteSettings.data?.logoUrl ?? null;
  const brand = siteSettings.data?.shortTitle ?? "AKFC";''',
        '''  const siteSettings = trpc.siteSettings.get.useQuery();
  // Valeur initiale (préchargée par le layout serveur) → logo présent dès le
  // 1er rendu ; la query ne fait ensuite que rafraîchir en arrière-plan.
  const logoUrl = siteSettings.data?.logoUrl ?? initialLogoUrl;
  const brand = siteSettings.data?.shortTitle ?? initialBrand;''',
        "header use props")
    wr(HEADER, s); print("  ok  Header : props initiales appliquées")
else:
    print("  — Header déjà")

# ---------- B) route logo : cache long au lieu de no-store ----------
s = rd(ROUTE)
if "no-store" in s:
    s = one(s,
        'headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },',
        '''headers: {
        // Le SVG change rarement et l'URL porte ?v=updatedAt (busting au
        // changement) → cache long : instantané après la 1re visite.
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },''',
        "route cache")
    wr(ROUTE, s); print("  ok  route : cache long")
else:
    print("  — route déjà")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "perf(logo): préchargement Header (props serveur) + cache route logo — fin de la latence" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }